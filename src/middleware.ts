import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/verify-email', '/oauth/callback']
const ADMIN_ROUTES = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  // Allow public routes
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    if (token) return NextResponse.redirect(new URL('/dashboard', request.url))
    return NextResponse.next()
  }

  // Require auth for protected routes
  if (!token && !PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
