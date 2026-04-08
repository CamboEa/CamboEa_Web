const DEFAULT_UA =
  'Mozilla/5.0 (compatible; CamboEA/1.0; +https://cambo-ea-web.vercel.app/news-ingest)';

function stripTags(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function normalizeText(input: string): string {
  return decodeEntities(stripTags(input)).replace(/\s+/g, ' ').trim();
}

function pickTitle(html: string): string {
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1];
  if (ogTitle?.trim()) return decodeEntities(ogTitle.trim());

  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if (titleTag?.trim()) return normalizeText(titleTag);

  return '';
}

function pickMainHtml(html: string): string {
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1];
  if (article?.trim()) return article;

  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (main?.trim()) return main;

  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  return body?.trim() ? body : html;
}

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
  const title = pickTitle(html);
  const mainHtml = pickMainHtml(html);
  let text = normalizeText(mainHtml);
  if (text.length < 300) {
    // Some pages do not use semantic tags; fall back to full-page extraction.
    text = normalizeText(html);
  }
  if (!text) {
    throw new Error('Extracted article has no text');
  }

  const excerpt = text.length > 260 ? `${text.slice(0, 260).trim()}...` : text;

  return {
    title,
    text,
    excerpt,
  };
}
