import { NextRequest, NextResponse } from 'next/server';
import { limitAdminPinVerify } from '@/lib/security/rate-limit';

const ADMIN_PIN_VERIFIED_COOKIE = 'admin_pin_verified';

function getIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for') ?? '';
  const ip = forwardedFor.split(',')[0]?.trim() || 'unknown-ip';
  const ua = request.headers.get('user-agent') ?? 'unknown-ua';
  return `${ip}:${ua}`;
}

export async function POST(request: NextRequest) {
  const identifier = getIdentifier(request);
  const rate = await limitAdminPinVerify(identifier);
  if (!rate.success) {
    return NextResponse.json(
      {
        ok: false,
        message: 'ព្យាយាមច្រើនពេក។ សូមរង់ចាំបន្តិចហើយសាកម្ដងទៀត។',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((rate.reset - Date.now()) / 1000))),
        },
      }
    );
  }

  const body = await request.json().catch(() => ({}));
  const pin = String(body.pin ?? '').trim();

  const validPin = (process.env.PIN_ADMIN ?? process.env.ADMIN_PIN ?? '').toString().trim();
  if (!validPin || pin !== validPin) {
    return NextResponse.json(
      { ok: false, message: 'PIN មិនត្រឹមត្រូវ' },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_PIN_VERIFIED_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 minutes to complete login
    path: '/',
  });
  return res;
}
