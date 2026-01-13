import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  try {
      // 1. Get Wallet Balance
      let balance = 0;
      let { data: w1, error: e1 } = await supabaseServer.from('Wallet').select('balance').eq('userId', user.id).eq('currency', 'USD').maybeSingle();
      
      if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
           let { data: w2 } = await supabaseServer.from('wallets').select('balance').eq('user_id', user.id).eq('currency', 'USD').maybeSingle();
           if (w2) balance = Number(w2.balance || 0);
      } else if (w1) {
          balance = Number(w1.balance || 0);
      }

      // 2. Get Active Investments
      let investments = [];
      let { data: d1, error: iErr1 } = await supabaseServer.from('Investment').select('*').eq('userId', user.id).eq('status', 'active');
       if (iErr1 && (iErr1.message.includes('relation') || iErr1.code === '42P01')) {
          let { data: d2 } = await supabaseServer.from('investments').select('*').eq('user_id', user.id).eq('status', 'active');
          investments = d2 || [];
       } else {
          investments = d1 || [];
       }

       let totalInvested = 0;
       for (const inv of investments) {
           totalInvested += Number(inv.amount || inv.amount_usd || 0);
       }

       // 3. Get Total Profit (ROI)
       // Sum of 'roi' transactions
       let totalProfit = 0;
       let txQuery = supabaseServer.from('Transaction').select('amount').eq('userId', user.id).in('type', ['roi', 'interest', 'profit']);
       let { data: txs, error: txErr } = await txQuery;
       if (txErr && (txErr.message.includes('relation') || txErr.code === '42P01')) {
            let { data: txs2 } = await supabaseServer.from('transactions').select('amount').eq('user_id', user.id).in('type', ['roi', 'interest', 'profit']);
            txs = txs2;
       }
       if (txs) {
           totalProfit = txs.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
       }

       const owedUSD = balance + totalInvested; // Simple definition of liability
       const roiPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

       return res.status(200).json({ roiPct, owedUSD });

  } catch (e: any) {
      return res.status(500).json({ error: e.message });
  }
}
