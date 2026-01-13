import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  if (req.method === 'GET') {
      try {
        // Try 'Ticket' with 'TicketReply'
        let { data: d1, error: e1 } = await supabaseServer
            .from('Ticket')
            .select('*, replies:TicketReply(*)')
            .eq('userId', user.id)
            .order('createdAt', { ascending: false });

        if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
            // Fallback 'tickets' with 'ticket_replies'
            const { data: d2, error: e2 } = await supabaseServer
                .from('tickets')
                .select('*, replies:ticket_replies(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (e2) throw e2;
            return res.status(200).json({ items: d2 || [] });
        } else if (e1) {
            throw e1;
        }

        return res.status(200).json({ items: d1 || [] });

      } catch (e: any) {
          return res.status(500).json({ error: e.message });
      }
  }

  if (req.method === 'POST') {
      const { subject, message } = req.body;
      if (!subject || !message) return res.status(400).json({ error: 'Subject and message required' });

      try {
          // Create Ticket
          const payload = {
              userId: user.id,
              subject,
              status: 'open',
              createdAt: new Date().toISOString()
              // Message? Usually the first message is a reply or part of ticket?
              // Frontend sends { subject, message }.
              // If ticket has 'description' or 'message' field.
          };

          // Let's assume Ticket has 'message' or we create a first reply.
          // Check schema assumption: Ticket(id, subject, status, userId). Reply(ticketId, body, userId).
          // But usually simple tickets have a body.
          // Let's try adding 'message' to payload.
          
          let ticketId;

          // Try Ticket
          const { data: t1, error: e1 } = await supabaseServer.from('Ticket').insert({ ...payload, message }).select().single();
          
          if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
              // Fallback tickets
               const { data: t2, error: e2 } = await supabaseServer.from('tickets').insert({
                   user_id: user.id,
                   subject,
                   message,
                   status: 'open',
                   created_at: new Date().toISOString()
               }).select().single();
               
               if (e2) throw e2;
               ticketId = t2.id;
          } else if (e1) {
              throw e1;
          } else {
              ticketId = t1.id;
          }

          return res.status(200).json({ message: 'Ticket created', id: ticketId });

      } catch (e: any) {
          return res.status(500).json({ error: e.message });
      }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
