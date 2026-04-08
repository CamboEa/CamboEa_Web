import type { NewsCategory } from '@/types';

export type IngestSourceConfig = {
  id: string;
  label: string;
  feedUrl: string;
  /** If set, only item links whose hostname matches (with or without www.) are ingested. */
  allowedArticleHosts?: string[];
  category: NewsCategory;
};

const DEFAULT_SOURCES: IngestSourceConfig[] = [
  {
    id: 'coindesk-rss',
    label: 'CoinDesk',
    feedUrl: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    allowedArticleHosts: ['coindesk.com'],
    category: 'crypto',
  },
  {
    id: 'investing-forex-rss',
    label: 'Investing.com Forex News',
    feedUrl: 'https://www.investing.com/rss/news_forex.rss',
    allowedArticleHosts: ['investing.com'],
    category: 'forex',
  },
];

function isValidSourceEntry(v: unknown): v is IngestSourceConfig {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    o.id.length > 0 &&
    typeof o.label === 'string' &&
    typeof o.feedUrl === 'string' &&
    o.feedUrl.startsWith('http') &&
    (o.category === 'forex' || o.category === 'crypto')
  );
}

/**
 * Optional env `NEWS_INGEST_SOURCES_JSON`: JSON array of IngestSourceConfig.
 * If missing or invalid, built-in defaults are used.
 */
export function getIngestSources(): IngestSourceConfig[] {
  const raw = process.env.NEWS_INGEST_SOURCES_JSON?.trim();
  if (!raw) return DEFAULT_SOURCES;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SOURCES;
    const list = parsed.filter(isValidSourceEntry);
    return list.length > 0 ? list : DEFAULT_SOURCES;
  } catch {
    return DEFAULT_SOURCES;
  }
}

export function getIngestSourceById(id: string | undefined): IngestSourceConfig | null {
  const sources = getIngestSources();
  if (!id?.trim()) return sources[0] ?? null;
  return sources.find((s) => s.id === id.trim()) ?? null;
}

export function assertArticleHostAllowed(
  articleUrl: string,
  source: IngestSourceConfig
): void {
  let host: string;
  try {
    host = new URL(articleUrl).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    throw new Error('Invalid article URL');
  }

  const allowed = source.allowedArticleHosts;
  if (!allowed?.length) return;

  const ok = allowed.some((h) => {
    const n = h.toLowerCase().replace(/^www\./, '');
    return host === n || host.endsWith(`.${n}`);
  });

  if (!ok) {
    throw new Error(`Article host "${host}" is not allowed for source ${source.id}`);
  }
}
