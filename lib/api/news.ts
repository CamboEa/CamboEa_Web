// Forex & Crypto News - News API Functions

import { NewsArticle, NewsCategory, NewsFilters } from '@/types';

// Sample data - Focus: Gold (XAU/USD) and Bitcoin (BTC/USD) only
const SAMPLE_NEWS: NewsArticle[] = [
  // Bitcoin Articles
  {
    id: 'btc-1',
    slug: 'bitcoin-price-prediction-january-2026',
    title: 'Bitcoin Price Prediction: BTC Could Surge to $60,000 by End of January',
    excerpt: 'Technical analysis suggests Bitcoin is poised for a significant breakout as institutional adoption continues to grow.',
    content: 'Full article content here...',
    category: 'crypto',
    tags: ['bitcoin', 'btc', 'price-prediction', 'technical-analysis'],
    author: {
      name: 'Sarah Chen',
      role: 'Senior Crypto Analyst',
    },
    publishedAt: '2026-01-21T08:00:00Z',
    readTime: '5 min read',
    featured: true,
    prediction: {
      asset: 'BTC/USD',
      currentPrice: 52345,
      predictedPrice: 60000,
      direction: 'bullish',
      confidence: 75,
      targetDate: '2026-01-31T00:00:00Z',
    },
  },
  {
    id: 'btc-2',
    slug: 'bitcoin-institutional-adoption-2026',
    title: 'Bitcoin Institutional Adoption Reaches New Heights in 2026',
    excerpt: 'Major corporations and investment funds continue to add Bitcoin to their portfolios, driving demand.',
    content: 'Full article content here...',
    category: 'crypto',
    tags: ['bitcoin', 'btc', 'institutional', 'adoption'],
    author: {
      name: 'Michael Torres',
      role: 'Blockchain Researcher',
    },
    publishedAt: '2026-01-21T06:30:00Z',
    readTime: '6 min read',
    prediction: {
      asset: 'BTC/USD',
      currentPrice: 52345,
      predictedPrice: 55000,
      direction: 'bullish',
      confidence: 70,
      targetDate: '2026-01-25T00:00:00Z',
    },
  },
  {
    id: 'btc-3',
    slug: 'bitcoin-halving-impact-analysis',
    title: 'Bitcoin Halving Impact: What to Expect for BTC Price Tomorrow',
    excerpt: 'The upcoming Bitcoin halving event could trigger significant price movements. Here\'s our analysis.',
    content: 'Full article content here...',
    category: 'crypto',
    tags: ['bitcoin', 'btc', 'halving', 'price-prediction'],
    author: {
      name: 'Alex Kim',
      role: 'Crypto Trader',
    },
    publishedAt: '2026-01-20T14:00:00Z',
    readTime: '7 min read',
    prediction: {
      asset: 'BTC/USD',
      currentPrice: 52345,
      predictedPrice: 58000,
      direction: 'bullish',
      confidence: 68,
      targetDate: '2026-01-22T00:00:00Z',
    },
  },
  {
    id: 'btc-4',
    slug: 'bitcoin-regulation-update',
    title: 'Bitcoin Regulation Update: How New Policies Could Affect BTC Price',
    excerpt: 'Latest regulatory developments and their potential impact on Bitcoin\'s price trajectory.',
    content: 'Full article content here...',
    category: 'crypto',
    tags: ['bitcoin', 'btc', 'regulation', 'policy'],
    author: {
      name: 'Jennifer Walsh',
      role: 'Legal Analyst',
    },
    publishedAt: '2026-01-20T10:00:00Z',
    readTime: '5 min read',
    prediction: {
      asset: 'BTC/USD',
      currentPrice: 52345,
      predictedPrice: 51000,
      direction: 'bearish',
      confidence: 55,
      targetDate: '2026-01-22T00:00:00Z',
    },
  },

  // Gold Articles
  {
    id: 'gold-1',
    slug: 'gold-price-prediction-january-2026',
    title: 'Gold Price Prediction: XAU/USD Could Break $2,100 This Week',
    excerpt: 'Gold prices are showing strong momentum as inflation concerns and geopolitical tensions drive safe-haven demand.',
    content: 'Full article content here...',
    category: 'forex',
    tags: ['gold', 'xauusd', 'price-prediction', 'safe-haven'],
    author: {
      name: 'David Miller',
      role: 'Commodity Strategist',
    },
    publishedAt: '2026-01-21T07:00:00Z',
    readTime: '5 min read',
    featured: true,
    prediction: {
      asset: 'XAU/USD',
      currentPrice: 2035.50,
      predictedPrice: 2100.00,
      direction: 'bullish',
      confidence: 72,
      targetDate: '2026-01-28T00:00:00Z',
    },
  },
  {
    id: 'gold-2',
    slug: 'gold-inflation-hedge-analysis',
    title: 'Gold as Inflation Hedge: Why XAU/USD Rises When Inflation Spikes',
    excerpt: 'Understanding the relationship between gold prices and inflation, and what it means for tomorrow\'s trading.',
    content: 'Full article content here...',
    category: 'forex',
    tags: ['gold', 'xauusd', 'inflation', 'hedge'],
    author: {
      name: 'Emma Williams',
      role: 'Economic Analyst',
    },
    publishedAt: '2026-01-21T05:00:00Z',
    readTime: '6 min read',
    prediction: {
      asset: 'XAU/USD',
      currentPrice: 2035.50,
      predictedPrice: 2050.00,
      direction: 'bullish',
      confidence: 65,
      targetDate: '2026-01-22T00:00:00Z',
    },
  },
  {
    id: 'gold-3',
    slug: 'gold-federal-reserve-impact',
    title: 'Gold Alert: Federal Reserve Policy Decision Could Move XAU/USD',
    excerpt: 'The Fed\'s upcoming interest rate decision may significantly impact gold prices.',
    content: 'Full article content here...',
    category: 'forex',
    tags: ['gold', 'xauusd', 'federal-reserve', 'interest-rates'],
    author: {
      name: 'James Cooper',
      role: 'Precious Metals Analyst',
    },
    publishedAt: '2026-01-20T12:00:00Z',
    readTime: '5 min read',
    prediction: {
      asset: 'XAU/USD',
      currentPrice: 2035.50,
      predictedPrice: 2020.00,
      direction: 'bearish',
      confidence: 58,
      targetDate: '2026-01-22T00:00:00Z',
    },
  },
  {
    id: 'gold-4',
    slug: 'gold-geopolitical-tensions',
    title: 'Gold Rises on Geopolitical Tensions: XAU/USD Outlook',
    excerpt: 'Escalating geopolitical tensions are driving investors toward gold as a safe-haven asset.',
    content: 'Full article content here...',
    category: 'forex',
    tags: ['gold', 'xauusd', 'geopolitical', 'safe-haven'],
    author: {
      name: 'Robert Brown',
      role: 'Market Strategist',
    },
    publishedAt: '2026-01-20T09:00:00Z',
    readTime: '4 min read',
    prediction: {
      asset: 'XAU/USD',
      currentPrice: 2035.50,
      predictedPrice: 2045.00,
      direction: 'bullish',
      confidence: 62,
      targetDate: '2026-01-22T00:00:00Z',
    },
  },
];

// Get all news articles with optional filtering
export async function getNewsArticles(filters?: NewsFilters): Promise<NewsArticle[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  let articles = [...SAMPLE_NEWS];

  if (filters?.category) {
    articles = articles.filter(a => a.category === filters.category);
  }

  if (filters?.tag) {
    articles = articles.filter(a => a.tags.includes(filters.tag));
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    articles = articles.filter(a => 
      a.title.toLowerCase().includes(searchLower) ||
      a.excerpt.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.featured !== undefined) {
    articles = articles.filter(a => a.featured === filters.featured);
  }

  // Sort by date (newest first)
  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return articles;
}

// Get news by category
export async function getNewsByCategory(category: NewsCategory): Promise<NewsArticle[]> {
  return getNewsArticles({ category });
}

// Get a single article by slug
export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return SAMPLE_NEWS.find(a => a.slug === slug) || null;
}

// Get featured articles
export async function getFeaturedArticles(): Promise<NewsArticle[]> {
  return getNewsArticles({ featured: true });
}

// Get related articles
export async function getRelatedArticles(article: NewsArticle, limit: number = 3): Promise<NewsArticle[]> {
  const articles = await getNewsArticles({ category: article.category });
  return articles.filter(a => a.id !== article.id).slice(0, limit);
}
