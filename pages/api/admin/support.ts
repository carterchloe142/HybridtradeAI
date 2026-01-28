import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { sendEmail, TEMPLATES } from '@/src/lib/email';

type ReplyRow = { id: string; ticket_id: string; body: string; is_admin: boolean; created_at: string };
type TicketRow = { id: string; user_id: string; subject: string; status: string; created_at: string };

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
      const { data: rawTickets, error: tErr } = await supabaseServer
        .from('support_tickets')
        .select('id,user_id,subject,status,created_at')
        .order('created_at', { ascending: false });

      if (tErr) throw tErr;

      const ticketIds = (rawTickets as TicketRow[] | null)?.map((t) => t.id) || [];
      const userIds = Array.from(new Set((rawTickets || []).map((t: any) => String(t.user_id)).filter(Boolean)));

      const { data: replies } = ticketIds.length
        ? await supabaseServer
            .from('replies')
            .select('id,ticket_id,body,is_admin,created_at')
            .in('ticket_id', ticketIds)
            .order('created_at', { ascending: true })
        : { data: [] as ReplyRow[] };

      const repliesMap = new Map<string, ReplyRow[]>();
      (replies || []).forEach((r: any) => {
        const tid = String(r.ticket_id);
        const arr = repliesMap.get(tid) || [];
        arr.push(r as ReplyRow);
        repliesMap.set(tid, arr);
      });

      const { data: profiles } = userIds.length
        ? await supabaseServer.from('profiles').select('user_id,email').in('user_id', userIds as any)
        : { data: [] as any[] };

      const emailByUser = new Map<string, string>();
      (profiles || []).forEach((p: any) => emailByUser.set(String(p.user_id), String(p.email || '')));

      if (userIds.length) {
        const { data: users } = await supabaseServer.from('User').select('id,email').in('id', userIds);
        (users || []).forEach((u: any) => {
          const id = String(u.id);
          if (!emailByUser.get(id)) emailByUser.set(id, String(u.email || ''));
        });
      }

      const items = (rawTickets || []).map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        subject: t.subject,
        status: t.status,
        created_at: t.created_at,
        profiles: { email: emailByUser.get(String(t.user_id)) || 'Unknown' },
        replies: repliesMap.get(String(t.id)) || [],
      }));

      return res.status(200).json({ items });
    } catch (err: any) {
      console.error('Fetch tickets error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
      // Create new ticket (Admin to User) OR Reply to ticket
      const { ticketId, userId, subject, body } = req.body;
      
      if (ticketId) {
          // Reply logic (existing)
          if (!body) return res.status(400).json({ error: 'Missing body for reply' });
          
          try {
            const { error: insErr } = await supabaseServer.from('replies').insert({
              ticket_id: String(ticketId),
              body: String(body),
              is_admin: true,
            });

            if (insErr) throw insErr;

            // --- Send Email Notification ---
            // Fetch User ID from ticket to send email
            const { data: ticketData } = await supabaseServer
              .from('support_tickets')
              .select('user_id')
              .eq('id', String(ticketId))
              .maybeSingle();
            const tUserId = ticketData?.user_id;
            
            if (tUserId) {
                 const { data: u } = await supabaseServer.auth.admin.getUserById(tUserId);
                 if (u?.user?.email) {
                     await sendEmail(u.user.email, {
                         subject: 'New Reply to your Support Request',
                         html: `<div style="font-family: sans-serif;">
                                  <h2>Support Update</h2>
                                  <p>An admin has replied to your ticket.</p>
                                  <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                     ${body}
                                  </div>
                                  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/support">View Ticket</a></p>
                                </div>`
                     });
                 }
            }
            // -------------------------------

            return res.status(200).json({ success: true });
          } catch (err: any) {
              return res.status(500).json({ error: err.message });
          }
      } else if (userId && subject && body) {
          // Create NEW Ticket (Admin initiating message)
          try {
              const { data: newTicket, error: tErr } = await supabaseServer
                .from('support_tickets')
                .insert({ user_id: String(userId), subject: String(subject), status: 'open' })
                .select('id')
                .single();

              if (tErr) throw tErr;
              
              const { error: rErr } = await supabaseServer.from('replies').insert({
                ticket_id: newTicket.id,
                body: String(body),
                is_admin: true,
              });

              if (rErr) throw rErr;

              // --- Send Email Notification ---
              const { data: u } = await supabaseServer.auth.admin.getUserById(userId);
              if (u?.user?.email) {
                   await sendEmail(u.user.email, {
                       subject: `Support: ${subject}`,
                       html: `<div style="font-family: sans-serif;">
                                <h2>New Message from Support</h2>
                                <p><strong>Subject:</strong> ${subject}</p>
                                <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                   ${body}
                                </div>
                                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/support">View Message</a></p>
                              </div>`
                   });
              }
              // -------------------------------

              return res.status(200).json({ success: true, ticketId: newTicket.id });

          } catch (err: any) {
              console.error('Create ticket error:', err);
              return res.status(500).json({ error: err.message });
          }
      } else {
          return res.status(400).json({ error: 'Missing ticketId OR (userId, subject, body)' });
      }
  }

  if (req.method === 'PATCH') {
      // Close ticket
      const { ticketId, status } = req.body;
      if (!ticketId || status !== 'closed') return res.status(400).json({ error: 'Invalid request' });

      try {
          const { error: e1 } = await supabaseServer
            .from('support_tickets')
            .update({ status: 'closed' })
            .eq('id', String(ticketId));
          if (e1) throw e1;
          return res.status(200).json({ success: true });
      } catch (err: any) {
          console.error('Close ticket error:', err);
          return res.status(500).json({ error: err.message });
      }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
