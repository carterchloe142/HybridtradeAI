import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '../../../../lib/adminAuth'
import { supabaseServer } from '../../../../lib/supabaseServer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })
  const admin = await requireAdmin(req)
  if (!admin.ok) return res.status(401).json({ error: admin.error || 'unauthorized' })

  try {
    const name = 'kyc'
    const existing = await (supabaseServer.storage as any).getBucket?.(name)
    if (existing?.data?.name === name) {
      await (supabaseServer.storage as any).updateBucket?.(name, {
        public: false,
        fileSizeLimit: '10MB',
        allowedMimeTypes: ['image/jpeg','image/png','application/pdf','application/json','text/plain']
      })
      return res.json({ ok: true, bucket: name, updated: true })
    }
    const created = await (supabaseServer.storage as any).createBucket?.(name, {
      public: false,
      fileSizeLimit: '10MB',
      allowedMimeTypes: ['image/jpeg','image/png','application/pdf','application/json','text/plain']
    })
    if (created?.error) return res.status(500).json({ error: String(created.error.message || 'create_failed') })
    return res.json({ ok: true, bucket: name, created: true })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'server_error' })
  }
}

export const config = { api: { bodyParser: false } }
