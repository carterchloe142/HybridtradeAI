import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { runStreamDistribution } from '@/src/lib/profit/engine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

  try {
    const { dryRun, performance, weekEnding } = req.body;
    
    const result = await runStreamDistribution({
      weekEnding: weekEnding || new Date(),
      performance: performance || {}, // Engine will fetch from DB if empty
      dryRun: dryRun === true || dryRun === 'true'
    });

    return res.status(200).json(result);
  } catch (e: any) {
    console.error('Distribute Profits Error:', e);
    return res.status(500).json({ error: e.message });
  }
}
