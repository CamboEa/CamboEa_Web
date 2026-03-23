import { NextRequest, NextResponse } from 'next/server';
import { sendSessionOpenToTelegram } from '@/lib/telegram';

type SessionAlert = {
  id: string;
  name: string;
  nameKm?: string;
  openUtc: number;
  closeUtc: number;
  flag: string;
  activeDaysUtc: number[]; // 0 = Sunday, 6 = Saturday
};

const SESSION_ALERTS: SessionAlert[] = [
  // Forex week opens Sunday 22:00 UTC and then Mon-Thu for Sydney.
  { id: 'sydney', name: 'Sydney', nameKm: 'ស៊ីដនី', openUtc: 22, closeUtc: 7, flag: '🇦🇺', activeDaysUtc: [0, 1, 2, 3, 4] },
  { id: 'asian', name: 'Asian', nameKm: 'អាស៊ី', openUtc: 0, closeUtc: 9, flag: '🇯🇵', activeDaysUtc: [1, 2, 3, 4, 5] },
  { id: 'london', name: 'London', nameKm: 'ឡុងដ៍', openUtc: 8, closeUtc: 17, flag: '🇬🇧', activeDaysUtc: [1, 2, 3, 4, 5] },
  { id: 'newyork', name: 'New York', nameKm: 'ញូវយ៉ក', openUtc: 13, closeUtc: 22, flag: '🇺🇸', activeDaysUtc: [1, 2, 3, 4, 5] },
  { id: 'london-ny-overlap', name: 'London-NY Overlap', nameKm: 'ឡុងដ៍-ញូវយ៉ក', openUtc: 13, closeUtc: 17, flag: '⚡', activeDaysUtc: [1, 2, 3, 4, 5] },
];

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.SESSION_ALERT_CRON_SECRET;
  if (!secret) return false;

  const headerSecret = req.headers.get('x-cron-secret') ?? '';
  const authHeader = req.headers.get('authorization') ?? '';
  const bearerSecret = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  return headerSecret === secret || bearerSecret === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const force = req.nextUrl.searchParams.get('force') === '1';
  const sessionParam = req.nextUrl.searchParams.get('session');

  const now = new Date();
  const utcDay = now.getUTCDay();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();

  // GitHub Actions cron can be delayed a few minutes; accept first 10 minutes of the hour.
  if (!force && utcMinute > 10) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      reason: 'Outside notification window (first 10 minutes only)',
      utcHour,
      utcMinute,
    });
  }

  const openingNow = force
    ? SESSION_ALERTS.filter((s) => (sessionParam ? s.id === sessionParam : true))
    : SESSION_ALERTS.filter((s) => s.openUtc === utcHour && s.activeDaysUtc.includes(utcDay));

  if (!openingNow.length) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      reason: force
        ? 'No matching session id found for force mode'
        : 'No sessions opening at this time',
      utcDay,
      utcHour,
      utcMinute,
      ...(force && sessionParam ? { session: sessionParam } : {}),
    });
  }

  const results = await Promise.all(
    openingNow.map(async (session) => {
      const ok = await sendSessionOpenToTelegram({
        name: session.name,
        nameKm: session.nameKm,
        openUtc: session.openUtc,
        closeUtc: session.closeUtc,
        flag: session.flag,
      });
      return { id: session.id, ok };
    })
  );

  const sent = results.filter((r) => r.ok).length;
  return NextResponse.json({
    ok: true,
    sent,
    attempted: results.length,
    force,
    ...(sessionParam ? { session: sessionParam } : {}),
    results,
  });
}
