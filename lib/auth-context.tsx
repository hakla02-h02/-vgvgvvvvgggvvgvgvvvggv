"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthSession {
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

const AuthContext = createContext<AuthContextType | null>(null)

const USERS_REGISTRY_KEY = "teleflow_users_registry"
const BANNED_KEY = "teleflow_banned"

function toSession(user: User): AuthSession {
  return { userId: user.id, email: user.email ?? "" }
}

function registerInRegistry(userId: string, email: string) {
  if (typeof window === "undefined") return
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY)
    const list = raw ? JSON.parse(raw) : []
    const exists = list.find((u: { userId: string }) => u.userId === userId)
    if (!exists) {
      list.push({ userId, email, firstSeen: Date.now() })
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(list))
    }
  } catch { /* ignore */ }
}

function isUserBanned(userId: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem(BANNED_KEY)
    const ids: string[] = raw ? JSON.parse(raw) : []
    return ids.includes(userId)
  } catch { return false }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user) setSession(toSession(s.user))
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, s) => {
      if (s?.user) {
        registerInRegistry(s.user.id, s.user.email ?? "")
        setSession(toSession(s.user))
      } else {
        setSession(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes("Invalid login")) return { error: "Email ou senha incorretos." }
      return { error: error.message }
    }
    if (data.user) {
      if (isUserBanned(data.user.id)) {
        await supabase.auth.signOut()
        return { error: "Sua conta foi banida." }
      }
      registerInRegistry(data.user.id, data.user.email ?? email)
      setSession(toSession(data.user))
      router.push("/")
    }
    return { error: null }
  }, [router])

  const register = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      if (error.message.includes("already registered")) return { error: "Este email ja esta cadastrado." }
      if (error.message.includes("at least 6") || error.message.includes("least 6")) return { error: "A senha precisa ter no minimo 6 caracteres." }
      return { error: error.message }
    }
    if (data.user && data.session) {
      registerInRegistry(data.user.id, data.user.email ?? email)
      setSession(toSession(data.user))
      router.push("/")
    } else if (data.user && !data.session) {
      // Supabase email confirmation enabled - user created but needs to confirm
      // For dev, we auto-login since confirmation may be disabled
      const { data: loginData } = await supabase.auth.signInWithPassword({ email, password })
      if (loginData.user) {
        registerInRegistry(loginData.user.id, loginData.user.email ?? email)
        setSession(toSession(loginData.user))
        router.push("/")
      }
    }
    return { error: null }
  }, [router])

  const logout = useCallback(() => {
    supabase.auth.signOut()
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
