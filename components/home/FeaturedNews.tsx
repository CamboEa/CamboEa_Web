import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui';

interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image?: string;
  readTime: string;
}

const FEATURED_NEWS: NewsArticle[] = [
  {
    id: 'btc-1',
    slug: 'fed-interest-rate-decision-january-2026',
    title: 'ធនាគារកណ្តាលសហរដ្ឋអាមេរិករក្សាអត្រាការប្រាក់ — ឥទ្ធិពលដល់ដុល្លារ មាស និងគ្រីបធ័',
    excerpt: 'ការសម្រេចចិត្តរបស់ Fed ធ្វើឱ្យដុល្លាររឹងមាំ មាសទទួលឥទ្ធិពល និង Bitcoin រញ៉េរញ៉ៃ។',
    category: 'គ្រីបធ័',
    date: '2026-01-21',
    readTime: '៥ នាទីអាន',
  },
  {
    id: 'gold-1',
    slug: 'us-inflation-data-cpi-january-2026',
    title: 'ទិន្នន័យអតិផរណាសហរដ្ឋអាមេរិកលើសក expectations — ឥទ្ធិពលដល់ដុល្លារ មាស និងគ្រីបធ័',
    excerpt: 'CPI ខ្ពស់ជាងការរំពឹងទុក ធ្វើឱ្យដុល្លាររឹងមាំ មាសឡើងជាការការពារ។',
    category: 'ប្តូរប្រាក់',
    date: '2026-01-21',
    readTime: '៥ នាទីអាន',
  },
  {
    id: 'btc-3',
    slug: 'geopolitical-tensions-middle-east-oil-gold',
    title: 'ភាពតានតឹងភូមិសាស្រ្តកើនឡើងនៅដើម្បីកើត — ឥទ្ធិពលដល់ប្រេង មាស និងទីផ្សារ',
    excerpt: 'ជម្លោះនៅដើម្បីកើតធ្វើឱ្យតម្លៃប្រេងកើន មាសឡើងជាទ្រព្យការពារ និងគ្រីបធ័រញ៉េរញ៉ៃ។',
    category: 'គ្រីបធ័',
    date: '2026-01-20',
    readTime: '៧ នាទីអាន',
  },
  {
    id: 'btc-2',
    slug: 'european-central-bank-rate-cut-signal',
    title: 'ធនាគារកណ្តាលអឺរ៉ុបផ្តល់សញ្ញាកាត់បន្ថយអត្រា — EUR/USD និងទីផ្សារ',
    excerpt: 'ECB បង្ហាញថាអាចកាត់បន្ថយអត្រាការប្រាក់ ធ្វើឱ្យអឺរ៉ុបខ្សោយ និងផ្តល់ឥទ្ធិពលដល់គូប្រាក់។',
    category: 'ទីផ្សារ',
    date: '2026-01-21',
    readTime: '៦ នាទីអាន',
  },
];

export const FeaturedNews = () => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'គ្រីបធ័': 'bg-orange-500',
      'ប្តូរប្រាក់': 'bg-green-500',
      'ទីផ្សារ': 'bg-blue-500',
      'ការវិភាគ': 'bg-sky-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              ព័ត៌មានពិសេស
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              ព័ត៌មានពិភពលោកដែលផ្តល់ឥទ្ធិពលដល់គូប្រាក់ មាស និងគ្រីបធ័
            </p>
          </div>
          <Link
            href="/news"
            className="mt-4 sm:mt-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center gap-2 group"
          >
            មើលព័ត៌មានទាំងអស់
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_NEWS.map((article, index) => (
            <Link href={`/news/${article.slug}`} key={article.id}>
              <Card
                variant="bordered"
                className={`h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                {/* Image Placeholder */}
                <div className={`bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 ${
                  index === 0 ? 'h-64' : 'h-48'
                } rounded-t-lg relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`${getCategoryColor(article.category)} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                      {article.category}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(article.date).toLocaleDateString('km-KH', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className={`font-bold text-gray-900 dark:text-white mb-2 ${
                    index === 0 ? 'text-2xl' : 'text-lg'
                  } line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                    {article.title}
                  </h3>

                  <p className={`text-gray-600 dark:text-gray-400 ${
                    index === 0 ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'
                  }`}>
                    {article.excerpt}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
