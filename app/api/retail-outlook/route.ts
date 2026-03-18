import { NextResponse } from 'next/server';

const MYFXBOOK_API_BASE = 'https://www.myfxbook.com/api';

type RetailerRow = {
  pair: string;
  avgLeft: number;
  avgRight: number;
  signal: 'buy' | 'sell' | 'neutral';
  runAt: string;
};

interface MyfxbookLoginResponse {
  error: boolean;
  message?: string;
  session?: string;
}

function normalizeMyfxbookSession(token: string): string {
  // Myfxbook often returns a URL-encoded session (contains %2B, %2F, etc).
  // Normalize to raw token and encode exactly once when building request URLs.
  try {
    return decodeURIComponent(token);
  } catch {
    return token;
  }
}

interface MyfxbookOutlookSymbol {
  name?: string;
  symbol?: string;
  longPercentage?: number;
  shortPercentage?: number;
  longPositions?: number;
  shortPositions?: number;
}

interface MyfxbookOutlookResponse {
  error: boolean;
  message?: string;
  symbols?: MyfxbookOutlookSymbol[];
  lastUpdate?: string;
  data?: {
    symbols?: MyfxbookOutlookSymbol[];
    lastUpdate?: string;
  };
}

let cachedSession: { token: string; expiresAt: number } | null = null;

async function getMyfxbookSession(): Promise<string> {
  const email = process.env.MYFXBOOK_EMAIL;
  const password = process.env.MYFXBOOK_PASSWORD;

  if (!email || !password) {
    throw new Error('Myfxbook credentials are not configured');
  }

  const now = Date.now();
  if (cachedSession && cachedSession.expiresAt > now + 60_000) {
    return cachedSession.token;
  }

  const loginUrl = `${MYFXBOOK_API_BASE}/login.json?email=${encodeURIComponent(
    email
  )}&password=${encodeURIComponent(password)}`;

  const res = await fetch(loginUrl, { cache: 'no-store' });
  const json = (await res.json().catch(() => ({}))) as MyfxbookLoginResponse;

  if (!res.ok || json.error || !json.session) {
    throw new Error(json.message || 'Failed to login to Myfxbook');
  }

  const token = normalizeMyfxbookSession(json.session);

  cachedSession = {
    token,
    // Myfxbook sessions are not documented clearly; use conservative 30 minutes.
    expiresAt: now + 30 * 60_000,
  };

  return token;
}

function mapOutlookToRows(outlook: MyfxbookOutlookResponse): RetailerRow[] {
  const symbols = outlook.symbols ?? outlook.data?.symbols ?? [];
  const runAt =
    (typeof outlook.lastUpdate === 'string' && outlook.lastUpdate) ||
    (typeof outlook.data?.lastUpdate === 'string' && outlook.data.lastUpdate)
      ? (outlook.lastUpdate ?? outlook.data?.lastUpdate)!
      : new Date().toISOString();

  return symbols
    .map((s) => {
      const rawSymbol = String(s.symbol ?? s.name ?? '').toUpperCase();
      if (!rawSymbol) return null;

      const longPct = Number(s.longPercentage ?? 0);
      const shortPct = Number(s.shortPercentage ?? 0);

      let signal: 'buy' | 'sell' | 'neutral' = 'neutral';
      if (longPct > shortPct) signal = 'buy';
      else if (shortPct > longPct) signal = 'sell';

      return {
        pair: rawSymbol,
        avgLeft: longPct,
        avgRight: shortPct,
        signal,
        runAt,
      } satisfies RetailerRow;
    })
    .filter((row): row is RetailerRow => row !== null);
}

export async function GET() {
  try {
    const session = await getMyfxbookSession();

    const url = `${MYFXBOOK_API_BASE}/get-community-outlook.json?session=${encodeURIComponent(
      session
    )}`;

    let res = await fetch(url, { cache: 'no-store' });
    let json = (await res.json().catch(() => ({}))) as MyfxbookOutlookResponse;

    // If session is invalid or expired, refresh once and retry.
    if (!res.ok || json.error) {
      cachedSession = null;
      const newSession = await getMyfxbookSession();
      const retryUrl = `${MYFXBOOK_API_BASE}/get-community-outlook.json?session=${encodeURIComponent(
        newSession
      )}`;
      res = await fetch(retryUrl, { cache: 'no-store' });
      json = (await res.json().catch(() => ({}))) as MyfxbookOutlookResponse;
      if (!res.ok || json.error) {
        throw new Error(json.message || 'Failed to load Myfxbook outlook data');
      }
    }

    const rows = mapOutlookToRows(json);

    if (!rows.length) {
      return NextResponse.json(
        { error: 'No outlook data available from Myfxbook' },
        { status: 502 }
      );
    }

    return NextResponse.json(rows, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch outlook data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

