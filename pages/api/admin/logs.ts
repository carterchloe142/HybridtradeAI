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

  let isAdmin = false;
  let { data: u1, error: e1 } = await supabaseServer.from('User').select('role').eq('id', user.id).single();
  if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
       let { data: u2 } = await supabaseServer.from('users').select('role').eq('id', user.id).single();
       if (u2 && u2.role === 'admin') isAdmin = true;
  } else if (u1 && u1.role === 'admin') isAdmin = true;
  if (!isAdmin && user.app_metadata?.role === 'admin') isAdmin = true;

  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });

  // 2. List Logs
  try {
      const { page = '1', limit = '100' } = req.query;
      const p = parseInt(String(page));
      const l = parseInt(String(limit));
      const from = (p - 1) * l;
      const to = from + l - 1;

      // Try 'AuditLog' or 'logs'
      let query = supabaseServer.from('AuditLog').select('*', { count: 'exact' }).range(from, to).order('createdAt', { ascending: false });
      let { data, error, count } = await query;

      if (error && (error.message.includes('relation') || error.code === '42P01')) {
          let q2 = supabaseServer.from('audit_logs').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
          const res2 = await q2;
          
          if (res2.error && (res2.error.message.includes('relation') || res2.error.code === '42P01')) {
               // Fallback 'logs'?
               let q3 = supabaseServer.from('logs').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
               const res3 = await q3;
               if (res3.error) {
                   // If no logs table, return empty
                   return res.status(200).json({ items: [], count: 0 });
               }
               data = res3.data;
               count = res3.count;
          } else if (res2.error) {
              throw res2.error;
          } else {
              data = res2.data;
              count = res2.count;
          }
      } else if (error) {
          throw error;
      }

      return res.status(200).json({ items: data || [], count: count || 0 });

  } catch (e: any) {
      return res.status(500).json({ error: e.message });
  }
}
