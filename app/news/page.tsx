// CamboEA - News Listing Page

import React from 'react';
import Link from 'next/link';
import { getNewsArticles } from '@/lib/api/news';
import { NewsList } from '@/components/features/news/NewsList';

export const metadata = {
  title: 'ព័ត៌មានពិភពលោក | CamboEA',
  description: 'ព័ត៌មានពិភពលោកដែលអាចផ្តល់ឥទ្ធិពលដល់គូប្រាក់ មាស និងគ្រីបធ័។ នៅដែលទាន់ពេលជាមួយព្រឹត្តិការណ៍សកល និងការវិភាគ។',
};

export default async function NewsPage() {
  const articles = await getNewsArticles();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ព័ត៌មានពិភពលោក</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-right">
              ព្រឹត្តិការណ៍ដែលអាចផ្តល់ឥទ្ធិពលដល់គូប្រាក់ មាស និងគ្រីបធ័
            </p>
          </div>
          <div className="mb-6 flex justify-end">
            <Link href="/markets" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
              មើលតាមចំណាត់ថ្នាក់ទីផ្សារ →
            </Link>
          </div>
          <NewsList articles={articles} showFeatured={true} />
        </div>
      </section>
    </main>
  );
}
