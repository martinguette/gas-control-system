import type { User, LoginCredentials } from "@/types"

// Mock users for testing
const MOCK_USERS: User[] = [
  {
    email: "admin@gaspardo.com",
    password: "admin123",
    role: "jefe",
    name: "Carlos Admin",
  },
  {
    email: "vendor@gaspardo.com",
    password: "vendor123",
    role: "vendedor",
    name: "Juan Vendor",
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const authenticateUser = async (credentials: LoginCredentials): Promise<User> => {
  // Simulate API call delay
  await delay(1500)

  const user = MOCK_USERS.find((u) => u.email === credentials.email && u.password === credentials.password)

  if (!user) {
    throw new Error("Credenciales inválidas")
  }

  return user
}

export const generateMockToken = (user: User): string => {
  // Simple mock JWT token
  return btoa(
    JSON.stringify({
      userId: user.email,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }),
  )
}

export const validateToken = (token: string): User | null => {
  try {
    const decoded = JSON.parse(atob(token))
    if (decoded.exp < Date.now()) {
      return null // Token expired
    }

    const user = MOCK_USERS.find((u) => u.email === decoded.userId)
    return user || null
  } catch {
    return null
  }
}
