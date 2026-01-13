import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { redisEnabled } from '@/src/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  try {
    // Check DB connection by simple query
    const { error: dbError } = await supabaseServer.from('profiles').select('id').limit(1);
    const prismaReady = !dbError;
    
    // Check Wallets table
    const { error: walletError } = await supabaseServer.from('Wallet').select('id').limit(1);
    // Fallback check
    let walletsTableReady = !walletError;
    if (walletError && (walletError.message.includes('relation') || walletError.code === '42P01')) {
         const { error: w2 } = await supabaseServer.from('wallets').select('id').limit(1);
         walletsTableReady = !w2;
    }

    const status = {
        manualCreditsEnabled: true, // hardcoded for now or fetch from settings
        prismaReady,
        walletsTableReady,
        serviceRoleConfigured: true, // we are using it
        redisEnabled
    };

    return res.status(200).json({ status });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
