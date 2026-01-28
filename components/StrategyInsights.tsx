import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Newspaper, RefreshCw } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n'

type InsightItem = {
  id: string
  title: string
  summary: string
  sourceType: 'market' | 'news'
  sourceName: string
  sourceUrl?: string
  publishedAt: string
  createdAt: string
  dedupeKey: string
}

export default function StrategyInsights() {
  const { t, lang } = useI18n()
  const [items, setItems] = useState<InsightItem[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [error, setError] = useState<string>('')

  const load = useCallback(async (force?: boolean) => {
    setLoading(true)
    setError('')
    try {
      const qp = `limit=20&locale=${encodeURIComponent(lang)}`
      const url = force ? `/api/insights?${qp}&_=${Date.now()}` : `/api/insights?${qp}`
      const r = await fetch(url, { cache: 'no-store' })
      const j: any = await r.json()
      const list = Array.isArray(j?.items) ? j.items : []
      const seen = new Set<string>()
      const deduped = list.filter((it: any) => {
        const k = String(it?.dedupeKey || it?.id || '')
        if (!k || seen.has(k)) return false
        seen.add(k)
        return true
      })
      setItems(deduped)
      setLastUpdated(String(j?.serverTime || new Date().toISOString()))
    } catch (e: any) {
      setError(String(e?.message || 'Failed to load insights'))
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    load()
    const id = setInterval(() => load(), 45000)
    return () => clearInterval(id)
  }, [load])

  const top = useMemo(() => items.slice(0, 6), [items])

  const iconFor = (it: InsightItem) => {
    if (it.sourceType === 'news') return { Icon: Newspaper, color: 'text-cyan-400' }
    if (String(it.title || '').includes('波动') || String(it.title || '').includes('风险')) return { Icon: AlertTriangle, color: 'text-red-400' }
    return { Icon: TrendingUp, color: 'text-primary' }
  }

  return (
    <div className="glass p-6 rounded-2xl border border-border/50 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Brain className="text-primary w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm">{t('market_insights')}</h3>
          <p className="text-xs text-muted-foreground">{t('insights_and_news')}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => load(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Refresh insights"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {t('refresh')}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-hidden relative">
        {error && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">{error}</div>
        )}

        {top.map((it, i) => {
          const { Icon, color } = iconFor(it)
          return (
            <div key={String(it.dedupeKey || it.id || i)} className={`flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-500 ${i === 0 ? 'opacity-100' : 'opacity-70'}`}>
              <Icon className={`w-4 h-4 mt-1 shrink-0 ${color}`} />
              <div className="text-sm min-w-0">
                <p className="leading-snug truncate">{it.title}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="truncate">{it.sourceType === 'news' ? it.sourceName : 'coingecko'} • {it.publishedAt ? new Date(it.publishedAt).toLocaleTimeString() : '—'}</span>
                  {it.sourceUrl && (
                    <a href={it.sourceUrl} target="_blank" rel="noreferrer" className="shrink-0 text-primary hover:underline">{t('verify')}</a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>

      <div className="mt-3 text-[10px] text-muted-foreground">{t('updated')}: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}</div>
    </div>
  );
}
