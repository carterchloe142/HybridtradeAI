import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react'

type TradeLog = {
  id: string
  streamId: string
  symbol: string
  type: 'BUY' | 'SELL'
  entryPrice: number
  exitPrice?: number
  profitPct?: number
  simulatedAt: string
}

export default function TradeFeed() {
  const [trades, setTrades] = useState<TradeLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTrades = async () => {
    const { data } = await supabase
      .from('TradeLog')
      .select('*')
      .order('simulatedAt', { ascending: false })
      .limit(10)
    
    if (data) setTrades(data as TradeLog[])
    setLoading(false)
  }

  useEffect(() => {
    fetchTrades()
    // Poll every 10 seconds
    const interval = setInterval(fetchTrades, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading && trades.length === 0) return <div className="animate-pulse h-40 bg-muted/10 rounded-xl" />

  return (
    <div className="glass p-4 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <RefreshCcw className="w-4 h-4 animate-spin-slow" />
          Live Market Feed
        </h3>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/20 rounded-full">
          Real-time
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
        {trades.map((trade) => (
          <div key={trade.id} className="flex items-center justify-between p-3 bg-muted/5 rounded-xl hover:bg-muted/10 transition-colors border border-transparent hover:border-primary/10">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${trade.profitPct && trade.profitPct >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {trade.profitPct && trade.profitPct >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
              <div>
                <div className="font-bold text-sm">{trade.symbol} <span className="text-xs text-muted-foreground opacity-70">/ USD</span></div>
                <div className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${trade.type === 'BUY' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                  {trade.type} @ {trade.entryPrice.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-mono font-bold text-sm ${trade.profitPct && trade.profitPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trade.profitPct && trade.profitPct > 0 ? '+' : ''}{trade.profitPct}%
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(trade.simulatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {trades.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Waiting for market data...
          </div>
        )}
      </div>
    </div>
  )
}
