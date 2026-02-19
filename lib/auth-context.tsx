"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface StoredUser {
  userId: string
  name: string
  email: string
  phone: string
  password: string
  registeredAt: number
  banned: boolean
}

interface Session {
  userId: string
  name: string
  email: string
  loggedInAt: number
}

interface AuthContextType {
  session: Session | null
  isLoading: boolean
  login: (email: string, password: string) => void
  register: (data: { name: string; email: string; phone: string; password: string }) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_KEY = "teleflow_session"
const USERS_KEY = "teleflow_users"

export function getAllUsers(): StoredUser[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAllUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setSession(parsed)
      }
    } catch {
      // ignore
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((email: string, password: string) => {
    const users = getAllUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      throw new Error("Email ou senha incorretos")
    }

    if (user.password !== password) {
      throw new Error("Email ou senha incorretos")
    }

    if (user.banned) {
      throw new Error("Conta banida")
    }

    const newSession: Session = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      loggedInAt: Date.now(),
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
    setSession(newSession)
    router.push("/")
  }, [router])

  const register = useCallback((data: { name: string; email: string; phone: string; password: string }) => {
    const users = getAllUsers()
    const exists = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())

    if (exists) {
      throw new Error("Este email ja esta cadastrado")
    }

    const newUser: StoredUser = {
      userId: crypto.randomUUID(),
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      password: data.password,
      registeredAt: Date.now(),
      banned: false,
    }

    users.push(newUser)
    saveAllUsers(users)

    const newSession: Session = {
      userId: newUser.userId,
      name: newUser.name,
      email: newUser.email,
      loggedInAt: Date.now(),
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
    setSession(newSession)
    router.push("/")
  }, [router])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ session, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
