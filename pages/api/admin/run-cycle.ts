import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // --- Auth Check (Admin) ---
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('role,is_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  const userRole = String(profile?.role || '').toLowerCase();
  const isAdmin = Boolean(profile?.is_admin) || userRole === 'admin';

  if (!isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required' });
  // --------------------------

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
      roiProcessed: 0,
      roiSkipped: 0,
      principalReleased: 0,
      errors: 0,
      totalPayout: 0
    };

    const force = req.body.force === true;

    // 3. Process Each Investment
    for (const inv of investments) {
      try {
        const lastPayout = inv[lastPayoutCol] ? new Date(inv[lastPayoutCol]) : new Date(inv.created_at || inv.createdAt);
        const createdAt = new Date(inv.created_at || inv.createdAt);
        const now = new Date();
        
        const diffHours = (now.getTime() - lastPayout.getTime()) / (1000 * 60 * 60);
        const ageDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

        const amount = Number(inv.amount || inv.amount_usd || inv.principal || 0);
        const userId = inv[userCol];
        const currency = inv.currency || 'USD';
        
        // --- A. Principal Release (Day 14) ---
        // Assuming 14 days cycle. 
        if (ageDays >= 14) {
             // Release Principal
             // 1. Update Investment Status
             await supabaseServer.from(investTable).update({ status: 'COMPLETED' }).eq('id', inv.id);
             
             // 2. Credit Wallet
             let { data: wallet } = await supabaseServer.from('Wallet').select('id, balance').eq('userId', userId).maybeSingle();
             if (!wallet) {
                 const { data: w2 } = await supabaseServer.from('wallets').select('id, balance').eq('user_id', userId).maybeSingle();
                 wallet = w2;
             }
             
             if (wallet) {
                 const newBalance = Number(wallet.balance) + amount;
                 // Try PascalCase update first
                 const { error: wErr } = await supabaseServer.from('Wallet').update({ balance: newBalance }).eq('id', wallet.id);
                 if (wErr) {
                     await supabaseServer.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
                 }
             }

             // 3. Log Transaction
             const txPayload = {
                id: uuidv4(),
                userId: userId, 
                investmentId: inv.id,
                type: 'PRINCIPAL_RETURN',
                amount: amount,
                currency,
                status: 'COMPLETED',
                provider: 'SYSTEM',
                reference: `Principal return for ${inv.id}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
             };

             const { error: tErr } = await supabaseServer.from('Transaction').insert(txPayload);
             if (tErr && (tErr.message.includes('relation') || tErr.code === '42P01')) {
                 await supabaseServer.from('transactions').insert({
                    user_id: userId,
                    investment_id: inv.id,
                    type: 'PRINCIPAL_RETURN',
                    amount: amount,
                    currency,
                    status: 'COMPLETED',
                    provider: 'SYSTEM',
                    reference: `Principal return for ${inv.id}`,
                    created_at: new Date().toISOString()
                });
             }
             
             results.principalReleased++;
             continue; // Skip ROI if principal released
        }

        // --- B. ROI Distribution (Daily) ---
        // DISABLED: ROI is handled by the Profit Engine (Weekly Stream Distribution)
        // See: /api/admin/distribute-profits and src/lib/profit/engine.ts
        /*
        if (diffHours < 24 && !force) {
          results.roiSkipped++;
          continue;
        }

        const planId = (inv[planCol] || 'starter').toLowerCase();
        
        // ROI Rates (Mock - should fetch from config but keeping simple for now)
        const rates: any = {
          'starter': 0.012, // 1.2%
          'pro': 0.015,     // 1.5%
          'elite': 0.020    // 2.0%
        };
        const rate = rates[planId] || 0.01;
        const payout = amount * rate;

        if (payout <= 0) {
            results.roiSkipped++;
            continue;
        }

        // 1. Add Transaction
        const txPayload = {
            id: uuidv4(),
            userId: userId,
            investmentId: inv.id,
            type: 'PROFIT',
            amount: payout,
            currency,
            status: 'COMPLETED',
            provider: 'SYSTEM',
            reference: `ROI for ${inv.id}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const { error: tErr } = await supabaseServer.from('Transaction').insert(txPayload);
        
        if (tErr && (tErr.message.includes('relation') || tErr.code === '42P01')) {
             await supabaseServer.from('transactions').insert({
                user_id: userId,
                investment_id: inv.id,
                type: 'PROFIT',
                amount: payout,
                currency,
                status: 'COMPLETED',
                provider: 'SYSTEM',
                reference: `ROI for ${inv.id}`,
                created_at: new Date().toISOString()
            });
        }

        // 2. Update Wallet
        let { data: wallet } = await supabaseServer.from('Wallet').select('id, balance').eq('userId', userId).maybeSingle();
        if (!wallet) {
             const { data: w2 } = await supabaseServer.from('wallets').select('id, balance').eq('user_id', userId).maybeSingle();
             wallet = w2;
        }
        
        if (wallet) {
             const newBalance = Number(wallet.balance) + payout;
             const { error: wErr } = await supabaseServer.from('Wallet').update({ balance: newBalance }).eq('id', wallet.id);
             if (wErr) {
                 await supabaseServer.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
             }
        }

        // 3. Update Investment (lastPayoutAt)
        await supabaseServer.from(investTable).update({
            [lastPayoutCol]: new Date().toISOString()
        }).eq('id', inv.id);

        results.roiProcessed++;
        results.totalPayout += payout;
        */

      } catch (err) {
        console.error('Error processing cycle for investment:', inv.id, err);
        results.errors++;
      }
    }

    return res.status(200).json(results);

  } catch (err: any) {
    console.error('Run Cycle Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
