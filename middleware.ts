// CamboEA - Middleware (admin: PIN → login → Supabase session + role)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const ADMIN_PIN_VERIFIED_COOKIE = 'admin_pin_verified';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Step 1: PIN page is always allowed
  if (pathname === '/admin/pin') {
    return NextResponse.next();
  }

  // Step 2: Login page requires PIN verified
  const pinOk = request.cookies.get(ADMIN_PIN_VERIFIED_COOKIE)?.value;
  if (pathname === '/admin/login') {
    if (!pinOk) {
      const pinUrl = new URL('/admin/pin', request.url);
      pinUrl.searchParams.set('from', '/admin/login');
      return NextResponse.redirect(pinUrl);
    }
    return NextResponse.next();
  }

  // Step 3: Other admin routes require Supabase session + admin role
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !anonKey) {
    // If Supabase is not configured, fail closed for admin routes
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/admin/login', request.url);
    if (pathname !== '/admin/login') loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};