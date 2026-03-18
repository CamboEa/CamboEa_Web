// CamboEA - Markets: TradingView + pair search

import React from 'react';
import { MarketsPageClient } from '@/components/features/markets/MarketsPageClient';

export const metadata = {
  title: 'ទីផ្សារ | CamboEA',
  description: 'ទិដ្ឋភាពទីផ្សារ ប្តូរប្រាក់ លោហៈ និងគ្រីបធ័ — TradingView។',
};

type PageProps = { searchParams: Promise<{ view?: string }> };

export default async function MarketsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialView =
    params.view === 'overview'
        ? 'overview'
        : params.view === 'depth'
          ? 'depth'
          : params.view === 'calendar'
            ? 'calendar'
            : params.view === 'volatility'
              ? 'volatility'
          : params.view === 'retailer'
            ? 'retailer'
              : 'overview';
  return (
    <main className="min-h-screen dark:bg-gray-950">
      <section className="bg-linear-to-br from-slate-800 via-slate-900 to-slate-800 text-white py-10 sm:py-12">
        <div className="w-[80vw] max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ទិន្នន័យទីផ្សារ
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-2xl">
            ទិដ្ឋភាពទីផ្សារ ជម្រៅ Order Book និងទិន្នន័យអ្នកលក់រាយ — ជ្រើសរើសខាងក្រោម។
          </p>
        </div>
      </section>
      <section className="w-[80vw] max-w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 relative z-1 mb-15">
        <MarketsPageClient initialView={initialView} />
      </section>
    </main>
  );
}
