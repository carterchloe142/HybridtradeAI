import { useMemo, useState, useEffect } from 'react';
import type { Balance } from '@/types';

const staticRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 156,
  CNY: 7.2,
  AUD: 1.52,
  CAD: 1.37,
  CHF: 0.88,
  SEK: 10.6,
  NOK: 11.0,
  DKK: 6.9,
  PLN: 3.9,
  CZK: 23.0,
  HUF: 365,
  RON: 4.6,
  BGN: 1.8,
  TRY: 34,
  INR: 84,
  IDR: 16000,
  MYR: 4.7,
  SGD: 1.35,
  HKD: 7.8,
  TWD: 32,
  KRW: 1350,
  SAR: 3.75,
  AED: 3.67,
  BRL: 5.6,
  MXN: 17,
  ARS: 1000,
  CLP: 970,
  COP: 4100,
  PEN: 3.8,
  ZAR: 18.5,
  EGP: 49,
  KES: 132,
  GHS: 15.5,
  NGN: 1550,
  RUB: 93,
  UAH: 41,
  THB: 36,
  VND: 24500,
  PHP: 58,
  PKR: 279,
  BTC: 1 / 65000,
  ETH: 1 / 3500,
  USDT: 1,
  USDC: 1,
  BNB: 1 / 600,
  SOL: 1 / 180,
  ADA: 1 / 0.45,
  DOT: 1 / 5.5,
  MATIC: 1 / 0.85
};

export const supportedCurrencies = Object.keys(staticRates)

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  ADA: 'cardano',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  USDT: 'tether',
  USDC: 'usd-coin'
};

export function useCurrency(initial: Balance['currency'] = 'USD') {
  const [currency, setCurrency] = useState<Balance['currency']>(initial);
  const [rates, setRates] = useState<Record<string, number>>(staticRates);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Fetch Fiat Rates
        const fiatRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const fiatData = await fiatRes.json();
        
        // Fetch Crypto Rates
        const ids = Object.values(COINGECKO_IDS).join(',');
        const cryptoRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        const cryptoData = await cryptoRes.json();

        const newRates = { ...staticRates, ...fiatData.rates };

        // Update Crypto Rates
        Object.entries(COINGECKO_IDS).forEach(([symbol, id]) => {
          if (cryptoData[id] && cryptoData[id].usd) {
            newRates[symbol] = 1 / cryptoData[id].usd;
          }
        });

        setRates(newRates);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      }
    };

    fetchRates();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const rate = useMemo(() => rates[currency] || 1, [currency, rates]);
  const format = (amount: number) => {
    const syms: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', AUD: '$', CAD: '$', CHF: '₣', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RON: 'lei', BGN: 'лв', TRY: '₺', INR: '₹', IDR: 'Rp', MYR: 'RM', SGD: '$', HKD: '$', TWD: '$', KRW: '₩', SAR: '﷼', AED: 'د.إ', BRL: 'R$', MXN: '$', ARS: '$', CLP: '$', COP: '$', PEN: 'S/', ZAR: 'R', EGP: '£', KES: 'KSh', GHS: '₵', NGN: '₦', RUB: '₽', UAH: '₴', THB: '฿', VND: '₫', PHP: '₱', PKR: '₨', BTC: '₿', ETH: 'Ξ', USDT: '$', USDC: '$', BNB: 'Ⓑ', SOL: '◎', ADA: 'A', DOT: '•', MATIC: 'M'
    }
    const symbol = syms[currency] || ''
    const isFiat = !['BTC','ETH','BNB','SOL','ADA','DOT','MATIC','USDT','USDC'].includes(currency)
    const decimals = isFiat ? 2 : 6
    return `${symbol}${amount.toFixed(decimals)}`
  }
  const convertFromUSD = (usdAmount: number) => usdAmount * rate;
  const convertToUSD = (amount: number, fromCurrency: Balance['currency']) => {
    const r = rates[fromCurrency] || 1; // currency per USD
    return amount / r; // convert currency -> USD
  };
  return { currency, setCurrency, format, convertFromUSD, convertToUSD, rate };
}
