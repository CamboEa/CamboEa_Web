// CamboEA - Data proxy (opaque path). Kraken first, then Binance.
import { NextRequest, NextResponse } from 'next/server';

const FETCH_TIMEOUT_MS = 6000;
const DEPTH_CACHE_TTL_MS = 3000;

type DepthPayload = {
  symbol: string;
  lastPrice: string;
  bidPrice: string;
  askPrice: string;
  priceChangePercent: string;
  bids: [string, string][];
  asks: [string, string][];
  lastUpdateId: number | null;
};

const depthCache = new Map<string, { payload: DepthPayload; expiresAt: number }>();
const inFlightDepth = new Map<string, Promise<DepthPayload>>();

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

async function tryKraken(symbol: string, limit: number): Promise<DepthPayload | null> {
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
  const tickerResult = tickerJson.result as Record<string, { c: string[]; b: string[]; a: string[] }>;
  const pairKey = Object.keys(depthResult)[0];
  const tickerPairKey = Object.keys(tickerResult)[0];
  if (!pairKey || !tickerPairKey) return null;
  const book = depthResult[pairKey];
  const ticker = tickerResult[tickerPairKey];
  if (!book || !ticker) return null;
  return {
    symbol,
    lastPrice: ticker.c?.[0] ?? '',
    bidPrice: ticker.b?.[0] ?? '',
    askPrice: ticker.a?.[0] ?? '',
    priceChangePercent: '',
    bids: book.bids.map(([price, vol]) => [price, vol] as [string, string]),
    asks: book.asks.map(([price, vol]) => [price, vol] as [string, string]),
    lastUpdateId: null,
  };
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

async function fetchDepthPayload(symbol: string, limit: number): Promise<DepthPayload> {
  try {
    const krakenPayload = await tryKraken(symbol, limit);
    if (krakenPayload) return krakenPayload;
  } catch {
    // fallthrough to Binance
  }

  if (KRAKEN_ONLY_SYMBOLS.has(symbol)) {
    throw new Error('Forex/metals data temporarily unavailable.');
  }

  let lastError: Error | null = null;
  for (const host of BINANCE_HOSTS) {
    try {
      const result = await tryBinance(host, symbol, limit);
      if (!result) continue;
      const { depth, ticker } = result as {
        depth: { bids?: [string, string][]; asks?: [string, string][]; lastUpdateId?: number };
        ticker: { symbol?: string; lastPrice?: string; bidPrice?: string; askPrice?: string; priceChangePercent?: string };
      };
      return {
        symbol: ticker.symbol ?? symbol,
        lastPrice: ticker.lastPrice ?? '',
        bidPrice: ticker.bidPrice ?? '',
        askPrice: ticker.askPrice ?? '',
        priceChangePercent: ticker.priceChangePercent ?? '',
        bids: depth.bids ?? [],
        asks: depth.asks ?? [],
        lastUpdateId: depth.lastUpdateId ?? null,
      };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  const isAbort = lastError instanceof Error && lastError.name === 'AbortError';
  if (isAbort) throw new Error('Request timed out. Try again later.');
  throw new Error(lastError?.message ?? 'Failed to fetch data');
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') || 'BTCUSDT';
  const limit = Math.min(50, Math.max(5, parseInt(request.nextUrl.searchParams.get('limit') || '20', 10) || 20));
  const cacheKey = `${symbol}:${limit}`;
  const now = Date.now();

  const cached = depthCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.payload, {
      headers: { 'x-depth-cache': 'hit' },
    });
  }

  const existingRequest = inFlightDepth.get(cacheKey);
  if (existingRequest) {
    const payload = await existingRequest;
    return NextResponse.json(payload, {
      headers: { 'x-depth-cache': 'deduped' },
    });
  }

  const requestPromise = fetchDepthPayload(symbol, limit);
  inFlightDepth.set(cacheKey, requestPromise);

  try {
    const payload = await requestPromise;
    depthCache.set(cacheKey, { payload, expiresAt: Date.now() + DEPTH_CACHE_TTL_MS });
    return NextResponse.json(payload, {
      headers: { 'x-depth-cache': 'miss' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch data';
    const status = message.includes('temporarily unavailable')
      ? 503
      : message.includes('timed out')
        ? 504
        : 500;
    return NextResponse.json({ error: message }, { status });
  } finally {
    inFlightDepth.delete(cacheKey);
  }
}
