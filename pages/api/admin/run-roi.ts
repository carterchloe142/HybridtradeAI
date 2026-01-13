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
    const { force } = req.body;
    
    // Use the centralized profit engine
    const { runStreamDistribution } = await import('@/src/lib/profit/engine');
    
    // Default to current week ending (Friday or Sunday? Usually standard is end of week)
    // For now, let's just use current date as 'weekEnding' reference.
    // The engine handles duplicate checks via unique constraints on ProfitLog.
    const result = await runStreamDistribution({
      weekEnding: new Date(),
      dryRun: false // This is a "Force Run", so not a dry run
    });

    return res.status(200).json(result);

  } catch (err: any) {
    console.error('Run ROI Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
