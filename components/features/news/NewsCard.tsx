// CamboEA - News Card Feature Component

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
  const CATEGORY_LABELS: Record<string, string> = { crypto: 'គ្រីបធ័', forex: 'ប្តូរប្រាក់' };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('km-KH', {
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

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{formatDate(article.publishedAt)}</span>
              <span>{article.readTime}</span>
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
            <span>{formatDate(article.publishedAt)}</span>
            <span>{article.readTime}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
