"use client"
import { useMemo, useState } from 'react'
import { useUserNotifications } from '../../src/hooks/useUserNotifications'
import { useI18n } from '../../hooks/useI18n'

export default function NotificationCenter() {
  const { t } = useI18n()
  const { items, markRead } = useUserNotifications()
  const [page, setPage] = useState(0)
  const pageSize = 20
  const pages = useMemo(() => Math.max(1, Math.ceil(items.length / pageSize)), [items.length])
  const view = useMemo(() => items.slice(page * pageSize, (page + 1) * pageSize), [items, page])

  const unreadIds = useMemo(() => items.filter((i) => !i.read).map((i) => String(i.id)), [items])

  return (
    <div className="rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold neon-text">{t('notifications_title')}</h2>
        <div className="flex items-center gap-2">
          <button className="btn-neon" onClick={() => markRead(unreadIds)}>{t('notifications_mark_all')}</button>
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
                <span className="inline-flex text-[10px] px-2 py-0.5 rounded bg-purple-600 text-white">{t('notifications_global_tag')}</span>
              )}
              {!n.read && (
                <span className="inline-flex text-[10px] px-2 py-0.5 rounded bg-neon-blue text-white">{t('notifications_new_tag')}</span>
              )}
              <button className="text-xs hover:text-neon-blue" onClick={() => markRead([String(n.id)])}>{t('notifications_mark_one')}</button>
            </div>
          </div>
        ))}
        {view.length === 0 && (
          <div className="text-sm text-white/70">{t('notifications_empty')}</div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button className="btn-neon" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>{t('prev')}</button>
        <div className="text-xs">{t('page_of', { page: page + 1, pages })}</div>
        <button className="btn-neon" disabled={page + 1 >= pages} onClick={() => setPage((p) => Math.min(p + 1, pages - 1))}>{t('next')}</button>
      </div>
    </div>
  )
}
