import React from 'react';
import { LessonPageClient } from '@/components/features/lesson/LessonPageClient';

export const metadata = {
  title: 'Lessons | CamboEA',
  description: 'មេរៀនជ្រើសរើសសម្រាប់ពង្រឹងចំណេះដឹងទីផ្សារ និងការជួញដូរ។',
};

export default function LessonPage() {
  return (
    <main className="min-h-screen dark:bg-gray-950">
      <section className="bg-linear-to-br from-slate-800 via-slate-900 to-slate-800 text-white py-10 sm:py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Lessons</h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-2xl">
            រៀនតាមរយៈមេរៀនដែលបានជ្រើសរើសដោយក្រុមគ្រប់គ្រង។
          </p>
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 relative z-1 mb-15">
        <LessonPageClient />
      </section>
    </main>
  );
}
