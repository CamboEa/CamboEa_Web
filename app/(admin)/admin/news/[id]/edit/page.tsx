'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminNewsForm } from '@/components/admin/AdminNewsForm';
import type { NewsArticle } from '@/types';

export default function AdminNewsEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const [article, setArticle] = useState<NewsArticle | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/admin/news/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setArticle(data);
      })
      .catch(() => {
        if (!cancelled) setArticle(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (article === undefined) {
    return <p className="text-gray-500 dark:text-gray-400">កំពុងផ្ទុក...</p>;
  }
  if (article === null) {
    return (
      <div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">រកអត្ថបទមិនឃើញ។</p>
        <Link href="/admin/news" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← ត្រឡប់រួម
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        កែអត្ថបទ
      </h1>
      <AdminNewsForm article={article} />
    </div>
  );
}
