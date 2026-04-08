import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { NewsArticle, NewsCategory } from '@/types';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendNewsToTelegram } from '@/lib/telegram';
import { sendNewsToFacebook } from '@/lib/facebook';
import { requireAdmin } from '@/lib/admin-auth';
import { mapNewsRowToArticle, NEWS_SELECT_COLUMNS, type NewsRow } from '@/lib/news/news-row';

type NewsCreateBody = {
  title?: unknown;
  slug?: unknown;
  excerpt?: unknown;
  content?: unknown;
  impact?: unknown;
  category?: unknown;
  tags?: unknown;
  authorName?: unknown;
  author?: { name?: unknown } | null;
  publishedAt?: unknown;
  readTime?: unknown;
  image?: unknown;
  featured?: unknown;
  isPublished?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseCreateBody(input: unknown): {
  title: string;
  slug?: string;
  excerpt: string;
  content?: string;
  impact?: string;
  category: NewsCategory;
  tags: string[];
  authorName: string;
  publishedAt?: string;
  readTime?: string;
  image?: string;
  featured: boolean;
  isPublished: boolean;
} {
  if (!isRecord(input)) {
    throw new Error('Invalid payload');
  }

  const title = parseOptionalString(input.title);
  if (!title) throw new Error('ចំណងជើងត្រូវតែមាន');

  const category: NewsCategory = input.category === 'forex' ? 'forex' : 'crypto';
  const tags = Array.isArray(input.tags)
    ? input.tags.filter((v): v is string => typeof v === 'string').map((v) => v.trim()).filter(Boolean)
    : [];

  const authorName = parseOptionalString(input.authorName)
    ?? (isRecord(input.author) ? parseOptionalString(input.author.name) : undefined)
    ?? 'Admin';

  const rawPublishedAt = parseOptionalString(input.publishedAt);
  let publishedAt: string | undefined;
  if (rawPublishedAt) {
    const parsed = new Date(rawPublishedAt);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Invalid publishedAt date');
    }
    publishedAt = parsed.toISOString();
  }

  return {
    title,
    slug: parseOptionalString(input.slug),
    excerpt: parseOptionalString(input.excerpt) ?? '',
    content: parseOptionalString(input.content),
    impact: parseOptionalString(input.impact),
    category,
    tags,
    authorName,
    publishedAt,
    readTime: parseOptionalString(input.readTime),
    image: parseOptionalString(input.image),
    featured: Boolean(input.featured),
    isPublished: input.isPublished === false ? false : true,
  };
}

// GET /api/admin/news — list all articles (admin only)
export async function GET(request: NextRequest) {
  try {
    void request;
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('news')
      .select(NEWS_SELECT_COLUMNS)
      .order('published_at', { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to load news' }, { status: 500 });
    }

    const articles: NewsArticle[] = (data ?? []).map((row) => mapNewsRowToArticle(row as NewsRow));

    return NextResponse.json(articles);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load news' }, { status: 500 });
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function revalidateNewsPages(slug?: string) {
  revalidatePath('/news');
  if (slug) revalidatePath(`/news/${slug}`);
}

// POST /api/admin/news — create article (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const supabase = getSupabaseAdminClient();
    const parsed = parseCreateBody(body as NewsCreateBody);

    const title = parsed.title;
    const excerpt = parsed.excerpt;
    const content = parsed.content ?? '';
    const impact = parsed.impact;
    const category = parsed.category;
    const tags = parsed.tags;
    const authorName = parsed.authorName;
    const publishedAt = parsed.publishedAt ?? new Date().toISOString();
    const readTime = parsed.readTime ?? '៥ នាទីអាន';
    const image = parsed.image;
    const featured = parsed.featured;
    const isPublished = parsed.isPublished;
    const slug = parsed.slug ? parsed.slug : slugify(title);

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'ចំណងជើង និង slug ត្រូវតែមាន' },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from('news')
      .insert({
        slug,
        title,
        excerpt,
        content: content || excerpt,
        impact: impact || null,
        category,
        tags,
        author_name: authorName,
        published_at: publishedAt,
        read_time: readTime,
        image: image || null,
        featured,
        docx_path: null,
        is_published: isPublished,
      })
      .select('*')
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Slug មានរួចហើយ' }, { status: 400 });
      }
      console.error(error);
      return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }

    if (isPublished) {
      sendNewsToTelegram({
        title,
        excerpt,
        slug,
        image,
        impact,
      }).catch((err) => console.error('Telegram notification failed:', err));

      sendNewsToFacebook({
        title,
        excerpt,
        slug,
        image,
        impact,
      }).catch((err) => console.error('Facebook post failed:', err));

      revalidateNewsPages(slug);
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
