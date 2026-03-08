// CamboEA - News Type Definitions

export type NewsCategory = 'crypto' | 'forex';

export type PredictionDirection = 'bullish' | 'bearish' | 'neutral';

export interface PricePrediction {
  asset: string;           // e.g., "BTC/USD", "EUR/USD"
  currentPrice: number;
  predictedPrice: number;
  direction: PredictionDirection;
  confidence: number;      // 0-100 percentage
  targetDate: string;      // ISO date string for prediction target
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
