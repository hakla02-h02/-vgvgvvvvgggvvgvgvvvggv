"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { DragonIcon } from "@/components/dragon-icon"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, session, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/")
    }
  }, [isLoading, session, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Digite seu email")
      return
    }

    if (!password) {
      setError("Digite sua senha")
      return
    }

    setIsSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Erro ao entrar")
      }
      setIsSubmitting(false)
    }
  }

  if (isLoading || session) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg animate-pulse">
          <DragonIcon className="h-5 w-5" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* LADO ESQUERDO: FORMULARIO */}
      <div className="flex w-full lg:w-[480px] flex-col justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
              <DragonIcon className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Dragon</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-1.5">Bem-vindo de volta</h1>
            <p className="text-sm text-muted-foreground">Entre com suas credenciais para continuar.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">E-mail</label>
              <input 
                type="email" 
                id="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Senha</label>
                <Link href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">Esqueceu?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-10 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Nao tem conta? <Link href="/cadastro" className="text-accent font-medium hover:underline">Criar conta</Link>
          </p>
        </div>
      </div>

      {/* LADO DIREITO: VISUAL */}
      <div className="hidden lg:flex flex-1 relative bg-muted/30 border-l border-border">
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10" />
        
        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px',
            color: 'var(--border)'
          }}
        />

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16">
          {/* Dragon visual */}
          <div className="relative mb-12">
            <div className="absolute inset-0 w-32 h-32 rounded-2xl bg-accent/10 blur-2xl" />
            <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-xl">
              <DragonIcon className="w-16 h-16 text-accent-foreground" />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-semibold text-foreground">1.2k</div>
              <div className="text-xs text-muted-foreground mt-1">Conversas/dia</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-semibold text-accent">94%</div>
              <div className="text-xs text-muted-foreground mt-1">Resolucao</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-semibold text-foreground">2.5s</div>
              <div className="text-xs text-muted-foreground mt-1">Resposta</div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-foreground mb-2">Automatize com inteligencia</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              IA avancada para transformar seu atendimento e escalar seu negocio de forma eficiente.
            </p>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-accent/40" />
        <div className="absolute bottom-8 left-8 w-2 h-2 rounded-full bg-accent/40" />
      </div>
    </div>
  )
}
