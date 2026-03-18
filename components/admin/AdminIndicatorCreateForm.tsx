'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminIndicatorCreateForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [indicatorName, setIndicatorName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const inputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!indicatorName.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះ Indicator។');
      return;
    }
    if (!file) {
      toast.error('សូមជ្រើសរើសឯកសារ Indicator។');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('indicatorName', indicatorName.trim());
      formData.append('description', description.trim());

      const res = await fetch('/api/admin/indicator', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || 'បន្ថែម Indicator មិនបាន');
        return;
      }

      toast.success('បន្ថែម Indicator បានជោគជ័យ');
      router.push('/admin/indicator');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          បន្ថែម Indicator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          បន្ថែមឯកសារ Trading Indicator ថ្មី និងទិន្នន័យពាក់ព័ន្ធ។
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4 w-full"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ឈ្មោះ Indicator *
          </label>
          <input
            type="text"
            value={indicatorName}
            onChange={(e) => setIndicatorName(e.target.value)}
            placeholder="ឧ. CamboEA Trend Scanner"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ឯកសារ Indicator *
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={inputClass}
            required
          />
          {file && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {file.name} ({formatFileSize(file.size)})
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ការពិពណ៌នា (មិនបាច់ក៏បាន)
          </label>
          <textarea
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="កំណត់ចំណាំ (ជាជម្រើស)"
            className={inputClass}
            style={{ minHeight: 180 }}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Link
            href="/admin/indicator"
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            បោះបង់
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក Indicator'}
          </button>
        </div>
      </form>
    </div>
  );
}
