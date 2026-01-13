import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return high-level platform stats
  // Can be cached or real-time
  
  try {
    // Check if we have a 'stats' table or similar
    // Or just aggregate on the fly (careful with performance)
    
    // For now, return mock/placeholder or simple counts
    const { count: userCount } = await supabaseServer.from('profiles').select('*', { count: 'exact', head: true });
    
    // Fallback if profiles not found, try users
    const finalUserCount = userCount || 0;

    return res.status(200).json({
      totalUsers: finalUserCount,
      totalAUM: 5000000, // Placeholder or fetch from ReserveBuffer
      totalPaid: 1200000,
      activeStrategies: 12
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
