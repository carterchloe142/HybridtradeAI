import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { session } = req.body;
  if (!session?.user?.id) return res.status(401).json({ error: 'Invalid session' });

  const user = session.user;
  const userId = user.id;
  const email = user.email;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || email?.split('@')[0] || 'User';

  try {
    // 1. Sync User
    // We try 'User' (Prisma default) first.
    let { error: userError } = await supabaseServer
      .from('User')
      .upsert({
        id: userId,
        email: email,
        name: name,
        updatedAt: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (userError && (userError.code === '42P01' || userError.message.includes('does not exist'))) {
        // Fallback to 'profiles' if 'User' doesn't exist
        const { error: profileError } = await supabaseServer
            .from('profiles')
            .upsert({
                user_id: userId,
                email: email,
                full_name: name,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        
        if (profileError) throw profileError;
    } else if (userError) {
        throw userError;
    }

    // 2. Ensure USD Wallet exists
    // Try 'Wallet' (Prisma)
    const { data: wallet, error: walletError } = await supabaseServer
        .from('Wallet')
        .select('id')
        .eq('userId', userId)
        .eq('currency', 'USD')
        .maybeSingle();

    if (!wallet && !walletError) {
        await supabaseServer.from('Wallet').insert({
            userId: userId,
            currency: 'USD',
            balance: 0,
            updatedAt: new Date().toISOString()
        });
    } else if (walletError && (walletError.code === '42P01' || walletError.message.includes('does not exist'))) {
        // Fallback to 'wallets'
         const { data: w2 } = await supabaseServer
            .from('wallets')
            .select('id')
            .eq('user_id', userId)
            .eq('currency', 'USD')
            .maybeSingle();
        
        if (!w2) {
             await supabaseServer.from('wallets').insert({
                user_id: userId,
                currency: 'USD',
                balance: 0,
                created_at: new Date().toISOString()
            });
        }
    }

    return res.status(200).json({ success: true });

  } catch (err: any) {
    console.error('Sync Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
