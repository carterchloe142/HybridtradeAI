import type { Redis as RedisType } from 'ioredis'

// Redis configuration
// Only connect if REDIS_URL is present.
// No localhost fallback.
// No connection during build (Next.js build phase might set NODE_ENV=production but we can check specifically)

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
const DISABLE_REDIS = isBuildPhase || process.env.DISABLE_REDIS === 'true'

export const redisEnabled = !DISABLE_REDIS && Boolean(process.env.REDIS_URL)

let client: RedisType | null = null

if (!DISABLE_REDIS) {
  try {
    const Redis = require('ioredis')
    const url = process.env.REDIS_URL
    const tlsOpts = url && url.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {}
    
    // Only connect when REDIS_URL is provided. Never fallback to localhost.
    if (url) {
      client = new Redis(url, {
        ...tlsOpts,
        lazyConnect: true, // Key for stability
        maxRetriesPerRequest: 0,
        enableOfflineQueue: true,
        retryStrategy: (times: number) => {
             // Simple retry strategy
             return Math.min(times * 50, 2000);
        },
      })
    } else {
      client = null
    }
    
    if (client) {
      client.on('error', (err: any) => {
        // Log error but prevent crash
        console.error('[Redis Error]', err.message);
      })
    }
  } catch (e) {
    // If ioredis is not installed or fails, just ignore
    console.warn('[Redis] Initialization failed or disabled', e)
  }
}

export const redis = client

export function createClient(url = process.env.REDIS_URL || '') {
  if (DISABLE_REDIS) return null as unknown as RedisType
  try {
    const Redis = require('ioredis')
    const tlsOpts = url && url.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {}
    const c = url 
      ? new Redis(url, { ...tlsOpts, lazyConnect: true, maxRetriesPerRequest: 0, enableOfflineQueue: true, retryStrategy: () => null })
      : null
    
    if (c) c.on('error', () => {})
    return c as RedisType
  } catch {
    return null as unknown as RedisType
  }
}

export function duplicate(client: RedisType | null) {
  if (!client || DISABLE_REDIS) return null as unknown as RedisType
  try {
    const dup = client.duplicate({
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
      retryStrategy: () => null,
    })
    dup.on('error', () => {})
    return dup
  } catch {
    return null as unknown as RedisType
  }
}

export const pub = duplicate(redis)
export const sub = duplicate(redis)

export function createSubscriber(url = process.env.REDIS_URL || '') {
  return duplicate(createClient(url))
}
