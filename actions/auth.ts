'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    repeatPassword: formData.get('repeatPassword') as string,
    full_name: formData.get('full_name') as string,
    role: formData.get('role') as string,
  };

  if (credentials.password !== credentials.repeatPassword) {
    redirect('/error?message=Las contraseñas no coinciden');
  }

  // Create the user account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        full_name: credentials.full_name,
        role: credentials.role,
      },
    },
  });

  if (authError) {
    redirect(`/error?message=${encodeURIComponent(authError.message)}`);
  }

  if (authData.user) {
    // Create user profile in profiles table
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: authData.user.id,
        full_name: credentials.full_name,
        email: credentials.email,
        role: credentials.role,
      },
    ]);

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't redirect on profile error, user can still sign in
    }
  }

  revalidatePath('/', 'layout');
  redirect(
    '/log-in?message=Cuenta creada exitosamente. Por favor, verifica tu email e inicia sesión.'
  );
}

export async function logIn(formData: FormData) {
  const supabase = await createClient();
  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(credentials);
  if (error) {
    redirect(`/log-in?message=${encodeURIComponent(error.message)}`);
  }

  // Get user and determine role-based redirect
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      `/log-in?message=${encodeURIComponent('No se pudo recuperar la sesión')}`
    );
  }

  const metaRole = (user.user_metadata as Record<string, unknown> | null)
    ?.role as 'jefe' | 'vendedor' | undefined;

  let role: 'jefe' | 'vendedor' | undefined = metaRole;

  if (!role) {
    // Fallback to profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profileError && profile?.role) {
      role = profile.role as 'jefe' | 'vendedor';
    }
  }

  revalidatePath('/', 'layout');

  if (role === 'jefe') {
    redirect('/dashboard/admin');
  } else if (role === 'vendedor') {
    redirect('/dashboard/vendor');
  } else {
    redirect('/dashboard');
  }
}

export async function logOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) redirect('/error');
  revalidatePath('/', 'layout');
  redirect('/log-in');
}
