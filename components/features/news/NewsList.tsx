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
      <div className="text-center py-20">
        <svg
          className="w-14 h-14 mx-auto text-gray-300 dark:text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">មិនមានអត្ថបទ</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">សូមពិនិត្យមើលនៅពេលក្រោយ។</p>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} variant="compact" />
        ))}
      </div>
    );
  }

  const featuredArticle = showFeatured ? articles.find(a => a.featured) || articles[0] : null;
  const remaining = showFeatured && featuredArticle
    ? articles.filter(a => a.id !== featuredArticle.id)
    : articles;

  const secondRow = remaining.slice(0, 3);
  const thirdRow = remaining.slice(3, 7);
  const restArticles = remaining.slice(7);

  return (
    <div>
      {/* Row 1: Featured story -- title+excerpt left, image right */}
      {featuredArticle && showFeatured && (
        <div className="pb-8 mb-8 border-b border-gray-200 dark:border-gray-700">
          <NewsCard article={featuredArticle} variant="featured" />
        </div>
      )}

      {/* Row 2: 3-column cards -- image top, title below */}
      {secondRow.length > 0 && (
        <div className="pb-8 mb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {secondRow.map((article) => (
              <NewsCard key={article.id} article={article} variant="default" />
            ))}
          </div>
        </div>
      )}

      {/* Row 3: 4-column smaller cards */}
      {thirdRow.length > 0 && (
        <div className="pb-8 mb-8 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {thirdRow.map((article) => (
              <NewsCard key={article.id} article={article} variant="small" />
            ))}
          </div>
        </div>
      )}

      {/* Remaining articles */}
      {restArticles.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restArticles.map((article) => (
            <NewsCard key={article.id} article={article} variant="default" />
          ))}
        </div>
      )}
    </div>
  );
};
