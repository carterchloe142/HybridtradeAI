import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

type ReplyRow = { id: string; ticket_id: string; body: string; is_admin: boolean; created_at: string };
type TicketRow = { id: string; user_id: string; subject: string; status: string; created_at: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: auth, error: userErr } = await supabaseServer.auth.getUser(token);
  const user = auth?.user;
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  if (req.method === 'GET') {
    try {
      const { data: tickets, error } = await supabaseServer
        .from('support_tickets')
        .select('id,user_id,subject,status,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ticketIds = (tickets as TicketRow[] | null)?.map((t) => t.id) || [];
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

      const items = (tickets || []).map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        subject: t.subject,
        status: t.status,
        created_at: t.created_at,
        replies: repliesMap.get(String(t.id)) || [],
      }));

      return res.status(200).json({ items });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    const { subject, message, ticketId, body } = req.body || {};

    if (ticketId && body) {
      try {
        const { data: t, error: tErr } = await supabaseServer
          .from('support_tickets')
          .select('id,user_id')
          .eq('id', String(ticketId))
          .maybeSingle();

        if (tErr) throw tErr;
        if (!t) return res.status(404).json({ error: 'Ticket not found' });
        if (String((t as any).user_id) !== user.id) return res.status(403).json({ error: 'Forbidden' });

        const { error: insErr } = await supabaseServer.from('replies').insert({
          ticket_id: String(ticketId),
          body: String(body),
          is_admin: false,
        });

        if (insErr) throw insErr;
        return res.status(200).json({ success: true });
      } catch (e: any) {
        return res.status(500).json({ error: e.message });
      }
    }

    if (!subject || !message) return res.status(400).json({ error: 'Subject and message required' });

    try {
      const { data: newTicket, error: tErr } = await supabaseServer
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: String(subject),
          status: 'open',
        })
        .select('id')
        .single();

      if (tErr) throw tErr;

      const { error: rErr } = await supabaseServer.from('replies').insert({
        ticket_id: newTicket.id,
        body: String(message),
        is_admin: false,
      });

      if (rErr) throw rErr;

      return res.status(200).json({ message: 'Ticket created', id: newTicket.id });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
