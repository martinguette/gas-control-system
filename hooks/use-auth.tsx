"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import type { AuthState, LoginCredentials } from "@/types"
import { authenticateUser, generateMockToken, validateToken } from "@/lib/auth"

const AuthContext = createContext<{
  authState: AuthState
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
} | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem("gas-control-token")
    if (token) {
      const user = validateToken(token)
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } else {
        localStorage.removeItem("gas-control-token")
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const user = await authenticateUser(credentials)
      const token = generateMockToken(user)

      localStorage.setItem("gas-control-token", token)

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error de autenticación",
      }))
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("gas-control-token")
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  }

  return <AuthContext.Provider value={{ authState, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
