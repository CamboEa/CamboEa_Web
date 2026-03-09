// CamboEA - News API Functions (Supabase-backed, with SAMPLE_NEWS fallback)

import { createClient } from '@supabase/supabase-js';
import { NewsArticle, NewsCategory, NewsFilters } from '@/types';

// World news that impacts currencies, gold, and crypto (fallback when no data file)
export const SAMPLE_NEWS: NewsArticle[] = [
  {
    id: 'btc-1',
    slug: 'fed-interest-rate-decision-january-2026',
    title: 'ធនាគារកណ្តាលសហរដ្ឋអាមេរិករក្សាអត្រាការប្រាក់ — ឥទ្ធិពលដល់ដុល្លារ មាស និងគ្រីបធ័',
    excerpt: 'ការសម្រេចចិត្តរបស់ Fed កាលពីថ្ងៃនេះធ្វើឱ្យដុល្លាររឹងមាំ មាសទទួលឥទ្ធិពល និង Bitcoin រញ៉េរញ៉ៃ។',
    content: 'Full article content here...',
    category: 'crypto',
    tags: ['fed', 'interest-rates', 'usd', 'bitcoin', 'gold'],
    author: {
      name: 'Sarah Chen',
    },
    publishedAt: '2026-01-21T08:00:00Z',
    readTime: '៥ នាទីអាន',
    featured: true,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
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
    slug: 'european-central-bank-rate-cut-signal',
    title: 'ធនាគារកណ្តាលអឺរ៉ុបផ្តល់សញ្ញាកាត់បន្ថយអត្រា — EUR/USD និងទីផ្សារគ្រីបធ័',
    excerpt: 'ECB បង្ហាញថាអាចកាត់បន្ថយអត្រាការប្រាក់នាពេលខាងមុខ ធ្វើឱ្យអឺរ៉ុបខ្សោយ និងផ្តល់ឥទ្ធិពលដល់គូប្រាក់។',
    content: 'Full article content here...',
    category: 'crypto',
    tags: ['ecb', 'euro', 'eur-usd', 'interest-rates'],
    author: {
      name: 'Michael Torres',
    },
    publishedAt: '2026-01-21T06:30:00Z',
    readTime: '៦ នាទីអាន',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
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
    slug: 'geopolitical-tensions-middle-east-oil-gold',
    title: 'ភាពតានតឹងភូមិសាស្រ្តកើនឡើងនៅដើម្បីកើត — ឥទ្ធិពលដល់ប្រេង មាស និងទីផ្សារហានិភ័យ',
    excerpt: 'ជម្លោះនៅដើម្បីកើតធ្វើឱ្យតម្លៃប្រេងកើន មាសឡើងជាទ្រព្យការពារ និងគ្រីបធ័រញ៉េរញ៉ៃ។',
    content: 'Full article content here...',
    category: 'crypto',
    tags: ['geopolitical', 'oil', 'gold', 'safe-haven', 'bitcoin'],
    author: {
      name: 'Alex Kim',
    },
    publishedAt: '2026-01-20T14:00:00Z',
    readTime: '៧ នាទីអាន',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
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
    slug: 'global-crypto-regulation-mica-europe',
    title: 'ការគ្រប់គ្រងគ្រីបធ័សកល (MiCA) នៅអឺរ៉ុប — ឥទ្ធិពលដល់ BTC និងគូប្រាក់',
    excerpt: 'ច្បាប់ថ្មីរបស់អឺរ៉ុបចំពោះគ្រីបធ័ផ្តល់ឥទ្ធិពលដល់ទីផ្សារ និងអត្រាប្តូរប្រាក់ដុល្លារ។',
    content: 'Full article content here...',
    category: 'crypto',
    tags: ['regulation', 'mica', 'europe', 'bitcoin', 'crypto'],
    author: {
      name: 'Jennifer Walsh',
    },
    publishedAt: '2026-01-20T10:00:00Z',
    readTime: '៥ នាទីអាន',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    prediction: {
      asset: 'BTC/USD',
      currentPrice: 52345,
      predictedPrice: 51000,
      direction: 'bearish',
      confidence: 55,
      targetDate: '2026-01-22T00:00:00Z',
    },
  },

  {
    id: 'gold-1',
    slug: 'us-inflation-data-cpi-january-2026',
    title: 'ទិន្នន័យអតិផរណាសហរដ្ឋអាមេរិកលើសក expectations — ឥទ្ធិពលដល់ដុល្លារ មាស និងធនធាន',
    excerpt: 'CPI ខែមករាខ្ពស់ជាងការរំពឹងទុក ធ្វើឱ្យដុល្លាររឹងមាំ មាសឡើងជាការការពារ និងគ្រីបធ័ទទួលឥទ្ធិពល។',
    content: 'Full article content here...',
    category: 'forex',
    tags: ['inflation', 'cpi', 'usd', 'gold', 'fed'],
    author: {
      name: 'David Miller',
    },
    publishedAt: '2026-01-21T07:00:00Z',
    readTime: '៥ នាទីអាន',
    featured: true,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
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
    slug: 'china-stimulus-economy-commodities-yuan',
    title: 'ចិនចេញវិធានការលូតលាស់សេដ្ឋកិច្ច — ឥទ្ធិពលដល់យ័ន វីជី មាស និងទីផ្សារហានិភ័យ',
    excerpt: 'ការលូតលាស់វិធានការរបស់ចិនផ្តល់ឥទ្ធិពលដល់យ័ន វីជី មាស និងអារម្មណ៍ទីផ្សារសកល។',
    content: 'Full article content here...',
    category: 'forex',
    tags: ['china', 'stimulus', 'yuan', 'commodities', 'gold'],
    author: {
      name: 'Emma Williams',
    },
    publishedAt: '2026-01-21T05:00:00Z',
    readTime: '៦ នាទីអាន',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
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
    slug: 'us-nfp-jobs-report-january-2026',
    title: 'របាយការណ៍ការងារសហរដ្ឋអាមេរិក (NFP) ខ្លាំង — ដុល្លារ អត្រាការប្រាក់ និងមាស',
    excerpt: 'NFP ខ្លាំងជាងការរំពឹងទុក ធ្វើឱ្យដុល្លារឡើង អត្រាការប្រាក់ Fed រក្សា និងមាសទទួលឥទ្ធិពលអវិជ្ជមាន។',
    content: 'Full article content here...',
    category: 'forex',
    tags: ['nfp', 'jobs', 'usd', 'fed', 'gold'],
    author: {
      name: 'James Cooper',
    },
    publishedAt: '2026-01-20T12:00:00Z',
    readTime: '៥ នាទីអាន',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
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
    slug: 'dollar-strength-emerging-markets-currencies',
    title: 'ភាពរឹងមាំរបស់ដុល្លារ និងគូប្រាក់ទីផ្សារកើនឡើង — USD/THB, USD/KHR, មាស',
    excerpt: 'ដុល្លាររឹងមាំធ្វើឱ្យគូប្រាក់នៅអាស៊ីអាគ្នេយ៍ និងទ្រព្យស refuge ដូចជាមាស ទទួលឥទ្ធិពល។',
    content: 'Full article content here...',
    category: 'forex',
    tags: ['usd', 'dxy', 'emerging-markets', 'gold', 'currencies'],
    author: {
      name: 'Robert Brown',
    },
    publishedAt: '2026-01-20T09:00:00Z',
    readTime: '៤ នាទីអាន',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
    prediction: {
      asset: 'XAU/USD',
      currentPrice: 2035.50,
      predictedPrice: 2045.00,
      direction: 'bullish',
      confidence: 62,
      targetDate: '2026-01-22T00:00:00Z',
    },
  },
  {
    id: 'docx-sample-1',
    slug: 'geopolitical-polycrisis-operation-epic-fury',
    title:
      'The Geopolitical Polycrisis of 2026: Operation Epic Fury and the Transformation of Global Market Psychology',
    excerpt:
      'Sample article rendered directly from a DOCX file so you can preview the exact document formatting inside the CamboEA news layout.',
    content: '',
    docxPath:
      '/mock_data/The Geopolitical Polycrisis of 2026_ Operation Epic Fury and the Transformation of Global Market Psychology.docx',
    category: 'forex',
    tags: ['sample', 'docx', 'geopolitics'],
    author: {
      name: 'CamboEA Research',
    },
    publishedAt: '2026-01-22T08:00:00Z',
    readTime: '១០ នាទីអាន',
    featured: false,
  },
];

function getSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

async function fetchNewsFromSupabase(): Promise<NewsArticle[] | null> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('news')
    .select(
      'id, slug, title, excerpt, content, impact, category, tags, author_name, published_at, updated_at, read_time, image, featured, prediction, docx_path'
    )
    .order('published_at', { ascending: false });

  if (error || !data) {
    console.error('Failed to fetch news from Supabase:', error?.message);
    return null;
  }

  return data.map((row: any): NewsArticle => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content ?? '',
    impact: row.impact ?? undefined,
    category: row.category as NewsCategory,
    tags: Array.isArray(row.tags) ? row.tags : [],
    author: {
      name: row.author_name ?? 'Admin',
    },
    publishedAt: row.published_at,
    updatedAt: row.updated_at ?? undefined,
    readTime: row.read_time ?? '៥ នាទីអាន',
    image: row.image ?? undefined,
    featured: !!row.featured,
    prediction: row.prediction ?? undefined,
    docxPath: row.docx_path ?? undefined,
  }));
}

// Get current articles (from Supabase or fallback to sample)
export async function getCurrentArticles(): Promise<NewsArticle[]> {
  const fromSupabase = await fetchNewsFromSupabase();
  if (fromSupabase && fromSupabase.length > 0) {
    return fromSupabase;
  }

  // Fallback to SAMPLE_NEWS when Supabase is not configured or empty
  return [...SAMPLE_NEWS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

// Get all news articles with optional filtering
export async function getNewsArticles(filters?: NewsFilters): Promise<NewsArticle[]> {
  await new Promise(resolve => setTimeout(resolve, 50));

  let articles = await getCurrentArticles();

  if (filters?.category) {
    articles = articles.filter(a => a.category === filters.category);
  }

  if (filters?.tag) {
    const tag = filters.tag;
    articles = articles.filter(a => a.tags.includes(tag));
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

  return articles;
}

// Get news by category
export async function getNewsByCategory(category: NewsCategory): Promise<NewsArticle[]> {
  return getNewsArticles({ category });
}

// Get world news that impacts markets (currencies, gold, crypto)
export async function getNewsByMarkets(): Promise<NewsArticle[]> {
  const articles = await getNewsArticles();
  return articles.filter(a => a.category === 'forex' || a.category === 'crypto');
}

// Get a single article by slug
export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const supabase = getSupabasePublicClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('news')
      .select(
        'id, slug, title, excerpt, content, impact, category, tags, author_name, published_at, updated_at, read_time, image, featured, prediction, docx_path'
      )
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content ?? '',
        impact: data.impact ?? undefined,
        category: data.category as NewsCategory,
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: {
          name: data.author_name ?? 'Admin',
        },
        publishedAt: data.published_at,
        updatedAt: data.updated_at ?? undefined,
        readTime: data.read_time ?? '៥ នាទីអាន',
        image: data.image ?? undefined,
        featured: !!data.featured,
        prediction: data.prediction ?? undefined,
        docxPath: data.docx_path ?? undefined,
      };
    }
  }

  // Fallback: also check SAMPLE_NEWS explicitly
  const fromSample = SAMPLE_NEWS.find(a => a.slug === slug);
  if (fromSample) return fromSample;

  // As a final fallback, search the composed current articles (may include samples)
  const articles = await getCurrentArticles();
  return articles.find(a => a.slug === slug) || null;
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
