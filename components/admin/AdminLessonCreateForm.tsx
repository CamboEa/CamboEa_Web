'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export function AdminLessonCreateForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [lessonUrl, setLessonUrl] = useState('');

  const inputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('សូមបញ្ចូលចំណងជើង Lesson។');
      return;
    }
    if (!lessonUrl.trim()) {
      toast.error('សូមបញ្ចូល URL មេរៀន។');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          reference: reference.trim(),
          lessonUrl: lessonUrl.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || 'បន្ថែម Lesson មិនបាន');
        return;
      }

      toast.success('បន្ថែម Lesson បានជោគជ័យ');
      router.push('/admin/lesson');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">បន្ថែម Lesson</h1>
        <p className="text-gray-600 dark:text-gray-400">
          បន្ថែមមេរៀនថ្មីដោយប្រើចំណងជើង ការពិពណ៌នា និង URL ទៅកាន់មេរៀន។
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4 w-full"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ចំណងជើង Lesson *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ឧ. Forex Fundamentals for Beginners"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL មេរៀន *
          </label>
          <input
            type="url"
            value={lessonUrl}
            onChange={(e) => setLessonUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ប្រភព/អ្នកនិពន្ធ (មិនបាច់ក៏បាន)
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="ឧ. BabyPips, Investopedia, John Doe"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ការពិពណ៌នា (មិនបាច់ក៏បាន)
          </label>
          <textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ពិពណ៌នាខ្លីអំពីមេរៀននេះ"
            className={inputClass}
            style={{ minHeight: 140 }}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Link
            href="/admin/lesson"
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            បោះបង់
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក Lesson'}
          </button>
        </div>
      </form>
    </div>
  );
}
