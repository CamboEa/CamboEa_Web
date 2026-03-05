// Forex & Crypto News - Individual News Article Page

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getRelatedArticles, getNewsArticles } from '@/lib/api/news';
import { NewsCard } from '@/components/features/news/NewsCard';
import { Card, CardContent } from '@/components/ui';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  
  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: `${article.title} | Forex & Crypto News`,
    description: article.excerpt,
  };
}

export async function generateStaticParams() {
  const articles = await getNewsArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article, 3);

  const getCategoryColor = (category: string) => {
    return category === 'crypto' ? 'bg-orange-500' : 'bg-green-500';
  };

  const getDirectionIcon = (direction: string) => {
    if (direction === 'bullish') return '↑';
    if (direction === 'bearish') return '↓';
    return '→';
  };

  const getDirectionColor = (direction: string) => {
    if (direction === 'bullish') return 'text-green-600';
    if (direction === 'bearish') return 'text-red-600';
    return 'text-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link href="/news" className="text-gray-400 hover:text-white transition-colors">
              News
            </Link>
            <span className="text-gray-600">/</span>
            <Link href={`/${article.category}`} className="text-gray-400 hover:text-white transition-colors capitalize">
              {article.category}
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300 truncate max-w-xs">{article.title}</span>
          </div>

          {/* Category & Date */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`${getCategoryColor(article.category)} text-white text-xs font-semibold px-3 py-1 rounded-full uppercase`}>
              {article.category}
            </span>
            <span className="text-gray-400">{formatDate(article.publishedAt)}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">{article.readTime}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-300 mb-8">
            {article.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {article.author.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-semibold">{article.author.name}</div>
              {article.author.role && (
                <div className="text-sm text-gray-400">{article.author.role}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Featured Image */}
              {article.image && (
                <div className="relative h-64 sm:h-96 rounded-xl overflow-hidden mb-8">
                  <Image src={article.image} alt={article.title} fill className="object-cover" />
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {article.content || article.excerpt}
                </p>
                
                {/* Placeholder content for demo */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-6">
                  This is a detailed analysis of the current market conditions and our prediction for the upcoming trading session. 
                  We've analyzed multiple technical indicators, fundamental factors, and market sentiment to provide you with 
                  actionable insights.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Key Takeaways</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Market sentiment remains cautiously optimistic</li>
                  <li>Technical indicators suggest potential breakout levels</li>
                  <li>Fundamental factors support our directional bias</li>
                  <li>Risk management is crucial in current volatility</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Technical Analysis</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our technical analysis reveals several key support and resistance levels that traders should watch. 
                  The current price action suggests a continuation pattern with the potential for significant moves 
                  in the direction of our prediction.
                </p>
              </div>

              {/* Tags */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Prediction Card */}
              {article.prediction && (
                <Card variant="bordered" className="sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Price Prediction
                    </h3>

                    <div className="space-y-4">
                      {/* Asset */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Asset</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{article.prediction.asset}</span>
                      </div>

                      {/* Direction */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Direction</span>
                        <span className={`font-semibold flex items-center gap-1 ${getDirectionColor(article.prediction.direction)}`}>
                          {getDirectionIcon(article.prediction.direction)}
                          <span className="capitalize">{article.prediction.direction}</span>
                        </span>
                      </div>

                      {/* Current Price */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Current Price</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ${article.prediction.currentPrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Predicted Price */}
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Target Price</span>
                        <span className={`font-bold text-lg ${getDirectionColor(article.prediction.direction)}`}>
                          ${article.prediction.predictedPrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Confidence */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Confidence</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{article.prediction.confidence}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${article.prediction.confidence >= 70 ? 'bg-green-500' : article.prediction.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${article.prediction.confidence}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Target Date */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Target Date</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(article.prediction.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      * This prediction is for informational purposes only and should not be considered financial advice.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
