import { Currency } from '../types';

// Exchange rates relative to BDT
const RATES: Record<Currency, { symbol: string; rate: number }> = {
  BDT: { symbol: '৳', rate: 1 },
  USD: { symbol: '$', rate: 0.0084 }, // ~120 BDT per USD
  SAR: { symbol: '﷼', rate: 0.031 },  // ~32 BDT per SAR
  AED: { symbol: 'AED ', rate: 0.031 } // ~32 BDT per AED
};

export function formatPrice(amountInBDT: number, currency: Currency): string {
  const currencyInfo = RATES[currency] || RATES.BDT;
  const converted = amountInBDT * currencyInfo.rate;
  
  if (currency === 'BDT') {
    return `${currencyInfo.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${currencyInfo.symbol}${converted.toFixed(2)}`;
}
