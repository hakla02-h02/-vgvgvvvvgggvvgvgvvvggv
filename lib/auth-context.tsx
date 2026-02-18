"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

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
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function mapUserToSession(user: User): Session {
  return {
    userId: user.id,
    email: user.email ?? "",
    loggedInAt: Date.now(),
  }
}

// Keep getAllUsers/saveAllUsers for adm page compatibility (reads from supabase profiles if needed, but falls back to empty)
export function getAllUsers(): StoredUser[] {
  return []
}

export function saveAllUsers(_users: StoredUser[]) {
  // no-op - managed by supabase now
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session: sbSession } }) => {
      if (sbSession?.user) {
        setSession(mapUserToSession(sbSession.user))
      }
      setIsLoading(false)
    })

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sbSession) => {
      if (sbSession?.user) {
        setSession(mapUserToSession(sbSession.user))
      } else {
        setSession(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw new Error(error.message)
    }
    router.push("/")
  }, [supabase, router])

  const signup = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    if (error) {
      throw new Error(error.message)
    }
  }, [supabase])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    router.push("/login")
  }, [supabase, router])

  return (
    <AuthContext.Provider value={{ session, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
