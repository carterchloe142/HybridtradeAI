import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../lib/supabaseServer';
import { createRateLimiter } from '../../lib/rateLimit';
import { z } from 'zod';

const DepositSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'NGN', 'BTC', 'ETH']),
  provider: z.string().min(1),
  planId: z.enum(['starter', 'pro', 'elite'])
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const limiter = createRateLimiter({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15_000),
    max: Number(process.env.RATE_LIMIT_MAX ?? 20)
  });
  const ok = await limiter(req, res, 'deposit');
  if (!ok) return;
  const parsed = DepositSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
  const { userId, amount, currency, provider, planId } = parsed.data;

  // Record transaction
  const { error: txErr } = await supabaseServer.from('transactions').insert({
    user_id: userId,
    type: 'deposit',
    amount,
    currency,
    status: 'pending',
    meta: { provider, planId }
  });
  if (txErr) return res.status(500).json({ error: 'Failed to record transaction', details: txErr.message });

  // Create investment (active)
  const { error: invErr } = await supabaseServer
    .from('investments')
    .insert({ user_id: userId, plan_id: planId, amount_usd: amount, status: 'active' });
  if (invErr) return res.status(500).json({ error: 'Failed to create investment' });

  return res.status(200).json({ ok: true, message: `Deposit of ${amount} ${currency} via ${provider} recorded for plan ${planId}.` });
}
