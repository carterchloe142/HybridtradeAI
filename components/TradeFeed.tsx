
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowUpRight, ArrowDownRight, RefreshCcw, Info } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'

type TradeLog = {
  id: string
  streamId: string
  symbol: string
  type: 'BUY' | 'SELL'
  entryPrice: number
  exitPrice?: number
  profitPct?: number
  simulatedAt: string
  strategy?: string
  reason?: string
}

export default function TradeFeed() {
  const { t, nf, df } = useI18n()
  const [trades, setTrades] = useState<TradeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{ total: number; wins: number; avgPnl: number }>(() => ({ total: 0, wins: 0, avgPnl: 0 }))

  const fetchTrades = async () => {
    const { data } = await supabase
      .from('TradeLog')
      .select('*')
      .order('simulatedAt', { ascending: false })
      .limit(20) // Increased limit to show more history
    
    if (data) {
      const list = data as TradeLog[]
      setTrades(list)
      const total = list.length
      const wins = list.filter((x) => Number(x.profitPct || 0) > 0).length
      const avg = total ? list.reduce((s, x) => s + Number(x.profitPct || 0), 0) / total : 0
      setStats({ total, wins, avgPnl: avg })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTrades()
    // Poll every 10 seconds
    const interval = setInterval(fetchTrades, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading && trades.length === 0) return <div className="animate-pulse h-60 bg-muted/10 rounded-xl" />

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/10 px-3 py-1 text-[11px] text-muted-foreground">
          <RefreshCcw className="w-3.5 h-3.5 animate-spin-slow" />
          <span className="text-foreground/90">{t('live_market_feed')}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/10 px-3 py-1 text-[11px] text-muted-foreground">
          <span className="text-foreground/90">{t('total_trades')}:</span>
          <span className="font-mono text-foreground">{stats.total}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/10 px-3 py-1 text-[11px] text-muted-foreground">
          <span className="text-foreground/90">{t('win_rate')}:</span>
          <span className="font-mono text-foreground">{stats.total ? nf((stats.wins / stats.total) * 100, { maximumFractionDigits: 1 }) : '0'}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide min-h-[300px]">
        {trades.map((trade) => (
          <div key={trade.id} className="group relative flex flex-col gap-2 p-3 bg-muted/5 rounded-xl hover:bg-muted/10 transition-colors border border-transparent hover:border-primary/10">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${trade.profitPct && trade.profitPct >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {trade.profitPct && trade.profitPct >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    {trade.symbol} 
                    <span className="text-xs text-muted-foreground opacity-70 font-normal">/ USD</span>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${trade.type === 'BUY' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                    {trade.type} @ {nf(trade.entryPrice)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-mono font-bold text-sm ${trade.profitPct && trade.profitPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trade.profitPct && trade.profitPct > 0 ? '+' : ''}{trade.profitPct}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {df(new Date(trade.simulatedAt), { hour: '2-digit', minute: '2-digit' } as any)}
                </div>
              </div>
            </div>

            {/* Strategy / Reason Line */}
            {(trade.strategy || trade.reason) && (
              <div className="pt-2 mt-1 border-t border-border/30 flex items-start gap-2 text-[11px] text-muted-foreground">
                <Info size={12} className="mt-0.5 text-primary/70" />
                <div>
                  {trade.strategy && <span className="font-medium text-foreground/80">{trade.strategy}: </span>}
                  {trade.reason}
                </div>
              </div>
            )}
            
          </div>
        ))}
        {trades.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {t('waiting_for_market_data')}
          </div>
        )}
      </div>
    </div>
  )
}
