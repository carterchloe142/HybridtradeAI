jest.mock('@lib/redis', () => {
  type Handler = (ch: string, msg: string) => void
  let handler: Handler | null = null
  let subscribed: string[] = []
  const api = {
    hset: jest.fn(),
    hgetall: jest.fn(async () => ({})),
  }
  const pub = {
    publish: jest.fn(async (channel: string, payload: string) => { if (handler) handler(channel, payload) }),
  }
  const sub = {
    subscribe: jest.fn(async (channel: string) => { subscribed.push(channel) }),
    on: jest.fn((event: string, h: Handler) => { if (event === 'message') handler = h }),
    off: jest.fn((event: string, h: Handler) => { if (event === 'message' && handler === h) handler = null }),
    unsubscribe: jest.fn(async (channel: string) => { subscribed = subscribed.filter((c) => c !== channel) }),
  }
  return { __esModule: true, redis: api, pub, sub }
})

import { publish, subscribe } from '@lib/sse'

describe('sse publish/subscribe', () => {
  it('delivers messages and can unsubscribe', async () => {
    const received: any[] = []
    const unsub = subscribe('demo', (p) => { received.push(p) })
    await publish('demo', { a: 1 })
    expect(received.length).toBe(1)
    expect(received[0]).toEqual({ a: 1 })
    unsub()
    await publish('demo', { a: 2 })
    expect(received.length).toBe(1)
  })
})

