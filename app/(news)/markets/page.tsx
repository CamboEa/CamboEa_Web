// CamboEA - Markets: TradingView + pair search

import React from 'react';
import { MarketsPageClient } from '@/components/features/markets/MarketsPageClient';

export const metadata = {
  title: 'ទីផ្សារ | CamboEA',
  description: 'ទិដ្ឋភាពទីផ្សារ ប្តូរប្រាក់ លោហៈ និងគ្រីបធ័ — TradingView។',
};

export default function MarketsPage() {
  return (
    <main className="bg-gray-50 dark:bg-gray-900">
      <section className="py-8 pb-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <MarketsPageClient />
      </section>
    </main>
  );
}
