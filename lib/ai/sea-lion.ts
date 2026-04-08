const DEFAULT_BASE = 'https://api.sea-lion.ai/v1';
const DEFAULT_MODEL = 'aisingapore/Gemma-SEA-LION-v4-27B-IT';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type KhmerArticleRewrite = {
  title: string;
  excerpt: string;
  contentHtml: string;
  impact?: string;
  suggestedTags: string[];
};

function getConfig() {
  const apiKey = process.env.SEA_LION_API_KEY;
  const baseUrl = (process.env.SEA_LION_BASE_URL || DEFAULT_BASE).replace(/\/$/, '');
  const model = process.env.SEA_LION_MODEL || DEFAULT_MODEL;
  return { apiKey, baseUrl, model };
}

export function requireSeaLionConfigured(): { baseUrl: string; model: string; apiKey: string } {
  const c = getConfig();
  if (!c.apiKey?.trim()) {
    throw new Error('SEA_LION_API_KEY is not configured');
  }
  return { baseUrl: c.baseUrl, model: c.model, apiKey: c.apiKey };
}

export async function seaLionChat(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const { apiKey, baseUrl, model } = requireSeaLionConfigured();
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4096,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`SEA-LION API error ${res.status}: ${raw.slice(0, 500)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('SEA-LION API returned non-JSON');
  }

  const content =
    typeof parsed === 'object' &&
    parsed !== null &&
    'choices' in parsed &&
    Array.isArray((parsed as { choices: unknown }).choices) &&
    (parsed as { choices: { message?: { content?: string } }[] }).choices[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('SEA-LION API returned empty content');
  }

  return content.trim();
}

function stripJsonFence(s: string): string {
  const t = s.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (m) return m[1].trim();
  return t;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function parseKhmerRewriteJson(raw: string): KhmerArticleRewrite {
  const inner = stripJsonFence(raw);
  let data: unknown;
  try {
    data = JSON.parse(inner);
  } catch {
    throw new Error('SEA-LION did not return valid JSON');
  }

  if (typeof data !== 'object' || data === null) {
    throw new Error('SEA-LION JSON must be an object');
  }

  const o = data as Record<string, unknown>;
  if (!isNonEmptyString(o.title)) throw new Error('SEA-LION JSON missing title');
  if (!isNonEmptyString(o.excerpt)) throw new Error('SEA-LION JSON missing excerpt');
  if (!isNonEmptyString(o.contentHtml)) throw new Error('SEA-LION JSON missing contentHtml');

  const suggestedTags = Array.isArray(o.suggestedTags)
    ? o.suggestedTags.filter((t): t is string => typeof t === 'string').map((t) => t.trim()).filter(Boolean)
    : [];

  const impact = isNonEmptyString(o.impact) ? o.impact.trim() : undefined;

  return {
    title: o.title.trim(),
    excerpt: o.excerpt.trim(),
    contentHtml: o.contentHtml.trim(),
    impact,
    suggestedTags,
  };
}

const SYSTEM_PROMPT = `You are a financial news editor for Cambodian readers. Rewrite the given source article into natural Khmer.

Rules:
- Preserve all facts, numbers, dates, names, and quotes accurately. Do not invent or alter figures.
- Use clear Khmer suitable for a trading/forex/crypto audience.
- Output ONLY valid JSON (no markdown fences, no commentary). Keys:
  - "title": string (Khmer headline)
  - "excerpt": string (1–2 sentences, Khmer)
  - "contentHtml": string — body in Khmer using ONLY these HTML tags: p, br, strong, em, ul, ol, li, a (href to public URLs only), h2, h3, blockquote
  - "impact": string (optional, Khmer — brief market impact for FX/gold/crypto if relevant)
  - "suggestedTags": string array of lowercase English slug tokens (e.g. "fed", "bitcoin", "usd")`;

export async function rewriteArticleToKhmerJson(params: {
  sourceTitle: string;
  sourceText: string;
  sourceUrl: string;
  maxSourceChars?: number;
}): Promise<KhmerArticleRewrite> {
  const max = params.maxSourceChars ?? 14_000;
  const text = params.sourceText.length > max ? `${params.sourceText.slice(0, max)}\n\n[… trimmed]` : params.sourceText;

  const user = [
    `Source URL (reference only, do not copy phrasing): ${params.sourceUrl}`,
    `Original title: ${params.sourceTitle}`,
    '',
    'Article plain text:',
    text,
  ].join('\n');

  const raw = await seaLionChat(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: user },
    ],
    { temperature: 0.25, maxTokens: 6144 }
  );

  return parseKhmerRewriteJson(raw);
}
