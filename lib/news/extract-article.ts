import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const DEFAULT_UA =
  'Mozilla/5.0 (compatible; CamboEA/1.0; +https://cambo-ea-web.vercel.app/news-ingest)';

export async function extractArticleFromUrl(
  url: string,
  options?: { userAgent?: string }
): Promise<{ title: string; text: string; excerpt?: string }> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': options?.userAgent ?? DEFAULT_UA,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch article (${res.status})`);
  }

  const html = await res.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error('Could not extract main article content from page');
  }

  const text = article.textContent?.trim() ?? '';
  if (!text) {
    throw new Error('Extracted article has no text');
  }

  return {
    title: article.title?.trim() || '',
    text,
    excerpt: article.excerpt?.trim() || undefined,
  };
}
