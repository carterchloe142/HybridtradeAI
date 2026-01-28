export function convertToUSD(amount: number, currency: string) {
  // Mock rates
  const rates: Record<string, number> = {
    USD: 1,
    USDT: 1,
    BTC: 65000,
    ETH: 3500,
    NGN: 0.00065,
    GHS: 0.08,
    KES: 0.007,
    ZAR: 0.053
  }
  const rate = rates[currency.toUpperCase()] || 1
  return amount * rate
}

export function convertFromUSD(amountUSD: number, currency: string) {
  const rates: Record<string, number> = {
    USD: 1,
    USDT: 1,
    BTC: 65000,
    ETH: 3500,
    NGN: 0.00065,
    GHS: 0.08,
    KES: 0.007,
    ZAR: 0.053
  }
  const rate = rates[currency.toUpperCase()] || 1
  return amountUSD / rate
}
