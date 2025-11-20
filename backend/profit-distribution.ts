import { supabaseServer } from '../lib/supabaseServer';
import * as Sentry from '@sentry/nextjs'
import { logInfo, logWarn, logError } from '../src/lib/observability/logger'

type PerformanceRow = {
  id: string;
  week_ending: string; // ISO date string
  stream_rois: Record<string, number> | string; // e.g., { trading: 3.5, staking_yield: 2.1, ai: 1.8, ads_tasks: 0.6 }
};

type InvestmentRow = {
  id: string;
  user_id: string;
  plan_id: 'starter' | 'pro' | 'elite' | string;
  amount_usd: number;
  status: 'active' | 'completed' | 'pending';
};

type ProfileRow = {
  user_id: string;
  kyc_status?: 'approved' | 'pending' | 'rejected' | null;
  referrer_id?: string | null;
};

const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? 7);

// Default allocations aligned to spec. Keys MUST match normalized stream names.
// Streams: trading, copy_trading, staking_yield, ads_tasks, ai
const DEFAULT_ALLOCATIONS: Record<string, Record<string, number>> = {
  starter: { ads_tasks: 70, trading: 30 },
  pro: { trading: 60, copy_trading: 25, ads_tasks: 15 },
  elite: { trading: 50, staking_yield: 30, ai: 20 }
};

function normalizeJson<T = Record<string, any>>(obj: T | string | null | undefined): T {
  if (!obj) return {} as T;
  if (typeof obj === 'string') {
    try { return JSON.parse(obj) as T; } catch { return {} as T; }
  }
  return obj as T;
}

// Map legacy/admin-entered keys to normalized streams for consistent computation
function normalizeStreams(raw: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw || {})) {
    const key = k.trim().toLowerCase();
    const mapped =
      key === 'ads' || key === 'tasks' || key === 'ads_tasks' ? 'ads_tasks' :
      key === 'hft' || key === 'arbitrage' || key === 'trading' ? 'trading' :
      key === 'staking' || key === 'yield' || key === 'staking_yield' ? 'staking_yield' :
      key === 'copytrading' || key === 'copy_trading' ? 'copy_trading' :
      key === 'ai' ? 'ai' : key;
    out[mapped] = Number(v) || 0;
  }
  return out;
}

function toMoney(n: number): number { return Number(n.toFixed(2)); }

export async function runProfitDistribution(opts?: { dryRun?: boolean }) {
  logInfo('profit_distribution.start', { dryRun: Boolean(opts?.dryRun) })
  // 1) Get latest performance entry (admin-input or API)
  const { data: perfRows, error: perfErr } = await supabaseServer
    .from('performance')
    .select('id,week_ending,stream_rois')
    .order('week_ending', { ascending: false })
    .limit(1);
  if (perfErr) {
    logError('profit_distribution.performance_fetch_failed', { error: perfErr.message })
    Sentry.captureException(perfErr)
    return { ok: false, error: 'Failed to fetch performance', details: perfErr.message };
  }
  const perf: PerformanceRow | null = (perfRows && perfRows[0]) ? perfRows[0] as any : null;
  if (!perf) {
    logWarn('profit_distribution.no_performance')
    return { ok: false, error: 'No performance data found — aborting' };
  }
  const streamRois = normalizeStreams(normalizeJson<Record<string, number>>(perf.stream_rois));

  // 2) Fetch eligible investments (active). Duplicate protection via profit_logs per week.
  const { data: investments, error: invErr } = await supabaseServer
    .from('investments')
    .select('id,user_id,plan_id,amount_usd,status')
    .eq('status', 'active');
  if (invErr) {
    logError('profit_distribution.investments_fetch_failed', { error: invErr.message })
    Sentry.captureException(invErr)
    return { ok: false, error: 'Failed to fetch investments', details: invErr.message };
  }

  const results: any[] = [];

  for (const inv of (investments || []) as InvestmentRow[]) {
    try {
      // KYC gate
      const { data: profile } = await supabaseServer
        .from('profiles')
        .select('kyc_status,referrer_id')
        .eq('user_id', inv.user_id)
        .maybeSingle();
      const kyc = (profile as ProfileRow)?.kyc_status ?? null;
      if (kyc !== 'approved') {
        results.push({ investmentId: inv.id, action: 'skipped_kyc' });
        continue;
      }

      // Check if already credited for this performance week
      const { data: existingLogs } = await supabaseServer
        .from('profit_logs')
        .select('id')
        .eq('investment_id', inv.id)
        .eq('week_ending', perf.week_ending)
        .limit(1);
      if (existingLogs && existingLogs.length > 0) {
        results.push({ investmentId: inv.id, action: 'skipped_duplicate_week' });
        continue;
      }

      // allocations: try from plans table; fallback to default
      let allocations: Record<string, number> = DEFAULT_ALLOCATIONS[inv.plan_id] || {};
      const { data: planRows } = await supabaseServer
        .from('plans')
        .select('id,allocations')
        .eq('id', inv.plan_id)
        .limit(1);
      const planAlloc = normalizeJson<Record<string, number>>(planRows?.[0]?.allocations);
      if (planAlloc && Object.keys(planAlloc).length > 0) allocations = planAlloc;

      // compute weighted ROI (%)
      let weightedPct = 0;
      for (const streamName of Object.keys(allocations)) {
        const allocPct = Number(allocations[streamName] || 0);
        const streamRoiPct = Number(streamRois[streamName] || 0); // e.g., 3.5 means 3.5%
        weightedPct += (allocPct / 100) * streamRoiPct;
      }

      const weeklyProfit = Number(inv.amount_usd) * (weightedPct / 100);
      const fee = weeklyProfit * (PLATFORM_FEE_PERCENT / 100);
      const netProfit = toMoney(weeklyProfit - fee);

      // Upsert USD wallet (skip on dry-run)
      if (!opts?.dryRun) {
        const { data: wallet } = await supabaseServer
          .from('wallets')
          .select('id,amount')
          .eq('user_id', inv.user_id)
          .eq('currency', 'USD')
          .maybeSingle();
        if (wallet?.id) {
          await supabaseServer
            .from('wallets')
            .update({ amount: Number(wallet.amount) + netProfit })
            .eq('id', wallet.id);
        } else {
          await supabaseServer
            .from('wallets')
            .insert({ user_id: inv.user_id, currency: 'USD', amount: netProfit });
        }
      }

      // Insert profit_log (skip on dry-run)
      if (!opts?.dryRun) {
        await supabaseServer
          .from('profit_logs')
          .insert({
            user_id: inv.user_id,
            plan_id: inv.plan_id,
            investment_id: inv.id,
            week_ending: perf.week_ending,
            weighted_pct: weightedPct,
            gross_profit: toMoney(weeklyProfit),
            fee: toMoney(fee),
            net_profit: netProfit,
            stream_rois: streamRois,
          });
      }

      // Insert transaction for ROI credit (skip on dry-run)
      if (!opts?.dryRun) {
        await supabaseServer
          .from('transactions')
          .insert({
            user_id: inv.user_id,
            type: 'roi',
            amount_usd: netProfit,
            meta: { investment_id: inv.id, weighted_pct: weightedPct, platform_fee_pct: PLATFORM_FEE_PERCENT, week_ending: perf.week_ending }
          });
      }

      // Optional referral credit if a referrer_id exists in profiles (not guaranteed)
      const referrerId = (profile as ProfileRow)?.referrer_id || null;
      if (referrerId && !opts?.dryRun) {
        const refRate = inv.plan_id === 'elite' ? 0.10 : inv.plan_id === 'pro' ? 0.07 : 0.05;
        const refBonus = toMoney(netProfit * refRate);
        if (refBonus > 0) {
          const { data: refWallet } = await supabaseServer
            .from('wallets')
            .select('id,amount')
            .eq('user_id', referrerId)
            .eq('currency', 'USD')
            .maybeSingle();
          if (refWallet?.id) {
            await supabaseServer
              .from('wallets')
              .update({ amount: Number(refWallet.amount) + refBonus })
              .eq('id', refWallet.id);
          } else {
            await supabaseServer
              .from('wallets')
              .insert({ user_id: referrerId, currency: 'USD', amount: refBonus });
          }
          await supabaseServer
            .from('transactions')
            .insert({ user_id: referrerId, type: 'referral_credit', amount_usd: refBonus, meta: { source_user_id: inv.user_id, investment_id: inv.id } });
        }
      }

      results.push({ investmentId: inv.id, action: opts?.dryRun ? 'dry_run' : 'credited', netProfit, weightedPct });
      logInfo('profit_distribution.credited', { investmentId: inv.id, weekEnding: perf.week_ending, netProfit })
    } catch (err: any) {
      results.push({ investmentId: inv.id, action: 'error', error: err?.message || String(err) });
      logError('profit_distribution.error', { investmentId: inv.id, error: err?.message || String(err) })
      Sentry.captureException(err)
    }
  }

  logInfo('profit_distribution.complete', { count: results.length, feePercent: PLATFORM_FEE_PERCENT, weekEnding: perf.week_ending })
  return { ok: true, results, feePercent: PLATFORM_FEE_PERCENT, week_ending: perf.week_ending };
}

export default runProfitDistribution;
