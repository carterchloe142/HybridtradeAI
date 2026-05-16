
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { encodeReferralCode } from '@/src/lib/referral';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify auth
  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!url || !key) return res.status(500).json({ error: 'Supabase not configured' });

  const supabase = createClient(url, key);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  // Strategy: Use Base64 encoded User ID as the referral code
  // This avoids needing a separate database table for mapping.
  
  if (req.method === 'GET' || req.method === 'POST') {
    try {
      const code = encodeReferralCode(user.id);
      return res.status(200).json({ code });
    } catch (error) {
      console.error('Error generating referral:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
