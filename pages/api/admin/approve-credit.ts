import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../src/lib/prisma'
import { createRateLimiter } from '../../../lib/rateLimit'
import { requireAdmin } from '../../../lib/adminAuth'
import { supabaseServer } from '../../../lib/supabaseServer'

const limiter = createRateLimiter({ windowMs: 60_000, max: 5 })

type Body = { actionId?: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })
  if (!(await limiter(req, res, 'admin-approve-credit'))) return

  const admin = await requireAdmin(req)
  if (!admin.ok || !admin.userId) return res.status(403).json({ error: admin.error || 'forbidden' })
  const approverId = admin.userId

  const { actionId } = (req.body ?? {}) as Body
  if (!actionId) return res.status(400).json({ error: 'missing_action_id' })

  try {
    // Fetch action from Prisma
    const action = await prisma.adminAction.findUnique({ where: { id: actionId } })
    if (!action) throw new Error('action_not_found')
    if (action.status !== 'PENDING') throw new Error('action_not_pending')
    const userId = action.userId

    // Always approve credits into USD wallet
    const currency = 'USD'

    // Fetch or create wallet in Supabase
    const { data: existing } = await supabaseServer
      .from('wallets')
      .select('id,amount')
      .eq('user_id', userId)
      .eq('currency', currency)
      .maybeSingle()

    let walletId = existing?.id as string | undefined
    let currentAmount = Number(existing?.amount ?? 0)
    if (!walletId) {
      const { data: inserted, error: insertErr } = await supabaseServer
        .from('wallets')
        .insert({ user_id: userId, currency, amount: 0 })
        .select()
        .maybeSingle()
      if (insertErr) throw new Error('wallet_create_failed')
      walletId = inserted?.id as string
      currentAmount = 0
    }

    const amountNum = Number(action.amount)
    const newAmount = Number((currentAmount + amountNum).toFixed(8))
    const { error: updateErr } = await supabaseServer
      .from('wallets')
      .update({ amount: newAmount })
      .eq('id', walletId!)
    if (updateErr) throw new Error('wallet_update_failed')

    const txn = await prisma.walletTransaction.create({
      data: {
        walletId: walletId!,
        amount: amountNum.toString(),
        type: 'CREDIT',
        source: 'admin_credit_approval',
        reference: action.id,
        note: action.note || null,
        performedBy: approverId,
      },
    })

    const completed = await prisma.adminAction.update({
      where: { id: action.id },
      data: { status: 'COMPLETED', approvedBy: approverId, approvedAt: new Date() },
    })

    return res.json({ balance: newAmount, transaction: txn, action: completed })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'approve_failed' })
  }
}

export const config = { api: { bodyParser: true } }
