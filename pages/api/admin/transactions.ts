import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireAdmin } from '../../../lib/adminAuth'
import { supabaseServer } from '../../../lib/supabaseServer'
import prisma from '../../../src/lib/prisma'

const PatchSchema = z.object({ id: z.string().min(1), status: z.enum(['confirmed', 'rejected']) })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin.ok) return res.status(401).json({ error: admin.error || 'unauthorized' })
    const type = String(req.query.type || '')
    const status = String(req.query.status || '')
    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status
    const { data, error } = await supabaseServer
      .from('transactions')
      .select('id,user_id,type,amount,amount_usd,currency,status,meta,created_at,profiles(email)')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: 'fetch_failed' })
    return res.json({ items: (data as any[])?.filter((t) => {
      const okType = type ? String(t.type) === type : true
      const okStatus = status ? String(t.status) === status : true
      return okType && okStatus
    }) || [] })
  }

  if (req.method === 'PATCH') {
    const admin = await requireAdmin(req)
    if (!admin.ok) return res.status(401).json({ error: admin.error || 'unauthorized' })
    const parsed = PatchSchema.safeParse(req.body || {})
    if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', issues: parsed.error.issues })
    const { id, status } = parsed.data

    const { data: tx, error } = await supabaseServer
      .from('transactions')
      .select('id,user_id,type,amount,amount_usd,currency,status,meta')
      .eq('id', id)
      .maybeSingle()
    if (error || !tx) return res.status(404).json({ error: 'transaction_not_found' })

    const { error: updErr } = await supabaseServer
      .from('transactions')
      .update({ status })
      .eq('id', id)
    if (updErr) return res.status(500).json({ error: 'update_failed' })

    try {
      const amt = Number((tx as any).amount ?? (tx as any).amount_usd ?? 0)
      const curr = String((tx as any).currency || (tx as any)?.meta?.currency || 'USD')
      const title = status === 'confirmed' ? 'Withdrawal Approved' : 'Withdrawal Rejected'
      const message = status === 'confirmed' ? `Your withdrawal of ${amt} ${curr} was approved.` : `Your withdrawal of ${amt} ${curr} was rejected.`
      const notif = await prisma.notification.create({ data: { userId: String((tx as any).user_id), type: 'withdrawal_status', title, message, read: false } as any })
      try {
        const { publish } = await import('../../../src/lib/sse')
        await publish(`user:${String((tx as any).user_id)}`, { id: notif.id, type: notif.type, title: notif.title, message: notif.message, createdAt: notif.createdAt })
      } catch {}
    } catch {}

    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'method_not_allowed' })
}

export const config = { api: { bodyParser: true } }
