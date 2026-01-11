'use client'
import useSWR from 'swr'
import { useCallback, useMemo, useState, useEffect } from 'react'
import { useI18n } from '@/hooks/useI18n'
import { authedFetcher, authedJson } from '@/lib/supabase'

export default function QueueDashboardPage() {
  const { t } = useI18n()
  const { data: stats, error: statsError, mutate: mutateStats } = useSWR('/api/admin/queue/stats', authedFetcher, { refreshInterval: 5000, errorRetryCount: 3, errorRetryInterval: 3000 })
  const [status, setStatus] = useState('waiting')
  const { data: jobs, error: jobsError, mutate: mutateJobs } = useSWR(`/api/admin/queue/jobs?status=${status}&limit=20`, authedFetcher, { refreshInterval: 5000, errorRetryCount: 3, errorRetryInterval: 3000 })
  const { data: rl, error: rlError } = useSWR('/api/admin/rate-limit/status?scope=admin', authedFetcher, { refreshInterval: 10000, errorRetryCount: 3, errorRetryInterval: 3000 })
  const items = useMemo(() => Array.isArray(jobs?.items) ? jobs.items : [], [jobs])
  const counts = stats?.counts || {}

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: selected } = useSWR(selectedId ? `/api/admin/queue/job/${selectedId}` : null, authedFetcher, { refreshInterval: 2000 })
  const [showData, setShowData] = useState(false)
  const [showLogs, setShowLogs] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setSelectedId(null) }
    if (selectedId) window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey) }
  }, [selectedId])

  const [query, setQuery] = useState('')
  const [queue, setQueue] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const retry = useCallback(async (id: string) => {
    await authedJson(`/api/admin/queue/job/${id}/retry`, { method: 'POST' })
    mutateJobs()
    mutateStats()
  }, [mutateJobs, mutateStats])

  const remove = useCallback(async (id: string) => {
    await authedJson(`/api/admin/queue/job/${id}`, { method: 'DELETE' })
    mutateJobs()
    mutateStats()
    setSelectedId(null)
  }, [mutateJobs, mutateStats])

  const filtered = useMemo(() => {
    return items.filter((j: any) => {
      const okName = query ? String(j.name || '').toLowerCase().includes(query.toLowerCase()) : true
      const qn = String((j.queue || j.queueName || '')).toLowerCase()
      const okQueue = queue === 'all' ? true : qn === queue.toLowerCase()
      return okName && okQueue
    })
  }, [items, query, queue])

  function toggleSelect(id: string) {
    setSelectedIds((curr) => (curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]))
  }

  async function bulkRetry() {
    for (const id of selectedIds) { await retry(id) }
    setSelectedIds([])
  }

  async function bulkRemove() {
    for (const id of selectedIds) { await remove(id) }
    setSelectedIds([])
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{t('admin_queue_title')}</h1>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {['waiting','active','completed','failed','delayed','paused'].map((k) => (
          <div key={k} className="card-neon p-4">
            <div className="text-sm text-muted-foreground">{t(`admin_queue.status.${k}`)}</div>
            <div className="text-2xl font-bold">{counts[k] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <label className="text-sm text-muted-foreground">{t('admin_queue_filter_status')}</label>
        <select className="px-3 py-2 rounded border border-input bg-background text-foreground" value={status} onChange={(e) => setStatus(e.target.value)}>
          {['waiting','active','completed','failed','delayed','paused'].map((k) => (<option key={k} value={k}>{t(`admin_queue.status.${k}`)}</option>))}
        </select>
        <label className="text-sm text-muted-foreground">{t('admin_queue_filter_name')}</label>
        <input className="px-3 py-2 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground/50" placeholder={t('admin_queue_filter_name')} value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="text-sm text-muted-foreground">{t('admin_queue_filter_queue')}</label>
        <select className="px-3 py-2 rounded border border-input bg-background text-foreground" value={queue} onChange={(e) => setQueue(e.target.value)}>
          {['all','default','broadcast','email','payments'].map((q) => (<option key={q} value={q}>{q}</option>))}
        </select>
        <button className="px-3 py-2 rounded bg-secondary hover:bg-secondary/80 text-foreground transition" onClick={bulkRetry} disabled={!selectedIds.length}>{t('retry')}</button>
        <button className="px-3 py-2 rounded bg-destructive hover:bg-destructive/80 text-destructive-foreground transition" onClick={bulkRemove} disabled={!selectedIds.length}>{t('remove')}</button>
      </div>

      {jobsError && (
        <div className="card-neon p-4 mb-4">
          <div className="text-sm text-muted-foreground">Failed to load jobs.</div>
          <button className="mt-2 px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground transition" onClick={() => mutateJobs()}>Retry</button>
        </div>
      )}
      <div className="card-neon overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left border-b border-border bg-muted/50">
            <tr>
              <th className="p-3"><input type="checkbox" aria-label="select all" onChange={(e) => setSelectedIds(e.target.checked ? filtered.map((j: any) => String(j.id)) : [])} checked={selectedIds.length === filtered.length && filtered.length > 0} className="rounded border-input bg-background text-primary focus:ring-primary" /></th>
              <th className="p-3 text-muted-foreground font-medium">{t('admin_queue.table.id')}</th>
              <th className="p-3 text-muted-foreground font-medium">{t('admin_queue.table.name')}</th>
              <th className="p-3 text-muted-foreground font-medium">{t('admin_queue.table.progress')}</th>
              <th className="p-3 text-muted-foreground font-medium">{t('admin_queue.table.state')}</th>
              <th className="p-3 text-muted-foreground font-medium">{t('admin_queue.table.updated')}</th>
            </tr>
          </thead>
          <tbody>
            {!filtered.length && !items.length && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk_${i}`} className="animate-pulse">
                  <td className="p-3"><div className="h-3 bg-muted rounded" /></td>
                  <td className="p-3"><div className="h-3 bg-muted rounded" /></td>
                  <td className="p-3"><div className="h-3 bg-muted rounded" /></td>
                  <td className="p-3"><div className="h-3 bg-muted rounded" /></td>
                  <td className="p-3"><div className="h-3 bg-muted rounded" /></td>
                  <td className="p-3"><div className="h-3 bg-muted rounded" /></td>
                </tr>
              ))
            )}
            {filtered.map((j: any) => (
              <tr key={j.id} className="cursor-pointer hover:bg-muted/50 border-b border-border last:border-0 transition-colors" onClick={() => setSelectedId(String(j.id))}>
                <td className="p-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={`select ${j.id}`} checked={selectedIds.includes(String(j.id))} onChange={() => toggleSelect(String(j.id))} className="rounded border-input bg-background text-primary focus:ring-primary" /></td>
                <td className="p-3 font-mono text-xs text-foreground">{j.id}</td>
                <td className="p-3 text-foreground">{j.name}</td>
                <td className="p-3 text-foreground">{typeof j.progress === 'number' ? `${j.progress}%` : ''}</td>
                <td className="p-3 text-foreground">{j.state}</td>
                <td className="p-3 text-foreground">{j.processedOn ? new Date(j.processedOn).toLocaleString() : ''}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="p-3 text-muted-foreground text-center" colSpan={5}>{t('admin_queue_empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {rlError && (
        <div className="card-neon p-4 mb-4">
          <div className="text-sm text-muted-foreground">Failed to load rate‑limit status.</div>
          <button className="mt-2 px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground transition" onClick={() => { /* no mutate ref */ }}>Retry</button>
        </div>
      )}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3 text-foreground">{t('admin_rl_title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Array.isArray(rl?.items) ? rl.items : []).map((it: any) => (
            <div key={it.key} className="card-neon p-4">
              <div className="font-mono text-xs mb-1 text-foreground">{it.key}</div>
              <div className="text-sm text-foreground">{t('admin_rl_tokens')}: {it.tokens}</div>
              <div className="text-xs text-muted-foreground">{t('admin_rl_timestamp')}: {it.timestamp}</div>
            </div>
          ))}
          {(Array.isArray(rl?.items) ? rl.items : []).length === 0 && <div className="text-sm text-muted-foreground">{t('admin_rl_empty')}</div>}
        </div>
      </div>

      {selectedId && selected && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedId(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="jobModalTitle" className="max-w-2xl w-full card-neon p-6 border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 id="jobModalTitle" className="text-lg font-semibold text-foreground">{t('admin_job_title', { id: String(selected.id) })}</h3>
              <button autoFocus className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground transition" onClick={() => setSelectedId(null)}>{t('close')}</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-foreground">
              <div>{t('admin_job_state_label')}: {selected.state}</div>
              <div>{t('admin_job_progress_label')}: {typeof selected.progress === 'number' ? `${selected.progress}%` : ''}</div>
              <div>{t('admin_job_attempts_label')}: {selected.attemptsMade}</div>
              <div>{t('admin_job_processed_label')}: {selected.processedOn ? new Date(selected.processedOn).toLocaleString() : ''}</div>
              <div>{t('admin_job_finished_label')}: {selected.finishedOn ? new Date(selected.finishedOn).toLocaleString() : ''}</div>
            </div>
            <div className="mb-4">
              <button className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground transition" onClick={() => setShowData((v) => !v)}>{t('admin_job_data')}</button>
              {showData && (
                <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-40 text-foreground">{JSON.stringify(selected.data, null, 2)}</pre>
              )}
            </div>
            <div className="mb-4">
              <button className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground transition" onClick={() => setShowLogs((v) => !v)}>{t('admin_job_logs')}</button>
              {showLogs && (
                <div className="mt-2 space-y-2 max-h-40 overflow-auto">
                  {Array.isArray(selected.logs) && selected.logs.map((l: any, i: number) => (
                    <div key={i} className="text-xs bg-muted rounded p-2 text-foreground">{JSON.stringify(l)}</div>
                  ))}
                  {(!selected.logs || selected.logs.length === 0) && <div className="text-xs text-muted-foreground">{t('admin_job_logs_empty')}</div>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground transition" onClick={() => retry(String(selected.id))}>{t('retry')}</button>
              <button className="px-4 py-2 rounded bg-destructive hover:bg-destructive/90 text-destructive-foreground transition" onClick={() => remove(String(selected.id))}>{t('remove')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
