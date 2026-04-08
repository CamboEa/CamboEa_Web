import Parser from 'rss-parser';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { rewriteArticleToKhmerJson, rewriteArticleToKhmerJsonStreaming } from '@/lib/ai/sea-lion';
import { extractArticleFromUrl } from '@/lib/news/extract-article';
import {
  assertArticleHostAllowed,
  getIngestSourceById,
} from '@/lib/news/ingest-sources';
import { sanitizeArticleContent } from '@/lib/sanitize-article-html';
import { mapNewsRowToArticle, NEWS_SELECT_COLUMNS, type NewsRow } from '@/lib/news/news-row';

const FETCH_UA =
  'Mozilla/5.0 (compatible; CamboEA/1.0; +https://cambo-ea-web.vercel.app/news-ingest)';

export type IngestProgress =
  | { kind: 'step'; step: string; message: string; detail?: string }
  | { kind: 'ai_delta'; channel: 'content' | 'reasoning'; text: string };

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
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
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
  const slug = base || 'article';
  for (let n = 0; n < 50; n += 1) {
    const trySlug = n === 0 ? slug : `${base}-${n}`;
    const { data } = await supabase.from('news').select('id').eq('slug', trySlug).maybeSingle();
    if (!data) return trySlug;
  }
  throw new Error('Could not allocate a unique slug');
}

async function fetchAndParseFeed(feedUrl: string) {
  const res = await fetch(feedUrl, {
    headers: {
      'User-Agent': FETCH_UA,
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        'RSS feed request failed (404). Source URL may be outdated; update NEWS_INGEST_SOURCES_JSON or default source config.'
      );
    }
    throw new Error(`RSS feed request failed (${res.status})`);
  }
  const xml = await res.text();
  const parser = new Parser({ headers: { 'User-Agent': FETCH_UA } });
  return parser.parseString(xml);
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

export type IngestResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string; status: number };

/**
 * Full news ingest pipeline. Calls onProgress for steps and (when streamAi) live AI tokens.
 */
export async function runNewsIngest(
  sourceId: string | undefined,
  onProgress: (p: IngestProgress) => void,
  options?: { streamAi?: boolean }
): Promise<IngestResult> {
  const streamAi = options?.streamAi === true;

  const emitStep = (step: string, message: string, detail?: string) => {
    onProgress({ kind: 'step', step, message, detail });
  };

  try {
    emitStep('init', 'ផ្ទៀងផ្ទាត់ប្រភព និងចាប់ផ្តើម');

    const source = getIngestSourceById(sourceId);
    if (!source) {
      return { ok: false, error: 'No ingest source configured', status: 400 };
    }

    emitStep('source', `ប្រភព៖ ${source.label}`, source.feedUrl);

    emitStep('rss_fetch', 'កំពុងទាញ RSS feed…', source.feedUrl);
    const feed = await fetchAndParseFeed(source.feedUrl);

    const rawItems = (feed.items ?? []) as RssItem[];
    const items = sortItemsNewestFirst(rawItems);
    emitStep('rss_parse', `បានញែក RSS — រកឃើញ ${items.length} រឿង`);

    const supabase = getSupabaseAdminClient();
    emitStep('dedup', 'កំពុងពិនិត្យរឿងដែលមិនទាន់រក្សាទុក…');

    let chosen: { item: RssItem; link: string } | null = null;
    let skipped = 0;
    for (const item of items) {
      const link = pickItemLink(item);
      if (!link) continue;
      try {
        assertArticleHostAllowed(link, source);
      } catch {
        continue;
      }

      const { data: existing } = await supabase.from('news').select('id').eq('source_url', link).maybeSingle();
      if (existing) {
        skipped += 1;
        continue;
      }

      chosen = { item, link };
      break;
    }

    if (skipped > 0) {
      emitStep('dedup_detail', `រំលងរឿងដែលមានរួច៖ ${skipped}`, `${skipped} links already imported`);
    }

    if (!chosen) {
      return {
        ok: false,
        error: 'គ្មានព័ត៌មានថ្មីពីប្រភពនេះ (ទាំងអស់ត្រូវបានទាញរួច ឬ feed ទទេ)',
        status: 409,
      };
    }

    const { item, link } = chosen;
    emitStep('article_pick', 'បានជ្រើសរឿងថ្មី', link);

    emitStep('article_fetch', 'កំពុងទាញ HTML ពីគេហទំព័រប្រភព…', link);
    const extracted = await extractArticleFromUrl(link);
    const snippet = extracted.text.length > 200 ? `${extracted.text.slice(0, 200)}…` : extracted.text;
    emitStep(
      'extract',
      `បានស្រង់អត្ថបទ (Readability) — ${extracted.text.length.toLocaleString()} តួអក្សរ`,
      snippet
    );

    const sourceTitle = (item.title?.trim() || extracted.title || 'News').slice(0, 500);

    emitStep(
      'sea_lion',
      streamAi
        ? 'កំពុងភ្ជាប់ SEA-LION (streaming) — កំពុងទទួលពាក្យពីម៉ូដែល…'
        : 'កំពុងផ្ញើទៅ SEA-LION API — បកប្រែ/សរសេរឡើងវិញជាភាសាខ្មែរ…'
    );

    const khmer = streamAi
      ? await rewriteArticleToKhmerJsonStreaming({
          sourceTitle,
          sourceText: extracted.text,
          sourceUrl: link,
          onDelta: (part) => {
            if (part.reasoning) {
              onProgress({ kind: 'ai_delta', channel: 'reasoning', text: part.reasoning });
            }
            if (part.content) {
              onProgress({ kind: 'ai_delta', channel: 'content', text: part.content });
            }
          },
        })
      : await rewriteArticleToKhmerJson({
          sourceTitle,
          sourceText: extracted.text,
          sourceUrl: link,
        });

    emitStep(
      'sea_lion_done',
      'បានទទួលចម្លើយពី AI ពេញលេញ — កំពុងញែក JSON',
      `ចំណងជើង៖ ${khmer.title.slice(0, 80)}${khmer.title.length > 80 ? '…' : ''}`
    );

    const attribution = `<p><em>ប្រភពដើម៖ <a href="${escapeAttr(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
      source.label
    )}</a></em></p>`;

    const mergedHtml = `${khmer.contentHtml.trim()}\n${attribution}`;
    const content = sanitizeArticleContent(mergedHtml);
    const excerpt = khmer.excerpt.trim().slice(0, 800);

    emitStep('slug', 'កំពុងបង្កើត slug តែមួយ…');
    const baseSlug = slugify(sourceTitle) || slugify(khmer.title) || 'article';
    const slug = await ensureUniqueSlug(supabase, baseSlug);

    const publishedAt =
      chosen.item.isoDate
        ? new Date(chosen.item.isoDate).toISOString()
        : chosen.item.pubDate
          ? new Date(chosen.item.pubDate).toISOString()
          : new Date().toISOString();

    const tags = khmer.suggestedTags.slice(0, 12);
    const image = pickRssImage(item);

    emitStep('save', 'កំពុងរក្សាទុកព្រាងនៅ Supabase…', `slug: ${slug}`);

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
        return { ok: false, error: 'អត្ថបទនេះត្រូវបានរក្សាទុករួចហើយ', status: 409 };
      }
      console.error(error);
      return { ok: false, error: 'Failed to save ingested article', status: 500 };
    }

    const article = mapNewsRowToArticle(row as NewsRow);
    emitStep('complete', 'បានរួចរាល់ — ព្រាងត្រូវបានបង្កើត', article.id);

    return { ok: true, id: article.id, slug: article.slug };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Ingest failed';
    return { ok: false, error: message, status: 500 };
  }
}
