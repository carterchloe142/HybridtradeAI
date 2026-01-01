import Redis from 'ioredis'

export const redisEnabled = Boolean(process.env.REDIS_URL)

export function createClient(url = process.env.REDIS_URL || '') {
  if (!url) {
    const stub: any = {
      status: 'end',
      publish: async () => 0,
      subscribe: async () => 0,
      unsubscribe: async () => 0,
      on: () => {},
      off: () => {},
      duplicate: () => stub,
      script: async () => '',
      evalsha: async () => 0,
      eval: async () => 0,
    }
    return stub
  }
  const tlsOpts = url.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {}
  const client = new Redis(url, {
    ...tlsOpts as any,
    lazyConnect: true,
    maxRetriesPerRequest: 0,
    enableOfflineQueue: true,
    retryStrategy: () => null,
  } as any)
  client.on('error', () => {})
  client.on('connect', () => {})
  client.on('ready', () => {})
  client.on('end', () => {})
  return client
}

export const redis = createClient()

export function duplicate(client: Redis) {
  const dup = client.duplicate({
    lazyConnect: true,
    maxRetriesPerRequest: 0,
    enableOfflineQueue: false,
    retryStrategy: () => null,
  } as any)
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
