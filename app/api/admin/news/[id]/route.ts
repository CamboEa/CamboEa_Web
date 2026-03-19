import { NextRequest, NextResponse } from 'next/server';
import type { NewsArticle, NewsCategory } from '@/types';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/admin-auth';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u1780-\u17FF\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET /api/admin/news/[id] — get one article (admin only)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('news')
      .select(
        'id, slug, title, excerpt, content, impact, category, tags, author_name, published_at, updated_at, read_time, image, featured, prediction, docx_path'
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to load article' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'រកអត្ថបទមិនឃើញ' }, { status: 404 });
    }

    const article: NewsArticle = {
      id: data.id,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content ?? '',
      impact: data.impact ?? undefined,
      category: data.category,
      tags: Array.isArray(data.tags) ? data.tags : [],
      author: {
        name: data.author_name ?? 'Admin',
      },
      publishedAt: data.published_at,
      updatedAt: data.updated_at ?? undefined,
      readTime: data.read_time ?? '៥ នាទីអាន',
      image: data.image ?? undefined,
      featured: !!data.featured,
      prediction: data.prediction ?? undefined,
      docxPath: data.docx_path ?? undefined,
    };

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
    const body = await request.json().catch(() => ({}));
    const supabase = getSupabaseAdminClient();

    const { data: existing, error: existingError } = await supabase
      .from('news')
      .select(
        'id, slug, title, excerpt, content, impact, category, tags, author_name, published_at, updated_at, read_time, image, featured, prediction, docx_path'
      )
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);
      return NextResponse.json({ error: 'Failed to load article' }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ error: 'រកអត្ថបទមិនឃើញ' }, { status: 404 });
    }

    const title = body.title !== undefined ? String(body.title).trim() : existing.title;
    const excerpt = body.excerpt !== undefined ? String(body.excerpt).trim() : existing.excerpt;
    const content = body.content !== undefined ? String(body.content).trim() : existing.content;
    const impact = body.impact !== undefined ? String(body.impact ?? '').trim() : existing.impact;
    const category = (body.category === 'forex' ? 'forex' : 'crypto') as NewsCategory;
    const tags = Array.isArray(body.tags) ? body.tags.map(String) : existing.tags;
    const authorName =
      body.authorName !== undefined
        ? String(body.authorName).trim()
        : body.author?.name ?? existing.author_name;
    const publishedAt = body.publishedAt
      ? new Date(body.publishedAt).toISOString()
      : existing.published_at;
    const readTime = body.readTime !== undefined ? String(body.readTime).trim() : existing.read_time;
    const image =
      body.image !== undefined ? (body.image ? String(body.image).trim() : null) : existing.image;
    const featured = body.featured !== undefined ? Boolean(body.featured) : existing.featured;
    let slug = body.slug !== undefined ? String(body.slug).trim() : existing.slug;
    if (!slug) slug = slugify(title) || existing.slug;

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

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE /api/admin/news/[id] — delete article (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdminClient();

    const { error } = await supabase.from('news').delete().eq('id', id);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
