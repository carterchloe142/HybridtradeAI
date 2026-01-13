import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Fetch Reserve Buffer
    let { data: buffer, error } = await supabaseServer
      .from('ReserveBuffer')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // Fallback table name
    if (error && (error.message.includes('relation') || error.code === '42P01')) {
      const { data: buffer2 } = await supabaseServer
        .from('reserve_buffers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      buffer = buffer2;
    }

    // 2. Fetch AUM (Total Active Investments)
    // We can aggregate this or use a cached stat.
    // For simplicity, let's query active investments.
    let totalInvested = 0;
    
    // Using a simpler approach: get from stats if available, or just a mock/calculated value
    // Real calculation:
    /*
    const { data: investments } = await supabaseServer
      .from('Investment')
      .select('amount_usd')
      .eq('status', 'active');
    totalInvested = investments?.reduce((sum, i) => sum + (i.amount_usd || 0), 0) || 0;
    */
    // For performance, let's rely on what's in ReserveBuffer if it stores AUM, or return 0
    
    const aumUSD = Number(buffer?.total_aum_usd || 0);
    const walletsUSDTotal = Number(buffer?.total_wallets_usd || 0);
    const reserveAmount = Number(buffer?.current_amount || 0);

    const coveragePct = (aumUSD + walletsUSDTotal) > 0 
      ? (reserveAmount / (aumUSD + walletsUSDTotal)) * 100 
      : 0;

    const breakdown = buffer?.breakdown || []; // Assuming JSON column

    return res.status(200).json({
      reserveBuffer: buffer,
      aumUSD,
      walletsUSDTotal,
      coveragePct,
      currencyBreakdown: breakdown,
      currencyBreakdownUSD: [], // simplified
      userMessage: buffer?.notes || '',
      hideMerkleSection: false
    });

  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
