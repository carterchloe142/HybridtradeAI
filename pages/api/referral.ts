import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId, amountUSD = 0 } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  // Generate referral code
  const referralCode = crypto.createHash('sha256').update(`${userId}:${Date.now()}`).digest('hex').slice(0, 8);
  // Placeholder: Track commission and auto-credit to downline wallets
  const creditedUSD = Number((amountUSD * 0.05).toFixed(2)); // 5% placeholder

  // Try persisting to Supabase if environment is configured
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    const supabase = createClient(url, key);
    try {
      await supabase
        .from('referrals')
        .upsert({ user_id: userId, code: referralCode }, { onConflict: 'user_id' });
    } catch (e) {
      // swallow insert errors to keep API responsive
    }
  }

  return res.status(200).json({ ok: true, referralCode, creditedUSD });
}
