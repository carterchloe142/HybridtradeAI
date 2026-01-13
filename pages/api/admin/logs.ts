import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  // 1. Verify Admin (Updated to use profiles table)
  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid token' });

  let isAdmin = false;
  
  // Check 'profiles' table
  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('role,is_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile) {
      const r = String(profile.role || '').toLowerCase();
      if (Boolean(profile.is_admin) || r === 'admin') {
          isAdmin = true;
      }
  }

  // Fallback to 'User'/'users'
  if (!isAdmin) {
      let { data: u1, error: e1 } = await supabaseServer.from('User').select('role').eq('id', user.id).single();
      if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
           let { data: u2 } = await supabaseServer.from('users').select('role').eq('id', user.id).single();
           if (u2 && u2.role === 'admin') isAdmin = true;
      } else if (u1 && u1.role === 'admin') isAdmin = true;
  }
  
  // App metadata fallback
  if (!isAdmin && user.app_metadata?.role === 'admin') isAdmin = true;

  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });

  // 2. List Logs
  try {
      const { page = '1', limit = '100' } = req.query;
      const p = parseInt(String(page));
      const l = parseInt(String(limit));
      const from = (p - 1) * l;
      const to = from + l - 1;

      // Try 'AuditLog' or 'audit_logs'
      let query = supabaseServer
        .from('AuditLog')
        .select('*', { count: 'exact' })
        .order('createdAt', { ascending: false })
        .range(from, to);

      // Probe
      const { error: probe } = await supabaseServer.from('AuditLog').select('id').limit(1);
      if (probe && (probe.message.includes('relation') || probe.code === '42P01')) {
           query = supabaseServer
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Normalize
      const items = (data || []).map((log: any) => ({
          id: log.id,
          action: log.action,
          target: log.target || log.target_resource,
          details: log.details,
          ip: log.ip || log.ip_address,
          admin_email: log.adminEmail || log.admin_email,
          created_at: log.createdAt || log.created_at
      }));

      return res.status(200).json({ items, total: count || 0 });

  } catch (err: any) {
      console.error('Fetch logs error:', err);
      return res.status(500).json({ error: err.message });
  }
}
