import type { NewsArticle, NewsCategory } from '@/types';

export const NEWS_SELECT_COLUMNS =
  'id, slug, title, excerpt, content, impact, category, tags, author_name, published_at, updated_at, read_time, image, featured, prediction, docx_path';

export type NewsRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string | null;
  impact: string | null;
  category: NewsCategory;
  tags: string[] | null;
  author_name: string | null;
  published_at: string;
  updated_at: string | null;
  read_time: string | null;
  image: string | null;
  featured: boolean | null;
  prediction: NewsArticle['prediction'] | null;
  docx_path: string | null;
};

export function mapNewsRowToArticle(row: NewsRow): NewsArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content ?? '',
    impact: row.impact ?? undefined,
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    author: {
      name: row.author_name ?? 'Admin',
    },
    publishedAt: row.published_at,
    updatedAt: row.updated_at ?? undefined,
    readTime: row.read_time ?? '៥ នាទីអាន',
    image: row.image ?? undefined,
    featured: !!row.featured,
    prediction: row.prediction ?? undefined,
    docxPath: row.docx_path ?? undefined,
  };
}
