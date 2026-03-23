'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
// import { Footer } from '@/components/layout/Footer';
import { TradingViewTicker } from '@/components/features/markets/TradingViewWidgets';
import { ToastContainer } from 'react-toastify';

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && (
        <>
          <Header />
          <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <TradingViewTicker />
          </section>
        </>
      )}
      <div key={pathname} className="animate-fade-in">
        {children}
      </div>
      {/* {!isAdmin && <Footer />} */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}
