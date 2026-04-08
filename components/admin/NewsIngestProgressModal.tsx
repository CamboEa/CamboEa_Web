'use client';

import React, { useEffect, useRef, useState } from 'react';

export type NewsIngestProgressModalProps = {
  open: boolean;
  /** Change this value to start a new ingest run while the modal is open or after reopen. */
  runKey: number;
  sourceId: string;
  onClose: () => void;
  /** Called with article id when ingest completes successfully. */
  onComplete: (articleId: string) => void;
};

type LogLine = {
  id: string;
  kind: 'progress' | 'done' | 'error';
  step?: string;
  message: string;
  detail?: string;
  status?: number;
};

function formatStepLabel(step: string | undefined): string {
  if (!step) return '';
  const map: Record<string, string> = {
    init: 'ចាប់ផ្តើម',
    source: 'ប្រភព RSS',
    rss_fetch: 'ទាញ RSS',
    rss_parse: 'ញែក RSS',
    dedup: 'ពិនិត្យស្ទួន',
    dedup_detail: 'រំលង (មានរួច)',
    article_pick: 'ជ្រើសរឿង',
    article_fetch: 'ទាញ HTML',
    extract: 'ស្រង់អត្ថបទ',
    sea_lion: 'SEA-LION AI',
    sea_lion_done: 'ចម្លើយ AI',
    slug: 'Slug',
    save: 'រក្សាទុក',
    complete: 'បញ្ចប់',
  };
  return map[step] ?? step;
}

async function consumeNdjsonStream(
  response: Response,
  onEvent: (obj: Record<string, unknown>) => void
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      try {
        onEvent(JSON.parse(t) as Record<string, unknown>);
      } catch {
        /* ignore malformed chunk */
      }
    }
  }

  const tail = buffer.trim();
  if (tail) {
    try {
      onEvent(JSON.parse(tail) as Record<string, unknown>);
    } catch {
      /* ignore */
    }
  }
}

export function NewsIngestProgressModal({
  open,
  runKey,
  sourceId,
  onClose,
  onComplete,
}: NewsIngestProgressModalProps) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [phase, setPhase] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [finalError, setFinalError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [aiReasoning, setAiReasoning] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [aiStreaming, setAiStreaming] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  const reasoningRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const reasoningBuf = useRef('');
  const outputBuf = useRef('');
  const flushRaf = useRef(0);

  useEffect(() => {
    if (!open || !sourceId) return;

    setLines([]);
    setFinalError(null);
    setSuccessId(null);
    setAiReasoning('');
    setAiOutput('');
    setAiStreaming(false);
    reasoningBuf.current = '';
    outputBuf.current = '';
    setPhase('running');

    const ac = new AbortController();

    const pushLine = (line: LogLine) => {
      setLines((prev) => [...prev, line]);
    };

    const scheduleAiFlush = () => {
      if (flushRaf.current) return;
      flushRaf.current = requestAnimationFrame(() => {
        flushRaf.current = 0;
        setAiReasoning(reasoningBuf.current);
        setAiOutput(outputBuf.current);
      });
    };

    const bumpAiDelta = (channel: 'content' | 'reasoning', text: string) => {
      if (!text) return;
      setAiStreaming(true);
      if (channel === 'reasoning') {
        reasoningBuf.current += text;
      } else {
        outputBuf.current += text;
      }
      scheduleAiFlush();
    };

    (async () => {
      try {
        const res = await fetch('/api/admin/news/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
          body: JSON.stringify({ sourceId, stream: true }),
          signal: ac.signal,
        });

        const ct = res.headers.get('content-type') ?? '';

        if (!res.ok && !ct.includes('ndjson')) {
          const data = await res.json().catch(() => ({}));
          const msg = typeof data.error === 'string' ? data.error : `HTTP ${res.status}`;
          setFinalError(msg);
          setPhase('error');
          pushLine({
            id: `e-${Date.now()}`,
            kind: 'error',
            message: msg,
            status: res.status,
          });
          return;
        }

        if (!ct.includes('ndjson')) {
          const data = await res.json().catch(() => ({}));
          if (data.id) {
            setSuccessId(String(data.id));
            setPhase('success');
            pushLine({
              id: `d-${Date.now()}`,
              kind: 'done',
              message: 'បានបញ្ចប់',
              detail: `id: ${data.id}`,
            });
          } else {
            setFinalError(typeof data.error === 'string' ? data.error : 'មិនស្គាល់កំហុស');
            setPhase('error');
          }
          return;
        }

        await consumeNdjsonStream(res, (obj) => {
          const type = String(obj.type ?? '');
          if (type === 'progress') {
            const step = typeof obj.step === 'string' ? obj.step : '';
            if (step === 'sea_lion') {
              setAiStreaming(true);
            }
            pushLine({
              id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              kind: 'progress',
              step: step || undefined,
              message: typeof obj.message === 'string' ? obj.message : '',
              detail: typeof obj.detail === 'string' ? obj.detail : undefined,
            });
          } else if (type === 'ai_delta') {
            const channel = obj.channel === 'reasoning' ? 'reasoning' : 'content';
            const text = typeof obj.text === 'string' ? obj.text : '';
            bumpAiDelta(channel, text);
          } else if (type === 'done') {
            setAiStreaming(false);
            const id = typeof obj.id === 'string' ? obj.id : '';
            setSuccessId(id);
            setPhase('success');
            pushLine({
              id: `d-${Date.now()}`,
              kind: 'done',
              message: 'បានបង្កើតព្រាងដោយជោគជ័យ',
              detail: typeof obj.slug === 'string' ? `slug: ${obj.slug}` : id,
            });
          } else if (type === 'error') {
            setAiStreaming(false);
            const msg = typeof obj.message === 'string' ? obj.message : 'បរាជ័យ';
            const status = typeof obj.status === 'number' ? obj.status : undefined;
            setFinalError(msg);
            setPhase('error');
            pushLine({
              id: `e-${Date.now()}`,
              kind: 'error',
              message: msg,
              status,
            });
          }
        });
      } catch (e) {
        if (ac.signal.aborted) return;
        setAiStreaming(false);
        const msg = e instanceof Error ? e.message : 'ទាញព័ត៌មានមិនបាន';
        setFinalError(msg);
        setPhase('error');
        pushLine({ id: `e-${Date.now()}`, kind: 'error', message: msg });
      }
    })();

    return () => {
      ac.abort();
      if (flushRaf.current) {
        cancelAnimationFrame(flushRaf.current);
        flushRaf.current = 0;
      }
    };
  }, [open, sourceId, runKey]);

  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  useEffect(() => {
    if (reasoningRef.current) {
      reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
    }
  }, [aiReasoning]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [aiOutput]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ingest-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <h2 id="ingest-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            ទាញយកព័ត៌មាន (AI)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="បិទ"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {phase === 'running' && (
            <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400">
              <span
                className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden
              />
              <span>កំពុងដំណើរការ — សូមរង់ចាំ…</span>
            </div>
          )}
          {phase === 'success' && (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              ✓ បានបង្កើតព្រាង — អាចកែសម្រួល និងផុសជាសាធារណៈនៅពេលក្រោយ
            </p>
          )}
          {phase === 'error' && finalError && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">✕ {finalError}</p>
          )}

          {aiReasoning.length > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                របៀបគិត / reasoning stream
              </h3>
              <p className="mb-1 text-[11px] text-gray-500 dark:text-gray-400">
                ពីម៉ូដែល reasoning (ប្រសិនបើមាន) — instruct models ភាគច្រើនមិនផ្ញើផ្នែកនេះ។
              </p>
              <div
                ref={reasoningRef}
                className="max-h-28 overflow-y-auto rounded-lg border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 px-2 py-2 text-xs text-amber-950 dark:text-amber-100 whitespace-pre-wrap wrap-break-word font-mono"
              >
                {aiReasoning}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-400">
              ចម្លើយពី AI (streaming)
            </h3>
            <p className="mb-1 text-[11px] text-gray-500 dark:text-gray-400">
              Token ពី SEA-LION រហូតដល់ JSON ពេញ (ខ្លឹមសារខ្មែរ + HTML ក្នុង JSON)។
            </p>
            <div
              ref={outputRef}
              className="max-h-48 overflow-y-auto rounded-lg border border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/20 px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap wrap-break-word font-mono"
            >
              {aiOutput || (aiStreaming && phase === 'running' ? 'កំពុងរង់ចាំ token ដំបូង…' : '')}
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              ជំហានប្រព័ន្ធ
            </h3>
            <div
              ref={logRef}
              className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/50 px-3 py-2 text-xs font-mono text-gray-800 dark:text-gray-200 space-y-2"
            >
              {lines.length === 0 && phase === 'running' && (
                <p className="text-gray-500 dark:text-gray-400">កំពុងភ្ជាប់…</p>
              )}
              {lines.map((line) => (
                <div key={line.id} className="border-l-2 pl-2 border-gray-300 dark:border-gray-600">
                  {line.kind === 'progress' && line.step && (
                    <span className="mr-2 text-[10px] uppercase tracking-wide text-violet-600 dark:text-violet-400">
                      {formatStepLabel(line.step)}
                    </span>
                  )}
                  {line.kind === 'error' && (
                    <span className="mr-2 text-[10px] uppercase tracking-wide text-red-500">error</span>
                  )}
                  {line.kind === 'done' && (
                    <span className="mr-2 text-[10px] uppercase tracking-wide text-emerald-600">done</span>
                  )}
                  <span className="text-gray-900 dark:text-gray-100">{line.message}</span>
                  {line.detail && (
                    <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 break-all whitespace-pre-wrap">
                      {line.detail}
                    </div>
                  )}
                  {line.status != null && line.kind === 'error' && (
                    <div className="mt-0.5 text-[10px] text-gray-400">HTTP {line.status}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          {phase === 'success' && successId && (
            <button
              type="button"
              onClick={() => {
                onComplete(successId);
                onClose();
              }}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              បើកទំព័រកែសម្រួល
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {phase === 'running' ? 'បោះបង់' : 'បិទ'}
          </button>
        </div>
      </div>
    </div>
  );
}
