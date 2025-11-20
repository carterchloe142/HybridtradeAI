import { Queue } from 'bullmq'

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' }

let q: Queue | null = null

export function getBroadcastQueue() {
  if (!q) q = new Queue('broadcast', { connection })
  return q
}

export const broadcastQueue = getBroadcastQueue()

