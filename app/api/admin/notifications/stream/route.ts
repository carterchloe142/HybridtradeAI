import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { requireRole } from '@lib/requireRole'
import { subscribe } from '@lib/sse'

function sse(data: any, id?: string, event?: string) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data)
  const idLine = id ? `id: ${id}\n` : ''
  const eventLine = event ? `event: ${event}\n` : ''
  return new TextEncoder().encode(`${idLine}${eventLine}data: ${payload}\n\n`)
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole('ADMIN')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const adminId = String(user.id)
  const lastEventId = new URL(req.url).searchParams.get('lastEventId')
  const lastDate = lastEventId ? new Date(lastEventId) : null

  const stream = new ReadableStream({
    async start(controller) {
      const heartbeat = setInterval(() => controller.enqueue(new TextEncoder().encode(`:hb\n\n`)), 25000)

      if (lastDate && !isNaN(lastDate.getTime())) {
        const globals = await prisma.globalNotification.findMany({
          where: { createdAt: { gt: lastDate } },
          orderBy: { createdAt: 'asc' },
          take: 100,
        })
        for (const g of globals) controller.enqueue(sse({ type: g.type, title: g.title, message: g.message, createdAt: g.createdAt }, g.id, 'global'))

        const personals = await prisma.notification.findMany({
          where: { userId: adminId, createdAt: { gt: lastDate } },
          orderBy: { createdAt: 'asc' },
          take: 100,
        })
        for (const n of personals) controller.enqueue(sse(n, n.id, 'personal'))
      }

      const unsubBroadcast = subscribe('broadcast', (payload) => {
        controller.enqueue(sse(payload, payload.id ?? undefined, 'global'))
      })
      const adminChannel = `admin:${adminId}`
      const unsubAdmin = subscribe(adminChannel, (payload) => {
        controller.enqueue(sse(payload, payload.id ?? undefined, 'personal'))
      })

      controller.enqueue(new TextEncoder().encode(`:connected\n\n`))

      ;(req as any).signal?.addEventListener?.('abort', () => {
        clearInterval(heartbeat)
        unsubBroadcast()
        unsubAdmin()
        controller.close()
      })
    },
    cancel() {},
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
