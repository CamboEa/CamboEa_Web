import React from 'react';
import { LessonPageClient } from '@/components/features/lesson/LessonPageClient';

export const metadata = {
  title: 'Lessons | CamboEA',
  description: 'មេរៀនជ្រើសរើសសម្រាប់ពង្រឹងចំណេះដឹងទីផ្សារ និងការជួញដូរ។',
};

export default function LessonPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-linear-to-br from-slate-800 via-slate-900 to-slate-800 text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Lessons</h1>
          <p className="mt-3 text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            រៀនតាមរយៈមេរៀនដែលបានជ្រើសរើសដោយក្រុមគ្រប់គ្រង។
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 relative z-1 pb-12 sm:pb-16">
        <LessonPageClient />
      </section>
    </main>
  );
}
