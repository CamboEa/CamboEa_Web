'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';

type LessonItem = {
  id: string;
  title: string;
  description: string;
  reference: string;
  lessonUrl: string;
  createdAt: string;
};

export function AdminLessonManager() {
  const [items, setItems] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  const [editingItem, setEditingItem] = useState<LessonItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editReference, setEditReference] = useState('');
  const [editLessonUrl, setEditLessonUrl] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.lessonUrl.toLowerCase().includes(q) ||
        item.reference.toLowerCase().includes(q)
    );
  }, [items, query]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/lesson', { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || 'ផ្ទុក Lesson មិនបាន');
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

  const openEditModal = (item: LessonItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description ?? '');
    setEditReference(item.reference ?? '');
    setEditLessonUrl(item.lessonUrl);
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setEditTitle('');
    setEditDescription('');
    setEditReference('');
    setEditLessonUrl('');
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editTitle.trim()) {
      toast.error('សូមបញ្ចូលចំណងជើង Lesson។');
      return;
    }
    if (!editLessonUrl.trim()) {
      toast.error('សូមបញ្ចូល URL មេរៀន។');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/lesson', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          title: editTitle.trim(),
          description: editDescription.trim(),
          reference: editReference.trim(),
          lessonUrl: editLessonUrl.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || 'កែប្រែ Lesson មិនបាន');
        return;
      }

      toast.success('កែប្រែ Lesson បានជោគជ័យ');
      closeEditModal();
      await loadItems();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('តើអ្នកចង់លុប Lesson នេះមែនទេ?');
    if (!ok) return;

    const res = await fetch(`/api/admin/lesson?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(json.error || 'លុប Lesson មិនបាន');
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">គ្រប់គ្រង Lessons</h1>
        <p className="text-gray-600 dark:text-gray-400">គ្រប់គ្រងបញ្ជីមេរៀន និង URL សម្រាប់អ្នកប្រើ។</p>
      </div>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">បញ្ជី Lesson ({items.length})</h2>
            <Link
              href="/admin/lesson/new"
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              បន្ថែម Lesson
            </Link>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ស្វែងរកចំណងជើង ប្រភព ឬ URL"
            className="w-full sm:w-80 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុក...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">មិនមាន Lesson ទេ។</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">ចំណងជើង</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">ប្រភព/អ្នកនិពន្ធ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">URL</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{item.title}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.reference || '—'}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono text-xs break-all">
                      {item.lessonUrl}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeEditModal}>
          <form
            onSubmit={handleEditSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4"
          >
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">កែប្រែ Lesson</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ចំណងជើង Lesson *
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
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
                value={editLessonUrl}
                onChange={(e) => setEditLessonUrl(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ប្រភព/អ្នកនិពន្ធ
              </label>
              <input
                type="text"
                value={editReference}
                onChange={(e) => setEditReference(e.target.value)}
                className={inputClass}
                placeholder="ឧ. BabyPips, Investopedia, John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ការពិពណ៌នា</label>
              <textarea
                rows={4}
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
