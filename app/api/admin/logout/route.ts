import { NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'admin_session';
const ADMIN_PIN_VERIFIED_COOKIE = 'admin_pin_verified';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const opts = { httpOnly: true, path: '/', maxAge: 0 };

  res.cookies.set(ADMIN_SESSION_COOKIE, '', opts);
  res.cookies.set(ADMIN_PIN_VERIFIED_COOKIE, '', opts);

  return res;
}
