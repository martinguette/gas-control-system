import { NextRequest, NextResponse } from 'next/server';
import { getUser, updateSession } from './utils/supabase/middleware';

export async function middleware(request: NextRequest, response: NextResponse) {
  const authRoutesList = ['/', '/log-in', '/sign-up'];
  const currentPath = new URL(request.url).pathname;

  const {
    data: { user },
  } = await getUser(request, response);

  // Keep session fresh
  const supabaseResponse = await updateSession(request);

  // Gate dashboard for unauthenticated users
  if (!user && currentPath.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/log-in', request.url));
  }

  // Redirect authenticated users away from auth routes (generic dashboard; server pages will route by role)
  if (user && authRoutesList.includes(currentPath)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
