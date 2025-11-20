import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/admin')) {
    // Admin access is enforced client-side via AdminGuard and server-side in API routes.
    // Allow navigation; unauthorized users will see "Not authorized" and cannot call admin APIs.
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
