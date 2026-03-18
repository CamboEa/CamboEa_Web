'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';

type EaBotItem = {
  id: string;
  botName: string;
  fileName: string;
  description: string;
  filePath: string;
  fileUrl: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

export function AdminEaBotManager() {
  const [items, setItems] = useState<EaBotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  const [editingItem, setEditingItem] = useState<EaBotItem | null>(null);
  const [editBotName, setEditBotName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.botName.toLowerCase().includes(q) ||
        item.filePath.toLowerCase().includes(q)
    );
  }, [items, query]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ea-bot', { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || 'ផ្ទុកឯកសារ EA Bot មិនបាន');
        return;
      }
      setItems(Array.isArray(json) ? json : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const openEditModal = (item: EaBotItem) => {
    setEditingItem(item);
    setEditBotName(item.botName);
    setEditDescription(item.description ?? '');
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setEditBotName('');
    setEditDescription('');
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editBotName.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះ Bot។');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/ea-bot', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          botName: editBotName.trim(),
          description: editDescription.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || 'កែប្រែ Bot មិនបាន');
        return;
      }

      toast.success('កែប្រែ Bot បានជោគជ័យ');
      closeEditModal();
      await loadItems();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('តើអ្នកចង់លុបឯកសារ Bot នេះមែនទេ?');
    if (!ok) return;

    const res = await fetch(`/api/admin/ea-bot?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(json.error || 'លុបឯកសារ Bot មិនបាន');
      return;
    }
    toast.success('លុបបានជោគជ័យ');
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          គ្រប់គ្រង EA Bot
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          គ្រប់គ្រងបញ្ជី Bot ជាទម្រង់តារាង និងទិន្នន័យពាក់ព័ន្ធ។
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              បញ្ជី Bot ({items.length})
            </h2>
            <Link
              href="/admin/ea-bot/new"
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              បន្ថែម Bot
            </Link>
          </div>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ស្វែងរកឈ្មោះ ឬ ផ្លូវឯកសារ"
            className="w-full sm:w-80 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុក...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">មិនមាន Bot ទេ។</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    ឈ្មោះ
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    ផ្លូវឯកសារ
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    សកម្មភាព
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {item.botName}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono text-xs break-all">
                      {item.filePath}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          កែប្រែ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg border border-red-300 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          លុប
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeEditModal}
        >
          <form
            onSubmit={handleEditSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4"
          >
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              កែប្រែ Bot
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ឈ្មោះ Bot *
              </label>
              <input
                type="text"
                value={editBotName}
                onChange={(e) => setEditBotName(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ផ្លូវឯកសារ
              </label>
              <input
                type="text"
                value={editingItem.filePath}
                readOnly
                className={`${inputClass} opacity-70`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ការពិពណ៌នា
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
