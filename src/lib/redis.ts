import Redis from 'ioredis'

export function createClient(url = process.env.REDIS_URL || 'redis://localhost:6379') {
  const tlsOpts = url.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {}
  const client = new Redis(url, tlsOpts as any)
  client.on('error', () => {})
  client.on('connect', () => {})
  client.on('ready', () => {})
  client.on('end', () => {})
  return client
}

export const redis = createClient()

export function duplicate(client: Redis) {
  const dup = client.duplicate()
  dup.on('error', () => {})
  dup.on('connect', () => {})
  dup.on('ready', () => {})
  dup.on('end', () => {})
  return dup
}

export const pub = duplicate(redis)
export const sub = duplicate(redis)

export function createSubscriber(url = process.env.REDIS_URL || 'redis://localhost:6379') {
  return duplicate(createClient(url))
}
