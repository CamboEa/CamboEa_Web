// Forex & Crypto News - Trading Signals API Functions

import { TradingSignal, AssetType } from '@/types';

// Sample trading signals data - Focus: Gold (XAU/USD) and Bitcoin (BTC/USD) only
const SAMPLE_SIGNALS: TradingSignal[] = [
  // Bitcoin Signals
  {
    id: 'signal-btc-1',
    asset: 'BTC/USD',
    assetType: 'crypto',
    direction: 'buy',
    entryPrice: 52000,
    stopLoss: 50500,
    takeProfit1: 54000,
    takeProfit2: 56000,
    takeProfit3: 60000,
    currentPrice: 52345,
    riskRewardRatio: 2.67,
    confidence: 78,
    status: 'active',
    analysis: 'Bitcoin shows strong support at $50,500 with bullish divergence on 4H RSI. Expecting continuation toward $54K-$60K range.',
    publishedAt: '2026-01-21T08:00:00Z',
    expiresAt: '2026-01-23T08:00:00Z',
    author: {
      name: 'Sarah Chen',
      role: 'Senior Crypto Analyst',
    },
  },
  {
    id: 'signal-btc-2',
    asset: 'BTC/USD',
    assetType: 'crypto',
    direction: 'buy',
    entryPrice: 51800,
    stopLoss: 51000,
    takeProfit1: 53500,
    takeProfit2: 55000,
    currentPrice: 52345,
    riskRewardRatio: 2.13,
    confidence: 72,
    status: 'active',
    analysis: 'BTC consolidating above key support. Institutional buying pressure building. Expecting breakout above $53,500.',
    publishedAt: '2026-01-21T07:30:00Z',
    expiresAt: '2026-01-22T20:00:00Z',
    author: {
      name: 'Michael Torres',
      role: 'Blockchain Researcher',
    },
  },
  {
    id: 'signal-btc-3',
    asset: 'BTC/USD',
    assetType: 'crypto',
    direction: 'sell',
    entryPrice: 53000,
    stopLoss: 54000,
    takeProfit1: 51500,
    takeProfit2: 50000,
    currentPrice: 52345,
    riskRewardRatio: 1.5,
    confidence: 65,
    status: 'active',
    analysis: 'Bitcoin facing resistance at $53,000. Potential pullback to $51,500 support if rejection occurs.',
    publishedAt: '2026-01-21T06:00:00Z',
    expiresAt: '2026-01-22T18:00:00Z',
    author: {
      name: 'Alex Kim',
      role: 'Crypto Trader',
    },
  },

  // Gold Signals
  {
    id: 'signal-gold-1',
    asset: 'XAU/USD',
    assetType: 'forex',
    direction: 'buy',
    entryPrice: 2020,
    stopLoss: 1995,
    takeProfit1: 2060,
    takeProfit2: 2100,
    currentPrice: 2035.50,
    riskRewardRatio: 2.4,
    confidence: 74,
    status: 'active',
    analysis: 'Gold finding support amid geopolitical tensions. Bullish momentum building above $2020. Target $2060-$2100.',
    publishedAt: '2026-01-21T07:00:00Z',
    expiresAt: '2026-01-24T04:00:00Z',
    author: {
      name: 'David Miller',
      role: 'Commodity Strategist',
    },
  },
  {
    id: 'signal-gold-2',
    asset: 'XAU/USD',
    assetType: 'forex',
    direction: 'buy',
    entryPrice: 2030,
    stopLoss: 2010,
    takeProfit1: 2055,
    takeProfit2: 2080,
    currentPrice: 2035.50,
    riskRewardRatio: 2.5,
    confidence: 70,
    status: 'active',
    analysis: 'Gold breaking above key resistance at $2030. Inflation concerns driving safe-haven demand. Next target $2055.',
    publishedAt: '2026-01-21T06:30:00Z',
    expiresAt: '2026-01-22T16:00:00Z',
    author: {
      name: 'Emma Williams',
      role: 'Precious Metals Analyst',
    },
  },
  {
    id: 'signal-gold-3',
    asset: 'XAU/USD',
    assetType: 'forex',
    direction: 'sell',
    entryPrice: 2045,
    stopLoss: 2060,
    takeProfit1: 2025,
    takeProfit2: 2000,
    currentPrice: 2035.50,
    riskRewardRatio: 2.0,
    confidence: 68,
    status: 'active',
    analysis: 'Gold approaching resistance at $2045. Potential reversal if Fed signals hawkish stance. Support at $2025.',
    publishedAt: '2026-01-21T05:00:00Z',
    expiresAt: '2026-01-22T14:00:00Z',
    author: {
      name: 'James Cooper',
      role: 'Market Strategist',
    },
  },
];

// Get all trading signals with optional filtering
export async function getTradingSignals(assetType?: AssetType): Promise<TradingSignal[]> {
  await new Promise(resolve => setTimeout(resolve, 100));

  let signals = [...SAMPLE_SIGNALS];

  if (assetType) {
    signals = signals.filter(s => s.assetType === assetType);
  }

  // Sort by published date (newest first)
  signals.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return signals;
}

// Get active signals only
export async function getActiveSignals(assetType?: AssetType): Promise<TradingSignal[]> {
  const signals = await getTradingSignals(assetType);
  return signals.filter(s => s.status === 'active');
}

// Get a single signal by ID
export async function getSignalById(id: string): Promise<TradingSignal | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return SAMPLE_SIGNALS.find(s => s.id === id) || null;
}

// Get signals by asset
export async function getSignalsByAsset(asset: string): Promise<TradingSignal[]> {
  const signals = await getTradingSignals();
  return signals.filter(s => s.asset === asset);
}
