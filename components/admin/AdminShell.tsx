'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const ADMIN_NAV = [
  { href: '/admin', label: 'ផ្ទាំងគ្រប់គ្រង' },
  { href: '/admin/news', label: 'ព័ត៌មាន' },
  { href: '/admin/users', label: 'អ្នកប្រើ' },
  { href: '/admin/ea-bot', label: 'EA Bot Management' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/pin';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (!res.ok) {
        toast.error('ចាកចេញមិនបាន');
        return;
      }
      router.push('/admin/pin');
      router.refresh();
      toast.success('ចាកចេញបានជោគជ័យ');
    } finally {
      setLoggingOut(false);
    }
  };

  if (isAuthPage) {
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
          {ADMIN_NAV.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          >
            {loggingOut ? '...' : 'ចាកចេញ'}
          </button>
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
