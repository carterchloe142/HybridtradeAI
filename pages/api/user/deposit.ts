import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { v4 as uuidv4 } from 'uuid';

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

  // 2. Parse Body
  const { amount, currency = 'USD', provider, planId, autoActivate, cryptoCurrency } = req.body;
  const amt = Number(amount);

  if (!amt || amt <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
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
        // metadata: { planId, autoActivate, cryptoCurrency }, // Schema doesn't support metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Try 'Transaction'
    const { data: d1, error: e1 } = await supabaseServer.from('Transaction').insert(insertPayload).select().single();
    
    if (e1) {
        throw e1;
    }
    txData = d1;

    const txId = txData.id;

    // 4. Handle Providers
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
            // Mock mode
             return res.status(200).json({ 
                invoiceUrl: `https://nowpayments.io/payment/?iid=mock-${txId}`,
                pay_url: `https://nowpayments.io/payment/?iid=mock-${txId}`
            });
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
                ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`
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
