import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

// Creating a handler to a GET request to route /auth/confirm
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  // default target
  let nextPath = '/dashboard';

  // Create redirect link without the secret token
  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete('token_hash');
  redirectTo.searchParams.delete('type');

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Determine role-based redirect
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const metaRole = (user.user_metadata as Record<string, unknown> | null)
          ?.role as 'jefe' | 'vendedor' | undefined;

        let role: 'jefe' | 'vendedor' | undefined = metaRole;

        if (!role) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile?.role === 'jefe' || profile?.role === 'vendedor') {
            role = profile.role;
          }
        }

        if (role === 'jefe') nextPath = '/dashboard/admin';
        else if (role === 'vendedor') nextPath = '/dashboard/vendor';
      }

      redirectTo.pathname = nextPath;
      redirectTo.searchParams.delete('next');
      return NextResponse.redirect(redirectTo);
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = '/error';
  return NextResponse.redirect(redirectTo);
}
