import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { NewsArticle, NewsCategory } from '@/types';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendNewsToFacebook } from '@/lib/facebook';
import { sendNewsToTelegram } from '@/lib/telegram';
import { requireAdmin } from '@/lib/admin-auth';
import { mapNewsRowToArticle, NEWS_SELECT_COLUMNS, type NewsRow } from '@/lib/news/news-row';

type NewsUpdateBody = {
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
  if (value === undefined || value === null || typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
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

function revalidateNewsPages(slugs: Array<string | undefined>) {
  revalidatePath('/news');
  for (const slug of slugs) {
    if (slug) revalidatePath(`/news/${slug}`);
  }
}

// GET /api/admin/news/[id] — get one article (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    void request;
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('news')
      .select(NEWS_SELECT_COLUMNS)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to load article' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'រកអត្ថបទមិនឃើញ' }, { status: 404 });
    }

    const article: NewsArticle = mapNewsRowToArticle(data as NewsRow);

    return NextResponse.json(article);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load article' }, { status: 500 });
  }
}

// PUT /api/admin/news/[id] — update article (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as NewsUpdateBody;
    const supabase = getSupabaseAdminClient();

    const { data: existing, error: existingError } = await supabase
      .from('news')
      .select(NEWS_SELECT_COLUMNS)
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);
      return NextResponse.json({ error: 'Failed to load article' }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ error: 'រកអត្ថបទមិនឃើញ' }, { status: 404 });
    }

    if (!isRecord(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const title = body.title !== undefined ? (parseOptionalString(body.title) ?? '') : existing.title;
    const excerpt = body.excerpt !== undefined ? (parseOptionalString(body.excerpt) ?? '') : existing.excerpt;
    const content = body.content !== undefined ? (parseOptionalString(body.content) ?? '') : existing.content;
    const impact = body.impact !== undefined ? (parseOptionalString(body.impact) ?? '') : existing.impact;
    const prevPublished = existing.is_published !== false;

    const category =
      body.category !== undefined
        ? ((body.category === 'forex' ? 'forex' : 'crypto') as NewsCategory)
        : existing.category;
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((v): v is string => typeof v === 'string').map((v) => v.trim()).filter(Boolean)
      : Array.isArray(existing.tags)
        ? existing.tags
        : [];
    const authorName = body.authorName !== undefined
      ? (parseOptionalString(body.authorName) ?? '')
      : (isRecord(body.author) ? (parseOptionalString(body.author.name) ?? existing.author_name) : existing.author_name);

    let publishedAt = existing.published_at;
    const rawPublishedAt = parseOptionalString(body.publishedAt);
    if (rawPublishedAt) {
      const parsed = new Date(rawPublishedAt);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'Invalid publishedAt date' }, { status: 400 });
      }
      publishedAt = parsed.toISOString();
    }

    const readTime = body.readTime !== undefined ? (parseOptionalString(body.readTime) ?? '') : existing.read_time;
    const image = body.image !== undefined ? (parseOptionalString(body.image) ?? null) : existing.image;
    const featured = body.featured !== undefined ? Boolean(body.featured) : existing.featured;
    const isPublished =
      body.isPublished !== undefined ? Boolean(body.isPublished) : prevPublished;
    let slug = body.slug !== undefined ? (parseOptionalString(body.slug) ?? '') : existing.slug;
    if (!slug) slug = slugify(title) || existing.slug;
    const oldSlug = typeof existing.slug === 'string' ? existing.slug : undefined;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'ចំណងជើង និង slug ត្រូវតែមាន' },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from('news')
      .update({
        slug,
        title,
        excerpt,
        content,
        impact: impact || null,
        category,
        tags,
        author_name: authorName,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
        read_time: readTime,
        image,
        featured,
        docx_path: null,
        is_published: isPublished,
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Slug មានរួចហើយ' }, { status: 400 });
      }
      console.error(error);
      return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }

    if (isPublished && !prevPublished && data) {
      const row = data as {
        title: string;
        excerpt: string;
        slug: string;
        image: string | null;
        impact: string | null;
      };
      sendNewsToTelegram({
        title: row.title,
        excerpt: row.excerpt,
        slug: row.slug,
        image: row.image ?? undefined,
        impact: row.impact ?? undefined,
      }).catch((err) => console.error('Telegram notification failed:', err));

      sendNewsToFacebook({
        title: row.title,
        excerpt: row.excerpt,
        slug: row.slug,
        image: row.image ?? undefined,
        impact: row.impact ?? undefined,
      }).catch((err) => console.error('Facebook post failed:', err));
    }

    if (isPublished || prevPublished) {
      const newSlug = data && typeof data.slug === 'string' ? data.slug : slug;
      revalidateNewsPages([oldSlug, newSlug]);
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE /api/admin/news/[id] — delete article (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    void request;
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdminClient();

    const { data: existing } = await supabase.from('news').select('slug,is_published').eq('id', id).maybeSingle();
    const deletedSlug =
      existing && typeof existing.slug === 'string' ? existing.slug : undefined;
    const wasPublished =
      !existing || typeof existing.is_published !== 'boolean' ? true : existing.is_published;

    const { error } = await supabase.from('news').delete().eq('id', id);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }

    if (wasPublished) {
      revalidateNewsPages([deletedSlug]);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
