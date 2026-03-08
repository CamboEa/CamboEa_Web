// CamboEA - Markets API: Frankfurter (forex) + CoinGecko (crypto) + MetalpriceAPI (metals)

import { NextResponse } from 'next/server';
import { getMetalpriceApiKey } from '@/config/env';

export type Bias = 'bullish' | 'bearish' | 'neutral';

export interface MarketsPriceRow {
  symbol: string;
  name: string;
  price: number;
  bias: Bias;
  decimals: number;
}

const DECIMALS: Record<string, number> = {
  'EUR/USD': 4,
  'GBP/USD': 4,
  'USD/JPY': 2,
  'AUD/USD': 4,
  'USD/CAD': 4,
  'USD/CHF': 4,
  'XAU/USD': 2,
  'XAG/USD': 2,
  'XPT/USD': 2,
  'BTC/USD': 2,
  'ETH/USD': 2,
  'XRP/USD': 4,
  'SOL/USD': 2,
};

function biasFromPercentChange(percentChange: number): Bias {
  const threshold = 0.05;
  if (percentChange > threshold) return 'bullish';
  if (percentChange < -threshold) return 'bearish';
  return 'neutral';
}

/** Frankfurter: 1 base = rates[currency]. So from=USD, to=EUR => 1 USD = rates.EUR EUR => EUR/USD = 1/rates.EUR */
async function fetchForex(): Promise<MarketsPriceRow[]> {
  const res = await fetch(
    'https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,AUD,CAD,CHF',
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const r = data.rates as Record<string, number> | undefined;
  if (!r) return [];

  const rows: MarketsPriceRow[] = [];
  rows.push({ symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1 / (r.EUR ?? 0), bias: 'neutral', decimals: 4 });
  rows.push({ symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1 / (r.GBP ?? 0), bias: 'neutral', decimals: 4 });
  rows.push({ symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', price: r.JPY ?? 0, bias: 'neutral', decimals: 2 });
  rows.push({ symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', price: 1 / (r.AUD ?? 0), bias: 'neutral', decimals: 4 });
  rows.push({ symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', price: r.CAD ?? 0, bias: 'neutral', decimals: 4 });
  rows.push({ symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', price: r.CHF ?? 0, bias: 'neutral', decimals: 4 });
  return rows.filter((row) => row.price > 0);
}

/** CoinGecko: simple/price with include_24hr_change for bias */
async function fetchCrypto(): Promise<MarketsPriceRow[]> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,solana&vs_currencies=usd&include_24hr_change=true',
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  const map: { id: string; symbol: string; name: string }[] = [
    { id: 'bitcoin', symbol: 'BTC/USD', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH/USD', name: 'Ethereum' },
    { id: 'ripple', symbol: 'XRP/USD', name: 'Ripple' },
    { id: 'solana', symbol: 'SOL/USD', name: 'Solana' },
  ];

  return map
    .filter((m) => data[m.id]?.usd != null)
    .map((m) => {
      const raw = data[m.id];
      const price = Number(raw.usd);
      const change = Number(raw.usd_24h_change ?? 0) || 0;
      return {
        symbol: m.symbol,
        name: m.name,
        price,
        bias: biasFromPercentChange(change),
        decimals: DECIMALS[m.symbol] ?? 2,
      };
    });
}

/** Static metals fallback when MetalpriceAPI key is missing */
const FALLBACK_METALS: MarketsPriceRow[] = [
  { symbol: 'XAU/USD', name: 'មាស (Gold)', price: 2035.5, bias: 'neutral', decimals: 2 },
  { symbol: 'XAG/USD', name: 'ប្រាក់ (Silver)', price: 24.18, bias: 'neutral', decimals: 2 },
  { symbol: 'XPT/USD', name: 'ប្លាទីន (Platinum)', price: 918.4, bias: 'neutral', decimals: 2 },
];

/** MetalpriceAPI: latest rates with base=USD, currencies=XAU,XAG,XPT. Response rates.USDXAU = USD per troy oz. */
async function fetchMetals(): Promise<MarketsPriceRow[]> {
  const apiKey = getMetalpriceApiKey();
  if (!apiKey) return FALLBACK_METALS;

  const res = await fetch(
    `https://api.metalpriceapi.com/v1/latest?api_key=${encodeURIComponent(apiKey)}&base=USD&currencies=XAU,XAG,XPT`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return FALLBACK_METALS;
  const data = await res.json();
  const r = data.rates as Record<string, number> | undefined;
  if (!r) return FALLBACK_METALS;

  const rows: MarketsPriceRow[] = [];
  if (r.USDXAU != null && r.USDXAU > 0)
    rows.push({ symbol: 'XAU/USD', name: 'មាស (Gold)', price: r.USDXAU, bias: 'neutral', decimals: 2 });
  if (r.USDXAG != null && r.USDXAG > 0)
    rows.push({ symbol: 'XAG/USD', name: 'ប្រាក់ (Silver)', price: r.USDXAG, bias: 'neutral', decimals: 2 });
  if (r.USDXPT != null && r.USDXPT > 0)
    rows.push({ symbol: 'XPT/USD', name: 'ប្លាទីន (Platinum)', price: r.USDXPT, bias: 'neutral', decimals: 2 });

  return rows.length > 0 ? rows : FALLBACK_METALS;
}

export async function GET() {
  try {
    const [forex, crypto, metals] = await Promise.all([
      fetchForex(),
      fetchCrypto(),
      fetchMetals(),
    ]);

    if (forex.length === 0 && crypto.length === 0) {
      return NextResponse.json(
        { error: 'Could not load forex or crypto data' },
        { status: 502 }
      );
    }

    return NextResponse.json({ forex, metals, crypto });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch markets';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
