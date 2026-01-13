import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Public endpoint, no auth check needed for reading public transparency data
  // But maybe we should cache it?

  try {
      // 1. Get Reserve Buffer
      let reserveBuffer = { currentAmount: 0, totalAUM: 0, updatedAt: null };
      const { data: rb, error: rbErr } = await supabaseServer.from('ReserveBuffer').select('*').order('updatedAt', { ascending: false }).limit(1).maybeSingle();
      
      if (rbErr && (rbErr.message.includes('relation') || rbErr.code === '42P01')) {
          // Fallback
          const { data: rb2 } = await supabaseServer.from('reserve_buffer').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle();
          if (rb2) {
              reserveBuffer = {
                  currentAmount: Number(rb2.current_amount || 0),
                  totalAUM: Number(rb2.total_aum || 0),
                  updatedAt: rb2.updated_at
              };
          }
      } else if (rb) {
          reserveBuffer = {
              currentAmount: Number(rb.currentAmount || 0),
              totalAUM: Number(rb.totalAUM || 0),
              updatedAt: rb.updatedAt
          };
      }

      // 2. Calculate AUM (Total User Balances + Active Investments)
      // This might be heavy, but for transparency page it's needed.
      // Ideally this should be cached or calculated by a background job and stored in 'ReserveBuffer' or similar.
      // For now, let's use the values from ReserveBuffer if they exist, assuming they are up to date.
      
      // If ReserveBuffer has totalAUM, use it. Otherwise calculate.
      let aumUSD = reserveBuffer.totalAUM;
      
      if (aumUSD === 0) {
          // Calculate from Wallets + Investments
          // Wallets
          let totalWalletUSD = 0;
          const { data: wallets, error: wErr } = await supabaseServer.from('Wallet').select('balance,currency');
          // Handling fallback for Wallet/wallets is tricky in a loop/map.
          // Let's assume Wallet or wallets table exists.
          
          if (wErr && (wErr.message.includes('relation') || wErr.code === '42P01')) {
               const { data: w2 } = await supabaseServer.from('wallets').select('balance,currency');
               if (w2) {
                   w2.forEach((w: any) => {
                       // Simplified: Assume 1:1 for USD, others need conversion. 
                       // For now just sum USD.
                       if (w.currency === 'USD') totalWalletUSD += Number(w.balance);
                   });
               }
          } else if (wallets) {
               wallets.forEach((w: any) => {
                   if (w.currency === 'USD') totalWalletUSD += Number(w.balance);
               });
          }

          // Investments
          let totalInvUSD = 0;
          const { data: invs, error: iErr } = await supabaseServer.from('Investment').select('amount').eq('status', 'ACTIVE');
          if (iErr && (iErr.message.includes('relation') || iErr.code === '42P01')) {
               const { data: i2 } = await supabaseServer.from('investments').select('amount').eq('status', 'ACTIVE');
               if (i2) {
                   i2.forEach((i: any) => totalInvUSD += Number(i.amount));
               }
          } else if (invs) {
               invs.forEach((i: any) => totalInvUSD += Number(i.amount));
          }

          aumUSD = totalWalletUSD + totalInvUSD;
      }

      const walletsUSDTotal = aumUSD; // Simplified for now
      
      const coveragePct = aumUSD > 0 ? (reserveBuffer.currentAmount / aumUSD) * 100 : 0;

      // Currency Breakdown - Mock or calculate
      const currencyBreakdown = [{ currency: 'USD', total: aumUSD }];
      const currencyBreakdownUSD = [{ currency: 'USD', total: aumUSD, usd: aumUSD }];

      const summary = {
          reserveBuffer,
          aumUSD,
          walletsUSDTotal,
          currencyBreakdown,
          currencyBreakdownUSD,
          coveragePct,
          generatedAt: new Date().toISOString()
      };

      return res.status(200).json(summary);

  } catch (err: any) {
      console.error('Error fetching transparency summary:', err);
      return res.status(500).json({ error: err.message });
  }
}
