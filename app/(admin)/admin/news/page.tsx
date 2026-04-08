'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import type { NewsArticle } from '@/types';

export default function AdminNewsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredArticles = useMemo(() => {
    let list = [...articles];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
          (a.content && a.content.toLowerCase().includes(q))
      );
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter((a) => new Date(a.publishedAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((a) => new Date(a.publishedAt) <= to);
    }
    return list;
  }, [articles, search, dateFrom, dateTo]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/news');
      if (res.ok) {
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'ផ្ទុកព័ត៌មានមិនបាន');
      }
    } catch {
      toast.error('ផ្ទុកព័ត៌មានមិនបាន');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    const id = deleteConfirmId;
    if (!id) return;
    setDeleteConfirmId(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('លុបបានជោគជ័យ');
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'លុបមិនបាន');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div>
      <ConfirmModal
        open={deleteConfirmId !== null}
        title="លុបអត្ថបទ"
        message="លុបអត្ថបទនេះ?"
        confirmLabel="លុប"
        cancelLabel="បោះបង់"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ព័ត៌មាន
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/news/ingest"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 text-center"
          >
            AI Scraper
          </Link>
          <Link
            href="/admin/news/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 text-center"
          >
            បន្ថែមអត្ថបទ
          </Link>
        </div>
      </div>

      {!loading && articles.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ស្វែងរក ចំណងជើង ឬខ្លឹមសារ..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="ពីថ្ងៃ"
            />
            <span className="text-gray-500 dark:text-gray-400 text-sm">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="ដល់ថ្ងៃ"
            />
            {(search || dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                លុបចម្រោះ
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">កំពុងផ្ទុក...</p>
      ) : articles.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">គ្មានអត្ថបទ។</p>
      ) : filteredArticles.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">គ្មានអត្ថបទផ្គូផ្គងចម្រោះ។</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  ចំណងជើង
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  កាលបរិច្ឆេទ
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  សកម្មភាព
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((a) => (
                <tr
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/admin/news/${a.id}/edit`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/admin/news/${a.id}/edit`);
                    }
                  }}
                  className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {a.title}
                    </span>
                    {a.isPublished === false && (
                      <span className="ml-2 text-xs text-violet-600 dark:text-violet-400">
                        ព្រាង
                      </span>
                    )}
                    {a.featured && (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                        ពិសេស
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {formatDate(a.publishedAt)}
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, a.id)}
                      disabled={deletingId === a.id}
                      className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                    >
                      {deletingId === a.id ? '...' : 'លុប'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
