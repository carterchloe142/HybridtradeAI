export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.95, // ~1.05 USD
  GBP: 0.79, // ~1.26 USD
  JPY: 152,
  CNY: 7.25,
  AUD: 1.55,
  CAD: 1.40,
  CHF: 0.90,
  SEK: 10.9,
  NOK: 11.2,
  DKK: 7.1,
  PLN: 4.0,
  CZK: 23.5,
  HUF: 370,
  RON: 4.7,
  BGN: 1.85,
  TRY: 35,
  INR: 85,
  IDR: 16200,
  MYR: 4.5,
  SGD: 1.36,
  HKD: 7.8,
  TWD: 32.5,
  KRW: 1400,
  SAR: 3.75,
  AED: 3.67,
  BRL: 5.8,
  MXN: 18,
  ARS: 1050,
  CLP: 980,
  COP: 4200,
  PEN: 3.75,
  ZAR: 18.0,
  EGP: 50,
  KES: 130,
  GHS: 16.0,
  NGN: 1600,
  RUB: 95,
  UAH: 41.5,
  THB: 34,
  VND: 25400,
  PHP: 59,
  PKR: 278,
  BTC: 1 / 95000,
  ETH: 1 / 3300,
  USDT: 1,
  USDC: 1,
  BNB: 1 / 650,
  SOL: 1 / 190,
  ADA: 1 / 0.75,
  DOT: 1 / 6.5,
  MATIC: 1 / 0.50
};

export function convertToUSD(amount: number, currency: string): number {
  const rate = EXCHANGE_RATES[currency] || 1;
  return amount / rate;
}

export function convertFromUSD(amountUSD: number, currency: string): number {
  const rate = EXCHANGE_RATES[currency] || 1;
  return amountUSD * rate;
}
