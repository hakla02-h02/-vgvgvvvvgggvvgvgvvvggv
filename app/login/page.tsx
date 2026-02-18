"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [successMsg, setSuccessMsg] = useState("")
  const { login, signup, session, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/")
    }
  }, [isLoading, session, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccessMsg("")

    if (!email.trim()) {
      setError("Digite seu email")
      return
    }
    if (!password.trim()) {
      setError("Digite sua senha")
      return
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === "login") {
        await login(email.trim(), password)
      } else {
        await signup(email.trim(), password)
        setSuccessMsg("Conta criada! Verifique seu email para confirmar.")
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos")
        } else if (err.message.includes("User already registered")) {
          setError("Este email ja esta registrado. Faca login.")
        } else if (err.message.includes("Email not confirmed")) {
          setError("Confirme seu email antes de entrar.")
        } else {
          setError(err.message)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || session) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground animate-pulse">
          <Zap className="h-6 w-6" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Zap className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">TeleFlow</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "login" ? "Entre para acessar seu painel" : "Crie sua conta"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground"
              autoComplete="email"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-sm text-foreground">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground pr-10"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {successMsg && (
            <p className="text-sm text-emerald-500">{successMsg}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              "Entrar"
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login")
              setError("")
              setSuccessMsg("")
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === "login" ? "Nao tem conta? Criar conta" : "Ja tem conta? Entrar"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Autenticacao via Supabase
        </p>
      </div>
    </div>
  )
}
