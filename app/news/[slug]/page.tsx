// CamboEA - Individual News Article Page

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getRelatedArticles, getNewsArticles } from '@/lib/api/news';
import { NewsCard } from '@/components/features/news/NewsCard';
import { sanitizeArticleContent, isHtmlContent } from '@/lib/sanitize-article-html';
import PdfInlineViewer from '@/components/features/news/PdfInlineViewer';

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
    openGraph: {
      title: article.title,
      description: article.excerpt,
      ...(article.image && { images: [{ url: article.image }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      ...(article.image && { images: [article.image] }),
    },
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

  const docUrl = article.docxPath
    ? (article.docxPath.startsWith('http')
        ? article.docxPath
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${article.docxPath}`)
    : '';

  const isPdf = docUrl.toLowerCase().endsWith('.pdf');

  const relatedArticles = await getRelatedArticles(article, 3);

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
      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            {/* Main Content */}
            <div className="max-w-3xl">
              {/* Featured Image */}
              {article.image && (
                <div className="relative h-64 sm:h-96 overflow-hidden mb-8">
                  <Image src={article.image} alt={article.title} fill className="object-cover" />
                </div>
              )}

              {/* Document content: render PDF pages directly on the page */}
              {article.docxPath && (
                <div className="mb-8">
                  {isPdf ? (
                    <PdfInlineViewer url={docUrl || article.docxPath} />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      មិនអាចដាក់បង្ហាញឯកសារបាន។ សូមទាញយកហើយបើកជាមួយកម្មវិធីដែលគាំទ្រ PDF/DOCX។
                    </p>
                  )}
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-700 prose-img:rounded-lg">
                {article.docxPath ? (
                  // For DOCX/PDF-backed articles, the main content is shown in the embedded document above.
                  null
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
