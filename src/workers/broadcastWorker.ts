import { Worker, Job } from 'bullmq'
// dynamic imports inside functions to avoid top-level crashes in tests/envs

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' }

function logToRedis(client: any, jobId: string, entry: any) {
  try {
    client.lpush(`job_logs:broadcast:${jobId}`, JSON.stringify(entry))
    client.ltrim(`job_logs:broadcast:${jobId}`, 0, 500)
  } catch {}
}

async function processJob(job: Job) {
  const { createClient } = await import('../lib/redis')
  const client = createClient()
  const jobId = String(job.id)
  try {
    logToRedis(client, jobId, { ts: Date.now(), status: 'started', data: job.data })

    const globalNotificationId = job.data?.globalNotificationId
    if (!globalNotificationId) throw new Error('missing globalNotificationId')

    const { default: prisma } = await import('../lib/prisma')
    const g = await prisma.globalNotification.findUnique({ where: { id: globalNotificationId } })
    if (!g) throw new Error('global notification not found')

    const batchSize = 500
    let cursor: string | null = null
    let processed = 0

    while (true) {
      const users: { id: string }[] = await prisma.user.findMany({
        select: { id: true },
        orderBy: { id: 'asc' },
        take: batchSize,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      })
      if (!users.length) break
      const { publish } = await import('../lib/sse')
      for (const u of users) {
        const note = await prisma.notification.create({ data: { userId: u.id, type: g.type, title: g.title, message: g.message } })
        await prisma.notificationDelivery.create({ data: { globalNotificationId: g.id, userId: u.id } })
        await publish(`user:${u.id}`, { id: note.id, type: note.type, title: note.title, message: note.message, createdAt: note.createdAt })
        processed += 1
        if (processed % 100 === 0) logToRedis(client, jobId, { ts: Date.now(), status: 'progress', processed })
      }
      cursor = users[users.length - 1].id
      if (users.length < batchSize) break
    }

    logToRedis(client, jobId, { ts: Date.now(), status: 'completed', processed })
    client.disconnect()
    return { ok: true, processed }
  } catch (err) {
    logToRedis(createClient(), jobId, { ts: Date.now(), status: 'failed', error: String(err) })
    throw err
  }
}

let worker: Worker | null = null

export function startBroadcastWorker() {
  if (worker) return worker
  if (process.env.NODE_ENV === 'test') return null as any
  worker = new Worker('broadcast', async (job: Job) => processJob(job), { connection })
  worker.on('failed', (job, err) => console.error('broadcast job failed', job?.id, err))
  return worker
}

if (process.env.NODE_ENV !== 'test' && process.env.START_BROADCAST_WORKER === '1') {
  startBroadcastWorker()
}

export default startBroadcastWorker
