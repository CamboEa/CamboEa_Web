'use client';

export const MARKET_OPTIONS: { value: 'overview' | 'depth' | 'retailer'; label: string }[] = [
  { value: 'overview', label: 'ទិដ្ឋភាពទីផ្សារ (Overview)' },
  { value: 'depth', label: 'ជម្រៅទីផ្សារ (Market Depth)' },
  { value: 'retailer', label: 'ទិន្នន័យអ្នកលក់រាយ (Retailer)' },
];

export const SYMBOLS = [
  { value: 'BTCUSDT', label: 'BTC/USDT' },
  { value: 'ETHUSDT', label: 'ETH/USDT' },
  { value: 'BNBUSDT', label: 'BNB/USDT' },
  { value: 'SOLUSDT', label: 'SOL/USDT' },
  { value: 'XRPUSDT', label: 'XRP/USDT' },
  { value: 'DOGEUSDT', label: 'DOGE/USDT' },
  { value: 'ADAUSDT', label: 'ADA/USDT' },
  { value: 'AVAXUSDT', label: 'AVAX/USDT' },
  { value: 'EURUSD', label: 'EUR/USD' },
  { value: 'GBPUSD', label: 'GBP/USD' },
  { value: 'USDJPY', label: 'USD/JPY' },
  { value: 'XAUUSD', label: 'XAU/USD (Gold)' },
];

export type DepthState = {
  symbol: string;
  lastPrice: string;
  bidPrice: string;
  askPrice: string;
  priceChangePercent: string;
  bids: [string, string][];
  asks: [string, string][];
} | null;

export function formatNum(s: string, decimals: number): string {
  const n = parseFloat(s);
  if (Number.isNaN(n)) return s;
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function spread(bid: string, ask: string): string {
  const b = parseFloat(bid);
  const a = parseFloat(ask);
  if (Number.isNaN(b) || Number.isNaN(a)) return '—';
  return (a - b).toFixed(4);
}
