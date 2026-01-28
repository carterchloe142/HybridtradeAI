const crypto = require('crypto')
const path = require('path')

require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

const { createClient } = require('@supabase/supabase-js')

async function run() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anon || !service) {
    console.error('Missing env vars', { hasUrl: !!url, hasAnon: !!anon, hasService: !!service })
    process.exit(1)
  }

  const admin = createClient(url, service)
  const client = createClient(url, anon)

  const email = `pnltest+${Date.now()}@example.com`
  const password = `T3st-${crypto.randomUUID().slice(0, 8)}!aA1`

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createErr) throw createErr
  const userId = created.user.id

  await admin.from('User').upsert({
    id: userId,
    email,
    role: 'USER',
    kycStatus: 'PENDING',
    kycLevel: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const { data: signIn, error: signInErr } = await client.auth.signInWithPassword({ email, password })
  if (signInErr) throw signInErr
  const token = signIn.session.access_token

  const planName = 'Starter Plan'
  const planId = crypto.randomUUID()
  await admin.from('InvestmentPlan').insert({
    id: planId,
    name: planName,
    minAmount: 100,
    maxAmount: 500,
    duration: 7,
    returnPercentage: 10,
    payoutFrequency: 'WEEKLY',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  await admin.from('Investment').insert({
    id: crypto.randomUUID(),
    userId,
    planId,
    principal: 100,
    status: 'ACTIVE',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  await admin.from('performance').insert({
    id: crypto.randomUUID(),
    week_ending: new Date().toISOString(),
    total_roi_pct: 12,
    stream_rois: { trading: 12 },
    created_at: new Date().toISOString(),
  })

  const pnlRes = await fetch('http://localhost:3000/api/user/investments/pnl', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const pnlText = await pnlRes.text()
  let pnlJson = null
  try {
    pnlJson = JSON.parse(pnlText)
  } catch {}

  const payRes = await fetch('http://localhost:3000/api/payment/create', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: 25,
      currency: 'USD',
      cryptoCurrency: 'usdt',
      provider: 'nowpayments',
      planId: 'starter',
      autoActivate: true,
    }),
  })
  const payText = await payRes.text()
  let payJson = null
  try {
    payJson = JSON.parse(payText)
  } catch {}

  console.log(
    JSON.stringify(
      {
        pnl: { status: pnlRes.status, body: pnlJson || pnlText },
        paymentCreate: { status: payRes.status, body: payJson || payText },
      },
      null,
      2
    )
  )
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
