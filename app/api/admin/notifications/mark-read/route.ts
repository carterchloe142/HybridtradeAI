import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { requireRole } from '@lib/requireRole'

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole('ADMIN')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const body = await req.json()
  const ids: string[] = Array.isArray(body?.ids) ? body.ids : body?.id ? [body.id] : []
  if (!ids.length) return new Response(JSON.stringify({ error: 'invalid' }), { status: 400 })
  await prisma.notification.updateMany({ where: { id: { in: ids }, userId: String(user.id) }, data: { read: true } })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

