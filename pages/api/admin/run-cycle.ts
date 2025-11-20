import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../lib/supabaseServer';
import { PLANS, calculateWeeklyROI } from '../../../backend/profit-engine';
import { requireAdmin } from '../../../lib/adminAuth';

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

function getPlanRoiPct(planId: string): number {
  const plan = PLANS.find(p => p.id === planId);
  return plan?.weeklyRoi ?? 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req);
  if (!admin.ok) return res.status(401).json({ error: admin.error || 'Unauthorized' });
  const serviceFeePct = Number(process.env.SERVICE_FEE_PCT ?? 5);

  const { data: investments, error } = await supabaseServer
    .from('investments')
    .select('id,user_id,plan_id,amount_usd,status,created_at')
    .eq('status', 'active');
  if (error) return res.status(500).json({ error: 'Failed to fetch investments' });

  const now = new Date();
  const results: any[] = [];

  for (const inv of (investments || [])) {
    const start = new Date(inv.created_at);
    const profitDate = addDays(inv.created_at, 7);
    const maturityDate = addDays(inv.created_at, 14);

    // Check if ROI already credited
    const { data: roiTx } = await supabaseServer
      .from('transactions')
      .select('id')
      .eq('user_id', inv.user_id)
      .eq('type', 'roi')
      .contains('meta', { investment_id: inv.id })
      .limit(1);

    // Credit ROI at day 7
    if (now >= profitDate && (!roiTx || roiTx.length === 0)) {
      const roiPct = getPlanRoiPct(inv.plan_id);
      const gross = calculateWeeklyROI(inv.amount_usd, inv.plan_id);
      const net = Number((gross * (1 - serviceFeePct / 100)).toFixed(2));

      // Upsert USD wallet
      const { data: wallet } = await supabaseServer
        .from('wallets')
        .select('id,amount')
        .eq('user_id', inv.user_id)
        .eq('currency', 'USD')
        .maybeSingle();
      if (wallet?.id) {
        await supabaseServer
          .from('wallets')
          .update({ amount: Number(wallet.amount) + net })
          .eq('id', wallet.id);
      } else {
        await supabaseServer
          .from('wallets')
          .insert({ user_id: inv.user_id, currency: 'USD', amount: net });
      }

      await supabaseServer
        .from('transactions')
        .insert({
          user_id: inv.user_id,
          type: 'roi',
          amount_usd: net,
          meta: { investment_id: inv.id, applied_weekly_roi: roiPct, service_fee_pct: serviceFeePct }
        });

      results.push({ investmentId: inv.id, action: 'roi_credited', net });
    }

    // Release principal at day 14 if not yet released
    const { data: relTx } = await supabaseServer
      .from('transactions')
      .select('id')
      .eq('user_id', inv.user_id)
      .eq('type', 'principal_release')
      .contains('meta', { investment_id: inv.id })
      .limit(1);

    if (now >= maturityDate && (!relTx || relTx.length === 0)) {
      // Credit principal to wallet
      const { data: wallet2 } = await supabaseServer
        .from('wallets')
        .select('id,amount')
        .eq('user_id', inv.user_id)
        .eq('currency', 'USD')
        .maybeSingle();
      if (wallet2?.id) {
        await supabaseServer
          .from('wallets')
          .update({ amount: Number(wallet2.amount) + Number(inv.amount_usd) })
          .eq('id', wallet2.id);
      } else {
        await supabaseServer
          .from('wallets')
          .insert({ user_id: inv.user_id, currency: 'USD', amount: inv.amount_usd });
      }

      await supabaseServer
        .from('transactions')
        .insert({ user_id: inv.user_id, type: 'principal_release', amount_usd: inv.amount_usd, meta: { investment_id: inv.id } });

      await supabaseServer
        .from('investments')
        .update({ status: 'completed' })
        .eq('id', inv.id);

      results.push({ investmentId: inv.id, action: 'principal_released', amount: inv.amount_usd });
    }
  }

  return res.status(200).json({ ok: true, results });
}
