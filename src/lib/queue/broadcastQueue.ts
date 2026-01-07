import { Queue } from 'bullmq'

let q: Queue | null = null

export function getBroadcastQueue() {
  const url = process.env.REDIS_URL || ''
  if (!url || process.env.DISABLE_REDIS === 'true' || process.env.VERCEL) {
    return {
      add: async () => ({ id: 'mock', getState: async () => 'completed' }),
      getJob: async () => null,
    } as any
  }
  if (!q) q = new Queue('broadcast', { connection: { url } })
  return q
}

export const broadcastQueue = getBroadcastQueue()

export async function enqueueBroadcast(globalNotificationId: string, opts?: { delay?: number; attempts?: number; backoff?: number }) {
  const attempts = Math.max(1, Number(opts?.attempts ?? 3))
  const backoff = Math.max(0, Number(opts?.backoff ?? 5000))
  const delay = Math.max(0, Number(opts?.delay ?? 0))
  return broadcastQueue.add('broadcast', { globalNotificationId }, {
    attempts,
    backoff: { type: 'fixed', delay: backoff },
    delay,
    removeOnComplete: true,
    removeOnFail: false,
  })
}
