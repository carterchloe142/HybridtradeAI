import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  try {
    const { data: userData, error } = await supabaseServer
      .from('User')
      .select('kycStatus, kycDocument')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return res.status(200).json({
      status: userData?.kycStatus || 'NOT_SUBMITTED',
      document: userData?.kycDocument || null
    });
  } catch (err: any) {
    console.error('KYC Status Error:', err);
    return res.status(500).json({ error: 'Failed to fetch KYC status' });
  }
}
