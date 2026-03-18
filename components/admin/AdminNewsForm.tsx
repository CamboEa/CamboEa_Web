'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import type { NewsArticle, NewsCategory } from '@/types';
import { sanitizeArticleContent, isHtmlContent } from '@/lib/sanitize-article-html';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';

type Props = { article?: NewsArticle | null };

const defaultValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  impact: '',
  category: 'crypto' as NewsCategory,
  tags: '' as string,
  authorName: '',
  publishedAt: new Date().toISOString().slice(0, 16),
  readTime: '៥ នាទីអាន',
  image: '',
  featured: false,
};

export function AdminNewsForm({ article }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultValues);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [docxUrl, setDocxUrl] = useState(article?.docxPath ?? '');
  const contentInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        impact: article.impact ?? '',
        category: article.category,
        tags: article.tags.join(', '),
        authorName: article.author.name,
        publishedAt: article.publishedAt.slice(0, 16),
        readTime: article.readTime,
        image: article.image ?? '',
        featured: article.featured ?? false,
      });
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // If a DOC/PDF file is selected, upload it to Supabase Storage on submit
      let finalDocxUrl = docxUrl;
      if (contentFile && !finalDocxUrl) {
        try {
          const supabase = getSupabaseBrowserClient();
          const bucket = 'news_docs';
          const fileName = `news/${Date.now()}-${contentFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, contentFile, { upsert: true });

          if (uploadError) {
            console.error(uploadError);
            toast.error('អាប់ឡូដឯកសារទៅ Storage មិនបាន');
          } else {
            const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
            if (data?.publicUrl) {
              finalDocxUrl = data.publicUrl;
              setDocxUrl(data.publicUrl);
            }
          }
        } catch (err) {
          console.error(err);
          toast.error('មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Supabase Storage');
        }
      }

      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const payload: any = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt,
        content: form.content,
        impact: form.impact,
        category: form.category,
        tags,
        authorName: form.authorName,
        publishedAt: new Date(form.publishedAt).toISOString(),
        readTime: form.readTime,
        image: form.image || undefined,
        featured: form.featured,
      };

      if (finalDocxUrl || article?.docxPath) {
        payload.docxPath = finalDocxUrl || article?.docxPath;
      }

      if (article) {
        const res = await fetch(`/api/admin/news/${article.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error || 'កែប្រែមិនបាន');
          return;
        }
        toast.success('រក្សាទុកបានជោគជ័យ');
        router.push('/admin/news');
        router.refresh();
      } else {
        const res = await fetch('/api/admin/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error || 'បន្ថែមមិនបាន');
          return;
        }
        toast.success('បន្ថែមអត្ថបទបានជោគជ័យ');
        router.push('/admin/news');
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExtractContent = async () => {
    if (!contentFile) return;
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', contentFile);
      const res = await fetch('/api/admin/news/extract-content', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'អានឯកសារមិនបាន');
        return;
      }
      if (data.content) {
        setForm((f) => ({ ...f, content: data.content }));
        toast.success('អានឯកសារបានជោគជ័យ');
      }
      // keep file selected so submit can upload it
    } finally {
      setExtracting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label htmlFor="title" className={labelClass}>
          ចំណងជើង *
        </label>
        <input
          id="title"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="slug" className={labelClass}>
          Slug (ទទេ = បង្កើតពីចំណងជើង)
        </label>
        <input
          id="slug"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          className={inputClass}
          placeholder="article-url-slug"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className={labelClass}>
          សង្ខេប
        </label>
        <textarea
          id="excerpt"
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="content" className={labelClass}>
          ខ្លឹមសារ
        </label>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <input
            ref={contentInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setContentFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="content-file-upload"
          />
          <button
            type="button"
            onClick={() => contentInputRef.current?.click()}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ជ្រើសរើសឯកសារ (PDF / DOC)
          </button>
          {contentFile && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {contentFile.name}
            </span>
          )}
          <button
            type="button"
            onClick={handleExtractContent}
            disabled={!contentFile || extracting}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {extracting ? 'កំពុងអាន...' : 'អានឯកសារ → ខ្លឹមសារ'}
          </button>
        </div>
        <textarea
          id="content"
          rows={6}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          className={inputClass}
        />
        {isHtmlContent(form.content) && (
          <div className="mt-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">មើលជាមុន (ខ្លឹមសារ)</span>
            <div
              className="mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 prose prose-sm dark:prose-invert max-w-none prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-700"
              dangerouslySetInnerHTML={{
                __html: sanitizeArticleContent(form.content),
              }}
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="impact" className={labelClass}>
          ផលប៉ះពាល់
        </label>
        <textarea
          id="impact"
          rows={6}
          value={form.impact}
          onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="min-w-[140px]">
          <label htmlFor="publishedAt" className={labelClass}>
            កាលបរិច្ឆេទ
          </label>
          <input
            id="publishedAt"
            type="datetime-local"
            value={form.publishedAt}
            onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div className="min-w-[120px]">
          <label htmlFor="readTime" className={labelClass}>
            ពេលអាន
          </label>
          <input
            id="readTime"
            value={form.readTime}
            onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
            className={inputClass}
            placeholder="៥ នាទីអាន"
          />
        </div>
      </div>

      <div>
        <label htmlFor="tags" className={labelClass}>
          តាធ័ (ញែកដោយក្បៀស)
        </label>
        <input
          id="tags"
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          className={inputClass}
          placeholder="fed, bitcoin, gold"
        />
      </div>

      <div>
        <label htmlFor="image" className={labelClass}>
          URL រូបភាព
        </label>
        <input
          id="image"
          type="url"
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          className={inputClass}
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="featured"
          type="checkbox"
          checked={form.featured}
          onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
          className="rounded border-gray-300 dark:border-gray-600"
        />
        <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">
          ពិសេស (Featured)
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'កំពុងរក្សាទុក...' : article ? 'រក្សាទុក' : 'បន្ថែម'}
        </button>
        <Link
          href="/admin/news"
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          បោះបង់
        </Link>
      </div>
    </form>
  );
}
