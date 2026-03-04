import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { sendEmail, TEMPLATES } from '@/src/lib/email';

type AnyRecord = Record<string, any>

function sortObject(obj: any): any {
  if (Array.isArray(obj)) return obj.map(sortObject)
  if (obj && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result: AnyRecord, key: string) => {
        result[key] = sortObject(obj[key])
        return result
      }, {})
  }
  return obj
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!ipnSecret) return res.status(500).send('NOWPayments IPN secret not configured');

  const sigHeader = req.headers['x-nowpayments-sig'];
  const sig = Array.isArray(sigHeader) ? sigHeader[0] : String(sigHeader || '').trim();
  if (!sig) return res.status(401).send('Missing signature');

  const params = (req.body || {}) as AnyRecord;
  const sortedParams = sortObject(params);
  const mySig = crypto.createHmac('sha512', ipnSecret).update(JSON.stringify(sortedParams)).digest('hex');

  if (mySig !== sig) {
    return res.status(401).send('Invalid signature');
  }

  const { payment_status, order_id, pay_amount, price_amount, price_currency } = params;

  if (payment_status === 'finished') {
      if (!supabaseServer) return res.status(500).send('Supabase not configured');

      try {
          const txId = String(order_id || '').trim();
          if (!txId) return res.status(200).send('Missing order_id');

          // 1. Find Transaction (order_id is our tx ID)
          let tx: any = null;
          const { data: t1 } = await supabaseServer.from('Transaction').select('*').eq('id', txId).maybeSingle();
          if (t1) {
            tx = t1;
          } else {
            const { data: t2 } = await supabaseServer.from('transactions').select('*').eq('id', txId).maybeSingle();
            tx = t2;
          }

          if (!tx) {
            return res.status(200).send('Tx not found');
          }

          let meta: any = {}
          try {
            meta = tx.reference ? JSON.parse(String(tx.reference)) : {}
          } catch {
            meta = {}
          }

          if (meta?.nowpaymentsProcessed === true) {
            return res.status(200).send('Already processed');
          }

          // 2. Update Transaction
          const nowIso = new Date().toISOString();

          if (String(tx.status || '').toUpperCase() !== 'COMPLETED') {
            await supabaseServer.from('Transaction').update({ status: 'COMPLETED', provider: 'NOWPAYMENTS', updatedAt: nowIso }).eq('id', tx.id);
            await supabaseServer.from('transactions').update({ status: 'COMPLETED', provider: 'NOWPAYMENTS', updated_at: nowIso }).eq('id', tx.id);
          }

          // 3. Credit Wallet
          const userId = tx.userId || tx.user_id;
          const txCurrency = String((tx.currency || price_currency || 'USD')).toUpperCase();
          const creditAmount = Number(tx.amount ?? tx.amount_usd ?? price_amount ?? pay_amount ?? 0);
          if (!userId || !creditAmount) return res.status(200).send('Missing user or amount');

          let newBalance = 0;
          if (meta?.walletCredited !== true) {
            const { data: w1 } = await supabaseServer.from('Wallet').select('*').eq('userId', userId).eq('currency', txCurrency).maybeSingle();
            if (w1) {
              newBalance = Number(w1.balance || 0) + creditAmount;
              await supabaseServer.from('Wallet').update({ balance: newBalance, updatedAt: nowIso }).eq('id', w1.id);
            } else {
              const { data: w2 } = await supabaseServer.from('wallets').select('*').eq('user_id', userId).eq('currency', txCurrency).maybeSingle();
              if (w2) {
                newBalance = Number(w2.balance || 0) + creditAmount;
                await supabaseServer.from('wallets').update({ balance: newBalance, updated_at: nowIso }).eq('id', w2.id);
              } else {
                const walletId = uuidv4();
                newBalance = creditAmount;
                const { error: wInsertErr } = await supabaseServer.from('Wallet').insert({
                  id: walletId,
                  userId,
                  currency: txCurrency,
                  balance: creditAmount,
                  createdAt: nowIso,
                  updatedAt: nowIso,
                });
                if (wInsertErr) {
                  await supabaseServer.from('wallets').insert({
                    id: walletId,
                    user_id: userId,
                    currency: txCurrency,
                    balance: creditAmount,
                    created_at: nowIso,
                    updated_at: nowIso,
                  });
                }
              }
            }

            meta.walletCredited = true
            meta.walletCreditedAt = nowIso
          }

          meta.nowpaymentsProcessed = true
          meta.nowpaymentsProcessedAt = nowIso

          await supabaseServer.from('Transaction').update({ reference: JSON.stringify(meta), updatedAt: nowIso }).eq('id', tx.id)

          const shouldAutoActivate = Boolean(meta?.autoActivate) && Boolean(meta?.planId)
          if (shouldAutoActivate && meta?.autoInvested !== true && txCurrency === 'USD') {
            const slug = String(meta.planId || '').toLowerCase()
            const slugToName: Record<string, string> = {
              starter: 'Starter Plan',
              pro: 'Pro Plan',
              elite: 'Elite Plan',
              bigtime: 'HYDRA Plan',
            }
            const mappedName = slugToName[slug]
            let plan: any = null
            if (mappedName) {
              const { data: byName } = await supabaseServer.from('InvestmentPlan').select('*').or(`name.eq.${mappedName},id.eq.${slug}`).maybeSingle()
              if (byName) plan = byName
            }

            if (!plan && mappedName) {
              const fallback = {
                starter: { minAmount: 100, maxAmount: 500, duration: 7, roiMinPct: 10 },
                pro: { minAmount: 501, maxAmount: 2000, duration: 14, roiMinPct: 15 },
                elite: { minAmount: 2001, maxAmount: 10000, duration: 30, roiMinPct: 22.5 },
                bigtime: { minAmount: 50000, maxAmount: 200000, duration: 14, roiMinPct: 30 },
              } as any
              const f = fallback[slug]
              if (f) {
                const newPlanId = uuidv4()
                const { data: seeded } = await supabaseServer
                  .from('InvestmentPlan')
                  .insert({
                    id: newPlanId,
                    name: mappedName,
                    minAmount: f.minAmount,
                    maxAmount: f.maxAmount,
                    duration: f.duration,
                    returnPercentage: f.roiMinPct,
                    createdAt: nowIso,
                    updatedAt: nowIso,
                  })
                  .select()
                  .single()
                if (seeded) plan = seeded
              }
            }

            if (plan?.id) {
              const { data: w } = await supabaseServer.from('Wallet').select('*').eq('userId', userId).eq('currency', 'USD').maybeSingle()
              const bal = Number(w?.balance || 0)
              if (w?.id && bal + 1e-9 >= creditAmount) {
                const invId = uuidv4()
                const startDate = new Date()
                const endDate = new Date(startDate)
                endDate.setDate(endDate.getDate() + Number(plan.duration || 30))

                const { data: inv, error: invErr } = await supabaseServer
                  .from('Investment')
                  .insert({
                    id: invId,
                    userId,
                    planId: plan.id,
                    principal: creditAmount,
                    status: 'ACTIVE',
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    createdAt: nowIso,
                    updatedAt: nowIso,
                  })
                  .select()
                  .single()

                if (!invErr && inv?.id) {
                  const newUsdBalance = bal - creditAmount
                  await supabaseServer.from('Wallet').update({ balance: Math.max(0, newUsdBalance), updatedAt: nowIso }).eq('id', w.id)

                  const transferId = uuidv4()
                  await supabaseServer.from('Transaction').insert({
                    id: transferId,
                    userId,
                    investmentId: inv.id,
                    type: 'TRANSFER',
                    amount: creditAmount,
                    currency: 'USD',
                    provider: 'investment',
                    status: 'COMPLETED',
                    reference: JSON.stringify({ source: 'deposit', depositId: tx.id, plan: slug }),
                    createdAt: nowIso,
                    updatedAt: nowIso,
                  })

                  meta.autoInvested = true
                  meta.investmentId = inv.id
                  await supabaseServer.from('Transaction').update({ investmentId: inv.id, reference: JSON.stringify(meta), updatedAt: nowIso }).eq('id', tx.id)
                }
              }
            }
          }

          // 4. Send Confirmation Email
          const { data: user } = await supabaseServer.auth.admin.getUserById(userId);
          if (user?.user?.email) {
            await sendEmail(user.user.email, TEMPLATES.depositConfirmed(creditAmount, txCurrency, newBalance));
          }

      } catch (e) {
          console.error('Webhook error:', e);
          return res.status(500).send('Internal Error');
      }
  }

  res.status(200).send('OK');
}
