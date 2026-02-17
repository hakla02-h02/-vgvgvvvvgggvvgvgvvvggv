"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"

const SESSION_DURATION = 5 * 60 * 60 * 1000 // 5 hours in ms
const STORAGE_KEY = "teleflow_session"

interface Session {
  userId: string
  email: string
  loggedInAt: number
}

interface AuthContextType {
  session: Session | null
  isLoading: boolean
  login: (email: string, password: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function generateUserId(email: string) {
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return "user_" + Math.abs(hash).toString(36)
}

function getStoredSession(): Session | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session: Session = JSON.parse(raw)
    const elapsed = Date.now() - session.loggedInAt
    if (elapsed > SESSION_DURATION) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = getStoredSession()
    setSession(stored)
    setIsLoading(false)
  }, [])

  const login = useCallback((email: string, _password: string) => {
    const newSession: Session = {
      userId: generateUserId(email),
      email,
      loggedInAt: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession))
    setSession(newSession)
    router.push("/")
  }, [router])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
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
