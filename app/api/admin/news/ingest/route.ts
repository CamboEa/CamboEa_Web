import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { rewriteArticleToKhmerJson } from '@/lib/ai/sea-lion';
import { extractArticleFromUrl } from '@/lib/news/extract-article';
import {
  assertArticleHostAllowed,
  getIngestSourceById,
  getIngestSources,
  type IngestSourceConfig,
} from '@/lib/news/ingest-sources';
import { sanitizeArticleContent } from '@/lib/sanitize-article-html';
import { mapNewsRowToArticle, NEWS_SELECT_COLUMNS, type NewsRow } from '@/lib/news/news-row';

export const runtime = 'nodejs';

const FETCH_UA =
  'Mozilla/5.0 (compatible; CamboEA/1.0; +https://cambo-ea-web.vercel.app/news-ingest)';

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  enclosure?: { url?: string; type?: string };
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u1780-\u17FF\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function pickItemLink(item: RssItem): string | null {
  const link = typeof item.link === 'string' ? item.link.trim() : '';
  if (!link || !link.startsWith('http')) return null;
  return link;
}

function pickRssImage(item: RssItem): string | undefined {
  const enc = item.enclosure;
  if (enc?.url && typeof enc.type === 'string' && enc.type.startsWith('image/')) {
    return enc.url.trim();
  }
  return undefined;
}

function sortItemsNewestFirst(items: RssItem[]): RssItem[] {
  return [...items].sort((a, b) => {
    const ta = a.isoDate ? Date.parse(a.isoDate) : a.pubDate ? Date.parse(a.pubDate) : 0;
    const tb = b.isoDate ? Date.parse(b.isoDate) : b.pubDate ? Date.parse(b.pubDate) : 0;
    return tb - ta;
  });
}

async function ensureUniqueSlug(supabase: ReturnType<typeof getSupabaseAdminClient>, base: string) {
  let slug = base || 'article';
  for (let n = 0; n < 50; n += 1) {
    const trySlug = n === 0 ? slug : `${base}-${n}`;
    const { data } = await supabase.from('news').select('id').eq('slug', trySlug).maybeSingle();
    if (!data) return trySlug;
  }
  throw new Error('Could not allocate a unique slug');
}

async function fetchAndParseFeed(feedUrl: string) {
  const res = await fetch(feedUrl, {
    headers: { 'User-Agent': FETCH_UA, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`RSS feed request failed (${res.status})`);
  }
  const xml = await res.text();
  const parser = new Parser({ headers: { 'User-Agent': FETCH_UA } });
  return parser.parseString(xml);
}

type IngestBody = { sourceId?: string };

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as IngestBody;
    const source = getIngestSourceById(body.sourceId);
    if (!source) {
      return NextResponse.json({ error: 'No ingest source configured' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const feed = await fetchAndParseFeed(source.feedUrl);
    const items = sortItemsNewestFirst((feed.items ?? []) as RssItem[]);

    let chosen: { item: RssItem; link: string } | null = null;
    for (const item of items) {
      const link = pickItemLink(item);
      if (!link) continue;
      assertArticleHostAllowed(link, source);

      const { data: existing } = await supabase.from('news').select('id').eq('source_url', link).maybeSingle();
      if (existing) continue;

      chosen = { item, link };
      break;
    }

    if (!chosen) {
      return NextResponse.json(
        { error: 'គ្មានព័ត៌មានថ្មីពីប្រភពនេះ (ទាំងអស់ត្រូវបានទាញរួច ឬ feed ទទេ)' },
        { status: 409 }
      );
    }

    const { item, link } = chosen;

    const extracted = await extractArticleFromUrl(link);
    const sourceTitle = (item.title?.trim() || extracted.title || 'News').slice(0, 500);

    const khmer = await rewriteArticleToKhmerJson({
      sourceTitle,
      sourceText: extracted.text,
      sourceUrl: link,
    });

    const attribution = `<p><em>ប្រភពដើម៖ <a href="${escapeAttr(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
      source.label
    )}</a></em></p>`;

    const mergedHtml = `${khmer.contentHtml.trim()}\n${attribution}`;
    const content = sanitizeArticleContent(mergedHtml);
    const excerpt = khmer.excerpt.trim().slice(0, 800);

    const baseSlug = slugify(khmer.title) || slugify(sourceTitle) || 'article';
    const slug = await ensureUniqueSlug(supabase, baseSlug);

    const publishedAt =
      chosen.item.isoDate
        ? new Date(chosen.item.isoDate).toISOString()
        : chosen.item.pubDate
          ? new Date(chosen.item.pubDate).toISOString()
          : new Date().toISOString();

    const tags = khmer.suggestedTags.slice(0, 12);
    const image = pickRssImage(item);

    const { data: row, error } = await supabase
      .from('news')
      .insert({
        slug,
        title: khmer.title,
        excerpt,
        content: content || excerpt,
        impact: khmer.impact?.trim()
          ? khmer.impact.trim().replace(/<[^>]*>/g, '').slice(0, 8000)
          : null,
        category: source.category,
        tags,
        author_name: `CamboEA · ${source.label}`,
        published_at: publishedAt,
        read_time: '៥ នាទីអាន',
        image: image || null,
        featured: false,
        docx_path: null,
        is_published: false,
        source_url: link,
        source_name: source.label,
      })
      .select(NEWS_SELECT_COLUMNS)
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'អត្ថបទនេះត្រូវបានរក្សាទុករួចហើយ' }, { status: 409 });
      }
      console.error(error);
      return NextResponse.json({ error: 'Failed to save ingested article' }, { status: 500 });
    }

    const article = mapNewsRowToArticle(row as NewsRow);
    return NextResponse.json({ id: article.id, slug: article.slug });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Ingest failed';
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** GET — list configured ingest sources (ids + labels) for admin UI */
export async function GET(request: NextRequest) {
  try {
    void request;
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sources = getIngestSources().map((s: IngestSourceConfig) => ({ id: s.id, label: s.label }));
    return NextResponse.json({ sources });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to list sources' }, { status: 500 });
  }
}
