import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- Auth Check ---
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
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
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  // ------------------

  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Missing ids' });
  }

  try {
      // Try PascalCase
      const { error: e1 } = await supabaseServer
        .from('Notification')
        .update({ read: true })
        .in('id', ids)
        .eq('userId', user.id);
      
      if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
          // Fallback
          const { error: e2 } = await supabaseServer
            .from('notifications')
            .update({ read: true })
            .in('id', ids)
            .eq('user_id', user.id);
          
          if (e2) throw e2;
      } else if (e1) {
          throw e1;
      }

      return res.status(200).json({ success: true });
  } catch (err: any) {
      return res.status(500).json({ error: err.message });
  }
}
