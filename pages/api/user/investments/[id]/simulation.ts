import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const { id } = req.query;

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  try {
      // Get Investment
      let investment = null;
      let { data: i1, error: e1 } = await supabaseServer.from('Investment').select('*').eq('id', id).single();
      
      if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
           let { data: i2, error: e2 } = await supabaseServer.from('investments').select('*').eq('id', id).single();
           if (e2) throw e2;
           investment = i2;
      } else if (e1) {
          throw e1;
      } else {
          investment = i1;
      }

      if (!investment) return res.status(404).json({ error: 'Investment not found' });
      
      // Check ownership
      const ownerId = investment.userId || investment.user_id;
      if (ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' });

      // Generate Simulation Data
      const amount = Number(investment.amount || investment.amount_usd || 0);
      const startDate = new Date(investment.startDate || investment.start_date || investment.created_at);
      const days = 30; // Show 30 days window? Or duration of plan?
      // Plans usually have duration. Let's assume 30 days for now or read from plan config if available.
      
      const data = [];
      let currentAmount = amount;
      
      // Mock market conditions
      const conditions = ['Bullish', 'Stable', 'Volatile', 'Bearish'];
      
      for (let i = 0; i < days; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          
          const isPast = date < new Date();
          const dailyRoi = 0.01 + (Math.random() * 0.01); // 1-2%
          const profit = currentAmount * dailyRoi;
          
          if (isPast) {
              // Should use actual accrued profit if available, but for simulation we mock 'actual' vs 'projected' visual
              // currentAmount += profit; // Compound? Usually payout is separate.
          }
          
          data.push({
              day: i + 1,
              date: date.toISOString().split('T')[0],
              roi: profit,
              amount: currentAmount,
              status: isPast ? 'actual' : 'projected',
              marketCondition: conditions[Math.floor(Math.random() * conditions.length)]
          });
      }

      return res.status(200).json(data);

  } catch (e: any) {
      return res.status(500).json({ error: e.message });
  }
}
