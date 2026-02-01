
import type { NextApiRequest, NextApiResponse } from 'next'
import { generateSmartTrades, saveTradesToDB } from '@/src/lib/simulation/generator'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow GET for manual testing, POST for cron
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization || ''
  const key = String(req.query.key || '')
  const secret = process.env.CRON_SECRET || ''
  
  // Secure the endpoint
  // if (secret && authHeader !== `Bearer ${secret}` && key !== secret) {
  //     return res.status(401).json({ error: 'Unauthorized' })
  // }
  
  try {
    // Generate 3-7 smart trades
    const count = Math.floor(Math.random() * 5) + 3;
    const trades = await generateSmartTrades(count);
    
    await saveTradesToDB(trades);
    
    return res.status(200).json({ ok: true, created: count, trades })
  } catch (e: any) {
    console.error('Simulation Error:', e);
    return res.status(500).json({ error: e.message })
  }
}
