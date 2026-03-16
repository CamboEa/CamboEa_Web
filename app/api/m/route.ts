// CamboEA - Data proxy (opaque path). Kraken first, then Binance.

import { NextRequest, NextResponse } from 'next/server';

const FETCH_TIMEOUT_MS = 6000;

const SYMBOL_TO_KRAKEN_PAIR: Record<string, string> = {
  BTCUSDT: 'XXBTZUSD',
  ETHUSDT: 'XETHZUSD',
  BNBUSDT: 'BNBUSD',
  SOLUSDT: 'SOLUSD',
  XRPUSDT: 'XXRPZUSD',
  DOGEUSDT: 'XDGUSD',
  ADAUSDT: 'ADAUSD',
  AVAXUSDT: 'AVAXUSD',
  // Forex (Kraken only)
  EURUSD: 'ZEURZUSD',
  GBPUSD: 'ZGBPZUSD',
  USDJPY: 'ZUSDZJPY',
  // Metals – XAUT = Tether Gold (Kraken)
  XAUUSD: 'XAUTUSD',
  XAUTUSD: 'XAUTUSD',
};
const KRAKEN_ONLY_SYMBOLS = new Set(['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'XAUTUSD']);

const BINANCE_HOSTS = ['https://api.binance.com', 'https://api1.binance.com', 'https://api2.binance.com'];
const BINANCE_PATH = '/api/v3';

function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

async function tryKraken(symbol: string, limit: number): Promise<NextResponse | null> {
  const pair = SYMBOL_TO_KRAKEN_PAIR[symbol] ?? symbol.replace('USDT', 'USD').replace('BTC', 'XBT');
  const krakenPair = pair.includes('XBT') || pair.endsWith('USD') ? pair : `${pair}USD`;
  const [depthRes, tickerRes] = await Promise.all([
    fetchWithTimeout(
      `https://api.kraken.com/0/public/Depth?pair=${encodeURIComponent(krakenPair)}&count=${limit}`,
      FETCH_TIMEOUT_MS
    ),
    fetchWithTimeout(
      `https://api.kraken.com/0/public/Ticker?pair=${encodeURIComponent(krakenPair)}`,
      FETCH_TIMEOUT_MS
    ),
  ]);
  if (!depthRes.ok || !tickerRes.ok) return null;
  const [depthJson, tickerJson] = await Promise.all([depthRes.json(), tickerRes.json()]);
  if (depthJson.error?.length || tickerJson.error?.length) return null;
  const depthResult = depthJson.result as Record<string, { asks: [string, string, number][]; bids: [string, string, number][] }>;
  const tickerResult = tickerJson.result as Record<string, { c: string[]; b: string[]; a: string[]; p: string[] }>;
  const pairKey = Object.keys(depthResult)[0];
  const tickerPairKey = Object.keys(tickerResult)[0];
  if (!pairKey || !tickerPairKey) return null;
  const book = depthResult[pairKey];
  const ticker = tickerResult[tickerPairKey];
  if (!book || !ticker) return null;
  const bids = book.bids.map(([price, vol]) => [price, vol] as [string, string]);
  const asks = book.asks.map(([price, vol]) => [price, vol] as [string, string]);
  const lastPrice = ticker.c?.[0] ?? '';
  const bidPrice = ticker.b?.[0] ?? '';
  const askPrice = ticker.a?.[0] ?? '';
  const priceChangePercent = '';
  return NextResponse.json({
    symbol,
    lastPrice,
    bidPrice,
    askPrice,
    priceChangePercent,
    bids,
    asks,
    lastUpdateId: null,
  });
}

async function tryBinance(host: string, symbol: string, limit: number): Promise<{ depth: unknown; ticker: unknown } | null> {
  const base = `${host}${BINANCE_PATH}`;
  const [depthRes, tickerRes] = await Promise.all([
    fetchWithTimeout(`${base}/depth?symbol=${encodeURIComponent(symbol)}&limit=${limit}`, FETCH_TIMEOUT_MS),
    fetchWithTimeout(`${base}/ticker/24hr?symbol=${encodeURIComponent(symbol)}`, FETCH_TIMEOUT_MS),
  ]);
  if (!depthRes.ok || !tickerRes.ok) return null;
  const [depth, ticker] = await Promise.all([depthRes.json(), tickerRes.json()]);
  return { depth, ticker };
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') || 'BTCUSDT';
  const limit = Math.min(50, Math.max(5, parseInt(request.nextUrl.searchParams.get('limit') || '20', 10) || 20));

  try {
    const krakenRes = await tryKraken(symbol, limit);
    if (krakenRes) return krakenRes;
  } catch {
    //
  }

  if (KRAKEN_ONLY_SYMBOLS.has(symbol)) {
    return NextResponse.json(
      { error: 'Forex/metals data temporarily unavailable.' },
      { status: 503 }
    );
  }

  let lastError: Error | null = null;
  for (const host of BINANCE_HOSTS) {
    try {
      const result = await tryBinance(host, symbol, limit);
      if (result) {
        const { depth, ticker } = result as {
          depth: { bids?: [string, string][]; asks?: [string, string][]; lastUpdateId?: number };
          ticker: { symbol?: string; lastPrice?: string; bidPrice?: string; askPrice?: string; priceChangePercent?: string };
        };
        return NextResponse.json({
          symbol: ticker.symbol ?? symbol,
          lastPrice: ticker.lastPrice ?? '',
          bidPrice: ticker.bidPrice ?? '',
          askPrice: ticker.askPrice ?? '',
          priceChangePercent: ticker.priceChangePercent ?? '',
          bids: depth.bids ?? [],
          asks: depth.asks ?? [],
          lastUpdateId: depth.lastUpdateId,
        });
      }
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  const isAbort = lastError instanceof Error && lastError.name === 'AbortError';
  const message = isAbort
    ? 'Request timed out. Try again later.'
    : (lastError instanceof Error ? lastError.message : 'Failed to fetch data');
  return NextResponse.json({ error: message }, { status: isAbort ? 504 : 500 });
}
