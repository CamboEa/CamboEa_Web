import { jsonrepair } from 'jsonrepair';

const DEFAULT_BASE = 'https://api.sea-lion.ai/v1';
const DEFAULT_MODEL = 'aisingapore/Gemma-SEA-LION-v4-27B-IT';
/** Enough room for long Khmer body + HTML inside JSON. */
const KHMER_JSON_MAX_TOKENS = 10_240;

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

/**
 * OpenAI-compatible streaming chat. Parses SSE lines (data: {...} / [DONE]).
 * Invokes onDelta for each token chunk; reasoning-capable models may send reasoning deltas separately.
 */
export async function seaLionChatStream(
  messages: ChatMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    onDelta: (part: { content?: string; reasoning?: string }) => void;
  }
): Promise<string> {
  const { apiKey, baseUrl, model } = requireSeaLionConfigured();
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? KHMER_JSON_MAX_TOKENS,
    }),
  });

  if (!res.ok) {
    const raw = await res.text();
    throw new Error(`SEA-LION stream error ${res.status}: ${raw.slice(0, 500)}`);
  }

  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    const raw = await res.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('SEA-LION returned non-JSON despite Content-Type');
    }
    const content =
      typeof parsed === 'object' &&
      parsed !== null &&
      'choices' in parsed &&
      Array.isArray((parsed as { choices: unknown }).choices) &&
      (parsed as { choices: { message?: { content?: string } }[] }).choices[0]?.message?.content;
    if (typeof content === 'string' && content.length > 0) {
      options.onDelta({ content });
      return content.trim();
    }
    throw new Error('SEA-LION non-stream response had no message content');
  }

  if (!res.body) {
    throw new Error('SEA-LION stream: empty body');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  const pickReasoning = (d: Record<string, unknown>): string => {
    const r =
      (typeof d.reasoning_content === 'string' && d.reasoning_content) ||
      (typeof d.reasoning === 'string' && d.reasoning) ||
      (typeof d.thought === 'string' && d.thought) ||
      (typeof d.thinking === 'string' && d.thinking) ||
      '';
    return r;
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n');
    buffer = parts.pop() ?? '';

    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') continue;

      try {
        const json = JSON.parse(payload) as {
          choices?: Array<{ delta?: Record<string, unknown> }>;
        };
        const delta = json.choices?.[0]?.delta;
        if (!delta || typeof delta !== 'object') continue;

        const reasoning = pickReasoning(delta);
        if (reasoning) {
          options.onDelta({ reasoning });
        }

        const content = typeof delta.content === 'string' ? delta.content : '';
        if (content) {
          fullContent += content;
          options.onDelta({ content });
        }
      } catch {
        /* ignore malformed SSE JSON */
      }
    }
  }

  const tail = buffer.trim();
  if (tail.startsWith('data:')) {
    const payload = tail.slice(5).trim();
    if (payload && payload !== '[DONE]') {
      try {
        const json = JSON.parse(payload) as {
          choices?: Array<{ delta?: Record<string, unknown> }>;
        };
        const delta = json.choices?.[0]?.delta;
        if (delta && typeof delta === 'object') {
          const reasoning = pickReasoning(delta);
          if (reasoning) options.onDelta({ reasoning });
          const content = typeof delta.content === 'string' ? delta.content : '';
          if (content) {
            fullContent += content;
            options.onDelta({ content });
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  return fullContent.trim();
}

function stripJsonFence(s: string): string {
  const t = s.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (m) return m[1].trim();
  return t;
}

/** First complete `{ ... }` using string/escape-aware scanning (handles nested objects). */
function extractBalancedJsonObject(s: string): string | null {
  const start = s.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === '\\') {
        escape = true;
        continue;
      }
      if (c === '"') {
        inString = false;
        continue;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === '{') depth += 1;
    else if (c === '}') {
      depth -= 1;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

/** Strip preamble, markdown fences, and isolate one JSON object from model output. */
function normalizeModelJsonPayload(raw: string): string {
  let s = raw.trim();
  const fenceMatch = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    s = fenceMatch[1].trim();
  } else {
    s = stripJsonFence(s);
  }
  const firstBrace = s.indexOf('{');
  if (firstBrace > 0) {
    s = s.slice(firstBrace);
  }
  const balanced = extractBalancedJsonObject(s);
  return balanced ?? s.trim();
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function parseKhmerRewriteJson(raw: string): KhmerArticleRewrite {
  const normalized = normalizeModelJsonPayload(raw);
  let data: unknown;
  try {
    data = JSON.parse(normalized);
  } catch {
    try {
      data = JSON.parse(jsonrepair(normalized));
    } catch {
      throw new Error('SEA-LION did not return valid JSON');
    }
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
- For important names/entities (people, companies, institutions, countries, currencies, crypto assets, indices), write Khmer first and include the original English in parentheses on first mention, e.g. ធនាគារកណ្តាលអាមេរិក (Federal Reserve), ប៊ីតខોઇន (Bitcoin), ដុល្លារអាមេរិក (USD).
- Output ONLY valid JSON (no markdown fences, no commentary before or after the JSON). Keys:
  - "title": string (Khmer headline)
  - "excerpt": string (1–2 sentences, Khmer)
  - "contentHtml": string — body in Khmer using ONLY these HTML tags: p, br, strong, em, ul, ol, li, a, h2, h3, blockquote
  - For <a> links you MUST use single quotes for the href so the JSON stays valid, e.g. <a href='https://example.com/path'>text</a>. Never put unescaped double quotes inside JSON string values.
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
    { temperature: 0.25, maxTokens: KHMER_JSON_MAX_TOKENS }
  );

  return parseKhmerRewriteJson(raw);
}

/** Same as rewriteArticleToKhmerJson but streams tokens from SEA-LION (SSE). */
export async function rewriteArticleToKhmerJsonStreaming(params: {
  sourceTitle: string;
  sourceText: string;
  sourceUrl: string;
  maxSourceChars?: number;
  onDelta: (part: { content?: string; reasoning?: string }) => void;
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

  const raw = await seaLionChatStream(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: user },
    ],
    {
      temperature: 0.25,
      maxTokens: KHMER_JSON_MAX_TOKENS,
      onDelta: params.onDelta,
    }
  );

  if (!raw) {
    throw new Error('SEA-LION stream returned empty content');
  }

  return parseKhmerRewriteJson(raw);
}
