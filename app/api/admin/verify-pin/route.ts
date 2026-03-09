import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PIN_VERIFIED_COOKIE = 'admin_pin_verified';

export async function POST(request: NextRequest) {
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
