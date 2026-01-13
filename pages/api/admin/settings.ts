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

  const { key, value } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'Missing key' });
  }

  // Upsert into Setting (PascalCase) or settings (lowercase)
  // Try PascalCase
  const { error: err1 } = await supabaseServer
    .from('Setting')
    .upsert({ key, value }, { onConflict: 'key' });

  if (err1) {
      if (err1.message.includes('relation') || err1.code === '42P01') {
           // Fallback to lowercase
           const { error: err2 } = await supabaseServer
            .from('settings')
            .upsert({ key, value }, { onConflict: 'key' });
           
           if (err2) {
               return res.status(500).json({ error: err2.message });
           }
      } else {
           return res.status(500).json({ error: err1.message });
      }
  }

  return res.status(200).json({ success: true });
}
