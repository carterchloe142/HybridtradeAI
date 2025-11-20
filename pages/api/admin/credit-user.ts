import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../src/lib/prisma'
import { createRateLimiter } from '../../../lib/rateLimit'
import { requireAdmin } from '../../../lib/adminAuth'
import { supabaseServer } from '../../../lib/supabaseServer'

const limiter = createRateLimiter({ windowMs: 60_000, max: 5 })

type Body = { userId?: string; email?: string; amount?: number; note?: string; description?: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return recent admin manual credit actions for history table with pagination
    const admin = await requireAdmin(req)
    if (!admin.ok) return res.status(403).json({ error: admin.error || 'forbidden' })
    const page = Math.max(1, Number((req.query.page as string) || '1'))
    const limit = Math.min(100, Math.max(1, Number((req.query.limit as string) || '25')))
    const skip = (page - 1) * limit
    try {
      const [actions, total] = await Promise.all([
        prisma.adminAction.findMany({
          where: { action: 'MANUAL_CREDIT' },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.adminAction.count({ where: { action: 'MANUAL_CREDIT' } })
      ])
      return res.json({ actions, total, page, limit })
    } catch {}
    // Fallback: derive actions from Supabase transactions when AdminAction table is unavailable
    const { data: txs, error: txErr, count } = await supabaseServer
      .from('transactions')
      .select('id,user_id,amount,currency,meta,created_at', { count: 'exact' })
      .eq('type', 'admin_credit')
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1)
    if (txErr) return res.json({ actions: [], total: 0, page, limit })
    const actions = (txs || []).map((t: any) => ({
      id: String(t.id),
      adminId: String(t.meta?.adminId || ''),
      userId: String(t.user_id || ''),
      amount: String(t.amount ?? '0'),
      action: 'MANUAL_CREDIT',
      note: String(t.meta?.description || ''),
      status: t?.meta?.pending ? 'PENDING' : 'COMPLETED',
      createdAt: String(t.created_at || new Date().toISOString()),
    }))
    return res.json({ actions, total: count ?? actions.length, page, limit })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })
  if (!(await limiter(req, res, 'admin-credit-user'))) return

  const admin = await requireAdmin(req)
  if (!admin.ok || !admin.userId) return res.status(403).json({ error: admin.error || 'forbidden' })
  const adminId = admin.userId

  const { userId: rawUserId, email: rawEmail, amount } = (req.body ?? {}) as Body
  const note = (req.body as Body)?.note ?? (req.body as Body)?.description ?? undefined
  if (typeof amount !== 'number') return res.status(400).json({ error: 'missing_fields' })
  if (amount <= 0) return res.status(400).json({ error: 'invalid_amount' })

  const enabled = String(process.env.ENABLE_MANUAL_CREDITS || 'false').toLowerCase() === 'true'
  if (!enabled) return res.status(403).json({ error: 'manual_credits_disabled' })
  const threshold = Number(process.env.MANUAL_CREDIT_APPROVAL_THRESHOLD || '0')

  try {
    // Resolve a valid Supabase user_id (UUID) from provided identifiers
    const resolvedUserId = await resolveSupabaseUserId({ userId: rawUserId, email: rawEmail })
    if (!resolvedUserId) return res.status(400).json({ error: 'invalid_user_identifier' })

    if (threshold && amount > threshold) {
      try {
        const pending = await prisma.adminAction.create({
          data: {
            adminId,
            userId: resolvedUserId,
            amount: amount.toString(),
            action: 'MANUAL_CREDIT',
            note: note || 'Pending approval due to threshold',
            status: 'PENDING',
          },
        })
        return res.status(202).json({ status: 'pending', action: pending })
      } catch {
        const { data: txInserted } = await supabaseServer
          .from('transactions')
          .insert({
            user_id: resolvedUserId,
            type: 'admin_credit',
            amount: amount,
            currency: 'USD',
            meta: { description: note ?? null, adminId, pending: true }
          })
          .select()
          .maybeSingle()
        return res.status(202).json({ status: 'pending', action: txInserted || null })
      }
    }

    // Always credit USD so balances are standardized
    const currency = 'USD'

    // Fetch or create wallet in Supabase
    const { data: existing, error: selectErr } = await supabaseServer
      .from('wallets')
      .select('id,balance')
      .eq('user_id', resolvedUserId)
      .eq('currency', currency)
      .maybeSingle()
    if (selectErr) throw new Error(`wallet_select_failed:${selectErr.message}`)

    let walletId = existing?.id as string | undefined
    let currentAmount = Number(existing?.balance ?? 0)
    if (!walletId) {
      const { data: inserted, error: insertErr } = await supabaseServer
        .from('wallets')
        .insert({ user_id: resolvedUserId, currency, balance: 0 })
        .select()
        .maybeSingle()
      if (insertErr) throw new Error(`wallet_create_failed:${insertErr.message}`)
      walletId = inserted?.id as string
      currentAmount = 0
    }

    const newAmount = Number((currentAmount + amount).toFixed(8))
    const { error: updateErr } = await supabaseServer
      .from('wallets')
      .update({ balance: newAmount })
      .eq('id', walletId!)
    if (updateErr) throw new Error(`wallet_update_failed:${updateErr.message}`)

    // Record transaction in Supabase for visibility in dashboards/history
    try {
      const { error: txErr } = await supabaseServer
        .from('transactions')
        .insert({
          user_id: resolvedUserId,
          type: 'admin_credit',
          amount: amount,
          currency,
          meta: { description: note ?? null, adminId }
        })
      if (txErr) throw new Error(`transactions_insert_failed:${txErr.message}`)
    } catch {}

    // Log via Prisma, but do not fail credit if logging is unavailable
    let txn: any = null
    try {
      txn = await prisma.walletTransaction.create({
        data: {
          walletId: walletId!,
          amount: amount.toString(),
          type: 'CREDIT',
          source: 'admin_credit',
          note: note || null,
          performedBy: adminId,
        },
      })
    } catch {}

    try {
      await prisma.adminAction.create({
        data: {
          adminId,
          userId: resolvedUserId,
          amount: amount.toString(),
          action: 'MANUAL_CREDIT',
          note: note || null,
          status: 'COMPLETED',
        },
      })
    } catch {}

    // Create and broadcast a user notification for instant feedback
    try {
      const notif = await prisma.notification.create({
        data: {
          userId: resolvedUserId,
          type: 'manual_credit',
          title: 'Manual Credit',
          message: `Your wallet was credited with $${amount.toFixed(2)} USD`,
          read: false,
        },
      })
      // Publish via SSE to notify active sessions immediately
      try {
        const { publish } = await import('../../../src/lib/sse')
        await publish(`user:${resolvedUserId}`, {
          id: notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          createdAt: notif.createdAt,
        })
      } catch {}
    } catch {}

    return res.json({ balance: newAmount, transaction: txn })
  } catch (e: any) {
    console.error('wallets api error', e)
    const msg = String(e?.message || 'credit_failed')
    // Normalize common supabase failure messages for easier troubleshooting
    if (msg.includes('wallet_select_failed')) return res.status(500).json({ error: msg })
    if (msg.includes('wallet_create_failed')) return res.status(500).json({ error: msg })
    if (msg.includes('wallet_update_failed')) return res.status(500).json({ error: msg })
    if (msg.includes('transactions_insert_failed')) return res.status(500).json({ error: msg })
    return res.status(500).json({ error: msg })
  }
}

export const config = { api: { bodyParser: true } }

// Utilities
function isUuidLike(id?: string) {
  if (!id) return false
  // Simple UUID v4 check: 36 chars with dashes
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

function isEmailLike(s?: string) {
  if (!s) return false
  return /.+@.+\..+/.test(s)
}

async function resolveSupabaseUserId({ userId, email }: { userId?: string; email?: string }): Promise<string | ''> {
  // Case 1: Provided a proper Supabase user UUID
  if (isUuidLike(userId)) return userId as string

  // Case 2: Provided an email directly
  const emailToUse = isEmailLike(email) ? (email as string) : (isEmailLike(userId) ? (userId as string) : '')
  if (emailToUse) {
    const { data, error } = await supabaseServer
      .from('profiles')
      .select('user_id')
      .eq('email', emailToUse)
      .maybeSingle()
    if (!error && data?.user_id) return data.user_id as string
    try {
      const adminRes: any = await (supabaseServer as any).auth?.admin?.listUsers?.({ page: 1, perPage: 200 })
      const users = adminRes?.data?.users || adminRes?.users || []
      const found = users.find((u: any) => String(u?.email || '').toLowerCase() === emailToUse.toLowerCase())
      if (found?.id) return String(found.id)
    } catch {}
  }

  // Case 3: Provided a Prisma cuid() – try to map via Prisma User.email → Supabase profiles.user_id
  if (userId && userId.startsWith('c') && userId.length >= 24) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      const emailFromPrisma = user?.email
      if (emailFromPrisma) {
        const { data, error } = await supabaseServer
          .from('profiles')
          .select('user_id')
          .eq('email', emailFromPrisma)
          .maybeSingle()
        if (!error && data?.user_id) return data.user_id as string
        try {
          const adminRes: any = await (supabaseServer as any).auth?.admin?.listUsers?.({ page: 1, perPage: 200 })
          const users = adminRes?.data?.users || adminRes?.users || []
          const found = users.find((u: any) => String(u?.email || '').toLowerCase() === String(emailFromPrisma).toLowerCase())
          if (found?.id) return String(found.id)
        } catch {}
      }
    } catch {}
  }

  return ''
}
