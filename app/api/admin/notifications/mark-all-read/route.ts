import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { requireRole } from '@lib/requireRole'
import { publish } from '@lib/sse'

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole('ADMIN')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const body = await req.json().catch(() => ({}))
  const type = String(body?.type || '')
  const beforeStr = String(body?.before || '')
  const before = beforeStr ? new Date(beforeStr) : null
  const where: any = { userId: String(user.id) }
  if (type) where.type = type
  if (before && !isNaN(before.getTime())) where.createdAt = { lt: before }
  await prisma.notification.updateMany({ where, data: { read: true } })
  await publish(`admin:${String(user.id)}`, { id: `read:${Date.now()}`, type: 'admin_read', title: '', message: '' })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
