import { useEffect, useMemo, useRef, useState } from 'react'

type AdminNotification = { id: string; type: string; title: string; message: string; createdAt?: string }

export function useAdminNotifications(adminId?: string) {
  const [items, setItems] = useState<AdminNotification[]>([])
  const [connected, setConnected] = useState(false)
  const esRef = useRef<EventSource | null>(null)
  const lastIdKey = useMemo(() => (adminId ? `admin:notifications:lastId:${adminId}` : 'admin:notifications:lastId'), [adminId])

  useEffect(() => {
    let mounted = true
    const lastEventId = (() => { try { return localStorage.getItem(lastIdKey) || '' } catch { return '' } })()
    const url = lastEventId ? `/api/admin/notifications/stream?lastEventId=${encodeURIComponent(lastEventId)}` : `/api/admin/notifications/stream`
    const es = new EventSource(url)
    esRef.current = es
    es.onopen = () => { if (mounted) setConnected(true) }
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        const id = String(data?.id || '')
        if (!id) return
        setItems((prev) => {
          const exists = prev.some((p) => String(p.id) === id)
          return exists ? prev.map((p) => (String(p.id) === id ? { ...p, ...data } : p)) : [data, ...prev]
        })
        try { localStorage.setItem(lastEventId, id) } catch {}
      } catch {}
    }
    es.onerror = () => {}
    return () => { mounted = false; try { es.close() } catch {} }
  }, [lastIdKey, adminId])

  async function refreshUnread() {
    try {
      const res = await fetch('/api/admin/notifications/unread-count')
      return await res.json()
    } catch { return { total: 0, unreadByType: {} } }
  }

  return { items, connected, refreshUnread }
}

export async function useUnreadCountAdmin() {
  try {
    const res = await fetch('/api/admin/notifications/unread-count')
    const json = await res.json()
    return Number(json?.total || 0)
  } catch { return 0 }
}

