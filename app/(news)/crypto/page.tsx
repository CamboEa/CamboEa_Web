// CamboEA - Crypto News Route Group

import React from 'react';
import Link from 'next/link';
import { getNewsByCategory } from '@/lib/api/news';
import { NewsList } from '@/components/features/news/NewsList';

export const metadata = {
  title: 'Cryptocurrency News | CamboEA',
  description: 'Latest cryptocurrency news, Bitcoin price predictions, Ethereum analysis, and altcoin market updates.',
};

export default async function CryptoNewsPage() {
  const articles = await getNewsByCategory('crypto');

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* News List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Latest Crypto News & Price Predictions
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {articles.length} articles
            </div>
          </div>
          <NewsList articles={articles} showFeatured={true} />
        </div>
      </section>

      {/* Popular Tags */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Topics</h3>
          <div className="flex flex-wrap gap-2">
            {['Bitcoin', 'Ethereum', 'Solana', 'XRP', 'DeFi', 'NFT', 'Altcoins', 'Trading', 'Technical Analysis', 'Price Prediction'].map(tag => (
              <span
                key={tag}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
