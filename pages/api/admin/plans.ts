import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  if (req.method === 'PATCH') {
      const plan = req.body;
      if (!plan || !plan.id) return res.status(400).json({ error: 'Missing plan data' });

      try {
          // Map camelCase to DB columns (PascalCase for prisma tables, or snake_case if using raw supabase)
          // The frontend sends: id, name, returnPercentage, minAmount, maxAmount, duration, payoutFrequency, active
          // The DB schema says InvestmentPlan: id, name, minAmount, maxAmount, duration, returnPercentage, payoutFrequency, active
          
          const updateData = {
              name: plan.name,
              minAmount: plan.minAmount,
              maxAmount: plan.maxAmount,
              duration: plan.duration,
              returnPercentage: plan.returnPercentage,
              payoutFrequency: plan.payoutFrequency,
              active: plan.active
          };

          const { error: updateErr } = await supabaseServer
              .from('InvestmentPlan')
              .update(updateData)
              .eq('id', plan.id);
          
          if (updateErr) {
              // Try snake_case if PascalCase fails
              const snakeData = {
                  name: plan.name,
                  min_amount: plan.minAmount,
                  max_amount: plan.maxAmount,
                  duration: plan.duration,
                  return_percentage: plan.returnPercentage,
                  payout_frequency: plan.payoutFrequency,
                  active: plan.active
              };
               const { error: u2 } = await supabaseServer.from('investment_plans').update(snakeData).eq('id', plan.id);
               if (u2) throw u2;
          }

          return res.status(200).json({ success: true });

      } catch (error: any) {
          console.error('Update plan error:', error);
          return res.status(500).json({ error: error.message });
      }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
