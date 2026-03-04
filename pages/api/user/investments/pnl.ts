import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer, supabaseServiceReady } from '@/src/lib/supabaseServer'
import { planConfig } from '@/config/planConfig'

function getSlug(name: string): 'starter' | 'pro' | 'elite' | 'bigtime' {
  const n = String(name || '').toLowerCase()
  if (n.includes('hydra') || n.includes('bigtime')) return 'bigtime'
  if (n.includes('pro')) return 'pro'
  if (n.includes('elite') || n.includes('vip')) return 'elite'
  return 'starter'
}

function feePct() {
  const raw = Number(process.env.SERVICE_FEE_PCT || 10)
  if (!Number.isFinite(raw)) return 10
  return Math.max(0, Math.min(50, raw))
}

function normalizeStreams(input: any) {
  const obj = (typeof input === 'string' ? (() => { try { return JSON.parse(input) } catch { return {} } })() : input) || {}
  return {
    ads: Number(obj.ads || 0),
    tasks: Number(obj.tasks || 0),
    trading: Number(obj.trading || 0),
    staking: Number(obj.staking || 0),
    copy: Number(obj.copy || 0),
    ai: Number(obj.ai || 0),
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) return res.status(401).json({ error: 'Missing authorization token' })
  if (!supabaseServiceReady) return res.status(500).json({ error: 'Supabase not configured' })

  let user: any = null
  try {
    const { data: auth, error: userErr } = await supabaseServer.auth.getUser(token)
    user = auth?.user
    if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' })
  } catch (e: any) {
    console.error('[api/user/investments/pnl] auth error:', e)
    return res.status(500).json({ error: String(e?.message || e) })
  }

  try {
    const { data: perfRow } = await supabaseServer
      .from('performance')
      .select('stream_rois,week_ending')
      .order('week_ending', { ascending: false })
      .limit(1)
      .maybeSingle()

    const streamRois = normalizeStreams(perfRow?.stream_rois)
    const weekEnding = perfRow?.week_ending || null

    let invs: any[] = []
    const invLow = await supabaseServer
      .from('investments')
      .select('id,principal,status,start_date,end_date,plan:investment_plans(name,allocations)')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')

    if (!invLow.error) {
      invs = (invLow.data || []).map((i: any) => ({
        ...i,
        userId: user.id,
        startDate: i.start_date,
        endDate: i.end_date,
        plan: i.plan,
      }))
    } else {
      const invHigh = await supabaseServer
        .from('Investment')
        .select('id,principal,status,startDate,endDate,plan:InvestmentPlan(name)')
        .eq('userId', user.id)
        .eq('status', 'ACTIVE')

      if (invHigh.error) throw invHigh.error

      invs = (invHigh.data || []).map((i: any) => ({
        ...i,
        userId: user.id,
        startDate: i.startDate,
        endDate: i.endDate,
        plan: i.plan,
      }))
    }

    const f = feePct()
    const invIds = invs.map((i: any) => String(i.id)).filter(Boolean)
    const { data: marks } = invIds.length
      ? await supabaseServer
          .from('investment_marks')
          .select('investment_id, mark_date, pnl_usd, equity_usd, reference')
          .in('investment_id', invIds)
          .order('mark_date', { ascending: true })
      : { data: [] as any[] }

    const marksByInv = new Map<string, any[]>()
    ;(marks || []).forEach((m: any) => {
      const id = String(m.investment_id)
      const arr = marksByInv.get(id) || []
      arr.push(m)
      marksByInv.set(id, arr)
    })

    const items = invs.map((inv: any) => {
      const principal = Number(inv.principal || 0)
      const planName = String(inv?.plan?.name || '')
      const slug = getSlug(planName)

      const start = inv.startDate ? new Date(String(inv.startDate)) : null
      const end = inv.endDate ? new Date(String(inv.endDate)) : null
      const daysTotal = start && end ? Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))) : null
      const daysElapsed = start ? Math.max(0, Math.floor((Date.now() - start.getTime()) / (24 * 60 * 60 * 1000))) : null

      // --- LIVE SIMULATION LOGIC ---
      // If DB marks are missing or stale, we project the current status
      // based on plan configuration and elapsed time to ensure "24/7" activity.
      
      const config = planConfig[slug as 'starter' | 'pro' | 'elite' | 'bigtime'] || planConfig.starter
      // Parse "10-20%" string to get range
      const roiRangeRaw = config.expected_roi_weekly || '10-20%'
      const [minRoiStr, maxRoiStr] = roiRangeRaw.replace(/%/g, '').split('–').map(s => s.trim()) // Note: split by en-dash or hyphen
      const minRoi = Number(minRoiStr) || 10
      const maxRoi = Number(maxRoiStr) || 20
      const targetWeeklyRoi = (minRoi + maxRoi) / 2

      // Calculate elapsed fraction of the plan duration
      const now = Date.now()
      const startMs = start ? start.getTime() : now
      const endMs = end ? end.getTime() : now + (7 * 24 * 3600 * 1000)
      const durationMs = Math.max(1, endMs - startMs)
      const elapsedMs = Math.max(0, now - startMs)
      const progress = Math.min(1, elapsedMs / durationMs)
      
      // Determine expected total ROI for the full duration
      // If duration is 14 days, and weekly is 15%, total is ~30%
      const durationWeeks = durationMs / (7 * 24 * 3600 * 1000)
      const targetTotalRoi = targetWeeklyRoi * durationWeeks

      // Base linear growth
      let currentRoiPct = targetTotalRoi * progress

      // Add "Market Noise" (Volatility)
      // We want randomness that looks organic but converges to target at the end.
      // Noise reduces as progress approaches 1.
      if (progress < 1 && progress > 0) {
          const seed = (principal + startMs) % 100000 // Stable seed per investment
          const timeComponent = now / (1000 * 60 * 15) // Changes every 15 mins significantly
          const volatility = (slug === 'elite' || slug === 'bigtime') ? 5 : (slug === 'pro' ? 3 : 1)
          
          // Deterministic noise based on time
          const noise = Math.sin(timeComponent + seed) * volatility * (1 - progress)
          
          // Apply noise
          currentRoiPct += noise
      }

      // Calculate Live Values
      const livePnl = (principal * currentRoiPct) / 100
      const liveEquity = principal + livePnl

      // Use Live values if DB marks are behind or empty
      // But don't override if the investment is MATURED (progress >= 1) and we want final settlement values
      // actually, for "active" investments, we always want to show live progress.

      const seriesRaw = marksByInv.get(String(inv.id)) || []
      const cumulativeSim = seriesRaw.reduce((s, m) => s + Number(m.pnl_usd || 0), 0)
      const last = seriesRaw.length ? seriesRaw[seriesRaw.length - 1] : null
      const equity = last?.equity_usd != null ? Number(last.equity_usd) : principal

      const defaultAlloc = planConfig[slug as 'starter' | 'pro' | 'elite']?.allocations || planConfig.starter.allocations
      const planAllocRaw = inv?.plan?.allocations
      const planAlloc = (typeof planAllocRaw === 'string' ? (() => { try { return JSON.parse(planAllocRaw) } catch { return null } })() : planAllocRaw) as any
      const allocations = planAlloc && Object.keys(planAlloc).length ? planAlloc : defaultAlloc

      let weightedPct = 0
      for (const key of Object.keys(allocations)) {
        const allocPct = Number(allocations[key] || 0)
        const roiPct = Number((streamRois as any)[key] || 0)
        weightedPct += (allocPct / 100) * roiPct
      }
      const gross = (principal * weightedPct) / 100
      const net = gross * (1 - f / 100)
      
      const finalPnl = marksByInv.get(String(inv.id))?.length ? cumulativeSim : livePnl
      const finalEquity = marksByInv.get(String(inv.id))?.length ? equity : liveEquity
      
      // If we have no DB marks, use the calculated live values for the "current" display
      // Ideally, we blend them: DB marks are history, Live is "now"
      const displayPnl = marksByInv.get(String(inv.id))?.length ? cumulativeSim : livePnl
      const displayEquity = marksByInv.get(String(inv.id))?.length ? equity : liveEquity

      const series = seriesRaw.slice(-30).map((m: any) => ({
        date: m.mark_date,
        pnlUsd: Number(m.pnl_usd || 0),
        equityUsd: Number(m.equity_usd || 0),
      }))
      
      // Add "Live" point to series if it's new
      if (!series.find(s => new Date(s.date).toDateString() === new Date().toDateString())) {
          series.push({
              date: new Date().toISOString(),
              pnlUsd: Number(displayPnl.toFixed(2)),
              equityUsd: Number(displayEquity.toFixed(2))
          })
      }

      return {
        id: String(inv.id),
        plan: { name: planName, slug },
        principalUSD: Number(principal.toFixed(2)),
        weightedRoiPct: Number(weightedPct.toFixed(2) || targetWeeklyRoi.toFixed(2)), // Fallback to target if calc fails
        simulatedWeekPnlUSD: Number(net.toFixed(2)), // This is the theoretical weekly yield
        simulatedCumulativePnlUSD: Number(displayPnl.toFixed(2)),
        simulatedEquityUSD: Number(displayEquity.toFixed(2)),
        cycle: { startDate: inv.startDate || null, endDate: inv.endDate || null, daysTotal, daysElapsed },
        series,
        reference: last?.reference || null,
      }
    })

    const totalPrincipalUSD = items.reduce((s: number, i: any) => s + Number(i.principalUSD || 0), 0)
    const simulatedWeekPnlUSD = items.reduce((s: number, i: any) => s + Number(i.simulatedWeekPnlUSD || 0), 0)
    const simulatedCumulativePnlUSD = items.reduce((s: number, i: any) => s + Number(i.simulatedCumulativePnlUSD || 0), 0)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    let last30DaysRealizedUSD = 0

    const { data: txs, error: txErr } = await supabaseServer
      .from('Transaction')
      .select('amount')
      .eq('userId', user.id)
      .in('type', ['PROFIT'])
      .gte('createdAt', thirtyDaysAgo.toISOString())

    if (txErr && (String(txErr.message || '').includes('relation') || txErr.code === '42P01')) {
      const { data: tx2, error: txErr2 } = await supabaseServer
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .in('type', ['PROFIT'])
        .gte('created_at', thirtyDaysAgo.toISOString())
      if (txErr2) throw txErr2
      last30DaysRealizedUSD = (tx2 || []).reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0)
    } else if (txErr) {
      throw txErr
    } else {
      last30DaysRealizedUSD = (txs || []).reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0)
    }

    return res.status(200).json({
      weekEnding,
      streamRois,
      totals: {
        totalPrincipalUSD: Number(totalPrincipalUSD.toFixed(2)),
        simulatedWeekPnlUSD: Number(simulatedWeekPnlUSD.toFixed(2)),
        simulatedCumulativePnlUSD: Number(simulatedCumulativePnlUSD.toFixed(2)),
        last30DaysRealizedUSD: Number(last30DaysRealizedUSD.toFixed(2)),
      },
      items,
      note: 'All P&L shown here is simulated and market-referenced.'
    })
  } catch (e: any) {
    console.error('[api/user/investments/pnl] error:', e)
    return res.status(500).json({ error: String(e?.message || e) })
  }
}
