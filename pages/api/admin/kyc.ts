import type { NextApiRequest, NextApiResponse } from 'next'
import { createRateLimiter } from '../../../lib/rateLimit'
import { requireAdmin } from '../../../lib/adminAuth'
import { supabaseServer } from '../../../lib/supabaseServer'
import prisma from '../../../src/lib/prisma'

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req)
  if (!admin.ok) return res.status(401).json({ error: admin.error || 'unauthorized' })

  if (req.method === 'GET') {
    const userId = String((req.query as any)?.userId || '')
    const files = String((req.query as any)?.files || '') === '1'
    if (files && userId) {
      try {
        const bucket = (supabaseServer.storage as any).from('kyc')
        const listRes = await bucket.list(userId, { limit: 20 })
        const entries = Array.isArray(listRes.data) ? listRes.data : []
        const nameStartsWith = (p: string) => entries.find((e: any) => String(e.name).startsWith(p))
        const idEntry = nameStartsWith('id')
        const selfieNeutral = nameStartsWith('selfie_neutral')
        const selfieSmile = nameStartsWith('selfie_smile')
        const selfieLeft = nameStartsWith('selfie_left')
        const selfieRight = nameStartsWith('selfie_right')
        const dataEntry = entries.find((e: any) => String(e.name) === 'data.json')
        async function signed(path?: string) {
          if (!path) return undefined
          const s = await bucket.createSignedUrl(`${userId}/${path}`, 3600)
          return s.data?.signedUrl as string | undefined
        }
        const idUrl = idEntry ? (await signed(idEntry.name)) : undefined
        const neutralUrl = await signed(selfieNeutral?.name)
        const smileUrl = await signed(selfieSmile?.name)
        const leftUrl = await signed(selfieLeft?.name)
        const rightUrl = await signed(selfieRight?.name)
        let details: any = null
        if (dataEntry) {
          const { data: download } = await bucket.download(`${userId}/data.json`)
          if (download) {
            const txt = await download.text()
            try { details = JSON.parse(txt) } catch { details = { raw: txt } }
          }
        }
        return res.json({ ok: true, files: { idUrl, neutralUrl, smileUrl, leftUrl, rightUrl }, details })
      } catch (e: any) {
        return res.status(500).json({ error: e?.message || 'files_failed' })
      }
    }
    // Fetch without email first to avoid schema differences
    const base = await supabaseServer
      .from('profiles')
      .select('*')
    if (base.error) return res.status(500).json({ error: base.error.message || 'list_failed' })
    const items = (base.data as any[]) || []
    // Enrich with email via Admin API
    try {
      const adminRes: any = await (supabaseServer as any).auth?.admin?.listUsers?.({ page: 1, perPage: 1000 })
      const users = adminRes?.data?.users || adminRes?.users || []
      const map = new Map<string, string>()
      for (const u of users) {
        const id = String(u?.id || '')
        const email = String(u?.email || '')
        if (id && email) map.set(id, email)
      }
      for (const it of items) {
        const email = map.get(String(it.user_id)) || null
        ;(it as any).email = email
      }
    } catch {}
    return res.json({ ok: true, items })
  }

  if (req.method !== 'PATCH') return res.status(405).json({ error: 'method_not_allowed' })
  if (!(await limiter(req, res, 'admin-kyc'))) return

  const userId = String((req.body as any)?.userId || '')
  const status = String((req.body as any)?.status || '').toLowerCase()
  const levelRaw = (req.body as any)?.level
  const level = typeof levelRaw === 'number' ? levelRaw : undefined
  if (!userId || !['approved','rejected','pending'].includes(status)) return res.status(400).json({ error: 'invalid_payload' })

  const now = new Date().toISOString()
  const minimal: any = { kyc_status: status }
  const optional: any = { kyc_decision_at: now }
  if (status === 'rejected') optional.kyc_reject_reason = String((req.body as any)?.reason || '')
  if (typeof level === 'number') optional.kyc_level = level

  // First: minimal update by user_id
  let updated = false
  let u = await supabaseServer
    .from('profiles')
    .update(minimal)
    .eq('user_id', userId)
    .select('user_id')
    .maybeSingle()
  if (!u.error && u.data) {
    // best-effort optional fields
    await supabaseServer.from('profiles').update(optional).eq('user_id', userId)
    updated = true
  }
  // No 'id' column in this schema; skip id-based update

  // If still failing, attempt full object by user_id, then by id
  const full: any = { ...minimal, ...optional }
  let f = await supabaseServer
    .from('profiles')
    .update(full)
    .eq('user_id', userId)
    .select('user_id')
    .maybeSingle()
  if (!f.error && f.data) updated = true

  const errMsg = u.error?.message || f.error?.message || (updated ? '' : 'update_failed')
  if (!updated && errMsg === 'update_failed') {
    // As a final fallback, attempt to insert/update minimal profile row by user_id
    try {
      const up = await supabaseServer
        .from('profiles')
        .upsert({ user_id: userId, kyc_status: status }, { onConflict: 'user_id' })
        .select('user_id')
        .maybeSingle()
      if (!up.error && up.data) {
        try { await supabaseServer.from('profiles').update(optional).eq('user_id', userId) } catch {}
        updated = true
      } else {
        return res.status(500).json({ error: up.error?.message || errMsg })
      }
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || errMsg })
    }
  }

  if (!updated) return res.status(500).json({ error: errMsg || 'update_failed' })

  // Create and publish user notification (best-effort; do not fail request if this part errors)
  try {
    const title = status === 'approved' ? 'KYC Approved' : status === 'rejected' ? 'KYC Rejected' : 'KYC Updated'
    const message = status === 'approved'
      ? 'Your identity verification has been approved. Withdrawals and advanced features are now unlocked.'
      : status === 'rejected'
      ? `Your KYC was rejected${optional.kyc_reject_reason ? `: ${optional.kyc_reject_reason}` : ''}. Please resubmit with correct details.`
      : 'Your KYC status has been updated.'
    const notif = await prisma.notification.create({ data: { userId: userId, type: 'kyc_status', title, message, read: false } as any })
    try {
      const { publish } = await import('../../../src/lib/sse')
      await publish(`user:${userId}`, { id: notif.id, type: notif.type, title: notif.title, message: notif.message, createdAt: notif.createdAt })
    } catch {}
  } catch {}

  return res.json({ ok: true })
}

export const config = { api: { bodyParser: true } }
