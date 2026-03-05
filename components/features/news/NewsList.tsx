// Forex & Crypto News - News List Feature Component

import React from 'react';
import { NewsCard } from './NewsCard';
import { NewsArticle } from '@/types';

interface NewsListProps {
  articles: NewsArticle[];
  variant?: 'grid' | 'list';
  showFeatured?: boolean;
}

export const NewsList = ({ articles, variant = 'grid', showFeatured = true }: NewsListProps) => {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
        <p className="text-gray-600 dark:text-gray-400">Check back later for new content.</p>
      </div>
    );
  }

  const featuredArticle = showFeatured ? articles.find(a => a.featured) || articles[0] : null;
  const regularArticles = showFeatured && featuredArticle 
    ? articles.filter(a => a.id !== featuredArticle.id)
    : articles;

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} variant="compact" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Article */}
      {featuredArticle && showFeatured && (
        <div className="mb-8">
          <NewsCard article={featuredArticle} variant="featured" />
        </div>
      )}

      {/* Regular Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};
