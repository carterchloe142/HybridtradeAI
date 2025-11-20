import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '../../../lib/adminAuth'
import prisma from '../../../src/lib/prisma'
import { logInfo, logError } from '../../../src/lib/observability/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })
  const check = await requireAdmin(req)
  if (!check.ok) return res.status(403).json({ error: 'forbidden' })

  const daysParam = req.query.days ?? req.body?.days
  const days = Number(daysParam ?? process.env.DELIVERY_RETENTION_DAYS ?? 30)
  if (isNaN(days) || days <= 0) return res.status(400).json({ error: 'invalid_days' })
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  try {
    const result = await prisma.notificationDelivery.deleteMany({ where: { deliveredAt: { lt: cutoff } } })
    logInfo('retention.notification_delivery_deleted', { days, count: result.count })
    return res.status(200).json({ ok: true, deleted: result.count, days })
  } catch (e: any) {
    logError('retention.notification_delivery_error', { days, error: e?.message })
    return res.status(500).json({ error: 'retention_failed', details: e?.message })
  }
}

