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

  // 1. Verify User
  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  try {
    // 2. Verify Admin Role
    const { data: userData, error: roleErr } = await supabaseServer
      .from('User')
      .select('role')
      .eq('id', user.id)
      .single();

    if (roleErr || !userData || userData.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // 3. Fetch Pending KYC
    const { data: pendingUsers, error: listErr } = await supabaseServer
      .from('User')
      .select('id, email, name, kycStatus, kycDocument, createdAt')
      .eq('kycStatus', 'PENDING');

    if (listErr) throw listErr;

    return res.status(200).json({ users: pendingUsers });
  } catch (err: any) {
    console.error('Admin KYC List Error:', err);
    return res.status(500).json({ error: 'Failed to fetch KYC list' });
  }
}
