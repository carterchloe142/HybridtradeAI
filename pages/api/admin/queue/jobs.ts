import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { broadcastQueue } from '@/src/lib/queue/broadcastQueue';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- Auth Check ---
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Check Admin Role
  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('role,is_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  const userRole = String(profile?.role || '').toLowerCase();
  const isAdmin = Boolean(profile?.is_admin) || userRole === 'admin';

  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  // ------------------

  const { status = 'waiting', limit = '20', page = '0' } = req.query;
  const l = parseInt(String(limit));
  const p = parseInt(String(page));
  const start = p * l;
  const end = start + l - 1;

  try {
    let items: any[] = [];
    if (broadcastQueue && typeof broadcastQueue.getJobs === 'function') {
        const jobs = await broadcastQueue.getJobs([status as any], start, end, true); // true for ascending
        items = jobs.map((j: any) => ({
            id: j.id,
            name: j.name,
            data: j.data,
            timestamp: j.timestamp,
            finishedOn: j.finishedOn,
            processedOn: j.processedOn,
            returnvalue: j.returnvalue,
            failedReason: j.failedReason,
            stacktrace: j.stacktrace,
            opts: j.opts
        }));
    }
    return res.status(200).json({ items });
  } catch (err: any) {
    console.error('Error fetching queue jobs:', err);
    return res.status(500).json({ error: err.message });
  }
}
