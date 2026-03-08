import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'admin_session';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = (body.email ?? '').trim();
  const password = body.password ?? '';

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, message: 'អ៉ីមែល និងពាក្យសម្ងាត់ត្រូវតែមាន' },
      { status: 400 }
    );
  }

  const validEmail = process.env.EMAIL_ADMIN ?? '';
  const validPassword = process.env.PASSWORD_ADMIN ?? '';
  if (!validEmail || !validPassword || email !== validEmail || password !== validPassword) {
    return NextResponse.json(
      { ok: false, message: 'អ៉ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ' },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
  return res;
}
