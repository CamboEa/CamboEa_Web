'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      router.push('/admin');
      router.refresh();
      return;
    }
    setMessage(data.message || 'ការចូលបរាជ័យ');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Admin — CamboEA
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          ចូលទៅផ្ទាំងគ្រប់គ្រង
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              អ៉ីមែល
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@camboea.com"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ពាក្យសម្ងាត់
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {message && (
            <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            ចូល
          </button>
        </form>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          ការចូលគឺជាគំរូ។ បន្ថែម auth ពិតបន្តិចទៀត។
        </p>
      </div>
    </div>
  );
}
