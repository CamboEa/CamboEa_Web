import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image?: string;
  readTime: string;
}

const FEATURED_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'Bitcoin Surges Past $50K as Institutional Adoption Grows',
    excerpt: 'Major financial institutions continue to embrace cryptocurrency, driving Bitcoin to new heights in 2026.',
    category: 'Crypto',
    date: '2026-01-21',
    readTime: '5 min read',
  },
  {
    id: '2',
    title: 'EUR/USD Analysis: ECB Policy Decision Impact',
    excerpt: 'European Central Bank\'s latest monetary policy decision creates significant movements in currency markets.',
    category: 'Forex',
    date: '2026-01-21',
    readTime: '4 min read',
  },
  {
    id: '3',
    title: 'Ethereum 3.0 Upgrade: What Investors Need to Know',
    excerpt: 'Comprehensive analysis of the upcoming Ethereum upgrade and its implications for the crypto ecosystem.',
    category: 'Crypto',
    date: '2026-01-20',
    readTime: '6 min read',
  },
  {
    id: '4',
    title: 'Global Market Outlook: Forex Trends for Q1 2026',
    excerpt: 'Expert predictions and analysis of major currency pairs for the first quarter of 2026.',
    category: 'Markets',
    date: '2026-01-20',
    readTime: '7 min read',
  },
];

export const FeaturedNews = () => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Crypto: 'bg-orange-500',
      Forex: 'bg-green-500',
      Markets: 'bg-blue-500',
      Analysis: 'bg-purple-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Featured News
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Latest updates from the world of forex and crypto
            </p>
          </div>
          <Link
            href="/news"
            className="mt-4 sm:mt-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center gap-2 group"
          >
            View All News
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_NEWS.map((article, index) => (
            <Link href={`/news/${article.id}`} key={article.id}>
              <Card
                variant="bordered"
                className={`h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                {/* Image Placeholder */}
                <div className={`bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 ${
                  index === 0 ? 'h-64' : 'h-48'
                } rounded-t-lg relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`${getCategoryColor(article.category)} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                      {article.category}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className={`font-bold text-gray-900 dark:text-white mb-2 ${
                    index === 0 ? 'text-2xl' : 'text-lg'
                  } line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                    {article.title}
                  </h3>

                  <p className={`text-gray-600 dark:text-gray-400 ${
                    index === 0 ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'
                  }`}>
                    {article.excerpt}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
