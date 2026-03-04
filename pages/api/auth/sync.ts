
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { session, referralCode } = req.body;
  if (!session?.user?.id) return res.status(401).json({ error: 'Invalid session' });

  const user = session.user;
  const userId = user.id;
  const email = user.email;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || email?.split('@')[0] || 'User';

  try {
    // 1. Sync User
    let { error: userError } = await supabaseServer
      .from('User')
      .upsert({
        id: userId,
        email: email,
        name: name,
        kycStatus: 'VERIFIED',
        updatedAt: new Date().toISOString(),
      }, { onConflict: 'id' });

    let useSnakeCase = false;

    if (userError && (userError.code === '42P01' || userError.message.includes('does not exist'))) {
        useSnakeCase = true;
        // Fallback to 'profiles' if 'User' doesn't exist
        const { error: profileError } = await supabaseServer
            .from('profiles')
            .upsert({
                user_id: userId,
                email: email,
                full_name: name,
                kyc_status: 'verified',
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        
        if (profileError) throw profileError;
    } else if (userError) {
        throw userError;
    }

    // 2. Ensure USD Wallet exists
    let walletId = null;
    if (!useSnakeCase) {
        const { data: wallet, error: walletError } = await supabaseServer
            .from('Wallet')
            .select('id')
            .eq('userId', userId)
            .eq('currency', 'USD')
            .maybeSingle();

        if (!wallet && !walletError) {
            const { data: newW } = await supabaseServer.from('Wallet').insert({
                userId: userId,
                currency: 'USD',
                balance: 0,
                updatedAt: new Date().toISOString()
            }).select('id').single();
            walletId = newW?.id;
        } else if (wallet) {
            walletId = wallet.id;
        }
    } 
    
    if (useSnakeCase || !walletId) {
         const { data: w2 } = await supabaseServer
            .from('wallets')
            .select('id')
            .eq('user_id', userId)
            .eq('currency', 'USD')
            .maybeSingle();
        
        if (!w2) {
             const { data: newW2 } = await supabaseServer.from('wallets').insert({
                user_id: userId,
                currency: 'USD',
                balance: 0,
                created_at: new Date().toISOString()
            }).select('id').single();
            walletId = newW2?.id;
        } else {
            walletId = w2.id;
        }
    }

    // 3. Handle Referral
    if (referralCode) {
        let referrerId: string | null = null;
        
        // Try to decode Base64
        try {
            // Restore standard Base64 characters
            const base64 = referralCode.replace(/-/g, '+').replace(/_/g, '/');
            const buffer = Buffer.from(base64, 'base64');
            referrerId = buffer.toString('utf-8');
            
            // Validate UUID format roughly (simple regex or length check)
            if (!referrerId || referrerId.length < 10) referrerId = null;
        } catch (e) {
            console.error('Invalid referral code format:', referralCode);
        }

        if (referrerId && referrerId !== userId) {
            // Check if referrer exists in 'profiles' or 'User'
            const { data: refUser } = useSnakeCase 
                ? await supabaseServer.from('profiles').select('user_id').eq('user_id', referrerId).maybeSingle()
                : await supabaseServer.from('User').select('id').eq('id', referrerId).maybeSingle();

            if (refUser) {
                 // Check if ALREADY referred
                const { data: profile } = await supabaseServer
                    .from('profiles')
                    .select('referrer_id')
                    .eq('user_id', userId)
                    .single();

                if (profile && !profile.referrer_id) {
                    // Update referrer_id
                    await supabaseServer
                        .from('profiles')
                        .update({ referrer_id: referrerId })
                        .eq('user_id', userId);

                    // Credit Referrer ("Little Token") - $5
                    const BONUS_AMOUNT = 5;
                    
                    if (useSnakeCase) {
                         const { data: refWallet } = await supabaseServer
                            .from('wallets')
                            .select('id, balance')
                            .eq('user_id', referrerId)
                            .eq('currency', 'USD')
                            .maybeSingle();
                        
                        if (refWallet) {
                            const newBalance = Number(refWallet.balance) + BONUS_AMOUNT;
                            await supabaseServer.from('wallets').update({ balance: newBalance }).eq('id', refWallet.id);
                            // Log Transaction
                            await supabaseServer.from('transactions').insert({
                                user_id: referrerId,
                                amount: BONUS_AMOUNT,
                                type: 'ADMIN_CREDIT', // or REFERRAL_BONUS
                                status: 'COMPLETED',
                                reference: `Referral Bonus for user ${email}`,
                                created_at: new Date().toISOString()
                            });
                        }
                    } else {
                        // Try PascalCase Wallet
                        const { data: refWallet } = await supabaseServer
                            .from('Wallet')
                            .select('id, balance')
                            .eq('userId', referrerId)
                            .eq('currency', 'USD')
                            .maybeSingle();
                        
                        if (refWallet) {
                            const newBalance = Number(refWallet.balance) + BONUS_AMOUNT;
                            await supabaseServer.from('Wallet').update({ balance: newBalance }).eq('id', refWallet.id);
                             // Log Transaction
                             await supabaseServer.from('Transaction').insert({
                                userId: referrerId,
                                amount: BONUS_AMOUNT,
                                type: 'ADMIN_CREDIT',
                                status: 'COMPLETED',
                                reference: `Referral Bonus for user ${email}`,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            });
                        }
                    }
                }
            }
        }
    }

    return res.status(200).json({ success: true });

  } catch (err: any) {
    console.error('Sync Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
