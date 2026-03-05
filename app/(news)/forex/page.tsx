// Forex & Crypto News - Forex News Route Group

import React from 'react';
import Link from 'next/link';
import { getNewsByCategory } from '@/lib/api/news';
import { NewsList } from '@/components/features/news/NewsList';

export const metadata = {
  title: 'Forex News | Forex & Crypto News',
  description: 'Latest forex news, currency pair analysis, price predictions, and trading insights for EUR/USD, GBP/USD, USD/JPY and more.',
};

export default async function ForexNewsPage() {
  const articles = await getNewsByCategory('forex');

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* News List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Latest Forex News & Price Predictions
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {articles.length} articles
            </div>
          </div>
          <NewsList articles={articles} showFeatured={true} />
        </div>
      </section>

      {/* Popular Currency Pairs */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Currency Pairs</h3>
          <div className="flex flex-wrap gap-2">
            {['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'].map(pair => (
              <span
                key={pair}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors"
              >
                {pair}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trading Topics */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trading Topics</h3>
          <div className="flex flex-wrap gap-2">
            {['Central Banks', 'ECB', 'Federal Reserve', 'BOJ', 'Interest Rates', 'Inflation', 'Technical Analysis', 'Economic Calendar', 'NFP', 'GDP'].map(topic => (
              <span
                key={topic}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
