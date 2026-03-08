// CamboEA - Analysis: bias table (តម្លៃបច្ចុប្បន្ន និងទិសដៅ)

import React from 'react';
import { MarketsPriceTable } from '@/components/features/markets/MarketsPriceTable';

export const metadata = {
  title: 'ការវិភាគ — តម្លៃបច្ចុប្បន្ន និងទិសដៅ | CamboEA',
  description: 'តម្លៃបច្ចុប្បន្ន និងទិសដៅ ប្តូរប្រាក់ លោហៈ និងគ្រីបធ័។',
};

export default function AnalysisPage() {
  return (
    <main className="bg-gray-50 dark:bg-gray-900">
      <MarketsPriceTable />
    </main>
  );
}
