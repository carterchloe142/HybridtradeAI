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

  const { amount, planId, currency = 'USD' } = req.body;
  const amt = Number(amount);

  if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount' });
  if (!planId) return res.status(400).json({ error: 'Missing planId' });

  try {
    // 0. Validate Plan
    const PLAN_RANGES: any = {
        starter: { min: 100, max: 500 },
        pro: { min: 501, max: 2000 },
        elite: { min: 2001, max: 10000 }
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

    // Check snake_case if:
    // 1. Error indicates table missing
    // 2. OR No data found (w1 is null) - might be in other table
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
       // If w2 is also null, wallet remains null (insufficient funds)
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
    
    // Optimistic locking? For now simple update.
    const { error: upErr } = await supabaseServer
        .from(walletTable)
        .update(updatePayload)
        .eq('id', wallet.id);
    
    if (upErr) throw upErr;

    // 3. Create Investment
    // Try 'Investment' (PascalCase) first with camelCase columns
    let investTable = 'Investment';
    
    const investPayload = {
        id: uuidv4(),
        userId: user.id, // Force camelCase for PascalTable
        planId: planId,
        principal: amt,
        status: 'ACTIVE',
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
            plan_id: planId,
            principal: amt, // Assuming 'principal' column exists in snake_case too, or map to 'amount'?
            // If fallback table is 'investments', it likely has 'principal' or 'amount'.
            // Based on Prisma schema, it should be 'principal'.
            status: 'ACTIVE',
            start_date: new Date().toISOString(),
        };
        const { error: iErr2 } = await supabaseServer.from('investments').insert(snakePayload);
        if (iErr2) throw iErr2;
    } else if (iErr1) {
        throw iErr1;
    }

    // 4. Record Transaction
    // Use TRANSFER type since INVESTMENT is not in Enum
    const txPayload = {
        id: uuidv4(),
        userId: user.id, // Explicitly try camelCase first for PascalCase table
        investmentId: investPayload.id,
        type: 'TRANSFER',
        amount: -amt, 
        currency,
        status: 'COMPLETED',
        // metadata: { description: `Investment in ${planId} plan` }, // Column missing
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
             investment_id: investPayload.id, // If column exists
             type: 'TRANSFER',
             amount: -amt,
             currency,
             status: 'COMPLETED',
             // metadata: { description: `Investment in ${planId} plan` },
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
