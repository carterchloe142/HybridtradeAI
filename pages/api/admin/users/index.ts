import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  // 1. Verify Admin
  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid token' });

  // Check role
  let isAdmin = false;
  
  // 1. Check 'profiles' table (Primary Source of Truth)
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

  // 2. Fallback: Check 'User' table role or 'users' table
  if (!isAdmin) {
      let { data: u1, error: e1 } = await supabaseServer.from('User').select('role').eq('id', user.id).single();
      if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
           let { data: u2 } = await supabaseServer.from('users').select('role').eq('id', user.id).single();
           if (u2 && u2.role === 'admin') isAdmin = true;
      } else if (u1 && u1.role === 'admin') {
          isAdmin = true;
      }
  }
  
  // 3. Fallback: Check App metadata if RBAC is there
  if (!isAdmin && user.app_metadata?.role === 'admin') isAdmin = true;

  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });

  // 2. List Users
  try {
      const { page = '1', limit = '50', search } = req.query;
      const p = parseInt(String(page));
      const l = parseInt(String(limit));
      const from = (p - 1) * l;
      const to = from + l - 1;

      // Try 'User'
      let query = supabaseServer.from('User').select('*', { count: 'exact' }).range(from, to).order('createdAt', { ascending: false });
      
      if (search) {
          query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
      }

      let { data, error, count } = await query;

      if (error && (error.message.includes('relation') || error.code === '42P01')) {
          // Fallback 'users'
           let q2 = supabaseServer.from('users').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
           if (search) {
               q2 = q2.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
           }
           const res2 = await q2;
           if (res2.error) throw res2.error;
           data = res2.data;
           count = res2.count;
      } else if (error) {
          throw error;
      }

      return res.status(200).json({ items: data, count });

  } catch (e: any) {
      return res.status(500).json({ error: e.message });
  }
}
