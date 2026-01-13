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
      // Get Investments
      let investments = [];
      // Investment Table
      let { data: d1, error: e1 } = await supabaseServer.from('Investment').select('*').eq('userId', user.id).eq('status', 'ACTIVE');
      
      if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
          let { data: d2, error: e2 } = await supabaseServer.from('investments').select('*').eq('user_id', user.id).eq('status', 'ACTIVE');
          if (e2) throw e2;
          investments = d2 || [];
      } else if (e1) {
          throw e1;
      } else {
          investments = d1 || [];
      }

      // Calculate stats
      let totalInvestedUSD = 0;
      let projectedWeeklyMinUSD = 0;
      let projectedWeeklyMaxUSD = 0;
      let last30DaysRoiUSD = 0; 

      // Plan ROI config (hardcoded or fetched?)
      // TODO: Fetch from InvestmentPlan
      const plans: any = {
          'starter': { min: 0.012, max: 0.015 }, // Daily
          'pro': { min: 0.015, max: 0.020 },
          'elite': { min: 0.020, max: 0.025 }
      };

      for (const inv of investments) {
          const amt = Number(inv.amount || inv.amount_usd || inv.principal || 0);
          totalInvestedUSD += amt;
          
          const planId = (inv.planId || inv.plan_id || 'starter').toLowerCase();
          const rate = plans[planId] || plans['starter'];
          
          // Weekly = Daily * 7
          projectedWeeklyMinUSD += amt * rate.min * 7;
          projectedWeeklyMaxUSD += amt * rate.max * 7;
      }

      // Last 30 days ROI
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      let txQuery = supabaseServer.from('Transaction')
        .select('amount')
        .eq('userId', user.id) // PascalCase
        .in('type', ['PROFIT'])
        .gte('createdAt', thirtyDaysAgo.toISOString());
      
      let { data: txs, error: txErr } = await txQuery;
      
      if (txErr && (txErr.message.includes('relation') || txErr.code === '42P01')) {
           let q2 = supabaseServer.from('transactions')
            .select('amount')
            .eq('user_id', user.id) // snake_case
            .in('type', ['PROFIT'])
            .gte('created_at', thirtyDaysAgo.toISOString());
           let res2 = await q2;
           if (!res2.error) txs = res2.data;
      }

      if (txs) {
          last30DaysRoiUSD = txs.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
      }

      return res.status(200).json({
          totalInvestedUSD,
          projectedWeeklyMinUSD,
          projectedWeeklyMaxUSD,
          last30DaysRoiUSD
      });

  } catch (e: any) {
      return res.status(500).json({ error: e.message });
  }
}
