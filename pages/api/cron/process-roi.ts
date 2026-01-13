import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Security Check
  const authHeader = req.headers.authorization || '';
  const key = req.query.key as string;
  const CRON_SECRET = process.env.CRON_SECRET || 'fallback_cron_secret';

  if (authHeader !== `Bearer ${CRON_SECRET}` && key !== CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 2. Fetch Active Investments
    let investments = [];
    let investTable = 'Investment';
    let userCol = 'userId';
    let planCol = 'planId';
    let lastPayoutCol = 'lastPayoutAt';

    // Try PascalCase
    const { data: d1, error: e1 } = await supabaseServer
      .from('Investment')
      .select('*')
      .eq('status', 'ACTIVE');

    if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
      investTable = 'investments';
      userCol = 'user_id';
      planCol = 'plan_id';
      lastPayoutCol = 'last_payout_at';
      const { data: d2, error: e2 } = await supabaseServer
        .from('investments')
        .select('*')
        .eq('status', 'ACTIVE');
      if (e2) throw e2;
      investments = d2 || [];
    } else if (e1) {
      throw e1;
    } else {
      investments = d1 || [];
    }

    const results = {
      processed: 0,
      skipped: 0,
      errors: 0,
      totalPayout: 0
    };

    // 3. Process Each Investment
    for (const inv of investments) {
      try {
        const lastPayout = inv[lastPayoutCol] ? new Date(inv[lastPayoutCol]) : new Date(inv.created_at || inv.createdAt);
        const now = new Date();
        const diffHours = (now.getTime() - lastPayout.getTime()) / (1000 * 60 * 60);

        // Only payout if > 24 hours (or force param for testing)
        // For E2E testing, we might want to force it.
        const force = req.query.force === 'true';

        if (diffHours < 24 && !force) {
          results.skipped++;
          continue;
        }

        const planId = (inv[planCol] || 'starter').toLowerCase();
        const amount = Number(inv.amount || inv.amount_usd || inv.principal || 0);
        
        // ROI Rates (Mock) - TODO: Fetch from InvestmentPlan
        const rates: any = {
          'starter': 0.012, // 1.2%
          'pro': 0.015,     // 1.5%
          'elite': 0.020    // 2.0%
        };
        // Fallback to 1% if planId is a UUID or unknown
        const rate = rates[planId] || 0.01;
        const payout = amount * rate;

        console.log(`Processing ROI for ${inv.id}: Amount=${amount}, Rate=${rate}, Payout=${payout}`);

        if (payout <= 0) {
            results.skipped++;
            continue;
        }

        const userId = inv[userCol];
        const currency = inv.currency || 'USD';

        // A. Add Transaction
        // Schema: id, userId, investmentId, type, amount, currency, status, provider, reference, createdAt, updatedAt
        const txPayload = {
            id: uuidv4(),
            [userCol]: userId, 
            investmentId: inv.id, // PascalCase column
            type: 'PROFIT',
            amount: payout,
            currency,
            status: 'COMPLETED',
            reference: `ROI: ${planId} plan`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Handle snake_case vs PascalCase for Transaction
        let txTable = 'Transaction';
        if (investTable === 'investments') {
            txTable = 'transactions';
            // Adjust payload keys for snake_case
             const payloadAny = txPayload as any;
             delete payloadAny.investmentId;
             delete payloadAny.createdAt;
             delete payloadAny.updatedAt;
             
             payloadAny.user_id = userId;
             delete payloadAny.userId;
             
             // snake_case table might be different, let's guess standard fields
             (txPayload as any).created_at = new Date().toISOString();
             (txPayload as any).reference = `ROI: ${planId} plan`;
        } 

        const { error: txErr } = await supabaseServer.from(txTable).insert(txPayload);
        if (txErr) throw txErr;

        // B. Update Wallet
        // Find wallet first
        let walletTable = investTable === 'investments' ? 'wallets' : 'Wallet';
        const { data: wallet, error: wErr } = await supabaseServer
            .from(walletTable)
            .select('*')
            .eq(userCol, userId)
            .eq('currency', currency)
            .single();

        if (wallet) {
            const newBal = Number(wallet.balance) + payout;
            await supabaseServer.from(walletTable).update({ balance: newBal }).eq('id', wallet.id);
        }

        // C. Update Investment (last_payout_at)
        const updatePayload: any = {};
        updatePayload[lastPayoutCol] = new Date().toISOString();
        // Maybe update total earned?
        // updatePayload['total_earned'] = (inv.total_earned || 0) + payout; 

        await supabaseServer.from(investTable).update(updatePayload).eq('id', inv.id);

        results.processed++;
        results.totalPayout += payout;

      } catch (e) {
        console.error('Error processing investment:', inv.id, e);
        results.errors++;
      }
    }

    return res.status(200).json({ success: true, results });

  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
