const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

async function run() {
  const key = process.env.NOWPAYMENTS_API_KEY
  if (!key) {
    console.error('Missing NOWPAYMENTS_API_KEY')
    process.exit(1)
  }

  const res = await fetch('https://api.nowpayments.io/v1/currencies', {
    headers: { 'x-api-key': key },
  })
  const json = await res.json().catch(() => ({}))
  const currencies = json.currencies

  if (!Array.isArray(currencies)) {
    console.log(JSON.stringify({ status: res.status, body: json }, null, 2))
    return
  }

  const sample = currencies.slice(0, 5)
  const first = currencies[0]
  const firstType = first == null ? 'null' : Array.isArray(first) ? 'array' : typeof first
  const firstKeys = first && typeof first === 'object' && !Array.isArray(first) ? Object.keys(first).slice(0, 20) : []

  const codes = currencies
    .map((c) => {
      if (typeof c === 'string') return c
      if (!c || typeof c !== 'object') return ''
      return String(c.currency || c.code || c.ticker || '')
    })
    .filter(Boolean)

  const usdt = codes.filter((c) => String(c).toLowerCase().includes('usdt')).slice(0, 50)
  const usd = codes.filter((c) => String(c).toLowerCase() === 'usd').length

  console.log(
    JSON.stringify(
      {
        status: res.status,
        total: currencies.length,
        firstType,
        firstKeys,
        sample,
        derivedCodeCount: codes.length,
        usdExactCount: usd,
        usdtMatches: usdt,
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

