import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { requireRole } from '@lib/requireRole'
import { adminRateLimit } from '@lib/rate-limit/redis-token-bucket'
import { publish } from '@lib/sse'
import { broadcastQueue } from '@lib/queue/broadcastQueue'

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole('ADMIN')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const allowed = await adminRateLimit.allow(String(user.id))
  if (!allowed) return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429 })
  const body = await req.json()
  const type = String(body?.type || 'info')
  const title = String(body?.title || '')
  const message = String(body?.message || '')
  if (!title || !message) return new Response(JSON.stringify({ error: 'invalid' }), { status: 400 })

  const g = await prisma.globalNotification.create({ data: { type, title, message } })
  await publish('broadcast', { id: g.id, type: g.type, title: g.title, message: g.message, createdAt: g.createdAt })
  await broadcastQueue.add(
    'broadcast',
    { globalNotificationId: g.id },
    { attempts: 3, backoff: { type: 'exponential', delay: 5000 } }
  )
  return new Response(JSON.stringify({ ok: true, id: g.id }), { status: 200 })
}
