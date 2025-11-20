import { useMemo, useState } from 'react';
import type { Balance } from '../types';

const staticRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  NGN: 1550, // placeholder
  BTC: 1 / 65000, // USD per Satoshi approx
  ETH: 1 / 3500
};

export function useCurrency(initial: Balance['currency'] = 'USD') {
  const [currency, setCurrency] = useState<Balance['currency']>(initial);
  const rate = useMemo(() => staticRates[currency] || 1, [currency]);
  const format = (amount: number) => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'NGN' ? '₦' : currency === 'BTC' ? '₿' : 'Ξ';
    const decimals = currency === 'USD' || currency === 'EUR' || currency === 'NGN' ? 2 : 6;
    return `${symbol}${amount.toFixed(decimals)}`;
  };
  const convertFromUSD = (usdAmount: number) => usdAmount * rate;
  const convertToUSD = (amount: number, fromCurrency: Balance['currency']) => {
    const r = staticRates[fromCurrency] || 1; // currency per USD
    return amount / r; // convert currency -> USD
  };
  return { currency, setCurrency, format, convertFromUSD, convertToUSD, rate };
}
