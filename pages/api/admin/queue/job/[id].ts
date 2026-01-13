import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { broadcastQueue } from '@/src/lib/queue/broadcastQueue';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  const { id } = req.query;
  const jobId = String(id);

  try {
    if (!broadcastQueue || typeof broadcastQueue.getJob !== 'function') {
        return res.status(503).json({ error: 'Queue service unavailable' });
    }

    const job = await broadcastQueue.getJob(jobId);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            id: job.id,
            name: job.name,
            data: job.data,
            timestamp: job.timestamp,
            finishedOn: job.finishedOn,
            processedOn: job.processedOn,
            returnvalue: job.returnvalue,
            failedReason: job.failedReason,
            stacktrace: job.stacktrace,
            opts: job.opts,
            state: await job.getState()
        });
    } else if (req.method === 'DELETE') {
        await job.remove();
        return res.status(200).json({ success: true });
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err: any) {
    console.error(`Error handling job ${jobId}:`, err);
    return res.status(500).json({ error: err.message });
  }
}
