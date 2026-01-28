const crypto = require('crypto')
const path = require('path')

require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const { createClient } = require('@supabase/supabase-js')

function sortObject(obj) {
  if (Array.isArray(obj)) return obj.map(sortObject)
  if (obj && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObject(obj[key])
        return result
      }, {})
  }
  return obj
}

async function run() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET

  if (!url || !serviceKey || !ipnSecret) {
    console.error('Missing required env vars', {
      hasUrl: !!url,
      hasServiceKey: !!serviceKey,
      hasIpnSecret: !!ipnSecret,
    })
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey)
  const userId = 'd8f99317-29bf-4a07-a394-cdd1035a0e87'
  const txId = crypto.randomUUID()
  const nowIso = new Date().toISOString()

  await supabase
    .from('User')
    .upsert({
      id: userId,
      email: 'test-nowpayments@example.com',
      role: 'USER',
      kycStatus: 'PENDING',
      kycLevel: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    })

  const { error: txErr } = await supabase.from('Transaction').insert({
    id: txId,
    userId,
    type: 'DEPOSIT',
    amount: 25,
    currency: 'USD',
    status: 'PENDING',
    provider: 'NOWPAYMENTS',
    reference: JSON.stringify({ planId: 'starter', autoActivate: true }),
    createdAt: nowIso,
    updatedAt: nowIso,
  })
  if (txErr) {
    console.error('Transaction insert error:', txErr)
    process.exit(1)
  }

  const payload = {
    payment_status: 'finished',
    order_id: txId,
    price_amount: 25,
    price_currency: 'usd',
    pay_amount: 0.01,
  }
  const sig = crypto
    .createHmac('sha512', ipnSecret)
    .update(JSON.stringify(sortObject(payload)))
    .digest('hex')

  const res = await fetch('http://localhost:3000/api/webhooks/nowpayments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-nowpayments-sig': sig,
    },
    body: JSON.stringify(payload),
  })
  const text = await res.text()

  const { data: txAfter } = await supabase
    .from('Transaction')
    .select('id,status,investmentId,reference')
    .eq('id', txId)
    .maybeSingle()

  const { data: wallet } = await supabase
    .from('Wallet')
    .select('currency,balance')
    .eq('userId', userId)
    .eq('currency', 'USD')
    .maybeSingle()

  console.log(JSON.stringify({ webhookStatus: res.status, webhookBody: text, txAfter, wallet }, null, 2))
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

