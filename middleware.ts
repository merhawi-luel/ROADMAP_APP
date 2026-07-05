import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = ['/', '/auth/signin', '/auth/error', '/favicon.ico']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const signInUrl = request.nextUrl.clone()
    signInUrl.pathname = '/auth/signin'
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/roadmaps/:path*', '/api/roadmaps/:path*'],
}
