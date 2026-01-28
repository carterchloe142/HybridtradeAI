import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/src/lib/supabaseServer'
import crypto from 'crypto'

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

async function fetchMarketReference() {
  const base = process.env.NEXT_PUBLIC_APP_URL || ''
  const url = base ? `${base}/api/market/reference` : 'http://localhost:3000/api/market/reference'
  const res = await fetch(url, { headers: { 'user-agent': 'HybridTradeAI/1.0' } })
  const json: any = await res.json()
  const items = Array.isArray(json?.items) ? json.items : []
  const btc = items.find((i: any) => String(i.symbol).toUpperCase() === 'BTC')
  const eth = items.find((i: any) => String(i.symbol).toUpperCase() === 'ETH')
  return {
    asOf: String(json?.asOf || new Date().toISOString()),
    source: String(json?.source || 'unknown'),
    btc7d: Number(btc?.change_7d_pct || 0),
    eth7d: Number(eth?.change_7d_pct || 0),
  }
}

function computeStreamRois(ref: { btc7d: number; eth7d: number }) {
  const marketBlend = (ref.btc7d * 0.6 + ref.eth7d * 0.4)

  const trading = clamp(marketBlend * 0.85, -18, 18)
  const staking = clamp(ref.eth7d * 0.55, -10, 10)
  const copy = clamp(marketBlend * 0.65, -14, 14)
  const ai = clamp(marketBlend * 0.95, -20, 20)

  const ads = clamp(1.0 + (marketBlend * 0.02), 0.4, 1.8)
  const tasks = clamp(0.6 + (marketBlend * 0.01), 0.2, 1.2)

  return {
    ads: Number(ads.toFixed(2)),
    tasks: Number(tasks.toFixed(2)),
    trading: Number(trading.toFixed(2)),
    staking: Number(staking.toFixed(2)),
    copy: Number(copy.toFixed(2)),
    ai: Number(ai.toFixed(2)),
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization || ''
  const key = String(req.query.key || '')
  const secret = process.env.CRON_SECRET || ''
  if (!secret) return res.status(500).json({ error: 'CRON_SECRET is not configured' })
  if (authHeader !== `Bearer ${secret}` && key !== secret) return res.status(401).json({ error: 'Unauthorized' })
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' })

  try {
    const ref = await fetchMarketReference()
    const streamRois = computeStreamRois(ref)
    const now = new Date().toISOString()
    const id = crypto.randomUUID ? crypto.randomUUID() : `perf_${Date.now()}_${Math.random().toString(36).slice(2)}`

    const { error: e1 } = await supabaseServer.from('Performance').insert({
      id,
      weekEnding: now,
      streamRois,
      updatedAt: now,
    })

    if (e1 && (String(e1.message || '').includes('relation') || e1.code === '42P01')) {
      const { error: e2 } = await supabaseServer.from('performance').insert({
        id,
        week_ending: now,
        stream_rois: streamRois,
        updated_at: now,
      })
      if (e2) throw e2
    } else if (e1) {
      throw e1
    }

    return res.status(200).json({ ok: true, id, weekEnding: now, streamRois, market: ref })
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) })
  }
}

