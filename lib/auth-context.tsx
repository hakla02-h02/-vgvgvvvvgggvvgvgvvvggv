"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export interface AuthSession {
  userId: string
  email: string
}

interface AuthContextType {
  session: AuthSession | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  register: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => void
}

const SESSION_KEY = "teleflow_session"
const SESSION_HOURS = 5

const AuthContext = createContext<AuthContextType | null>(null)

function saveLocal(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, exp: Date.now() + SESSION_HOURS * 3600000 }))
}

function loadLocal(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (Date.now() > data.exp) { localStorage.removeItem(SESSION_KEY); return null }
    return { userId: data.userId, email: data.email }
  } catch { return null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const s = loadLocal()
    setSession(s)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const cleanEmail = email.toLowerCase().trim()

    const { data, error } = await supabase
      .from("users")
      .select("id, email, password, banned")
      .eq("email", cleanEmail)
      .single()

    if (error || !data) return { error: "Email ou senha incorretos." }
    if (data.password !== password) return { error: "Email ou senha incorretos." }
    if (data.banned) return { error: "Sua conta foi banida." }

    const s: AuthSession = { userId: data.id, email: data.email }
    saveLocal(s)
    setSession(s)
    router.push("/")
    return { error: null }
  }, [router])

  const register = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const cleanEmail = email.toLowerCase().trim()

    if (password.length < 4) return { error: "A senha precisa ter no minimo 4 caracteres." }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", cleanEmail)
      .single()

    if (existing) return { error: "Esse email ja esta cadastrado." }

    const { data, error } = await supabase
      .from("users")
      .insert({ email: cleanEmail, password })
      .select("id, email")
      .single()

    if (error || !data) {
      console.log("[v0] Register error:", error)
      return { error: "Erro ao criar conta. Tente novamente." }
    }

    const s: AuthSession = { userId: data.id, email: data.email }
    saveLocal(s)
    setSession(s)
    router.push("/")
    return { error: null }
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
  if (!ctx) throw new Error("useAuth fora do AuthProvider")
  return ctx
}
