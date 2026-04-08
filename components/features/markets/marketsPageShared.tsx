'use client';

export type ViewMode = 'overview' | 'retailer' | 'depth' | 'volatility';

export const PAIRS: { label: string; tvSymbol: string }[] = [
  { label: 'EUR/USD', tvSymbol: 'FX:EURUSD' },
  { label: 'GBP/USD', tvSymbol: 'FX:GBPUSD' },
  { label: 'USD/JPY', tvSymbol: 'FX:USDJPY' },
  { label: 'AUD/USD', tvSymbol: 'FX:AUDUSD' },
  { label: 'USD/CAD', tvSymbol: 'FX:USDCAD' },
  { label: 'USD/CHF', tvSymbol: 'FX:USDCHF' },
  { label: 'XAU/USD', tvSymbol: 'TVC:GOLD' },
  { label: 'XAG/USD', tvSymbol: 'TVC:SILVER' },
  { label: 'XPT/USD', tvSymbol: 'TVC:PLATINUM' },
  { label: 'BTC/USD', tvSymbol: 'BITSTAMP:BTCUSD' },
  { label: 'ETH/USD', tvSymbol: 'BITSTAMP:ETHUSD' },
  { label: 'XRP/USD', tvSymbol: 'BITSTAMP:XRPUSD' },
  { label: 'SOL/USD', tvSymbol: 'COINBASE:SOLUSD' },
  { label: 'BNB/USD', tvSymbol: 'BINANCE:BNBUSD' },
];

export const MARKET_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'overview', label: 'ទិដ្ឋភាពទីផ្សារ (Overview)' },
  { value: 'depth', label: 'ជម្រៅទីផ្សារ (Market Depth)' },
  { value: 'retailer', label: 'ទិន្នន័យអ្នកលក់រាយ (Retailer)' },
  { value: 'volatility', label: 'Volatility' },
];

export function ViewSkeleton({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 flex flex-col items-center justify-center min-h-[320px]">
      <div className="w-9 h-9 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
      <p className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុក {text}...</p>
    </div>
  );
}
