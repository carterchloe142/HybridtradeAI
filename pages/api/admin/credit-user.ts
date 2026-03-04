import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { v4 as uuidv4 } from 'uuid';

export function isUuidLike(input: string): boolean {
  const trimmed = (input || '').trim()
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(trimmed)
}

export function isEmailLike(input: string): boolean {
  const trimmed = (input || '').trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmed)
}

export async function resolveSupabaseUserId({ userId, email }: { userId?: string; email?: string }): Promise<string> {
  if (userId && isUuidLike(userId)) {
    return userId.trim()
  }
  if (email && isEmailLike(email)) {
    if (!supabaseServer) throw new Error('Supabase not configured');
    
    // Try PascalCase
    const { data, error } = await supabaseServer
      .from('User')
      .select('id')
      .eq('email', email.trim())
      .maybeSingle()
      
    if (!error && data?.id) return data.id

    // Try snake_case
    const { data: data2, error: error2 } = await supabaseServer
        .from('users')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle()

    if (!error2 && data2?.id) return data2.id
  }
  throw new Error('Unable to resolve user ID from userId or email')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API Server connecting to:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (req.method !== 'POST' && req.method !== 'GET') {
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

  if (req.method === 'GET') {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 25;
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      // Try PascalCase 'AdminAction'
      let { data: actions, count, error } = await supabaseServer
          .from('AdminAction')
          .select('*', { count: 'exact' })
          .order('createdAt', { ascending: false })
          .range(start, end);
          
      if (error && error.code === '42P01') {
          // Fallback to snake_case 'admin_actions'
          const { data: actions2, count: count2, error: error2 } = await supabaseServer
              .from('admin_actions')
              .select('*', { count: 'exact' })
              .order('created_at', { ascending: false })
              .range(start, end);
          
          if (!error2) {
              actions = (actions2 || []).map((a: any) => ({
                  id: a.id,
                  adminId: a.admin_id,
                  userId: a.user_id,
                  amount: a.amount,
                  action: a.action,
                  note: a.note,
                  status: a.status,
                  createdAt: a.created_at
              }));
              count = count2;
              error = null;
          } else {
              // If both fail, return empty list instead of error to avoid breaking UI
              // console.error('Failed to fetch admin_actions:', error2);
              return res.status(200).json({ actions: [], total: 0, page, limit });
          }
      } else if (error) {
           console.error('Failed to fetch AdminAction:', error);
           return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ actions, total: count, page, limit });
  }

  try {
    const { userId, email, amount, currency, description } = req.body;
    const resolvedUserId = await resolveSupabaseUserId({ userId, email });

    if (!supabaseServer) {
        return res.status(500).json({ error: 'Supabase not configured' });
    }

    // Check if wallet exists
    let walletId = '';
    let currentBalance = 0;

    let { data: wallet } = await supabaseServer.from('Wallet').select('id, balance').eq('userId', resolvedUserId).maybeSingle();
    
    if (!wallet) {
         const { data: w2 } = await supabaseServer.from('wallets').select('id, balance').eq('user_id', resolvedUserId).maybeSingle();
         if (w2) {
             wallet = { id: w2.id, balance: w2.balance };
         }
    }

    if (wallet) {
        walletId = wallet.id;
        currentBalance = Number(wallet.balance);
    } else {
        // Create wallet if it doesn't exist (optional, but good for manual credit)
        const { data: newWallet, error: createErr } = await supabaseServer.from('Wallet').insert({ userId: resolvedUserId, currency: currency || 'USD', balance: 0 }).select().single();
        if (createErr || !newWallet) {
             // Try snake_case
             const { data: nw2 } = await supabaseServer.from('wallets').insert({ user_id: resolvedUserId, currency: currency || 'USD', balance: 0 }).select().single();
             if (nw2) {
                 walletId = nw2.id;
                 currentBalance = 0;
             } else {
                 return res.status(400).json({ error: 'User wallet not found and could not be created' });
             }
        } else {
            walletId = newWallet.id;
            currentBalance = 0;
        }
    }

    // Update balance
    const newBalance = currentBalance + Number(amount);
    
    // Try update PascalCase
    const { data: uData, error: uErr } = await supabaseServer.from('Wallet').update({ balance: newBalance }).eq('id', walletId).select();
    
    if (uErr || !uData || uData.length === 0) {
        // Try snake_case
        await supabaseServer.from('wallets').update({ balance: newBalance }).eq('id', walletId);
    }

    // Log Transaction
    const txData = {
        id: uuidv4(),
        userId: resolvedUserId,
        type: 'DEPOSIT', // Treat as real DEPOSIT so it counts for investment
        amount: Number(amount),
        currency: currency || 'USD',
        provider: 'manual_admin',
        status: 'COMPLETED',
        // description: description || 'Manual admin credit', // Removed as column might not exist
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const { error: txErr } = await supabaseServer.from('Transaction').insert(txData);
    if (txErr) {
        console.error('Transaction insert failed:', txErr);
        // Fallback removed as 'transactions' table does not exist
    } else {
        console.log(`Transaction inserted successfully: ${txData.id} for user ${txData.userId}`);
    }

    // Log AdminAction
    const adminAction = {
         id: uuidv4(),
         adminId: user.id,
         userId: resolvedUserId,
         amount: Number(amount),
         action: 'MANUAL_CREDIT',
         note: description || null,
         status: 'COMPLETED',
         createdAt: new Date().toISOString()
    };
    const { error: aaErr } = await supabaseServer.from('AdminAction').insert(adminAction);
    if (aaErr) {
        if (aaErr.code === '42P01') {
             // Fallback to snake_case 'admin_actions'
             const aaSnake = {
                 id: adminAction.id,
                 admin_id: adminAction.adminId,
                 user_id: adminAction.userId,
                 amount: adminAction.amount,
                 action: adminAction.action,
                 note: adminAction.note,
                 status: adminAction.status,
                 created_at: adminAction.createdAt
             };
             const { error: aaErr2 } = await supabaseServer.from('admin_actions').insert(aaSnake);
             if (aaErr2) console.error('admin_actions insert failed:', aaErr2);
             else console.log(`admin_actions inserted successfully: ${adminAction.id}`);
        } else {
             console.error('AdminAction insert failed:', aaErr);
        }
    } else {
        console.log(`AdminAction inserted successfully: ${adminAction.id}`);
    }

    return res.status(200).json({ success: true, newBalance, message: 'Credit applied successfully' });
  } catch (error: any) {
    console.error('Credit error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
