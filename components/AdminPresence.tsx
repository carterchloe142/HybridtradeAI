'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type PresenceUser = { key: string; meta: { status?: string; ts?: string } }

export default function AdminPresence() {
  const [connected, setConnected] = useState(false)
  const [status, setStatus] = useState<string>('idle')
  const [users, setUsers] = useState<PresenceUser[]>([])
  const [err, setErr] = useState<string>('')

  const count = useMemo(() => users.length, [users])

  useEffect(() => {
    let mounted = true
    let channel: ReturnType<typeof supabase.channel> | null = null
    ;(async () => {
      try {
        const { data: session } = await supabase.auth.getSession()
        const uid = session.session?.user?.id || 'admin'
        channel = supabase.channel('traders_presence', { config: { presence: { key: uid } } })
          .on('presence', { event: 'sync' }, () => {
            try {
              const state: Record<string, any[]> = channel!.presenceState() as any
              const list: PresenceUser[] = Object.entries(state).flatMap(([key, metas]) => metas.map((m) => ({ key, meta: m as any })))
              const dedup: Record<string, PresenceUser> = {}
              for (const u of list) dedup[u.key] = u
              if (mounted) setUsers(Object.values(dedup))
            } catch {}
          })
          .subscribe((status: string) => {
            setStatus(String(status))
            setConnected(status === 'SUBSCRIBED')
          })
        await channel.track({ status: 'online', ts: new Date().toISOString() })
      } catch (e: any) {
        if (mounted) setErr(String(e?.message || 'presence_error'))
      }
    })()
    return () => {
      mounted = false
      try { channel?.unsubscribe() } catch {}
    }
  }, [])

  return (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
      <h2 className="text-xl font-semibold text-foreground">Active Traders Presence</h2>
      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <div className="glass rounded-lg p-3 border border-border">
          <div className="text-muted-foreground">Connection</div>
          <div className="mt-1 font-semibold text-foreground">{connected ? 'Connected' : 'Disconnected'}</div>
          <div className="text-xs text-muted-foreground">State: {status}</div>
        </div>
        <div className="glass rounded-lg p-3 border border-border">
          <div className="text-muted-foreground">Active traders</div>
          <div className="mt-1 font-semibold text-foreground">{count}</div>
        </div>
        <div className="glass rounded-lg p-3 border border-border">
          <div className="text-muted-foreground">Last error</div>
          <div className="mt-1 font-semibold text-foreground">{err || '—'}</div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">Presence details</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          {users.map((u) => (
            <div key={u.key} className="glass rounded-lg p-3 border border-border">
              <div className="font-mono text-xs text-muted-foreground">{u.key}</div>
              <div className="text-foreground">Status: {u.meta?.status || 'online'}</div>
              <div className="text-xs text-muted-foreground">Last: {u.meta?.ts ? new Date(u.meta.ts).toLocaleString() : '—'}</div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-sm text-muted-foreground">No active traders present on channel.</div>
          )}
        </div>
      </div>
    </div>
  )
}
