import { NextRequest, NextResponse } from 'next/server';
import { getUser, updateSession } from './utils/supabase/middleware';

export async function middleware(request: NextRequest, response: NextResponse) {
  const authRoutesList = ['/', '/log-in', '/sign-up'];
  const currentPath = new URL(request.url).pathname;

  const {
    data: { user },
  } = await getUser(request, response);

  // Maintain session cookies
  const supabaseResponse = await updateSession(request);

  // If user not logged in and accessing protected dashboard, send to login
  const isDashboard = currentPath.startsWith('/dashboard');
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/log-in', request.url));
  }

  // If user is logged in and on auth routes, redirect to their role dashboard
  if (user && authRoutesList.includes(currentPath)) {
    const metaRole = (user.user_metadata as Record<string, unknown> | null)
      ?.role as 'jefe' | 'vendedor' | undefined;

    let role: 'jefe' | 'vendedor' | undefined = metaRole;

    if (!role) {
      // We cannot call supabase.from here reliably in middleware; rely on metadata only.
      // Ensure you set role in user metadata at sign up.
    }

    const target =
      role === 'jefe'
        ? '/dashboard/admin'
        : role === 'vendedor'
        ? '/dashboard/vendor'
        : '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Optional: Gate subroutes by role
  if (user && currentPath.startsWith('/dashboard/admin')) {
    const role = (user.user_metadata as Record<string, unknown> | null)?.role;
    if (role !== 'jefe') {
      return NextResponse.redirect(new URL('/dashboard/vendor', request.url));
    }
  }

  if (user && currentPath.startsWith('/dashboard/vendor')) {
    const role = (user.user_metadata as Record<string, unknown> | null)?.role;
    if (role !== 'vendedor') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
