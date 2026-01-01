
const apiKey = process.env.NOWPAYMENTS_API_KEY || 'JBFCWMF-ZEEM3A1-P3WTFW6-X4B67JE'

async function test() {
  console.log('Testing NOWPayments API...')
  
  // 1. Status
  try {
    const statusRes = await fetch('https://api.nowpayments.io/v1/status')
    const status = await statusRes.json()
    console.log('API Status:', status)
  } catch (e) {
    console.error('Status check failed:', e)
  }

  // 2. Currencies (check if usdt exists)
  try {
    const curRes = await fetch('https://api.nowpayments.io/v1/currencies?fixed_rate=true', {
        headers: { 'x-api-key': apiKey }
    })
    const currencies = await curRes.json()
    console.log('Currencies count:', currencies.currencies?.length)
    console.log('Has usdt?', currencies.currencies?.includes('usdt'))
    console.log('Has usdttrc20?', currencies.currencies?.includes('usdttrc20'))
    console.log('Has usdterc20?', currencies.currencies?.includes('usdterc20'))
  } catch (e) {
    console.error('Currencies check failed:', e)
  }

  // 3. Estimate
  try {
    console.log('Getting estimate for 100 USD to USDT...')
    const estRes = await fetch(`https://api.nowpayments.io/v1/estimate?amount=100&currency_from=usd&currency_to=usdt`, {
        headers: { 'x-api-key': apiKey }
    })
    const est = await estRes.json()
    console.log('Estimate USDT:', est)
  } catch (e) { console.error(e) }

  try {
    console.log('Getting estimate for 100 USD to USDTTRC20...')
    const estRes = await fetch(`https://api.nowpayments.io/v1/estimate?amount=100&currency_from=usd&currency_to=usdttrc20`, {
        headers: { 'x-api-key': apiKey }
    })
    const est = await estRes.json()
    console.log('Estimate USDTTRC20:', est)
  } catch (e) { console.error(e) }
}

test()
