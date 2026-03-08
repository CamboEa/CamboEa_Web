// CamboEA - Subscribe / Community Page

import React from 'react';

export const metadata = {
  title: 'ជាវ | CamboEA',
  description: 'ចូលរួមសហគមន៍របស់យើងលើ Telegram និង Facebook សម្រាប់ព័ត៌មានពិភពលោកដែលផ្តល់ឥទ្ធិពលដល់ទីផ្សារ និងសញ្ញាធ្វើដូច។',
};

const SOCIAL_LINKS = [
  {
    name: 'ក្រុម Telegram',
    description: 'សញ្ញាប្រចាំថ្ងៃ ព័ត៌មានពិភពលោក និងការពិភាក្សាសហគមន៍។',
    href: 'https://t.me/camboea',
  },
  {
    name: 'ទំព័រ Facebook',
    description: 'ព័ត៌មានពិសេស ការបង្រៀន និងព័ត៌មានផ្ទាល់។',
    href: 'https://www.facebook.com/profile.php?id=61586942218663',
  },
];

function ExternalIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 3h7v7m0-7L10 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SubscribePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <section className="bg-linear-to-br from-sky-600 via-blue-700 to-blue-900 text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">ជាវ</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            ចូលរួមឆានែលរបស់យើងដើម្បីទទួលសញ្ញាធ្វើដូច ព័ត៌មានពិភពលោកដែលផ្តល់ឥទ្ធិពលដល់ទីផ្សារ និងការវិភាគ។ ជ្រើសរើសវេទិកាដែលអ្នកចូលចិត្ត។
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          {SOCIAL_LINKS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                </div>
                <div className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <ExternalIcon />
                </div>
              </div>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                បើកតំណ
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h14m0 0-6-6m6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                ចំណាំ៖ ជំនួស URL ជាបណ្តោះអាសន្នក្នុងកូដដោយតំណរបស់អ្នក។
              </p>
            </a>
          ))}
        </div>

        <div className="mt-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">ត្រូវការជំនួយ?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ប្រសិនអ្នកជួបការលំបាកក្នុងការចូលរួម សូមផ្ញើសារមកយើងតាម Telegram ឬ Facebook យើងនឹងជួយអ្នកឱ្យចូលបាន។
          </p>
        </div>
      </section>
    </main>
  );
}

