import { NewsImage } from '@/components/features/news/NewsImage';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getRelatedArticles, getNewsArticles } from '@/lib/api/news';
import { NewsCard } from '@/components/features/news/NewsCard';
import { sanitizeArticleContent, isHtmlContent } from '@/lib/sanitize-article-html';
import PdfInlineViewer from '@/components/features/news/PdfInlineViewer';
import { HiOutlineChartBar } from 'react-icons/hi';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  
  if (!article) {
    return { title: 'រកអត្ថបទមិនឃើញ | CamboEA' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cambo-ea-web.vercel.app';
  const imageUrl = article.image
    ? (article.image.startsWith('http') ? article.image : `${siteUrl}${article.image}`)
    : undefined;

  return {
    title: `${article.title} | CamboEA`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      ...(imageUrl && { images: [imageUrl] }),
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
          {/* Main Content */}
          <div className="max-w-3xl mx-auto">
            <article>
              {/* Header */}
              <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                  {article.title}
                </h1>
                <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {article.excerpt}
                </p>
                <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {formatDate(article.publishedAt)}
                </p>
              </header>

              {/* Featured Image */}
              {article.image && (
                <div className="relative h-64 sm:h-96 overflow-hidden rounded-xl mb-8">
                  <NewsImage src={article.image} alt={article.title} fill className="object-cover" />
                </div>
              )}

              {/* Document content: render PDF pages full-width on the screen */}
              {article.docxPath && (
                <div className="mb-8 -mx-[calc(50vw-50%)]">
                  <div className="w-screen px-4 sm:px-6 lg:px-8">
                    {isPdf ? (
                      <PdfInlineViewer url={docUrl || article.docxPath} />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        មិនអាចដាក់បង្ហាញឯកសារបាន។ សូមទាញយកហើយបើកជាមួយកម្មវិធីដែលគាំទ្រ PDF/DOCX។
                      </p>
                    )}
                  </div>
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
              {article.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">ស្លាក</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Impact */}
              {article.impact && (
                <div className="mt-8 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 rounded-r-lg p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineChartBar className="text-amber-600 dark:text-amber-400 text-xl" />
                    <h3 className="font-bold text-amber-800 dark:text-amber-300 text-sm uppercase tracking-wide">ផលប៉ះពាល់</h3>
                  </div>
                  <p className="text-amber-900 dark:text-amber-200 text-base leading-relaxed">{article.impact}</p>
                </div>
              )}
            </article>
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
