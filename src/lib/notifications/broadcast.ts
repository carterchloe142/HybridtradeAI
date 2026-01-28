import { supabaseServer } from '@/src/lib/supabaseServer'
import { v4 as uuidv4 } from 'uuid'

export async function broadcastNotificationToAllUsers(input: {
  type: string
  title: string
  message: string
  link?: string
}) {
  if (!supabaseServer) throw new Error('Supabase not configured')

  const type = String(input.type || 'info')
  const title = String(input.title || '')
  const message = String(input.message || '')
  const link = input.link ? String(input.link) : null
  const now = new Date().toISOString()

  const batchSize = 500
  let lastId: string | null = null
  let processed = 0

  while (true) {
    let users: { id: string }[] = []

    let q1 = supabaseServer.from('User').select('id').order('id', { ascending: true }).limit(batchSize)
    if (lastId) q1 = q1.gt('id', lastId)
    const { data: u1, error: uErr1 } = await q1

    let useLowercaseUsers = false
    if (uErr1 && (String(uErr1.message || '').includes('relation') || uErr1.code === '42P01')) {
      useLowercaseUsers = true
    } else if (u1) {
      users = u1 as any
    }

    if (useLowercaseUsers) {
      let q2 = supabaseServer.from('users').select('id').order('id', { ascending: true }).limit(batchSize)
      if (lastId) q2 = q2.gt('id', lastId)
      const { data: u2 } = await q2
      if (u2) users = u2 as any
    }

    if (!users.length) break

    const ids = users.map((u) => String(u.id)).filter(Boolean)
    if (!ids.length) break

    const payload = ids.map((userId) => ({
      id: uuidv4(),
      userId,
      type,
      title,
      message,
      link,
      read: false,
      createdAt: now,
      updatedAt: now,
    }))

    const { error: nErr } = await supabaseServer.from('Notification').insert(payload)

    if (nErr) {
      const msg = String(nErr.message || '')

      const fallback1 = await supabaseServer.from('notifications').insert(
        ids.map((user_id) => ({
          id: uuidv4(),
          user_id,
          type,
          title,
          message,
          link,
          read: false,
          created_at: now,
          updated_at: now,
        }))
      )

      if (fallback1.error) {
        const fallback2 = await supabaseServer.from('notifications').insert(
          ids.map((userid) => ({
            id: uuidv4(),
            userid,
            type,
            title,
            message,
            read: false,
            createdat: now,
          }))
        )

        if (fallback2.error) {
          throw new Error(`Failed to broadcast notification: ${msg}`)
        }
      }
    }

    processed += ids.length
    lastId = users[users.length - 1].id
    if (users.length < batchSize) break
  }

  return { processed }
}

