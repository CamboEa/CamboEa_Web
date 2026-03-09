'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminPinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin/login';
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/admin/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pin.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      router.push(from);
      router.refresh();
      return;
    }
    setMessage(data.message || 'PIN មិនត្រឹមត្រូវ');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Admin — CamboEA
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          វាយ PIN ដើម្បីបន្ត
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PIN
            </label>
            <input
              id="admin-pin"
              name="pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              maxLength={8}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••"
            />
          </div>
          {message && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{message}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            បន្ត
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">កំពុងផ្ទុក...</div>
      </div>
    }>
      <AdminPinForm />
    </Suspense>
  );
}
