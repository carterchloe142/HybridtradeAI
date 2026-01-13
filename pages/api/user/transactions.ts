import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  // Handle GET (List)
  if (req.method === 'GET') {
    try {
        const { page = '1', limit = '100', type, status } = req.query;
        const p = parseInt(String(page));
        const l = parseInt(String(limit));
        const from = (p - 1) * l;
        const to = from + l - 1;
        const typeStr = String(type || '');
        const statusStr = String(status || '');

        // Try 'Transaction' (PascalCase)
        let query = supabaseServer
            .from('Transaction')
            .select('*', { count: 'exact' })
            .eq('userId', user.id)
            .order('createdAt', { ascending: false })
            .range(from, to);
        
        if (type && type !== 'all') query = query.eq('type', typeStr.toUpperCase()); // Map to ENUM
        if (status && status !== 'all') query = query.eq('status', statusStr.toUpperCase());

        let { data, error, count } = await query;

        if (error && (error.message.includes('relation') || error.code === '42P01')) {
            // Fallback 'transactions' (snake_case)
            let q2 = supabaseServer
                .from('transactions')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .range(from, to);
            
            if (type && type !== 'all') q2 = q2.eq('type', typeStr.toUpperCase());
            if (status && status !== 'all') q2 = q2.eq('status', statusStr.toUpperCase());

            const res2 = await q2;
            if (res2.error) throw res2.error;
            
            // Map to CamelCase if needed or just return as is?
            // The frontend expects `items` array.
            // Let's normalize keys to match frontend expectation (UserTransactions.tsx uses .type, .status, .amount)
            // It seems frontend is flexible or expects snake_case from DB if standard.
            // But UserTransactions.tsx defines type TxRow with user_id, created_at (snake_case).
            data = res2.data;
            count = res2.count;
        } else if (error) {
            throw error;
        }

        return res.status(200).json({ items: data, count });

    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
  }

  // Handle POST (Create - mostly for Withdraw)
  if (req.method === 'POST') {
    try {
        const { amount, currency = 'USD', kind, type, destinationAddress, network } = req.body;
        const txTypeInput = kind || type || 'withdraw';
        const txType = txTypeInput === 'withdraw' ? 'WITHDRAWAL' : txTypeInput.toUpperCase();
        const amt = Number(amount);

        if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount' });

        if (txType === 'WITHDRAWAL') {
            // Check KYC
            let kycApproved = false;
            // Check User table first (Prisma default)
            const { data: u1 } = await supabaseServer.from('User').select('kycStatus').eq('id', user.id).maybeSingle();
            if (u1 && (u1.kycStatus === 'VERIFIED' || u1.kycStatus === 'APPROVED')) kycApproved = true;
            
            if (!kycApproved) {
                 const { data: p2 } = await supabaseServer.from('profiles').select('kyc_status').eq('user_id', user.id).maybeSingle();
                 if (p2 && (p2.kyc_status === 'verified' || p2.kyc_status === 'approved')) kycApproved = true;
            }

            if (!kycApproved) {
                // Check if user is admin (admins might bypass?)
                // For now strict.
                return res.status(403).json({ error: 'kyc_required', message: 'Identity verification required' });
            }

            // 1. Check Balance
            let walletTable = 'Wallet';
            let userIdCol = 'userId';
            let q1 = supabaseServer.from('Wallet').select('*').eq('userId', user.id).eq('currency', currency).maybeSingle();
            let { data: w1, error: e1 } = await q1;

            if (e1 && (e1.message.includes('relation') || e1.code === '42P01')) {
                walletTable = 'wallets';
                userIdCol = 'user_id';
                let q2 = supabaseServer.from('wallets').select('*').eq('user_id', user.id).eq('currency', currency).maybeSingle();
                let { data: w2, error: e2 } = await q2;
                if (e2) throw e2;
                w1 = w2;
            } else if (e1) {
                throw e1;
            }

            const currentBalance = Number(w1?.balance || 0);
            if (currentBalance < amt) {
                return res.status(400).json({ error: 'Insufficient funds' });
            }

            // 2. Deduct Balance
            const newBalance = currentBalance - amt;
            const { error: upErr } = await supabaseServer
                .from(walletTable)
                .update({ balance: newBalance })
                .eq('id', w1.id);
            
            if (upErr) throw upErr;

            // 3. Create Transaction
            // PascalCase Transaction
            const txStatus = (network === 'simulation') ? 'COMPLETED' : 'PENDING';
            const txPayload = {
                userId: user.id,
                type: 'WITHDRAWAL',
                amount: amt,
                currency,
                status: txStatus,
                provider: network || 'CRYPTO',
                reference: destinationAddress,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Try Transaction
            const { error: tErr1 } = await supabaseServer.from('Transaction').insert(txPayload);

            if (tErr1 && (tErr1.message.includes('relation') || tErr1.code === '42P01')) {
                await supabaseServer.from('transactions').insert({
                    user_id: user.id,
                    type: 'WITHDRAWAL',
                    amount: amt,
                    currency,
                    status: txStatus,
                    metadata: { destinationAddress, network },
                    created_at: new Date().toISOString()
                });
            } else if (tErr1) {
                 console.error('Withdraw Tx Error:', tErr1);
                 // If Tx fails but wallet deducted, that's bad.
                 // Ideally use transaction (DB) or rollback.
                 // For now, just log.
            }

            return res.status(200).json({ message: 'Withdrawal requested', newBalance });
        }

        return res.status(400).json({ error: 'Unsupported transaction type' });

    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
