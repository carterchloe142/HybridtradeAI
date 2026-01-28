import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/src/lib/supabaseServer'
import { planConfig } from '@/config/planConfig'

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

function feePct() {
  const raw = Number(process.env.SERVICE_FEE_PCT || 10)
  if (!Number.isFinite(raw)) return 10
  return Math.max(0, Math.min(50, raw))
}

function getSlug(name: string) {
  const n = String(name || '').toLowerCase()
  if (n.includes('pro')) return 'pro'
  if (n.includes('elite') || n.includes('vip')) return 'elite'
  return 'starter'
}

function toDateOnlyISO(d: Date) {
  const dt = new Date(d)
  dt.setHours(0, 0, 0, 0)
  return dt.toISOString().slice(0, 10)
}

function parseJson(value: any) {
  if (!value) return null
  if (typeof value === 'object') return value
  if (typeof value !== 'string') return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
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
  const marketBlend = ref.btc7d * 0.6 + ref.eth7d * 0.4

  const trading = clamp(marketBlend * 0.85, -18, 18)
  const staking = clamp(ref.eth7d * 0.55, -10, 10)
  const copy = clamp(marketBlend * 0.65, -14, 14)
  const ai = clamp(marketBlend * 0.95, -20, 20)

  const ads = clamp(1.0 + marketBlend * 0.02, 0.4, 1.8)
  const tasks = clamp(0.6 + marketBlend * 0.01, 0.2, 1.2)

  return {
    ads: Number(ads.toFixed(2)),
    tasks: Number(tasks.toFixed(2)),
    trading: Number(trading.toFixed(2)),
    staking: Number(staking.toFixed(2)),
    copy: Number(copy.toFixed(2)),
    ai: Number(ai.toFixed(2)),
  }
}

async function getLatestPerformance() {
  const { data, error } = await supabaseServer!
    .from('performance')
    .select('id, week_ending, stream_rois')
    .order('week_ending', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!error && data) {
    return {
      id: String(data.id),
      weekEnding: String((data as any).week_ending),
      streamRois: parseJson((data as any).stream_rois) || {},
    }
  }
  return null
}

function weightedPctForPlan(planName: string, planAllocations: any, streamRois: any) {
  const slug = getSlug(planName)
  const defaultAlloc = planConfig[slug as 'starter' | 'pro' | 'elite']?.allocations || planConfig.starter.allocations
  const allocParsed = parseJson(planAllocations)
  const allocations = allocParsed && Object.keys(allocParsed).length ? allocParsed : defaultAlloc
  let weightedPct = 0
  for (const key of Object.keys(allocations)) {
    const allocPct = Number(allocations[key] || 0)
    const roiPct = Number(streamRois[key] || 0)
    weightedPct += (allocPct / 100) * roiPct
  }
  return Number(weightedPct.toFixed(4))
}

async function returnPrincipal(inv: any) {
  if (!supabaseServer) return
  const supabase = supabaseServer
  const invId = String(inv?.id || '')
  const userId = String(inv?.userId || '')
  const principal = Number(inv?.principal || 0)
  if (!invId || !userId || !Number.isFinite(principal) || principal <= 0) return

  const currency = 'USD'

  let wallet: any = null
  const { data: w1, error: wErr1 } = await supabase.from('Wallet').select('id,balance').eq('userId', userId).eq('currency', currency).maybeSingle()
  if (!wErr1 && w1) wallet = w1
  if (!wallet && wErr1 && (String(wErr1.message || '').includes('relation') || wErr1.code === '42P01')) {
    const { data: w2 } = await supabase.from('wallets').select('id,balance').eq('user_id', userId).eq('currency', currency).maybeSingle()
    if (w2) wallet = { id: w2.id, balance: w2.balance, __snake: true }
  }

  if (wallet) {
    const newBalance = Number(wallet.balance || 0) + principal
    if (wallet.__snake) {
      await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id)
    } else {
      await supabase.from('Wallet').update({ balance: newBalance }).eq('id', wallet.id)
    }
  } else {
    try {
      const { error } = await supabase.from('Wallet').insert({ userId, currency, balance: principal })
      if (error && (String(error.message || '').includes('relation') || error.code === '42P01')) {
        await supabase.from('wallets').insert({ user_id: userId, currency, balance: principal })
      }
    } catch {
      try {
        await supabase.from('wallets').insert({ user_id: userId, currency, balance: principal })
      } catch {}
    }
  }

  const txData = {
    userId,
    investmentId: invId,
    type: 'PRINCIPAL_RETURN',
    amount: principal,
    currency,
    status: 'COMPLETED',
    reference: JSON.stringify({ description: 'Principal returned at end of cycle' }),
    createdAt: new Date().toISOString(),
  }

  try {
    const { error } = await supabase.from('Transaction').insert(txData)
    if (error && (String(error.message || '').includes('relation') || error.code === '42P01')) {
      await supabase.from('transactions').insert({
        ...txData,
        user_id: userId,
        investment_id: invId,
        created_at: txData.createdAt,
      })
    }
  } catch {
    try {
      await supabase.from('transactions').insert({
        ...txData,
        user_id: userId,
        investment_id: invId,
        created_at: txData.createdAt,
      })
    } catch {}
  }

  const nData = {
    userId,
    type: 'investment_return',
    title: 'Investment Completed',
    message: `Your principal of $${principal.toFixed(2)} has been returned to your wallet.`,
    read: false,
    createdAt: new Date().toISOString(),
  }

  try {
    const { error } = await supabase.from('Notification').insert(nData)
    if (error && (String(error.message || '').includes('relation') || error.code === '42P01')) {
      await supabase.from('notifications').insert({
        ...nData,
        user_id: userId,
        created_at: nData.createdAt,
      })
    }
  } catch {
    try {
      await supabase.from('notifications').insert({
        ...nData,
        user_id: userId,
        created_at: nData.createdAt,
      })
    } catch {}
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
    const perf = (await getLatestPerformance()) || {
      id: 'synthetic',
      weekEnding: new Date().toISOString(),
      streamRois: computeStreamRois(ref),
    }

    const streamRois = computeStreamRois(ref)
    const f = feePct()

    const { data: invsRaw, error: invErr } = await supabaseServer
      .from('Investment')
      .select('id,userId,principal,status,startDate,endDate,plan:InvestmentPlan(name,allocations)')
      .eq('status', 'ACTIVE')

    let invs: any[] = invsRaw || []
    if (invErr && (String(invErr.message || '').includes('relation') || invErr.code === '42P01')) {
      const { data: inv2, error: invErr2 } = await supabaseServer
        .from('investments')
        .select('id,user_id,principal,status,start_date,end_date,plan:investment_plans(name,allocations)')
        .eq('status', 'ACTIVE')
      if (invErr2) throw invErr2
      invs = (inv2 || []).map((i: any) => ({
        id: i.id,
        userId: i.user_id,
        principal: i.principal,
        status: i.status,
        startDate: i.start_date,
        endDate: i.end_date,
        plan: i.plan,
      }))
    } else if (invErr) {
      throw invErr
    }

    const today = new Date()
    const todayISO = toDateOnlyISO(today)

    let created = 0
    let skipped = 0
    let completed = 0

    for (const inv of invs) {
      const invId = String(inv.id)
      const userId = String(inv.userId)
      const principal = Number(inv.principal || 0)
      const planName = String(inv?.plan?.name || '')
      const planAlloc = inv?.plan?.allocations
      const startDate = inv.startDate ? new Date(String(inv.startDate)) : null
      const endDate = inv.endDate ? new Date(String(inv.endDate)) : null

      if (!invId || !userId || !principal || !startDate) continue

      const endDateISO = endDate ? toDateOnlyISO(endDate) : null
      const cycleDay = Math.max(1, Math.floor((new Date(todayISO).getTime() - new Date(toDateOnlyISO(startDate)).getTime()) / (24 * 60 * 60 * 1000)) + 1)
      const weightedPctWeekly = weightedPctForPlan(planName, planAlloc, streamRois)
      const dailyPct = weightedPctWeekly / 7
      const grossDaily = (principal * dailyPct) / 100
      const netDaily = grossDaily * (1 - f / 100)

      const markDate = todayISO
      const { data: existing } = await supabaseServer
        .from('investment_marks')
        .select('id')
        .eq('investment_id', invId)
        .eq('mark_date', markDate)
        .maybeSingle()

      if (existing?.id) {
        skipped += 1
      } else {
        const { data: last } = await supabaseServer
          .from('investment_marks')
          .select('equity_usd')
          .eq('investment_id', invId)
          .order('mark_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        const prevEquity = last?.equity_usd != null ? Number((last as any).equity_usd) : principal
        const equity = prevEquity + netDaily

        const reference = {
          kind: 'market_referenced_simulation',
          source: ref.source,
          asOf: ref.asOf,
          performanceId: perf.id,
          weekEnding: perf.weekEnding,
          market: { btc_7d_pct: ref.btc7d, eth_7d_pct: ref.eth7d },
          streamRois,
          plan: { name: planName, cycle_day: cycleDay, end_date: endDateISO, weighted_weekly_roi_pct: weightedPctWeekly },
          fee_pct: f,
          formula: { version: 'v1', daily_pct: Number(dailyPct.toFixed(4)) },
        }

        const { error: insErr } = await supabaseServer.from('investment_marks').insert({
          investment_id: invId,
          user_id: userId,
          mark_date: markDate,
          principal_usd: principal,
          pnl_usd: Number(netDaily.toFixed(6)),
          equity_usd: Number(equity.toFixed(6)),
          reference,
          formula_version: 'v1',
        })

        if (!insErr) created += 1
      }

      if (endDateISO && todayISO >= endDateISO) {
        completed += 1
        // Process Principal Return before closing
        await returnPrincipal(inv)
        
        try {
          await supabaseServer.from('Investment').update({ status: 'COMPLETED' }).eq('id', invId)
        } catch {}
        try {
          await supabaseServer.from('investments').update({ status: 'COMPLETED' }).eq('id', invId)
        } catch {}
      }
    }

    return res.status(200).json({ ok: true, today: todayISO, created, skipped, completed })
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) })
  }
}
