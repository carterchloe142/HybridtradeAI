
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail, TEMPLATES } from '@/src/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Auth Check
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

  // 1.1 KYC Check (Enforced)
  let kycStatus = 'PENDING'; // Default
  
  // Check 'User' table
  const { data: profile } = await supabaseServer.from('User').select('kycStatus').eq('id', user.id).maybeSingle();
  
  if (profile) {
      kycStatus = profile.kycStatus || 'PENDING';
  } else {
      // Check 'profiles' table fallback
      const { data: p2 } = await supabaseServer.from('profiles').select('kyc_status').eq('id', user.id).maybeSingle();
      if (p2) {
          kycStatus = p2.kyc_status || 'PENDING';
      }
  }
  
  // Normalize status
  const normalizedStatus = String(kycStatus).toUpperCase();
  
  if (normalizedStatus !== 'VERIFIED' && normalizedStatus !== 'APPROVED') {
      return res.status(403).json({ 
          error: 'KYC Verification Required', 
          code: 'KYC_REQUIRED',
          currentStatus: kycStatus
      });
  }

  // 2. Parse Body
  const { amount, currency = 'USD', provider, planId, autoActivate, cryptoCurrency } = req.body;
  const amt = Number(amount);

  if (!amt || amt <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const publicBaseUrlRaw =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';
    const publicBaseUrl = publicBaseUrlRaw.replace(/\/$/, '');

    // 3. Create Transaction Record (Pending)
    // Try PascalCase first, then snake_case
    let txData = null;
    let txError = null;
    
    const insertPayload = {
        id: uuidv4(),
        userId: user.id,
        type: 'DEPOSIT',
        amount: amt,
        currency,
        status: 'PENDING',
        provider,
        // metadata: { planId, autoActivate, cryptoCurrency }, // Removed due to missing column
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Try 'Transaction'
    const { data: d1, error: e1 } = await supabaseServer.from('Transaction').insert(insertPayload).select().single();
    
    if (e1) {
        // Try fallback to 'transactions'
        const snakePayload = {
            id: insertPayload.id,
            user_id: user.id,
            type: 'DEPOSIT',
            amount: amt,
            currency,
            status: 'PENDING',
            provider,
            // metadata: { planId, autoActivate, cryptoCurrency }, // Removed due to missing column
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        const { data: d2, error: e2 } = await supabaseServer.from('transactions').insert(snakePayload).select().single();
        if (e2) throw e1; // Throw original error if both fail
        txData = d2;
    } else {
        txData = d1;
    }

    const txId = txData.id;

    // Send Pending Email
    if (user.email) {
      await sendEmail(user.email, TEMPLATES.depositPending(amt, currency, txId));
    }

    // 4. Handle Providers
    if (provider === 'simulation') {
         // Update Transaction to COMPLETED
         await supabaseServer.from('Transaction').update({ status: 'COMPLETED' }).eq('id', txId);
         await supabaseServer.from('transactions').update({ status: 'COMPLETED' }).eq('id', txId);

         // Credit Wallet
         let walletTable = 'Wallet';
         let { data: wallet } = await supabaseServer.from('Wallet').select('id, balance').eq('userId', user.id).eq('currency', currency).maybeSingle();
         
         if (!wallet) {
             const { data: w2 } = await supabaseServer.from('wallets').select('id, balance').eq('user_id', user.id).eq('currency', currency).maybeSingle();
             if (w2) {
                 wallet = { id: w2.id, balance: w2.balance };
                 walletTable = 'wallets';
             }
         }

         if (wallet) {
             const newBalance = Number(wallet.balance) + amt;
             await supabaseServer.from(walletTable).update({ balance: newBalance }).eq('id', wallet.id);
         } else {
             // Create wallet
             const newWalletId = uuidv4();
             const { error: cwErr } = await supabaseServer.from('Wallet').insert({ 
                 id: newWalletId, userId: user.id, currency, balance: amt 
             });
             if (cwErr) {
                 await supabaseServer.from('wallets').insert({ 
                     id: newWalletId, user_id: user.id, currency, balance: amt 
                 });
             }
         }

         return res.status(200).json({ message: 'Deposit successful (simulated)', id: txId });
    }

    if (provider === 'paystack') {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        // Check for missing key OR dummy/invalid key patterns
        if (!secret || secret === 'test_paystack_secret' || !secret.startsWith('sk_')) {
            // Mock mode if no key or test key
            return res.status(200).json({ 
                authorizationUrl: `https://checkout.paystack.com/mock-checkout?ref=${txId}`, 
                reference: txId 
            });
        }

        const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secret}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: user.email,
                amount: Math.round(amt * 100), // In kobo/cents if NGN/USD
                currency: currency === 'NGN' ? 'NGN' : 'USD', // Paystack mainly NGN, but supports USD
                reference: txId,
                callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
            })
        });

        const paystackJson = await paystackRes.json();
        if (!paystackRes.ok || !paystackJson.status) {
             throw new Error(paystackJson.message || 'Paystack init failed');
        }

        return res.status(200).json({
            authorizationUrl: paystackJson.data.authorization_url,
            reference: paystackJson.data.reference
        });

    } else if (provider === 'nowpayments' || provider === 'crypto') {
        const apiKey = process.env.NOWPAYMENTS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'NOWPayments not configured', details: 'Missing NOWPAYMENTS_API_KEY' });
        }

        const npRes = await fetch('https://api.nowpayments.io/v1/invoice', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                price_amount: amt,
                price_currency: currency.toLowerCase(), // 'usd'
                pay_currency: cryptoCurrency || 'btc',
                order_id: txId,
                ipn_callback_url: `${publicBaseUrl}/api/webhooks/nowpayments`,
                success_url: `${publicBaseUrl}/dashboard`,
                cancel_url: `${publicBaseUrl}/deposit`,
            })
        });

        const npJson = await npRes.json();
        if (!npRes.ok) {
             throw new Error(npJson.message || 'NOWPayments init failed');
        }
        
        return res.status(200).json({
            invoiceUrl: npJson.invoice_url,
            pay_url: npJson.invoice_url
        });
    }

    // Default / Manual / Other
    return res.status(200).json({ message: 'Deposit recorded', id: txId });

  } catch (err: any) {
    console.error('Deposit Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
