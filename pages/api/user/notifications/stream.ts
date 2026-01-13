import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { sub, redisEnabled } from '@/src/lib/redis';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.query.token as string;
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for Nginx

  // Initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', userId: user.id })}\n\n`);

  // Heartbeat interval
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  // Redis Subscription (if enabled)
  let redisSub: any = null;
  if (redisEnabled && sub) {
    try {
      redisSub = sub.duplicate();
      const channel = `notifications:user:${user.id}`;
      
      redisSub.subscribe(channel);
      redisSub.on('message', (chan: string, message: string) => {
        if (chan === channel) {
          res.write(`data: ${message}\n\n`);
        }
      });
    } catch (e) {
      console.error('Redis subscription failed', e);
    }
  }

  // Cleanup on close
  req.on('close', () => {
    clearInterval(heartbeat);
    if (redisSub) {
      redisSub.quit();
    }
  });
}
