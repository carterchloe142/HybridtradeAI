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

  // Check Admin Role
  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('role,is_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  const userRole = String(profile?.role || '').toLowerCase();
  const isAdmin = Boolean(profile?.is_admin) || userRole === 'admin';

  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });

  // Count unread notifications
  // Try PascalCase
  const { count, error: e1 } = await supabaseServer
    .from('Notification')
    .select('*', { count: 'exact', head: true })
    .eq('userId', user.id)
    .eq('read', false);

  if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
    // Fallback
    const { count: c2, error: e2 } = await supabaseServer
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    
    if (e2) return res.status(500).json({ error: e2.message });
    return res.status(200).json({ count: c2 || 0 });
  } else if (e1) {
    return res.status(500).json({ error: e1.message });
  }

  return res.status(200).json({ count: count || 0 });
}
