import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    const { error: uErr } = await supabaseServer.from('Wallet').update({ balance: newBalance }).eq('id', walletId);
    if (uErr) {
        // Try snake_case
        await supabaseServer.from('wallets').update({ balance: newBalance }).eq('id', walletId);
    }

    // Log Transaction
    const txData = {
        userId: resolvedUserId,
        type: 'CREDIT',
        amount: Number(amount),
        currency: currency || 'USD',
        provider: 'manual_admin',
        status: 'COMPLETED',
        description: description || 'Manual admin credit',
        createdAt: new Date().toISOString()
    };

    const { error: txErr } = await supabaseServer.from('Transaction').insert(txData);
    if (txErr) {
        await supabaseServer.from('transactions').insert({
            ...txData,
            user_id: txData.userId,
            created_at: txData.createdAt
        });
    }

    return res.status(200).json({ success: true, newBalance, message: 'Credit applied successfully' });
  } catch (error: any) {
    console.error('Credit error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
