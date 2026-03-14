'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
// import { Footer } from '@/components/layout/Footer';
import { TradingViewTicker } from '@/components/features/markets/TradingViewWidgets';

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TradingViewTicker />
      </section>
      {children}
      {/* <Footer /> */}
    </>
  );
}
