import { NextRequest, NextResponse } from 'next/server';
import type { NewsArticle, NewsCategory } from '@/types';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendNewsToTelegram } from '@/lib/telegram';
import { requireAdmin } from '@/lib/admin-auth';

// GET /api/admin/news — list all articles (admin only)
export async function GET(_request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('news')
      .select(
        'id, slug, title, excerpt, content, impact, category, tags, author_name, published_at, updated_at, read_time, image, featured, prediction, docx_path'
      )
      .order('published_at', { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to load news' }, { status: 500 });
    }

    const articles: NewsArticle[] = (data ?? []).map((row: any) => ({
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
    }));

    return NextResponse.json(articles);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load news' }, { status: 500 });
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u1780-\u17FF\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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

    const title = String(body.title ?? '').trim();
    const excerpt = String(body.excerpt ?? '').trim();
    const content = String(body.content ?? '').trim();
    const impact = body.impact !== undefined ? String(body.impact ?? '').trim() : undefined;
    const category = (body.category === 'forex' ? 'forex' : 'crypto') as NewsCategory;
    const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
    const authorName = String(body.authorName ?? body.author?.name ?? 'Admin').trim();
    const publishedAt = body.publishedAt
      ? new Date(body.publishedAt).toISOString()
      : new Date().toISOString();
    const readTime = String(body.readTime ?? '៥ នាទីអាន').trim();
    const image = body.image ? String(body.image).trim() : undefined;
    const featured = Boolean(body.featured);
    const slug = body.slug ? String(body.slug).trim() : slugify(title);
    const docxPath = body.docxPath ? String(body.docxPath).trim() : undefined;

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
        docx_path: docxPath || null,
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

    sendNewsToTelegram({
      title,
      excerpt,
      slug,
      image,
      impact,
    }).catch((err) => console.error('Telegram notification failed:', err));

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
