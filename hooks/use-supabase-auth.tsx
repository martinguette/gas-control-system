'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userRole: string | null;
}

const AuthContext = createContext<{
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
} | null>(null);

export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    userRole: null,
  });

  const supabase = createClient();

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        // Si no existe en la tabla users, usar rol por defecto
        return 'vendedor';
      }

      return data?.role || 'vendedor';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'vendedor';
    }
  };

  const refreshUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        // Solo mostrar errores que no sean de sesión faltante
        if (!error.message.includes('Auth session missing')) {
          console.error('Error getting user:', error);
        }
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null, // No mostrar error de sesión como error crítico
          userRole: null,
        });
        return;
      }

      if (user) {
        const userRole = await fetchUserRole(user.id);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          userRole,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          userRole: null,
        });
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null, // No mostrar errores de sesión como errores críticos
        userRole: null,
      });
    }
  };

  useEffect(() => {
    // Verificar sesión inicial
    refreshUser();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userRole = await fetchUserRole(session.user.id);
        setAuthState({
          user: session.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          userRole,
        });
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          userRole: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        let errorMessage = error.message;

        // Traducir errores comunes
        if (error.message.includes('Invalid login credentials')) {
          errorMessage =
            'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email no confirmado. Revisa tu bandeja de entrada.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage =
            'Demasiados intentos. Espera un momento antes de intentar nuevamente.';
        } else if (error.message.includes('Database error')) {
          errorMessage = 'Error de base de datos. Contacta al administrador.';
        }

        throw new Error(errorMessage);
      }

      if (data.user) {
        const userRole = await fetchUserRole(data.user.id);
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          userRole,
        });
      }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Error de autenticación',
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        userRole: null,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useSupabaseAuth must be used within a SupabaseAuthProvider'
    );
  }
  return context;
};
