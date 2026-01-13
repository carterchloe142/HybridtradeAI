import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  const CONFIG_KEY = 'por_privacy_config';

  if (req.method === 'GET') {
      let val = null;
      const { data, error } = await supabaseServer.from('Setting').select('value').eq('key', CONFIG_KEY).maybeSingle();
      if (error && (error.message.includes('relation') || error.code === '42P01')) {
           const { data: d2 } = await supabaseServer.from('settings').select('value').eq('key', CONFIG_KEY).maybeSingle();
           val = d2?.value;
      } else {
           val = data?.value;
      }

      let config = { epsilon: 0.5, sensitivity: 1000 };
      if (val) {
          try { config = JSON.parse(val); } catch (e) {}
      }
      return res.status(200).json({ config });

  } else if (req.method === 'POST' || req.method === 'PUT') {
      const config = req.body;
      const value = JSON.stringify(config);

      const { error: err1 } = await supabaseServer
        .from('Setting')
        .upsert({ key: CONFIG_KEY, value }, { onConflict: 'key' });

      if (err1) {
          if (err1.message.includes('relation') || err1.code === '42P01') {
               const { error: err2 } = await supabaseServer
                .from('settings')
                .upsert({ key: CONFIG_KEY, value }, { onConflict: 'key' });
               if (err2) return res.status(500).json({ error: err2.message });
          } else {
               return res.status(500).json({ error: err1.message });
          }
      }
      return res.status(200).json({ success: true });
  } else {
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
