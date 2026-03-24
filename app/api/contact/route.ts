import { NextRequest, NextResponse } from 'next/server';

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parsePayload(input: unknown): ContactPayload | null {
  if (!input || typeof input !== 'object') return null;
  const body = input as Record<string, unknown>;
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const subject = String(body.subject ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!name || !email || !subject || !message) return null;
  if (!isValidEmail(email)) return null;
  return { name, email, subject, message };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const payload = parsePayload(body);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid contact payload' },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
    if (webhookUrl) {
      const forwarded = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          source: 'camboea-contact-form',
          receivedAt: new Date().toISOString(),
        }),
      });

      if (!forwarded.ok) {
        return NextResponse.json(
          { error: 'Failed to forward contact request' },
          { status: 502 }
        );
      }
    } else {
      // Fallback path keeps endpoint functional even when no integration is configured.
      console.info('Contact payload received without CONTACT_WEBHOOK_URL configured.');
    }

    return NextResponse.json({ success: true, queued: Boolean(webhookUrl) });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
