import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/src/lib/supabaseServer'

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

async function fetchMarketPrice(symbol: string) {
  // Simple mock or fetch if available. 
  // We'll mock around a baseline for speed/stability in this visual simulation.
  const baseline = symbol === 'BTC' ? 65000 : 3500;
  const variation = baseline * 0.02; // 2% swing
  return baseline + randomRange(-variation, variation);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization || ''
  const key = String(req.query.key || '')
  const secret = process.env.CRON_SECRET || ''
  // Allow if secret is set and matches, or if running locally/testing
  if (secret && authHeader !== `Bearer ${secret}` && key !== secret) {
      return res.status(401).json({ error: 'Unauthorized' })
  }
  
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' })

  try {
    const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA']
    const types = ['BUY', 'SELL']
    
    const newTrades = []
    
    // Generate 3-5 random trades
    const count = Math.floor(randomRange(3, 6))
    
    for (let i = 0; i < count; i++) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)]
        const type = types[Math.floor(Math.random() * types.length)]
        const price = await fetchMarketPrice(symbol)
        const profit = randomRange(-0.5, 1.2) // Mostly positive for "good" simulation, but some loss
        
        newTrades.push({
            streamId: 'hft_bot_v1',
            symbol,
            type,
            entryPrice: price,
            exitPrice: type === 'BUY' ? price * (1 + profit/100) : price * (1 - profit/100),
            profitPct: Number(profit.toFixed(2)),
            simulatedAt: new Date().toISOString()
        })
    }
    
    // Insert
    const { error } = await supabaseServer.from('TradeLog').insert(newTrades)
    
    if (error) {
        // Try snake_case
        if (error.message.includes('relation') || error.code === '42P01') {
             const mapped = newTrades.map(t => ({
                 stream_id: t.streamId,
                 symbol: t.symbol,
                 type: t.type,
                 entry_price: t.entryPrice,
                 exit_price: t.exitPrice,
                 profit_pct: t.profitPct,
                 simulated_at: t.simulatedAt
             }))
             await supabaseServer.from('trade_logs').insert(mapped)
        } else {
            throw error
        }
    }
    
    // Cleanup old logs (keep last 100)
    // We can't easily "keep last N" in SQL delete without subquery, 
    // but we can delete older than 24h.
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    try {
        await supabaseServer.from('TradeLog').delete().lt('simulatedAt', yesterday.toISOString())
    } catch {
        try {
            await supabaseServer.from('trade_logs').delete().lt('simulated_at', yesterday.toISOString())
        } catch {}
    }

    return res.status(200).json({ ok: true, created: count })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
