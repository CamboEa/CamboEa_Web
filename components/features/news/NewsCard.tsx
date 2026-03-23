import React from 'react';
import Link from 'next/link';
import { NewsImage } from './NewsImage';
import { NewsArticle } from '@/types';

interface NewsCardProps {
  article: NewsArticle;
  variant?: 'default' | 'featured' | 'compact' | 'headline' | 'small';
}

export const NewsCard = ({ article, variant = 'default' }: NewsCardProps) => {
  // Featured: text left + image right, side by side
  if (variant === 'featured') {
    return (
      <Link href={`/news/${article.slug}`} className="group block">
        <article className="grid md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 py-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight mb-4 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
              {article.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed line-clamp-4 mb-4">
              {article.excerpt}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              {article.impact && (
                <p>ផលប៉ះពាល់: {article.impact}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-8 font-semibold">{new Date(article.publishedAt).toLocaleDateString('km-KH', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="md:col-span-2 relative aspect-4/3 overflow-hidden rounded-xl">
            {article.image ? (
              <NewsImage 
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
            )}
          </div>
        </article>
      </Link>
    );
  }


  if (variant === 'default') {
    return (
      <Link href={`/news/${article.slug}`} className="group block">
        <article>
          <div className="relative aspect-3/2 overflow-hidden rounded-xl mb-3">
            {article.image ? (
              <NewsImage
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
            )}
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug line-clamp-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
            {article.excerpt}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-semibold">
            {new Date(article.publishedAt).toLocaleDateString('km-KH', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </article>
      </Link>
    );
  }

  // Small: smaller thumbnail + title, for the bottom row
  if (variant === 'small') {
    return (
      <Link href={`/news/${article.slug}`} className="group block">
        <article>
          <div className="relative aspect-video overflow-hidden rounded-xl mb-2">
            {article.image ? (
              <NewsImage
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
            )}
          </div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {article.excerpt}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-semibold">
            {new Date(article.publishedAt).toLocaleDateString('km-KH', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </article>
      </Link>
    );
  }

  // Headline: text-only list item with bottom border
  if (variant === 'headline') {
    return (
      <Link href={`/news/${article.slug}`} className="group block">
        <article className="py-3 border-b border-gray-200 dark:border-gray-700/60 last:border-b-0">
          <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(article.publishedAt).toLocaleDateString('km-KH', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </article>
      </Link>
    );
  }

  // Compact: image left + text right
  if (variant === 'compact') {
    return (
      <Link href={`/news/${article.slug}`} className="group block">
        <article className="flex gap-4 items-start">
          {article.image && (
            <div className="shrink-0 w-24 h-24 overflow-hidden relative rounded-lg">
              <NewsImage
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
          )}
          <div className="flex-1 min-w-0 py-0.5">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
              {article.title}
            </h3>
          </div>
        </article>
      </Link>
    );
  }

  return null;
};
