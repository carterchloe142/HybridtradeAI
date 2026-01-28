import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { broadcastNotificationToAllUsers } from '@/src/lib/notifications/broadcast'

export const config = {
  api: {
    bodyParser: false,
  },
}

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function verifyVercelSignature(rawBody: Buffer, signatureHeader: string, secret: string) {
  const expected = crypto.createHmac('sha1', secret).update(rawBody).digest('hex')
  const provided = signatureHeader.trim()

  if (!expected || !provided) return false
  try {
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(provided, 'hex')
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = String(process.env.DEPLOY_NOTIFY_SECRET || '')
  if (!secret) return res.status(500).json({ error: 'DEPLOY_NOTIFY_SECRET is not configured' })

  const rawBody = await readRawBody(req)

  const authHeader = String(req.headers.authorization || '')
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  const sig = String(req.headers['x-vercel-signature'] || '')
  const ok = bearer === secret || (sig ? verifyVercelSignature(rawBody, sig, secret) : false)
  if (!ok) return res.status(401).json({ error: 'Unauthorized' })

  let payload: any = null
  try {
    payload = JSON.parse(rawBody.toString('utf-8') || '{}')
  } catch {
    payload = {}
  }

  const project = String(payload?.payload?.project?.name || payload?.project || payload?.payload?.project || '')
  const url = String(payload?.payload?.url || payload?.url || '')
  const event = String(payload?.type || payload?.event || payload?.hook || 'deployment')
  const env = String(payload?.payload?.target || payload?.target || '')
  const now = new Date().toLocaleString()

  const title = project ? `Update deployed: ${project}` : 'Update deployed'
  const parts = [`Event: ${event}`]
  if (env) parts.push(`Target: ${env}`)
  if (url) parts.push(`URL: https://${url}`)
  parts.push(`Time: ${now}`)
  const message = parts.join('\n')

  const link = url ? `https://${url}` : (process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` : undefined)

  const result = await broadcastNotificationToAllUsers({
    type: 'deploy',
    title,
    message,
    link,
  })

  return res.status(200).json({ ok: true, processed: result.processed })
}

