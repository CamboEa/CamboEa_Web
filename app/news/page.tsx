import React from 'react';
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
      {/* Page header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            ព័ត៌មានពិភពលោក
          </h1>
          <p className="mt-3 max-w-3xl text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            តាមដានព័ត៌មានសំខាន់ៗដែលមានឥទ្ធិពលលើទីផ្សារ ប្តូរប្រាក់ មាស និងគ្រីបធ័។
          </p>
        </div>
      </div>

      {/* Articles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <NewsList articles={articles} showFeatured={true} />
      </section>
    </main>
  );
}
