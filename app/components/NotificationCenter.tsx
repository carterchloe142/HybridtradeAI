"use client"
import { useMemo, useState } from 'react'
import { useUserNotifications } from '../../src/hooks/useUserNotifications'

export default function NotificationCenter() {
  const { items, markRead } = useUserNotifications()
  const [page, setPage] = useState(0)
  const pageSize = 20
  const pages = useMemo(() => Math.max(1, Math.ceil(items.length / pageSize)), [items.length])
  const view = useMemo(() => items.slice(page * pageSize, (page + 1) * pageSize), [items, page])

  const unreadIds = useMemo(() => items.filter((i) => !i.read).map((i) => String(i.id)), [items])

  return (
    <div className="rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold neon-text">Notifications</h2>
        <div className="flex items-center gap-2">
          <button className="btn-neon" onClick={() => markRead(unreadIds)}>Mark all as read</button>
        </div>
      </div>
      <div className="space-y-2">
        {view.map((n) => (
          <div key={n.id} className="rounded-lg p-3 bg-white/5 flex items-start justify-between">
            <div>
              <div className="text-sm font-medium">{n.title}</div>
              <div className="text-xs text-white/70">{n.message}</div>
            </div>
            <div className="flex items-center gap-2">
              {String((n as any).event || '') === 'global' && (
                <span className="inline-flex text-[10px] px-2 py-0.5 rounded bg-purple-600 text-white">global</span>
              )}
              {!n.read && (
                <span className="inline-flex text-[10px] px-2 py-0.5 rounded bg-neon-blue text-white">new</span>
              )}
              <button className="text-xs hover:text-neon-blue" onClick={() => markRead([String(n.id)])}>Mark read</button>
            </div>
          </div>
        ))}
        {view.length === 0 && (
          <div className="text-sm text-white/70">No notifications.</div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button className="btn-neon" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</button>
        <div className="text-xs">Page {page + 1} / {pages}</div>
        <button className="btn-neon" disabled={page + 1 >= pages} onClick={() => setPage((p) => Math.min(p + 1, pages - 1))}>Next</button>
      </div>
    </div>
  )
}
