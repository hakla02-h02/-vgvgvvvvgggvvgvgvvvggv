"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface StoredUser {
  userId: string
  email: string
  registeredAt: number
  banned: boolean
}

interface Session {
  userId: string
  email: string
  loggedInAt: number
}

interface AuthContextType {
  session: Session | null
  isLoading: boolean
  login: (email: string) => void
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
    console.log("[v0] AuthProvider: checking localStorage for session")
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        console.log("[v0] AuthProvider: found session for", parsed.email)
        setSession(parsed)
      } else {
        console.log("[v0] AuthProvider: no session found")
      }
    } catch (err) {
      console.log("[v0] AuthProvider: error reading session", err)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((email: string) => {
    console.log("[v0] login called with email:", email)

    // Create or find user in local storage
    const users = getAllUsers()
    let user = users.find((u) => u.email === email)

    if (!user) {
      console.log("[v0] login: creating new user for", email)
      user = {
        userId: crypto.randomUUID(),
        email,
        registeredAt: Date.now(),
        banned: false,
      }
      users.push(user)
      saveAllUsers(users)
    } else {
      console.log("[v0] login: found existing user for", email)
      if (user.banned) {
        console.log("[v0] login: user is banned, blocking")
        throw new Error("Conta banida")
      }
    }

    const newSession: Session = {
      userId: user.userId,
      email: user.email,
      loggedInAt: Date.now(),
    }

    console.log("[v0] login: saving session and redirecting")
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
    setSession(newSession)
    router.push("/")
  }, [router])

  const logout = useCallback(() => {
    console.log("[v0] logout called")
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
