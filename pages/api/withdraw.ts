import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../lib/supabaseServer';
import { createRateLimiter } from '../../lib/rateLimit';
import { getKycStatus } from '../../lib/kyc';
import { z } from 'zod';

const WithdrawSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'NGN', 'BTC', 'ETH']),
  cycleActive: z.boolean().optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const limiter = createRateLimiter({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15_000),
    max: Number(process.env.RATE_LIMIT_MAX ?? 20)
  });
  const ok = await limiter(req, res, 'withdraw');
  if (!ok) return;
  const parsed = WithdrawSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
  const { userId, amount, currency, cycleActive } = parsed.data;
  // Enforce KYC approval before any withdrawal
  const kyc = await getKycStatus(userId);
  if (kyc !== 'approved') return res.status(403).json({ error: 'KYC required. Please complete verification.' });
  // Enforce waiting period if investment cycle is ongoing
  if (cycleActive) return res.status(400).json({ error: 'Withdrawal blocked: cycle in progress. Try after distribution.' });
  // Large withdrawal hold policy
  const holdThreshold = Number(process.env.WITHDRAW_HOLD_THRESHOLD_USD ?? 2000);
  if (Number(amount) > holdThreshold) {
    await supabaseServer
      .from('transactions')
      .insert({ user_id: userId, type: 'withdraw_request', amount_usd: amount, meta: { currency, status: 'pending', reason: 'large_withdrawal_hold' } });
    return res.status(202).json({ ok: true, message: 'Withdrawal request submitted and pending admin approval.' });
  }
  // Fetch wallet
  const { data: wallet, error: wErr } = await supabaseServer
    .from('wallets')
    .select('id,amount')
    .eq('user_id', userId)
    .eq('currency', currency)
    .maybeSingle();
  if (wErr) return res.status(500).json({ error: 'Wallet fetch failed' });
  if (!wallet || Number(wallet.amount) < Number(amount)) return res.status(400).json({ error: 'Insufficient balance' });

  const { error: updErr } = await supabaseServer
    .from('wallets')
    .update({ amount: Number(wallet.amount) - Number(amount) })
    .eq('id', wallet.id);
  if (updErr) return res.status(500).json({ error: 'Failed to update wallet' });

  const { error: txErr } = await supabaseServer
    .from('transactions')
    .insert({ user_id: userId, type: 'withdraw', amount_usd: amount, meta: { currency } });
  if (txErr) return res.status(500).json({ error: 'Failed to record withdrawal' });

  return res.status(200).json({ ok: true, message: `Withdrawal of ${amount} ${currency} recorded.` });
}
