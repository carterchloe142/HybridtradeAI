
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  // 1.1 KYC Check (Enforced)
  let kycStatus = 'PENDING';
  
  // Check 'User' table
  const { data: profile } = await supabaseServer.from('User').select('kycStatus').eq('id', user.id).maybeSingle();
  
  if (profile) {
      kycStatus = profile.kycStatus || 'PENDING';
  } else {
      // Check 'profiles' table fallback
      const { data: p2 } = await supabaseServer.from('profiles').select('kyc_status').eq('id', user.id).maybeSingle();
      if (p2) {
          kycStatus = p2.kyc_status || 'PENDING';
      }
  }
  
  const normalizedStatus = String(kycStatus).toUpperCase();
  
  if (normalizedStatus !== 'VERIFIED' && normalizedStatus !== 'APPROVED') {
      return res.status(403).json({ 
          error: 'KYC Verification Required', 
          code: 'KYC_REQUIRED',
          currentStatus: kycStatus
      });
  }

  const { amount, planId, currency = 'USD' } = req.body;
  const amt = Number(amount);

  if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount' });
  if (!planId) return res.status(400).json({ error: 'Missing planId' });

  try {
    // 0. Validate Plan
    const PLAN_RANGES: any = {
        starter: { min: 100, max: 500 },
        pro: { min: 501, max: 2000 },
        elite: { min: 2001, max: 10000 },
        bigtime: { min: 50000, max: 200000 }
    };
    
    let min = 0;
    let max = Infinity;

    // Try to fetch from DB
    let { data: dbPlan } = await supabaseServer.from('InvestmentPlan').select('*').or(`id.eq.${planId},name.ilike.${planId}`).maybeSingle();
    if (!dbPlan) {
        const { data: dbPlan2 } = await supabaseServer.from('investment_plans').select('*').or(`id.eq.${planId},name.ilike.${planId}`).maybeSingle();
        dbPlan = dbPlan2;
    }

    if (dbPlan) {
        min = Number(dbPlan.minAmount || dbPlan.min_amount || 0);
        max = Number(dbPlan.maxAmount || dbPlan.max_amount || Infinity);
    } else if (PLAN_RANGES[planId]) {
        min = PLAN_RANGES[planId].min;
        max = PLAN_RANGES[planId].max;
    }

    if (amt < min || amt > max) {
        return res.status(400).json({ error: `Amount must be between ${min} and ${max} for ${planId} plan` });
    }

    // 1. Check Balance
    // Try 'Wallet' then 'wallets'
    let wallet = null;
    let walletTable = 'Wallet';
    let userIdCol = 'userId';

    let q1 = supabaseServer.from('Wallet').select('*').eq('userId', user.id).eq('currency', currency).maybeSingle();
    let { data: w1, error: e1 } = await q1;

    if ((!w1 && !e1) || (e1 && (e1.message.includes('relation') || e1.code === '42P01'))) {
       // Try snake_case
       let q2 = supabaseServer.from('wallets').select('*').eq('user_id', user.id).eq('currency', currency).maybeSingle();
       let { data: w2, error: e2 } = await q2;
       
       if (w2) {
           wallet = w2;
           walletTable = 'wallets';
           userIdCol = 'user_id';
       } else if (e2) {
           if (e1) throw e1;
           throw e2;
       }
    } else if (e1) {
       throw e1;
    } else {
       wallet = w1;
    }

    const currentBalance = Number(wallet?.balance || 0);

    if (currentBalance < amt) {
        return res.status(400).json({ 
            error: 'Insufficient funds', 
            message: 'insufficient_funds',
            details: `Available: ${currentBalance} ${currency}` 
        });
    }

    // 2. Deduct Balance
    const newBalance = currentBalance - amt;
    const updatePayload = { balance: newBalance };
    
    const { error: upErr } = await supabaseServer
        .from(walletTable)
        .update(updatePayload)
        .eq('id', wallet.id);
    
    if (upErr) throw upErr;

    // 3. Create Investment
    let investTable = 'Investment';
    
    const startDate = new Date();
    const duration = Number(dbPlan?.duration || dbPlan?.duration || 14);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration);

    const investPayload = {
        id: uuidv4(),
        userId: user.id, // Force camelCase for PascalTable
        planId: dbPlan?.id || planId,
        principal: amt,
        status: 'ACTIVE',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        createdAt: startDate.toISOString(),
        updatedAt: startDate.toISOString()
    };
    
    // Attempt insert
    let investError = null;
    const { data: invData, error: iErr1 } = await supabaseServer.from('Investment').insert(investPayload).select().single();
    
    if (iErr1) console.error('Invest Try 1 Error:', iErr1);

    if (iErr1 && (iErr1.message.includes('relation') || iErr1.code === '42P01' || iErr1.message.includes('column'))) {
        // Fallback snake_case table AND snake_case columns
        investTable = 'investments';
        const snakePayload = {
            user_id: user.id,
            plan_id: dbPlan?.id || planId,
            principal: amt, 
            status: 'ACTIVE',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
        };
        const { error: iErr2 } = await supabaseServer.from('investments').insert(snakePayload);
        if (iErr2) throw iErr2;
    } else if (iErr1) {
        throw iErr1;
    }

    // 4. Record Transaction
    const txPayload = {
        id: uuidv4(),
        userId: user.id, 
        investmentId: investPayload.id,
        type: 'TRANSFER',
        amount: -amt, 
        currency,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Try Transaction
    const { error: tErr1 } = await supabaseServer.from('Transaction').insert(txPayload);
    if (tErr1) {
         console.error('Invest Transaction Try 1 Error:', tErr1);
         // Fallback to 'transactions'
         const snakeTxPayload = {
             id: txPayload.id,
             user_id: user.id,
             investment_id: investPayload.id, 
             type: 'TRANSFER',
             amount: -amt,
             currency,
             status: 'COMPLETED',
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString()
         };
         const { error: tErr2 } = await supabaseServer.from('transactions').insert(snakeTxPayload);
         if (tErr2) console.error('Invest Transaction Try 2 Error:', tErr2);
    }

    return res.status(200).json({ message: 'Investment active', newBalance });

  } catch (err: any) {
    console.error('Invest Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
