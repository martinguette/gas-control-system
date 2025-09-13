export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'jefe' | 'vendedor';
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  full_name: string;
  email: string;
  role: 'jefe' | 'vendedor';
  password: string;
  repeatPassword: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'jefe' | 'vendedor';
  created_at?: string;
  updated_at?: string;
}

// Re-export inventory types
export * from './inventory';
