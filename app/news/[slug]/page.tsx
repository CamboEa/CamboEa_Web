// CamboEA - Individual News Article Page

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getRelatedArticles, getNewsArticles } from '@/lib/api/news';
import { NewsCard } from '@/components/features/news/NewsCard';
import { sanitizeArticleContent, isHtmlContent } from '@/lib/sanitize-article-html';
import { getDocxAsHtml } from '@/lib/docx-to-html';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  
  if (!article) {
    return { title: 'រកអត្ថបទមិនឃើញ | CamboEA' };
  }

  return {
    title: `${article.title} | CamboEA`,
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

  const docUrl = article.docxPath
    ? (article.docxPath.startsWith('http')
        ? article.docxPath
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${article.docxPath}`)
    : '';

  // Fetch DOCX and convert to HTML so we can display it on the page (no Office Online needed).
  let docxHtml: string | null = null;
  if (docUrl) {
    try {
      docxHtml = await getDocxAsHtml(docUrl);
    } catch (e) {
      console.error('Failed to load DOCX for article:', e);
    }
  }

  const getCategoryColor = (category: string) => {
    return category === 'crypto' ? 'bg-orange-500' : 'bg-green-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('km-KH', {
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
              ព័ត៌មាន
            </Link>
            <span className="text-gray-600">/</span>
            <Link href="/markets" className="text-gray-400 hover:text-white transition-colors">
              {article.category === 'crypto' ? 'គ្រីបធ័' : 'ប្តូរប្រាក់'}
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300 truncate max-w-xs">{article.title}</span>
          </div>

          {/* Category & Date */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`${getCategoryColor(article.category)} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
              {article.category === 'crypto' ? 'គ្រីបធ័' : 'ប្តូរប្រាក់'}
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
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            {/* Main Content */}
            <div className="max-w-3xl">
              {/* Featured Image */}
              {article.image && (
                <div className="relative h-64 sm:h-96 rounded-xl overflow-hidden mb-8">
                  <Image src={article.image} alt={article.title} fill className="object-cover" />
                </div>
              )}

              {/* DOCX content: display as HTML on the page (works even when file is not publicly embeddable) */}
              {article.docxPath && (
                <div className="mb-8 space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    មើលឯកសារ Word ដើម
                  </h2>
                  {docxHtml ? (
                    <div
                      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 prose prose-lg dark:prose-invert max-w-none prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-700 prose-img:rounded-lg text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: docxHtml }}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      មិនអាចដាក់បង្ហាញឯកសារបាន។ សូមទាញយកហើយបើកជាមួយ Microsoft Word។
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <a
                      href={docUrl || article.docxPath}
                      className="underline hover:text-gray-700 dark:hover:text-gray-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ទាញយកឯកសារ Word
                    </a>
                  </p>
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-700 prose-img:rounded-lg">
                {article.docxPath ? (
                  // For DOCX-backed articles, we only show the embedded viewer above.
                  // Keep a minimal fallback message or excerpt here.
                  <div
                    className="article-content text-gray-700 dark:text-gray-300"
                  >
                    <p className="leading-relaxed">
                      មាតិកាអត្ថបទនេះត្រូវបានបង្ហាញនៅក្នុងឯកសារ Word ដើមខាងលើ។
                    </p>
                  </div>
                ) : isHtmlContent(article.content || '') ? (
                  <div
                    className="article-content text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeArticleContent(article.content || ''),
                    }}
                  />
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {article.content || article.excerpt}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">ស្លាក</h3>
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

          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">អត្ថបទពាក់ព័ន្ធ</h2>
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
