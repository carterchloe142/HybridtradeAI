import type Redis from 'ioredis'
import { pub, sub } from './redis'

export async function publish(channel: string, payload: unknown) {
  const data = JSON.stringify(payload)
  await pub.publish(channel, data)
}

export function subscribe(channel: string, handler: (payload: any) => void, client: Redis = sub) {
  client.subscribe(channel)
  const onMessage = (ch: string, message: string) => {
    if (ch !== channel) return
    try {
      handler(JSON.parse(message))
    } catch {
      handler(message)
    }
  }
  client.on('message', onMessage)
  return () => {
    client.off('message', onMessage)
    client.unsubscribe(channel)
  }
}

export const HEARTBEAT_MS = 25000

export function encodeSSE(data: any, id?: string, event?: string) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data)
  const idLine = id ? `id: ${id}\n` : ''
  const eventLine = event ? `event: ${event}\n` : ''
  return new TextEncoder().encode(`${idLine}${eventLine}data: ${payload}\n\n`)
}
