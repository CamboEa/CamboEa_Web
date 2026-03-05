// Forex & Crypto News - News Listing Page

import React from 'react';
import Link from 'next/link';
import { getNewsArticles } from '@/lib/api/news';
import { NewsList } from '@/components/features/news/NewsList';

export const metadata = {
  title: 'Latest News | Forex & Crypto News',
  description: 'Stay updated with the latest forex and cryptocurrency news, price predictions, and market analysis.',
};

export default async function NewsPage() {
  const articles = await getNewsArticles();
  const cryptoArticles = articles.filter(a => a.category === 'crypto').slice(0, 3);
  const forexArticles = articles.filter(a => a.category === 'forex').slice(0, 3);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">     
      {/* All Latest News */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Latest News</h2>
          </div>
          <NewsList articles={articles} showFeatured={true} />
        </div>
      </section>

      {/* Crypto Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">CRYPTO</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cryptocurrency News</h2>
            </div>
            <Link href="/crypto" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <NewsList articles={cryptoArticles} showFeatured={false} />
        </div>
      </section>

      {/* Forex Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">FOREX</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forex News</h2>
            </div>
            <Link href="/forex" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <NewsList articles={forexArticles} showFeatured={false} />
        </div>
      </section>
    </main>
  );
}
