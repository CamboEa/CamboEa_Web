// CamboEA - Individual News Article Page

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getRelatedArticles, getNewsArticles } from '@/lib/api/news';
import { NewsCard } from '@/components/features/news/NewsCard';


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

              {/* Article Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {article.content || article.excerpt}
                </p>
                
                {/* Placeholder content for demo */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-6">
                  នេះគឺជាការវិភាគលម្អិតអំពីស្ថានភាពទីផ្សារបច្ចុប្បន្ន និងការព្យាករណ៍របស់យើងសម្រាប់វគ្គធ្វើដូចខាងមុខ។ 
                  យើងបានវិភាគសូចនាករបច្ចេកទេសច្រើន កត្តាមូលដ្ឋាន និងអារម្មណ៍ទីផ្សារដើម្បីផ្តល់ឱ្យអ្នកនូវ 
                  ការយល់ដឹងអាចអនុវត្តបាន។
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">ចំណុចសំខាន់</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>អារម្មណ៍ទីផ្សារនៅតែមានការសង្ឃឹមដោយប្រុងប្រយ័ត្ន</li>
                  <li>សូចនាករបច្ចេកទេសបង្ហាញកម្រិត breakout ដែលអាចមាន</li>
                  <li>កត្តាមូលដ្ឋានគាំទ្រទិសដៅរបស់យើង</li>
                  <li>ការគ្រប់គ្រងហានិភ័យមានសារៈសំខាន់ក្នុងភាពចល័តបច្ចុប្បន្ន</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">ការវិភាគបច្ចេកទេស</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  ការវិភាគបច្ចេកទេសរបស់យើងបង្ហាញកម្រិតគាំទ្រ និងការរារែកសំខាន់ៗជាច្រើនដែលអ្នកធ្វើដូចគួរតាមដាន។ 
                  សកម្មភាពតម្លៃបច្ចុប្បន្នបង្ហាញពីលទ្ធផលបន្តដោយមានសក្តានុពលចលនាខ្លាំង 
                  ក្នុងទិសដៅការព្យាករណ៍របស់យើង។
                </p>
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
