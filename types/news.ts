// Forex & Crypto News - News Type Definitions

export type NewsCategory = 'crypto' | 'forex';

export type PredictionDirection = 'bullish' | 'bearish' | 'neutral';

export type SignalStatus = 'active' | 'hit_tp' | 'hit_sl' | 'expired' | 'pending';

export type AssetType = 'crypto' | 'forex';

export interface PricePrediction {
  asset: string;           // e.g., "BTC/USD", "EUR/USD"
  currentPrice: number;
  predictedPrice: number;
  direction: PredictionDirection;
  confidence: number;      // 0-100 percentage
  targetDate: string;      // ISO date string for prediction target
}

export interface TradingSignal {
  id: string;
  asset: string;           // e.g., "BTC/USD", "EUR/USD"
  assetType: AssetType;
  direction: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2?: number;
  takeProfit3?: number;
  currentPrice: number;
  riskRewardRatio: number;
  confidence: number;      // 0-100 percentage
  status: SignalStatus;
  analysis: string;        // Brief analysis/reason for the trade
  publishedAt: string;
  expiresAt: string;       // When the signal expires
  author: {
    name: string;
    role?: string;
  };
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  publishedAt: string;     // ISO date string
  updatedAt?: string;
  readTime: string;        // e.g., "5 min read"
  image?: string;
  featured?: boolean;
  prediction?: PricePrediction;
}

export interface NewsFilters {
  category?: NewsCategory;
  tag?: string;
  search?: string;
  featured?: boolean;
}
