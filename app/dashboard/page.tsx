import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/log-in');
  }

  // Obtener el rol del usuario desde la tabla users
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = userData?.role;

  // Redirigir según el rol
  if (userRole === 'jefe') {
    redirect('/dashboard/admin');
  } else if (userRole === 'vendedor') {
    redirect('/dashboard/vendor');
  } else {
    // Si no tiene rol asignado, redirigir a login
    redirect('/log-in');
  }
}
