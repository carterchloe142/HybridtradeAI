'use client'
import useSWR from 'swr'
import { useState, useEffect } from 'react'
import AdminGuard from '@/components/AdminGuard'
import { authedFetcher, authedJson } from '@/lib/supabase'

type Summary = {
  reserveBuffer: { currentAmount: number; totalAUM: number; updatedAt: string | null }
  aumUSD: number
  walletsUSDTotal: number
  currencyBreakdown: { currency: string; total: number }[]
  currencyBreakdownUSD: { currency: string; total: number; usd: number }[]
  coveragePct: number
  generatedAt: string
  error?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminTransparencyPage() {
  const { data, error, mutate, isLoading } = useSWR<Summary>('/api/transparency', fetcher, { refreshInterval: 30000 })
  const { data: cfg, mutate: mutateCfg } = useSWR<any>('/api/admin/proof-config', authedFetcher)
  const { data: dpCfg, mutate: mutateDp } = useSWR<any>('/api/admin/por-privacy-config', authedFetcher)
  const { data: audit } = useSWR<any>('/api/admin/por-audit', authedFetcher)
  const hasError = !!error || !!data?.error
  const cb = Array.isArray(data?.currencyBreakdownUSD) ? data!.currencyBreakdownUSD : []
  const [userMessage, setUserMessage] = useState('')
  const [hideMerkleSection, setHideMerkleSection] = useState(false)
  const [epsilon, setEpsilon] = useState<number>(0.5)
  const [sensitivity, setSensitivity] = useState<number>(1000)
  useEffect(() => {
    setUserMessage(String(cfg?.config?.userMessage || ''))
    setHideMerkleSection(cfg?.config?.hideMerkleSection === true)
  }, [cfg])
  useEffect(() => {
    setEpsilon(Number(dpCfg?.config?.epsilon ?? 0.5))
    setSensitivity(Number(dpCfg?.config?.sensitivity ?? 1000))
  }, [dpCfg])

  return (
    <AdminGuard>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Proof of Reserves</h1>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card-neon p-4">
            <div className="text-sm text-muted-foreground">Reserve Buffer (USD)</div>
            <div className="text-2xl font-bold">{Number(data?.reserveBuffer?.currentAmount || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Updated {data?.reserveBuffer?.updatedAt ? new Date(data.reserveBuffer.updatedAt).toLocaleString() : '—'}</div>
          </div>
          <div className="card-neon p-4">
            <div className="text-sm text-muted-foreground">AUM (USD)</div>
            <div className="text-2xl font-bold">{Number(data?.aumUSD || 0).toLocaleString()}</div>
          </div>
          <div className="card-neon p-4">
            <div className="text-sm text-muted-foreground">Wallets Total (USD)</div>
            <div className="text-2xl font-bold">{Number(data?.walletsUSDTotal || 0).toLocaleString()}</div>
          </div>
          <div className="card-neon p-4">
            <div className="text-sm text-muted-foreground">Coverage</div>
            <div className="text-2xl font-bold">{Number(data?.coveragePct || 0).toFixed(2)}%</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-neon" onClick={() => mutate()}>Refresh</button>
          {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {hasError && <div className="text-sm text-destructive">Error loading transparency summary.</div>}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-foreground">Currency Breakdown</h2>
          <div className="rounded-xl bg-card border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left text-muted-foreground">Currency</th>
                  <th className="p-3 text-right text-muted-foreground">Total</th>
                  <th className="p-3 text-right text-muted-foreground">USD Equivalent</th>
                </tr>
              </thead>
              <tbody>
                {cb.map((row) => (
                  <tr key={row.currency} className="hover:bg-muted/50 border-b border-border last:border-0">
                    <td className="p-3 text-foreground">{row.currency}</td>
                    <td className="p-3 text-right text-foreground">{Number(row.total).toLocaleString()}</td>
                    <td className="p-3 text-right text-foreground">{Number(row.usd).toLocaleString()}</td>
                  </tr>
                ))}
                {cb.length === 0 && (
                  <tr>
                    <td className="p-3 text-muted-foreground" colSpan={3}>No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-muted-foreground mt-2">Generated {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—'}</div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Publish to Users</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-muted-foreground">User Message</div>
              <textarea className="w-full mt-1 rounded-md bg-background border border-input p-2 text-foreground" rows={3} value={userMessage} onChange={(e) => setUserMessage(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input id="hideMerkle" type="checkbox" checked={hideMerkleSection} onChange={(e) => setHideMerkleSection(e.target.checked)} className="rounded border-input bg-background text-primary focus:ring-primary" />
              <label htmlFor="hideMerkle" className="text-sm text-foreground">Hide user verification section</label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-neon" onClick={async () => {
              const body = {
                mode: 'published',
                userMessage,
                hideMerkleSection,
                reserveBuffer: data?.reserveBuffer || { currentAmount: 0, totalAUM: 0, updatedAt: null },
                aumUSD: Number(data?.aumUSD || 0),
                walletsUSDTotal: Number(data?.walletsUSDTotal || 0),
                currencyBreakdown: Array.isArray(data?.currencyBreakdown) ? data?.currencyBreakdown : [],
                currencyBreakdownUSD: Array.isArray(data?.currencyBreakdownUSD) ? data?.currencyBreakdownUSD : [],
                coveragePct: Number(data?.coveragePct || 0),
                generatedAt: data?.generatedAt || new Date().toISOString()
              }
              try {
                await authedJson('/api/admin/proof-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                await mutateCfg()
                alert('Published')
              } catch (e: any) {
                alert(String(e?.message || 'Publish failed'))
              }
            }}>Publish Live Summary</button>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Privacy Settings</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Epsilon (privacy)</div>
              <input className="w-full mt-1 rounded-md bg-background border border-input p-2 text-foreground" type="number" step="0.01" value={epsilon} onChange={(e) => setEpsilon(Number(e.target.value))} />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sensitivity</div>
              <input className="w-full mt-1 rounded-md bg-background border border-input p-2 text-foreground" type="number" step="1" value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-neon" onClick={async () => {
              try {
                await authedJson('/api/admin/por-privacy-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ epsilon, sensitivity }) })
                await mutateDp()
                alert('Saved')
              } catch (e: any) {
                alert(String(e?.message || 'Save failed'))
              }
            }}>Save Privacy Settings</button>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Publish History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2 text-left text-muted-foreground">Time</th>
                  <th className="p-2 text-left text-muted-foreground">Coverage %</th>
                  <th className="p-2 text-left text-muted-foreground">Reserve</th>
                  <th className="p-2 text-left text-muted-foreground">AUM</th>
                  <th className="p-2 text-left text-muted-foreground">Message</th>
                  <th className="p-2 text-left text-muted-foreground">Hide Verify</th>
                </tr>
              </thead>
              <tbody>
                {(audit?.items || []).map((row: any, i: number) => (
                  <tr key={String(row.publishedAt || i)} className="hover:bg-muted/50 border-b border-border last:border-0">
                    <td className="p-2 text-foreground">{row.publishedAt ? new Date(row.publishedAt).toLocaleString() : '—'}</td>
                    <td className="p-2 text-foreground">{Number(row.coveragePct || 0).toFixed(2)}%</td>
                    <td className="p-2 text-foreground">{Number(row.reserveAmountUSD || 0).toLocaleString()}</td>
                    <td className="p-2 text-foreground">{Number(row.aumUSD || 0).toLocaleString()}</td>
                    <td className="p-2 text-foreground">{String(row.message || '')}</td>
                    <td className="p-2 text-foreground">{row.hideMerkleSection ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
                {(!audit?.items || audit.items.length === 0) && (
                  <tr>
                    <td className="p-3 text-muted-foreground" colSpan={6}>No entries</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Actual Reserve Analytics</h2>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div className="glass rounded-lg p-3 border border-border">
              <div className="text-muted-foreground">Reserve (USD)</div>
              <div className="mt-1 font-semibold text-foreground">{Number(data?.reserveBuffer?.currentAmount || 0).toLocaleString()}</div>
            </div>
            <div className="glass rounded-lg p-3 border border-border">
              <div className="text-muted-foreground">AUM (USD)</div>
              <div className="mt-1 font-semibold text-foreground">{Number(data?.aumUSD || 0).toLocaleString()}</div>
            </div>
            <div className="glass rounded-lg p-3 border border-border">
              <div className="text-muted-foreground">Coverage %</div>
              <div className="mt-1 font-semibold text-foreground">{Number(data?.coveragePct || 0).toFixed(2)}%</div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="glass rounded-lg p-3 border border-white/10">
              <div>Formula</div>
              <div className="mt-1">coverage = reserve / aum × 100</div>
            </div>
            <div className="glass rounded-lg p-3 border border-white/10">
              <div>Surplus/Shortfall</div>
              <div className="mt-1 font-semibold">{(Number(data?.reserveBuffer?.currentAmount || 0) - Number(data?.aumUSD || 0)).toLocaleString()}</div>
            </div>
          </div>
          <div className="text-xs opacity-70">Generated {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—'}</div>
        </div>
      </div>
    </AdminGuard>
  )
}
