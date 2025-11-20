'use client'
import useSWR from 'swr'
import { useCallback, useMemo, useState } from 'react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function QueueDashboardPage() {
  const { data: stats, mutate: mutateStats } = useSWR('/api/admin/queue/stats', fetcher, { refreshInterval: 5000 })
  const [status, setStatus] = useState('waiting')
  const { data: jobs, mutate: mutateJobs } = useSWR(`/api/admin/queue/jobs?status=${status}&limit=20`, fetcher, { refreshInterval: 5000 })
  const { data: rl } = useSWR('/api/admin/rate-limit/status?scope=admin', fetcher, { refreshInterval: 10000 })
  const items = useMemo(() => Array.isArray(jobs?.items) ? jobs.items : [], [jobs])
  const counts = stats?.counts || {}

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: selected } = useSWR(selectedId ? `/api/admin/queue/job/${selectedId}` : null, fetcher)

  const retry = useCallback(async (id: string) => {
    await fetch(`/api/admin/queue/job/${id}/retry`, { method: 'POST' })
    mutateJobs()
    mutateStats()
  }, [mutateJobs, mutateStats])

  const remove = useCallback(async (id: string) => {
    await fetch(`/api/admin/queue/job/${id}`, { method: 'DELETE' })
    mutateJobs()
    mutateStats()
    setSelectedId(null)
  }, [mutateJobs, mutateStats])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Queue Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {['waiting','active','completed','failed','delayed','paused'].map((k) => (
          <div key={k} className="rounded-xl bg-white/5 dark:bg-black/20 backdrop-blur-lg p-4 border border-white/10">
            <div className="text-sm opacity-70">{k}</div>
            <div className="text-2xl font-bold">{counts[k] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm">Status</label>
        <select className="px-3 py-2 rounded border border-white/10 bg-black/20" value={status} onChange={(e) => setStatus(e.target.value)}>
          {['waiting','active','completed','failed','delayed','paused'].map((k) => (<option key={k} value={k}>{k}</option>))}
        </select>
      </div>

      <div className="rounded-xl bg-white/5 dark:bg-black/20 backdrop-blur-lg border border-white/10">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Progress</th>
              <th className="p-3">State</th>
              <th className="p-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.map((j: any) => (
              <tr key={j.id} className="cursor-pointer hover:bg-white/10" onClick={() => setSelectedId(String(j.id))}>
                <td className="p-3 font-mono text-xs">{j.id}</td>
                <td className="p-3">{j.name}</td>
                <td className="p-3">{typeof j.progress === 'number' ? `${j.progress}%` : ''}</td>
                <td className="p-3">{j.state}</td>
                <td className="p-3">{j.processedOn ? new Date(j.processedOn).toLocaleString() : ''}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-3" colSpan={5}>No jobs</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Admin Rate-Limit Buckets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Array.isArray(rl?.items) ? rl.items : []).map((it: any) => (
            <div key={it.key} className="rounded-xl bg-white/5 dark:bg-black/20 backdrop-blur-lg p-4 border border-white/10">
              <div className="font-mono text-xs mb-1">{it.key}</div>
              <div className="text-sm">Tokens: {it.tokens}</div>
              <div className="text-xs opacity-70">Ts: {it.timestamp}</div>
            </div>
          ))}
          {(Array.isArray(rl?.items) ? rl.items : []).length === 0 && <div className="text-sm opacity-70">No buckets</div>}
        </div>
      </div>

      {selectedId && selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setSelectedId(null)}>
          <div className="max-w-2xl w-full rounded-xl bg-white/5 dark:bg-black/30 border border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Job {selected.id}</h3>
              <button className="px-3 py-1 rounded bg-white/10" onClick={() => setSelectedId(null)}>Close</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div>State: {selected.state}</div>
              <div>Progress: {typeof selected.progress === 'number' ? `${selected.progress}%` : ''}</div>
              <div>Attempts: {selected.attemptsMade}</div>
              <div>Processed: {selected.processedOn ? new Date(selected.processedOn).toLocaleString() : ''}</div>
              <div>Finished: {selected.finishedOn ? new Date(selected.finishedOn).toLocaleString() : ''}</div>
            </div>
            <div className="mb-4">
              <div className="text-sm opacity-70 mb-1">Data</div>
              <pre className="text-xs bg-black/30 rounded p-3 overflow-auto max-h-40">{JSON.stringify(selected.data, null, 2)}</pre>
            </div>
            <div className="mb-4">
              <div className="text-sm opacity-70 mb-1">Logs</div>
              <div className="space-y-2 max-h-40 overflow-auto">
                {Array.isArray(selected.logs) && selected.logs.map((l: any, i: number) => (
                  <div key={i} className="text-xs bg-black/30 rounded p-2">{JSON.stringify(l)}</div>
                ))}
                {(!selected.logs || selected.logs.length === 0) && <div className="text-xs opacity-70">No logs</div>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded bg-green-600" onClick={() => retry(String(selected.id))}>Retry</button>
              <button className="px-4 py-2 rounded bg-red-600" onClick={() => remove(String(selected.id))}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

