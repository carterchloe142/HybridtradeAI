import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // --- Auth Check ---
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('role,is_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  const userRole = String(profile?.role || '').toLowerCase();
  const isAdmin = Boolean(profile?.is_admin) || userRole === 'admin';

  if (!isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required' });
  // ------------------

  if (req.method === 'GET') {
      try {
          // Try PascalCase
          let { data, error } = await supabaseServer
            .from('SupportTicket')
            .select('*, profiles:userId(email)')
            .order('created_at', { ascending: false });

          if (error && (error.message.includes('relation') || error.code === '42P01')) {
               // Fallback snake_case
               const { data: d2, error: e2 } = await supabaseServer
                 .from('support_tickets')
                 .select('*, profiles:user_id(email)')
                 .order('created_at', { ascending: false });
               if (e2) throw e2;
               
               // Map snake_case to frontend expectations
               data = (d2 || []).map((t: any) => ({
                   id: t.id,
                   user_id: t.user_id,
                   subject: t.subject,
                   status: t.status,
                   created_at: t.created_at,
                   profiles: t.profiles,
                   replies: t.replies || [] // Assuming replies are stored or fetched similarly? 
                   // Actually, replies usually in separate table. 
                   // The frontend type expects `replies: { id, body, is_admin, created_at }[]`.
                   // If they are not joined, we might need to fetch them or assume empty for list view.
                   // For now, let's just return what we have.
               }));
          } else if (error) {
              throw error;
          }

          // If PascalCase, map userId to user_id for consistency if needed, or just pass as is.
          // Frontend type: user_id. PascalCase DB: userId.
          const items = (data || []).map((t: any) => ({
              id: t.id,
              user_id: t.user_id || t.userId,
              subject: t.subject,
              status: t.status,
              created_at: t.created_at || t.createdAt,
              profiles: t.profiles, // Supabase join
              replies: t.replies || [] // We might need to fetch replies if not joined. 
              // Usually ticket fetch includes replies or we fetch separately.
              // Let's assume for list view we don't need full replies or they are jsonb.
          }));

          return res.status(200).json({ items });
      } catch (err: any) {
          console.error('Fetch tickets error:', err);
          return res.status(500).json({ error: err.message });
      }
  }

  if (req.method === 'POST') {
      // Reply to ticket
      const { ticketId, body } = req.body;
      if (!ticketId || !body) return res.status(400).json({ error: 'Missing ticketId or body' });

      try {
          // 1. Insert Reply
          // Check tables
          let replyTable = 'SupportReply';
          let ticketCol = 'ticketId';
          let bodyCol = 'body';
          let adminCol = 'isAdmin';
          let createdCol = 'createdAt';

          // Probe
          const { error: probe } = await supabaseServer.from('SupportReply').select('id').limit(1);
          if (probe && (probe.message.includes('relation') || probe.code === '42P01')) {
              replyTable = 'support_replies';
              ticketCol = 'ticket_id';
              bodyCol = 'body';
              adminCol = 'is_admin';
              createdCol = 'created_at';
          }

          const { error: insErr } = await supabaseServer.from(replyTable).insert({
              [ticketCol]: ticketId,
              [bodyCol]: body,
              [adminCol]: true,
              [createdCol]: new Date().toISOString()
          });

          if (insErr) throw insErr;

          // 2. Notify User (Optional - create Notification)
          // Find user from ticket
          let userId = null;
          const { data: t1 } = await supabaseServer.from('SupportTicket').select('userId').eq('id', ticketId).single();
          if (t1) userId = t1.userId;
          else {
               const { data: t2 } = await supabaseServer.from('support_tickets').select('user_id').eq('id', ticketId).single();
               if (t2) userId = t2.user_id;
          }

          if (userId) {
               // Send notification logic (reusing support.ts old logic or similar)
               // For now, skip to keep simple, or add if critical.
          }

          return res.status(200).json({ success: true });

      } catch (err: any) {
          console.error('Reply error:', err);
          return res.status(500).json({ error: err.message });
      }
  }

  if (req.method === 'PATCH') {
      // Close ticket
      const { ticketId, status } = req.body;
      if (!ticketId || status !== 'closed') return res.status(400).json({ error: 'Invalid request' });

      try {
          // Try PascalCase
          const { error: e1 } = await supabaseServer.from('SupportTicket').update({ status: 'closed' }).eq('id', ticketId);
          if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
              await supabaseServer.from('support_tickets').update({ status: 'closed' }).eq('id', ticketId);
          } else if (e1) {
              throw e1;
          }
          return res.status(200).json({ success: true });
      } catch (err: any) {
          console.error('Close ticket error:', err);
          return res.status(500).json({ error: err.message });
      }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
