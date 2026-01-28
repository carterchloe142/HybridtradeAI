import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n'

type InsightItem = {
  id: string
  title: string
  summary: string
  sourceType: 'market' | 'news'
  sourceName: string
  sourceUrl?: string
  createdAt: string
}

export default function AIPredictionCard() {
  const { t, lang } = useI18n()
  const [items, setItems] = useState<InsightItem[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const load = useCallback(async (force?: boolean) => {
    setLoading(true)
    try {
      const qp = `limit=12&locale=${encodeURIComponent(lang)}`
      const url = force ? `/api/insights?${qp}&_=${Date.now()}` : `/api/insights?${qp}`
      const r = await fetch(url, { cache: 'no-store' })
      const j: any = await r.json()
      const list = Array.isArray(j?.items) ? j.items : []
      setItems(list)
      setLastUpdated(String(j?.serverTime || new Date().toISOString()))
    } catch {
      setItems([])
      setLastUpdated(new Date().toISOString())
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    load()
    const id = setInterval(() => load(), 30000)
    return () => clearInterval(id)
  }, [load])

  const primary = useMemo(() => {
    const market = items.find((x) => x.sourceType === 'market')
    return market || items[0] || null
  }, [items])

  return (
    <div className="relative glass p-6 rounded-2xl border border-border/50 h-full overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 animate-pulse-slow" />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
          </div>
          <button
            type="button"
            onClick={() => load(true)}
            className="inline-flex items-center gap-2 text-[10px] font-mono bg-background/50 px-2 py-1 rounded border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Refresh insight"
            disabled={loading}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {loading ? t('updating') : t('refresh')}
          </button>
        </div>

        <div className="mt-4">
          <p className="text-lg font-medium leading-tight">
            {primary?.title || 'Fetching market signals…'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground line-clamp-3">
            {primary?.summary || t('insights_and_news')}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
          <div className="min-w-0 flex items-center gap-2 truncate">
            <span className="truncate">{t('source')}: {primary?.sourceName || '—'}</span>
            {primary?.sourceUrl && (
              <a href={primary.sourceUrl} target="_blank" rel="noreferrer" className="shrink-0 text-primary hover:underline">{t('verify')}</a>
            )}
          </div>
          <div className="shrink-0">{lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}</div>
        </div>
      </div>
    </div>
  );
}
