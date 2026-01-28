const crypto = require('crypto')
const path = require('path')

require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

async function run() {
  const key = process.env.NOWPAYMENTS_API_KEY
  if (!key) {
    console.error('Missing NOWPAYMENTS_API_KEY')
    process.exit(1)
  }

  const body = {
    price_amount: 25,
    price_currency: 'usd',
    pay_currency: 'usdttrc20',
    order_id: crypto.randomUUID(),
    order_description: 'Local test payment',
  }

  const res = await fetch('https://api.nowpayments.io/v1/payment', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {}

  console.log(JSON.stringify({ status: res.status, body: json || text }, null, 2))
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

