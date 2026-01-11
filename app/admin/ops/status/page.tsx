'use client'
import useSWR from 'swr'
import { useI18n } from '@/hooks/useI18n'
import AdminPresence from '@/components/AdminPresence'
import { authedFetcher } from '@/lib/supabase'

export default function AdminStatusPage() {
  const { t } = useI18n()
  const { data: rl } = useSWR('/api/admin/rate-limit/status?scope=admin', authedFetcher, { refreshInterval: 15000, errorRetryCount: 3, errorRetryInterval: 3000 })
  const { data: queue } = useSWR('/api/admin/queue/stats', authedFetcher, { refreshInterval: 15000, errorRetryCount: 3, errorRetryInterval: 3000 })

  const rlItems = Array.isArray(rl?.items) ? rl.items : []
  const counts = queue?.counts || {}
  const healthyQueues = ['waiting','active','failed','completed'].every((k) => typeof counts[k] === 'number')
  const backendHealthy = !!queue && !!rl

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Status</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-neon p-4">
          <div className="text-sm text-muted-foreground">Backend</div>
          <div className="text-2xl font-bold">{backendHealthy ? 'OK' : 'Unavailable'}</div>
        </div>
        <div className="card-neon p-4">
          <div className="text-sm text-muted-foreground">Queues</div>
          <div className="text-2xl font-bold">{healthyQueues ? 'OK' : 'Unavailable'}</div>
        </div>
        <div className="card-neon p-4">
          <div className="text-sm text-muted-foreground">Rate‑Limit</div>
          <div className="text-2xl font-bold">{rlItems.length ? 'Active' : 'Idle'}</div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Rate‑Limit Buckets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rlItems.map((it: any) => (
            <div key={it.key} className="card-neon p-4">
              <div className="font-mono text-xs mb-1">{it.key}</div>
              <div className="text-sm">{t('admin_rl_tokens')}: {it.tokens}</div>
              <div className="text-xs text-muted-foreground">{t('admin_rl_timestamp')}: {it.timestamp}</div>
            </div>
          ))}
          {rlItems.length === 0 && <div className="text-sm text-muted-foreground">{t('admin_rl_empty')}</div>}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Queue Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {['waiting','active','completed','failed','delayed','paused'].map((k) => (
            <div key={k} className="card-neon p-4">
              <div className="text-sm text-muted-foreground">{t(`admin_queue.status.${k}`)}</div>
              <div className="text-2xl font-bold">{counts[k] ?? 0}</div>
            </div>
          ))}
        </div>
      </div>

      <AdminPresence />
    </div>
  )
}
