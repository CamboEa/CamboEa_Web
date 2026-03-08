'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_NAV = [
  { href: '/admin', label: 'ផ្ទាំងគ្រប់គ្រង', exact: true },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex">
      <aside className="w-56 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/admin" className="text-lg font-bold text-gray-900 dark:text-white">
            CamboEA Admin
          </Link>
        </div>
        <nav className="p-2 flex-1">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/"
            className="block px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ← ត្រឡប់គេហទំព័រ
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
