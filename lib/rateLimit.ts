import type { NextApiRequest, NextApiResponse } from 'next';

type LimiterOptions = { windowMs: number; max: number };
type Hit = { count: number; resetAt: number };

const store = new Map<string, Hit>();

function getIp(req: NextApiRequest) {
  const xfwd = (req.headers['x-forwarded-for'] || '') as string;
  const ip = xfwd.split(',')[0].trim();
  return ip || (req.socket as any)?.remoteAddress || 'unknown';
}

export function createRateLimiter(opts: LimiterOptions) {
  return async function check(req: NextApiRequest, res: NextApiResponse, key: string) {
    const ip = getIp(req);
    const id = `${ip}:${key}`;
    const now = Date.now();
    const hit = store.get(id);
    if (!hit || now > hit.resetAt) {
      store.set(id, { count: 1, resetAt: now + opts.windowMs });
      res.setHeader('X-RateLimit-Remaining', String(opts.max - 1));
      return true;
    }
    if (hit.count >= opts.max) {
      const retryMs = hit.resetAt - now;
      res.setHeader('Retry-After', String(Math.ceil(retryMs / 1000)));
      res.status(429).json({ error: 'Too many requests' });
      return false;
    }
    hit.count += 1;
    store.set(id, hit);
    res.setHeader('X-RateLimit-Remaining', String(opts.max - hit.count));
    return true;
  };
}
