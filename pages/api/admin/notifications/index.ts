import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

  const { scope = 'personal', type, unreadOnly, limit = '50', page = '0' } = req.query;
  const l = parseInt(String(limit));
  const p = parseInt(String(page));
  const from = p * l;
  const to = from + l - 1;

  try {
    let data = [];
    let count = 0;

    if (scope === 'personal') {
        // Try PascalCase
        let query = supabaseServer
            .from('Notification')
            .select('*', { count: 'exact' })
            .eq('userId', user.id)
            .order('createdAt', { ascending: false })
            .range(from, to);
        
        if (type) query = query.eq('type', type);
        if (unreadOnly === 'true') query = query.eq('read', false);

        const { data: d1, error: e1, count: c1 } = await query;

        if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
             // Fallback to snake_case
             let q2 = supabaseServer
                .from('notifications')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .range(from, to);

             if (type) q2 = q2.eq('type', type);
             if (unreadOnly === 'true') q2 = q2.eq('read', false);

             const { data: d2, error: e2, count: c2 } = await q2;
             if (e2) throw e2;
             
             // Map snake_case to camelCase
             data = (d2 || []).map((item: any) => ({
                 id: item.id,
                 userId: item.user_id,
                 type: item.type,
                 title: item.title,
                 message: item.message,
                 link: item.link,
                 read: item.read,
                 createdAt: item.created_at
             }));
             count = c2 || 0;
        } else if (e1) {
            throw e1;
        } else {
            data = d1 || [];
            count = c1 || 0;
        }

    } else {
        // Global (System Logs / Global Notifications)
        // Try GlobalNotification (PascalCase)
        let query = supabaseServer
            .from('GlobalNotification')
            .select('*', { count: 'exact' })
            .order('createdAt', { ascending: false })
            .range(from, to);
        
        if (type) query = query.eq('type', type);

        const { data: d1, error: e1, count: c1 } = await query;

        if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
            // Fallback to snake_case
            let q2 = supabaseServer
                .from('global_notifications')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);
            
            if (type) q2 = q2.eq('type', type);

            const { data: d2, error: e2, count: c2 } = await q2;
            
            // If GlobalNotification table is also missing, try Notification where userId is null
            if (e2 && (e2.message.includes('relation') || e2.code === '42P01')) {
                 let q3 = supabaseServer
                    .from('notifications') // lowercase
                    .select('*', { count: 'exact' })
                    .is('user_id', null)
                    .order('created_at', { ascending: false })
                    .range(from, to);
                 
                 if (type) q3 = q3.eq('type', type);
                 const { data: d3, error: e3, count: c3 } = await q3;
                 
                 if (e3) {
                     // Try PascalCase Notification with null userId
                     let q4 = supabaseServer
                        .from('Notification')
                        .select('*', { count: 'exact' })
                        .is('userId', null)
                        .order('createdAt', { ascending: false })
                        .range(from, to);
                    if (type) q4 = q4.eq('type', type);
                    const { data: d4, error: e4, count: c4 } = await q4;
                    if (e4) throw e4;
                    data = d4 || [];
                    count = c4 || 0;
                 } else {
                     data = (d3 || []).map((item: any) => ({
                         id: item.id,
                         type: item.type,
                         title: item.title,
                         message: item.message,
                         createdAt: item.created_at
                     }));
                     count = c3 || 0;
                 }
            } else if (e2) {
                throw e2;
            } else {
                data = (d2 || []).map((item: any) => ({
                    id: item.id,
                    type: item.type,
                    title: item.title,
                    message: item.message,
                    createdAt: item.created_at
                }));
                count = c2 || 0;
            }
        } else if (e1) {
            throw e1;
        } else {
            data = d1 || [];
            count = c1 || 0;
        }
    }

    return res.status(200).json({ items: data, count });
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ error: err.message });
  }
}
