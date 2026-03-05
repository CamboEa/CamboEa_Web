// Forex & Crypto News - News Card Feature Component

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui';
import { NewsArticle } from '@/types';

interface NewsCardProps {
  article: NewsArticle;
  variant?: 'default' | 'featured' | 'compact';
}

export const NewsCard = ({ article, variant = 'default' }: NewsCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      crypto: 'bg-orange-500',
      forex: 'bg-green-500',
    };
    return colors[category] || 'bg-blue-500';
  };

  const getDirectionColor = (direction: string) => {
    const colors: Record<string, string> = {
      bullish: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      bearish: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      neutral: 'text-gray-600 bg-gray-100 dark:bg-gray-700',
    };
    return colors[direction] || colors.neutral;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (variant === 'compact') {
    return (
      <Link href={`/news/${article.slug}`}>
        <Card variant="bordered" className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="shrink-0 w-20 h-20 bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg overflow-hidden relative">
                {article.image ? (
                  <Image src={article.image} alt={article.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`${getCategoryColor(article.category)} text-white text-xs font-bold px-2 py-1 rounded`}>
                      {article.category.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatDate(article.publishedAt)}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/news/${article.slug}`}>
        <Card variant="bordered" className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
          {/* Image */}
          <div className="relative h-64 bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
            {article.image ? (
              <Image src={article.image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : null}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-4 left-4">
              <span className={`${getCategoryColor(article.category)} text-white text-xs font-semibold px-3 py-1 rounded-full uppercase`}>
                {article.category}
              </span>
            </div>
            {article.prediction && (
              <div className="absolute top-4 right-4">
                <span className={`${getDirectionColor(article.prediction.direction)} text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1`}>
                  {article.prediction.direction === 'bullish' && '↑'}
                  {article.prediction.direction === 'bearish' && '↓'}
                  {article.prediction.direction === 'neutral' && '→'}
                  {article.prediction.asset}
                </span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
                {article.title}
              </h2>
            </div>
          </div>

          <CardContent className="p-6">
            <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
              {article.excerpt}
            </p>

            {/* Prediction Info */}
            {article.prediction && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Price Prediction</span>
                  <span className={`font-semibold ${article.prediction.direction === 'bullish' ? 'text-green-600' : article.prediction.direction === 'bearish' ? 'text-red-600' : 'text-gray-600'}`}>
                    ${article.prediction.predictedPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Confidence: {article.prediction.confidence}%</span>
                  <span>Target: {formatDate(article.prediction.targetDate)}</span>
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {article.author.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{article.author.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(article.publishedAt)}</div>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{article.readTime}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/news/${article.slug}`}>
      <Card variant="bordered" className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
        {/* Image */}
        <div className="relative h-48 bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
          {article.image ? (
            <Image src={article.image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : null}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
          <div className="absolute top-3 left-3">
            <span className={`${getCategoryColor(article.category)} text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase`}>
              {article.category}
            </span>
          </div>
          {article.prediction && (
            <div className="absolute top-3 right-3">
              <span className={`${getDirectionColor(article.prediction.direction)} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                {article.prediction.direction === 'bullish' && '↑'}
                {article.prediction.direction === 'bearish' && '↓'}
                {article.prediction.direction === 'neutral' && '→'}
                {Math.round(article.prediction.confidence)}%
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>{article.author.name}</span>
              <span>•</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <span>{article.readTime}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
