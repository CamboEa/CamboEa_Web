// Forex & Crypto News - Subscribe / Community Page

import React from 'react';

export const metadata = {
  title: 'Subscribe | Forex & Crypto News',
  description: 'Join our community on Telegram and Facebook for daily market updates and trading signals.',
};

const SOCIAL_LINKS = [
  {
    name: 'Telegram Group',
    description: 'Daily signals, market updates, and community discussion.',
    href: 'https://t.me/your_telegram_group',
  },
  {
    name: 'Facebook Page',
    description: 'News highlights, education posts, and live updates.',
    href: 'https://www.facebook.com/your_page',
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
      <section className="bg-linear-to-br from-blue-900 via-indigo-900 to-slate-900 text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Subscribe</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Join our channels to receive trading signals, market news, and analysis. Pick the platform you prefer.
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
                Open link
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
                Note: Replace the placeholder URL in code with your real link.
              </p>
            </a>
          ))}
        </div>

        <div className="mt-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Need help?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If you have trouble joining, message us on Telegram or Facebook and we will help you get access.
          </p>
        </div>
      </section>
    </main>
  );
}

