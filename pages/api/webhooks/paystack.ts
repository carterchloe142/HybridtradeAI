import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return res.status(500).send('Paystack secret not configured');

  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.body;
  if (event.event === 'charge.success') {
      const { reference, amount, currency, metadata } = event.data;
      // amount is in kobo/cents
      const realAmount = amount / 100;
      
      if (!supabaseServer) return res.status(500).send('Supabase not configured');

      try {
          // 1. Find Transaction
          let tx = null;
          let table = 'Transaction';
          let userIdCol = 'userId';

          let { data: t1, error: e1 } = await supabaseServer.from('Transaction').select('*').eq('id', reference).single();
          
          if (e1) {
               console.error('Tx error:', e1);
               // If transaction not found, we can't process
               return res.status(200).send('Tx not found or error');
          }
          tx = t1;

          if (tx.status === 'COMPLETED' || tx.status === 'completed') {
              return res.status(200).send('Already processed');
          }

          // 2. Update Transaction
          await supabaseServer.from('Transaction').update({ 
              status: 'COMPLETED',
              provider: 'PAYSTACK',
              updatedAt: new Date().toISOString()
          }).eq('id', tx.id);

          // 3. Credit Wallet
          // Find or create wallet
          const userId = tx.userId;
          const txCurrency = tx.currency || currency; // Use tx currency as source of truth?

          let walletTable = 'Wallet';
          let { data: w1, error: we1 } = await supabaseServer.from('Wallet').select('*').eq('userId', userId).eq('currency', txCurrency).maybeSingle();
          
          if (we1) {
               console.error('Wallet fetch error:', we1);
               // Try snake_case 'wallets' if Wallet fails?
               // But check-tables says Wallet exists.
               // Let's assume Wallet exists.
          }

          if (w1) {
              const newBal = Number(w1.balance || 0) + realAmount;
              const { error: wUpdateErr } = await supabaseServer.from('Wallet').update({ balance: newBal }).eq('id', w1.id);
              if (wUpdateErr) console.error('Wallet update error:', wUpdateErr);
          } else {
              // Create wallet
              const walletPayload = {
                  id: uuidv4(),
                  userId: userId,
                  currency: txCurrency,
                  balance: realAmount,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
              };

              const { error: wInsertErr } = await supabaseServer.from('Wallet').insert(walletPayload);
              if (wInsertErr) console.error('Wallet insert error:', wInsertErr);
          }

          // 4. Auto-Activate Plan if requested?
          // metadata.autoActivate
          // This would require creating an Investment.
          // Let's keep it simple for now: just credit wallet. 
          // If auto-activate logic is needed, it should be added here.

      } catch (e) {
          console.error('Webhook error:', e);
          return res.status(500).send('Internal Error');
      }
  }

  res.status(200).send('OK');
}
