import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { redis } from '@/src/lib/redis';

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

  const { scope = 'admin' } = req.query;

  try {
    let items: any[] = [];
    if (redis) {
        // Scan for rate limit keys
        const prefix = scope === 'admin' ? 'rl:admin:' : 'rl:user:';
        let cursor = '0';
        const keys = new Set<string>();
        
        do {
            const [nextCursor, batch] = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
            cursor = nextCursor;
            batch.forEach(k => keys.add(k));
        } while (cursor !== '0');

        // Fetch values for all keys
        const keyList = Array.from(keys);
        if (keyList.length > 0) {
            // Pipeline to get all values
            const pipeline = redis.pipeline();
            keyList.forEach(k => pipeline.hmget(k, 'tokens', 'timestamp'));
            const results = await pipeline.exec();
            
            items = keyList.map((k, i) => {
                const [err, res] = results?.[i] || [null, null];
                const [tokens, timestamp] = (res as any[]) || [null, null];
                return {
                    key: k,
                    tokens: tokens ? Number(tokens) : null,
                    timestamp: timestamp ? new Date(Number(timestamp) * 1000).toISOString() : null
                };
            });
        }
    }

    return res.status(200).json({ items });
  } catch (err: any) {
    console.error('Error fetching rate limit status:', err);
    return res.status(500).json({ error: err.message });
  }
}
