'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { serverLoginSchema, serverSignUpSchema } from '@/lib/validations';

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  // Validar datos del formulario
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    repeatPassword: formData.get('repeatPassword') as string,
    full_name: formData.get('full_name') as string,
    role: formData.get('role') as string,
  };

  // Validar con Zod
  const validationResult = serverSignUpSchema.safeParse(rawData);
  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    redirect(`/sign-up?message=${encodeURIComponent(firstError.message)}`);
  }

  const credentials = validationResult.data;

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
    // Mapear errores de Supabase a mensajes user-friendly
    let errorMessage = 'Error al crear la cuenta. Por favor, intenta de nuevo.';

    if (authError.message.includes('already registered')) {
      errorMessage = 'Este email ya está registrado. Intenta iniciar sesión.';
    } else if (authError.message.includes('invalid email')) {
      errorMessage = 'El email ingresado no es válido.';
    } else if (authError.message.includes('password')) {
      errorMessage = 'La contraseña no cumple con los requisitos de seguridad.';
    }

    redirect(`/sign-up?message=${encodeURIComponent(errorMessage)}`);
  }

  // Profile creation is handled by DB trigger on auth.users insert
  revalidatePath('/', 'layout');
  redirect(
    '/log-in?message=' +
      encodeURIComponent(
        'Cuenta creada exitosamente. Por favor, verifica tu email e inicia sesión.'
      )
  );
}

export async function logIn(formData: FormData) {
  const supabase = await createClient();

  // Validar datos del formulario
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  // Validar con Zod
  const validationResult = serverLoginSchema.safeParse(rawData);
  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    // Incluir el email en la URL para mantenerlo en el formulario
    const emailParam = encodeURIComponent(rawData.email || '');
    redirect(
      `/log-in?message=${encodeURIComponent(
        firstError.message
      )}&email=${emailParam}`
    );
  }

  const credentials = validationResult.data;

  const { error } = await supabase.auth.signInWithPassword(credentials);
  if (error) {
    // Mapear errores de Supabase a mensajes user-friendly
    let errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';

    if (error.message.includes('Invalid login credentials')) {
      errorMessage =
        'Email o contraseña incorrectos. Verifica tus credenciales.';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Por favor, verifica tu email antes de iniciar sesión.';
    } else if (error.message.includes('Too many requests')) {
      errorMessage =
        'Demasiados intentos. Espera un momento antes de intentar de nuevo.';
    } else if (error.message.includes('signup_disabled')) {
      errorMessage = 'El registro está deshabilitado temporalmente.';
    }

    // Incluir el email en la URL para mantenerlo en el formulario
    const emailParam = encodeURIComponent(credentials.email);
    redirect(
      `/log-in?message=${encodeURIComponent(errorMessage)}&email=${emailParam}`
    );
  }

  // Get user and determine role-based redirect
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      `/log-in?message=${encodeURIComponent(
        'Error al recuperar la sesión. Intenta de nuevo.'
      )}`
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
    // Si no se puede determinar el rol, redirigir al login con mensaje
    redirect(
      '/log-in?message=' +
        encodeURIComponent(
          'Por favor, verifica tu email para completar el registro.'
        )
    );
  }
}

export async function logOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    redirect('/error?message=Error al cerrar sesión. Intenta de nuevo.');
  }
  revalidatePath('/', 'layout');
  redirect('/log-in');
}
