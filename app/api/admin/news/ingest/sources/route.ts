import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import type { NewsCategory } from '@/types';

type SourceBody = {
  id?: string;
  label?: string;
  feedUrl?: string;
  allowedArticleHosts?: string[];
  category?: NewsCategory;
};

function normalizeHosts(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''))
    .filter(Boolean);
}

function parseSourceBody(body: SourceBody) {
  const id = (body.id ?? '').trim();
  const label = (body.label ?? '').trim();
  const feedUrl = (body.feedUrl ?? '').trim();
  const category = body.category;
  const allowedArticleHosts = normalizeHosts(body.allowedArticleHosts);

  if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    throw new Error('id is required and must contain only lowercase letters, numbers, and dashes');
  }
  if (!label) throw new Error('label is required');
  if (!feedUrl || !/^https?:\/\//i.test(feedUrl)) throw new Error('feedUrl must be a valid http(s) URL');
  if (category !== 'forex' && category !== 'crypto') throw new Error('category must be forex or crypto');

  return { id, label, feedUrl, category, allowedArticleHosts };
}

export async function GET(request: NextRequest) {
  try {
    void request;
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('news_ingest_sources')
      .select('id,label,feed_url,allowed_article_hosts,category,is_active,created_at')
      .order('created_at', { ascending: true });
    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to load ingest sources' }, { status: 500 });
    }

    const sources = (data ?? []).map((row) => ({
      id: row.id,
      label: row.label,
      feedUrl: row.feed_url,
      allowedArticleHosts: row.allowed_article_hosts ?? [],
      category: row.category as NewsCategory,
      isActive: row.is_active,
    }));
    return NextResponse.json({ sources });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load ingest sources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as SourceBody;
    const parsed = parseSourceBody(body);

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('news_ingest_sources')
      .upsert(
        {
          id: parsed.id,
          label: parsed.label,
          feed_url: parsed.feedUrl,
          allowed_article_hosts: parsed.allowedArticleHosts,
          category: parsed.category,
          is_active: true,
        },
        { onConflict: 'id' }
      )
      .select('id,label,feed_url,allowed_article_hosts,category,is_active')
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to save source' }, { status: 500 });
    }

    return NextResponse.json({
      source: {
        id: data?.id,
        label: data?.label,
        feedUrl: data?.feed_url,
        allowedArticleHosts: data?.allowed_article_hosts ?? [],
        category: data?.category,
        isActive: data?.is_active,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as { id?: string };
    const id = (body.id ?? '').trim();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from('news_ingest_sources').delete().eq('id', id);
    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
  }
}
