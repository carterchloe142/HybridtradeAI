'use client'
import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { authedFetcher, authedJson } from '@/lib/supabase'

type Item = { id: string; type: string; title: string; message: string; createdAt: string; read?: boolean }

export default function AdminNotificationsPage() {
  const [scope, setScope] = useState<'personal' | 'global'>('personal')
  const [type, setType] = useState<string>('')
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false)
  const qs = useMemo(() => {
    const p = new URLSearchParams()
    p.set('scope', scope)
    if (type) p.set('type', type)
    if (unreadOnly) p.set('unreadOnly', 'true')
    p.set('limit', '50')
    return p.toString()
  }, [scope, type, unreadOnly])
  const { data, mutate } = useSWR(`/api/admin/notifications?${qs}`, authedFetcher)
  const items: Item[] = Array.isArray(data?.items) ? data.items : []
  const [selected, setSelected] = useState<string[]>([])

  async function markSelectedRead() {
    if (scope !== 'personal' || selected.length === 0) return
    await authedJson('/api/admin/notifications/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selected }) })
    setSelected([])
    mutate()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Notifications</h1>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm text-foreground">Scope</label>
        <select className="px-3 py-2 rounded border border-input bg-background text-foreground" value={scope} onChange={(e) => setScope(e.target.value as any)}>
          <option value="personal">Personal</option>
          <option value="global">Global</option>
        </select>
        <label className="text-sm text-foreground">Type</label>
        <input className="px-3 py-2 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground" placeholder="type" value={type} onChange={(e) => setType(e.target.value)} />
        {scope === 'personal' && (
          <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} /> Unread only</label>
        )}
        {scope === 'personal' && (
          <button className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90" disabled={selected.length === 0} onClick={markSelectedRead}>Mark selected read</button>
        )}
      </div>

      <div className="rounded-xl bg-card border border-border">
        <table className="w-full text-sm text-foreground">
          <thead className="text-left bg-muted/50 border-b border-border">
            <tr>
              {scope === 'personal' && <th className="p-3 font-medium text-muted-foreground">Select</th>}
              <th className="p-3 font-medium text-muted-foreground">Type</th>
              <th className="p-3 font-medium text-muted-foreground">Title</th>
              <th className="p-3 font-medium text-muted-foreground">Message</th>
              <th className="p-3 font-medium text-muted-foreground">Created</th>
              {scope === 'personal' && <th className="p-3 font-medium text-muted-foreground">Read</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((n: any) => (
              <tr key={n.id} className="hover:bg-muted/50">
                {scope === 'personal' && (
                  <td className="p-3">
                    <input type="checkbox" checked={selected.includes(n.id)} onChange={(e) => {
                      if (e.target.checked) setSelected((s) => [...s, n.id])
                      else setSelected((s) => s.filter((x) => x !== n.id))
                    }} />
                  </td>
                )}
                <td className="p-3">{n.type}</td>
                <td className="p-3">{n.title}</td>
                <td className="p-3">{n.message}</td>
                <td className="p-3">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</td>
                {scope === 'personal' && <td className="p-3">{n.read ? 'Yes' : 'No'}</td>}
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-3 text-muted-foreground" colSpan={scope === 'personal' ? 6 : 5}>No notifications</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
