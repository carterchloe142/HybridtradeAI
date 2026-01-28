import type { NextApiRequest, NextApiResponse } from 'next'

type MarketRef = {
  symbol: string
  name: string
  currency: string
  price: number
  change_7d_pct: number
}

async function fetch7dChangePct(coinId: string): Promise<{ price: number; change7dPct: number }> {
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=7&interval=hourly`
  const res = await fetch(url, { headers: { 'user-agent': 'HybridTradeAI/1.0' } })
  if (!res.ok) throw new Error(`coingecko_${coinId}_failed`)
  const json: any = await res.json()
  const prices: Array<[number, number]> = Array.isArray(json?.prices) ? json.prices : []
  if (prices.length < 2) throw new Error(`coingecko_${coinId}_empty`)
  const first = prices[0][1]
  const last = prices[prices.length - 1][1]
  const change7dPct = ((last - first) / first) * 100
  return { price: last, change7dPct }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const [btc, eth] = await Promise.all([fetch7dChangePct('bitcoin'), fetch7dChangePct('ethereum')])

    const items: MarketRef[] = [
      { symbol: 'BTC', name: 'Bitcoin', currency: 'USD', price: Number(btc.price), change_7d_pct: Number(btc.change7dPct) },
      { symbol: 'ETH', name: 'Ethereum', currency: 'USD', price: Number(eth.price), change_7d_pct: Number(eth.change7dPct) },
    ]

    return res.status(200).json({
      asOf: new Date().toISOString(),
      source: 'coingecko',
      items,
    })
  } catch (e: any) {
    return res.status(200).json({
      asOf: new Date().toISOString(),
      source: 'fallback',
      items: [
        { symbol: 'BTC', name: 'Bitcoin', currency: 'USD', price: 65000, change_7d_pct: 1.2 },
        { symbol: 'ETH', name: 'Ethereum', currency: 'USD', price: 3500, change_7d_pct: 0.8 },
      ],
      warning: String(e?.message || 'market_reference_unavailable'),
    })
  }
}

