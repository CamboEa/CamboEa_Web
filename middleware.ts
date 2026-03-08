// CamboEA - Middleware (for auth, redirects, etc.)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Example middleware to log requests and handle redirects
export function middleware(request: NextRequest) {
  // Log the request method and URL
  console.log(`Request Method: ${request.method}, URL: ${request.url}`);

  // Example: Redirect from /old-path to /new-path
  if (request.nextUrl.pathname === '/old-path') {
    const url = request.nextUrl.clone();
    url.pathname = '/new-path';
    return NextResponse.redirect(url);
  }

  // Example: Block access to a specific path
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  // Continue with the request if no conditions are met
  return NextResponse.next();
}

// Specify the paths where the middleware should run
export const config = {
  matcher: ['/old-path', '/admin/:path*'],
};