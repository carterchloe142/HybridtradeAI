import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/src/lib/supabaseServer'
import { broadcastNotificationToAllUsers } from '@/src/lib/notifications/broadcast'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  if (!token) return res.status(401).json({ error: 'Missing authorization token' })
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' })

  const { data: auth, error: userErr } = await supabaseServer.auth.getUser(token)
  const user = auth?.user
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' })

  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('role,is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  const userRole = String(profile?.role || '').toLowerCase()
  const isAdmin = Boolean(profile?.is_admin) || userRole === 'admin'
  if (!isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required' })

  const { type = 'info', title, message, link } = req.body || {}
  if (!title || !message) return res.status(400).json({ error: 'title and message are required' })

  const result = await broadcastNotificationToAllUsers({
    type: String(type || 'info'),
    title: String(title),
    message: String(message),
    link: link ? String(link) : undefined,
  })

  return res.status(200).json({ ok: true, processed: result.processed })
}

