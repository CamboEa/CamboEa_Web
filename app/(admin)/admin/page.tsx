import React from 'react';
import Link from 'next/link';

const SITE_SECTIONS = [
  { href: '/news', label: 'ព័ត៌មាន', description: 'ព័ត៌មានចុងក្រោយ និងអត្ថបទផ្សាយ' },
  { href: '/markets', label: 'ទីផ្សារ', description: 'ទិដ្ឋភាពទីផ្សារ Forex, Metals, Crypto' },
  { href: '/calendar', label: 'ប្រតិទិនសេដ្ឋកិច្ច', description: 'ព្រឹត្តិការណ៍សេដ្ឋកិច្ចសប្តាហ៍' },
  { href: '/analysis', label: 'ការវិភាគ', description: 'ការវិភាគទីផ្សារ និងតម្លៃ' },
  { href: '/ea-trading-bot', label: 'EA Trading Bot', description: 'ព័ត៌មាន EA Bot (មកដល់ឆាប់ៗ)' },
  { href: '/about', label: 'អំពីយើង', description: 'ព័ត៌មានក្រុមហ៊ុន' },
  { href: '/contact', label: 'ទំនាក់ទំនង', description: 'ទំនាក់ទំនងជាមួយយើង' },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        ផ្ទាំងគ្រប់គ្រង
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        សូមស្វាគមន៍មកកាន់ផ្នែកគ្រប់គ្រង CamboEA។ ទិដ្ឋភាពទូទៅគេហទំព័រ។
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ទិដ្ឋភាពទូទៅគេហទំព័រ
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SITE_SECTIONS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {item.label}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
              <span className="inline-block mt-2 text-xs text-blue-600 dark:text-blue-400">
                មើលគេហទំព័រ →
              </span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          គ្រប់គ្រងខ្លឹមសារ
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/news"
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">ព័ត៌មាន</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">គ្រប់គ្រងអត្ថបទ និងព័ត៌មាន</p>
          </Link>
          <Link
            href="/admin/users"
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">អ្នកប្រើ</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">គណនី និងសិទ្ធិ</p>
          </Link>
          <Link
            href="/admin/ea-bot"
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">EA Bot Management</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">គ្រប់គ្រង EA Trading Bot</p>
          </Link>
          <Link
            href="/admin/indicator"
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Indicator Management</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">គ្រប់គ្រង Trading Indicator</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
