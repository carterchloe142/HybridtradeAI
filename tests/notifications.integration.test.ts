import { NextRequest } from 'next/server'
import { GET as UserStream } from '../app/api/user/notifications/stream/route'

jest.mock('@lib/requireRole', () => ({
  requireRole: async () => ({ user: { id: 'user-1' }, error: null })
}))

jest.mock('@lib/sse', () => {
  const handlers: Record<string, (payload: any) => void> = {}
  return {
    publish: async (ch: string, payload: any) => { handlers[ch]?.(payload) },
    subscribe: (ch: string, h: (payload: any) => void) => { handlers[ch] = h; return () => { delete handlers[ch] } },
  }
})

jest.mock('@lib/prisma', () => ({
  __esModule: true,
  default: {
    notification: {
      findMany: jest.fn(async ({ where }: any) => {
        const after = where?.createdAt?.gt as Date | undefined
        const base = [
          { id: 'n1', type: 'info', title: 'A', message: 'A', createdAt: new Date('2025-01-01T00:00:00Z') },
          { id: 'n2', type: 'info', title: 'B', message: 'B', createdAt: new Date('2025-01-01T00:00:01Z') },
        ]
        return after ? base.filter(n => n.createdAt > after) : base
      })
    }
  }
}))

async function collectFirstChunk(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader()
  const { value } = await reader.read()
  await reader.cancel()
  return Buffer.from(value || new Uint8Array()).toString('utf8')
}

describe('SSE replay smoke test', () => {
  it('streams replay when lastEventId is provided', async () => {
    const last = encodeURIComponent(new Date('2025-01-01T00:00:00Z').toISOString())
    const req = new NextRequest(new Request(`http://localhost/api/user/notifications/stream?lastEventId=${last}`))
    const res = await UserStream(req)
    const text = await collectFirstChunk(res.body as any)
    expect(text).toContain('event: personal')
    expect(text).toContain('data:')
  })
})
