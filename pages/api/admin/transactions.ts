import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // --- Auth Check (Admin) ---
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
  // --------------------------

  if (req.method === 'GET') {
      const { type, page = '1', limit = '100' } = req.query;
      
      const p = parseInt(String(page));
      const l = parseInt(String(limit));
      const from = (p - 1) * l;
      const to = from + l - 1;

      let query = supabaseServer
          .from('Transaction')
          .select('id,userId,type,amount,currency,status,createdAt,provider,reference, user:User(email)', { count: 'exact' })
          .order('createdAt', { ascending: false })
          .range(from, to);

      if (type) {
          // Handle mixed case input
          const types = String(type).split(',').map(t => t.trim());
          if (types.length === 1) {
             query = query.ilike('type', types[0]); // Case-insensitive match if possible, or use OR logic
             // Note: supabase .eq is case sensitive usually. .ilike works for text. 
             // But type is ENUM in prisma. Supabase sees it as text?
             // Safest is to use 'in' with uppercase variants if known, or just pass as is if matched.
             // The frontend passes 'withdrawal' (lowercase). DB likely uses 'WITHDRAWAL' (uppercase).
             // Let's try both.
             query = query.in('type', [types[0].toUpperCase(), types[0].toLowerCase(), types[0]]);
          } else {
             query = query.in('type', types);
          }
      }

      const { data, error, count } = await query;
      
      if (error) {
          console.error('Fetch transactions error:', error);
          return res.status(500).json({ error: error.message });
      }

      // Map response to handle potential null user (deleted users) and format fields
      const items = (data || []).map((t: any) => ({
          id: t.id,
          userId: t.userId || t.user_id,
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          status: t.status,
          createdAt: t.createdAt || t.created_at,
          provider: t.provider,
          reference: t.reference,
          user: t.user,
          meta: t.reference && (t.reference.startsWith('{') || t.reference.startsWith('[')) 
                ? JSON.parse(t.reference) 
                : { reference: t.reference }
      }));

      return res.status(200).json({ items, total: count });
  }

  if (req.method === 'PATCH') {
      const { id, status } = req.body;
      if (!id || !status) return res.status(400).json({ error: 'Missing id or status' });

      try {
          // Get transaction
          // Try PascalCase
          let { data: tx, error: txErr } = await supabaseServer
              .from('Transaction')
              .select('*')
              .eq('id', id)
              .single();
          
          if (txErr && (txErr.message.includes('relation') || txErr.code === '42P01')) {
              // Fallback snake_case
              const { data: tx2, error: txErr2 } = await supabaseServer
                  .from('transactions')
                  .select('*')
                  .eq('id', id)
                  .single();
              
              if (txErr2 || !tx2) return res.status(404).json({ error: 'Transaction not found' });
              
              // Normalize to camelCase for internal logic
              tx = {
                  ...tx2,
                  userId: tx2.user_id,
                  createdAt: tx2.created_at
              };
          } else if (txErr || !tx) {
              return res.status(404).json({ error: 'Transaction not found' });
          }

          // Map frontend status to DB Enum
          let dbStatus = status.toUpperCase();
          if (status === 'confirmed') dbStatus = 'COMPLETED';
          if (status === 'cancelled' || status === 'rejected') dbStatus = 'CANCELLED';

          if (tx.status === dbStatus) {
              return res.status(200).json({ message: 'Status already set' });
          }

          // If confirming a deposit, credit the wallet
          if (dbStatus === 'COMPLETED' && tx.type === 'DEPOSIT' && tx.status !== 'COMPLETED') {
              // Find wallet
              let { data: wallet } = await supabaseServer.from('Wallet').select('id, balance').eq('userId', tx.userId).maybeSingle();
              
              if (!wallet) {
                   const { data: w2 } = await supabaseServer.from('wallets').select('id, balance').eq('user_id', tx.userId).maybeSingle();
                   if (w2) {
                       wallet = { id: w2.id, balance: w2.balance };
                   }
              }

              if (!wallet) {
                  // Try creating one if missing
                   const { data: newWallet, error: cwErr } = await supabaseServer.from('Wallet').insert({ userId: tx.userId, currency: tx.currency || 'USD', balance: 0 }).select().single();
                   if (!newWallet && (cwErr?.message.includes('relation') || cwErr?.code === '42P01')) {
                       const { data: nw2 } = await supabaseServer.from('wallets').insert({ user_id: tx.userId, currency: tx.currency || 'USD', balance: 0 }).select().single();
                       if (nw2) wallet = { id: nw2.id, balance: nw2.balance };
                   } else if (newWallet) {
                       wallet = newWallet;
                   }
              }

              if (wallet) {
                   const newBalance = Number(wallet.balance) + Number(tx.amount);
                   // Try PascalCase update
                   const { error: uErr } = await supabaseServer.from('Wallet').update({ balance: newBalance }).eq('id', wallet.id);
                   if (uErr && (uErr.message.includes('relation') || uErr.code === '42P01')) {
                       await supabaseServer.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
                   }
              }
          }
          
          // If cancelling a withdrawal, refund the wallet
          if (dbStatus === 'CANCELLED' && tx.type === 'WITHDRAWAL' && tx.status !== 'CANCELLED') {
              let { data: wallet } = await supabaseServer.from('Wallet').select('id, balance').eq('userId', tx.userId).maybeSingle();
              
              if (!wallet) {
                   const { data: w2 } = await supabaseServer.from('wallets').select('id, balance').eq('user_id', tx.userId).maybeSingle();
                   if (w2) wallet = { id: w2.id, balance: w2.balance };
              }
              
              if (wallet) {
                   const newBalance = Number(wallet.balance) + Number(tx.amount);
                   const { error: uErr } = await supabaseServer.from('Wallet').update({ balance: newBalance }).eq('id', wallet.id);
                   if (uErr && (uErr.message.includes('relation') || uErr.code === '42P01')) {
                       await supabaseServer.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
                   }
              }
          }

          // Update transaction status
          // Try PascalCase
          const { error: updateErr } = await supabaseServer
              .from('Transaction')
              .update({ status: dbStatus })
              .eq('id', id);

          if (updateErr && (updateErr.message.includes('relation') || updateErr.code === '42P01')) {
               // Fallback snake_case
               const { error: updateErr2 } = await supabaseServer
                  .from('transactions')
                  .update({ status: dbStatus })
                  .eq('id', id);
               
               if (updateErr2) throw updateErr2;
          } else if (updateErr) {
              throw updateErr;
          }

          return res.status(200).json({ success: true });

      } catch (error: any) {
          console.error('Transaction update error:', error);
          return res.status(500).json({ error: error.message });
      }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
