import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { subscribe, HEARTBEAT_MS } from '@/src/lib/sse';
import { createClient } from '@/src/lib/redis';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (req.query.token as string);

  if (!token) {
    res.write('event: error\ndata: Missing token\n\n');
    return res.end();
  }
  
  if (!supabaseServer) {
    res.write('event: error\ndata: Supabase not configured\n\n');
    return res.end();
  }

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) {
    res.write('event: error\ndata: Invalid token\n\n');
    return res.end();
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
    res.write('event: error\ndata: Forbidden\n\n');
    return res.end();
  }

  // SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  // Initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', userId: user.id })}\n\n`);

  // Redis Subscriber
  const subClient = createClient(); // Create a new client for subscription
  
  if (!subClient) {
     // Fallback if Redis not available
     const interval = setInterval(() => {
        res.write(': heartbeat\n\n');
     }, HEARTBEAT_MS);
     
     req.on('close', () => {
        clearInterval(interval);
        res.end();
     });
     return;
  }

  const cleanup = subscribe(`user:${user.id}`, (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }, subClient);

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, HEARTBEAT_MS);

  req.on('close', () => {
    clearInterval(heartbeat);
    if (cleanup) cleanup();
    if (subClient) subClient.disconnect();
    res.end();
  });
}
