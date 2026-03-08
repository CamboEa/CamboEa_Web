import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        ផ្ទាំងគ្រប់គ្រង
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        សូមស្វាគមន៍មកកាន់ផ្នែកគ្រប់គ្រង CamboEA។ រចនាសម្ព័ន្ធត្រៀមរួច អាចបន្ថែមម៉ូឌុលបាននៅពេលក្រោយ។
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">ព័ត៌មាន</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">គ្រប់គ្រងអត្ថបទ និងព័ត៌មាន</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">ទីផ្សារ</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">ការកំណត់ និងទិន្នន័យទីផ្សារ</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">អ្នកប្រើ</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">គ្រប់គ្រងគណនី និងសិទ្ធិ</p>
        </div>
      </div>
    </div>
  );
}
