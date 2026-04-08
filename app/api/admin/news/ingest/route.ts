import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getIngestSources, type IngestSourceConfig } from '@/lib/news/ingest-sources';
import { runNewsIngest } from '@/lib/news/run-news-ingest';

export const runtime = 'nodejs';

type IngestBody = { sourceId?: string; stream?: boolean };

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: IngestBody = {};
  try {
    body = (await request.json()) as IngestBody;
  } catch {
    body = {};
  }

  if (body.stream) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendLine = (obj: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
        };

        try {
          const result = await runNewsIngest(
            body.sourceId,
            (p) => {
              if (p.kind === 'ai_delta') {
                sendLine({ type: 'ai_delta', channel: p.channel, text: p.text });
              } else {
                sendLine({ type: 'progress', step: p.step, message: p.message, detail: p.detail });
              }
            },
            { streamAi: true }
          );

          if (!result.ok) {
            sendLine({ type: 'error', message: result.error, status: result.status });
          } else {
            sendLine({ type: 'done', id: result.id, slug: result.slug });
          }
        } catch (e) {
          sendLine({
            type: 'error',
            message: e instanceof Error ? e.message : 'Ingest failed',
            status: 500,
          });
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-store, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  try {
    const result = await runNewsIngest(body.sourceId, () => {}, { streamAi: false });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ id: result.id, slug: result.slug });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Ingest failed';
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
