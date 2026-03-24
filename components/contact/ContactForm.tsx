'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { submitContactForm } from '@/lib/api/client';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setStatus('loading');
    setMessage('');

    try {
      await submitContactForm({
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        subject: String(formData.get('subject') ?? ''),
        message: String(formData.get('message') ?? ''),
      });
      setStatus('success');
      setMessage('អរគុណ! យើងនឹងឆ្លើយតបឆាប់តាមអាចធ្វើបាន។');
      form.reset();
    } catch {
      setStatus('error');
      setMessage('មានបញ្ហា សូមព្យាយាមម្តងទៀត។');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ឈ្មោះ <span className="text-gray-500">/ Name</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
            placeholder="ឈ្មោះរបស់អ្នក"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            អ៉ីមែល <span className="text-gray-500">/ Email</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ប្រធានបទ <span className="text-gray-500">/ Subject</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
          placeholder="ប្រធានបទសារ"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          សារ <span className="text-gray-500">/ Message</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition resize-y min-h-[120px]"
          placeholder="ផ្ញើសាររបស់អ្នក..."
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {message}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === 'loading'}
        isLoading={status === 'loading'}
        className="w-full sm:w-auto bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
      >
        {status === 'loading' ? 'កំពុងផ្ញើ...' : 'ផ្ញើសារ'}
      </Button>
    </form>
  );
}
