export interface User {
  email: string
  password: string
  role: "jefe" | "vendedor"
  name: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}
