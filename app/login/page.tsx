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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl animate-pulse">
          <DragonIcon className="h-7 w-7" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 z-10">
        <div className="w-full max-w-md">
          {/* Logo Dragon */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <DragonIcon className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">Dragon</span>
          </div>

          {/* Boas-vindas */}
          <div className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3">Ola novamente!</h1>
            <p className="text-muted-foreground">Insira suas credenciais para acessar sua conta.</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">E-mail</label>
              <input 
                type="email" 
                id="email" 
                placeholder="email@provedor.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20 transition-all"
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">Senha</label>
                <Link href="#" className="text-sm font-medium text-accent hover:underline">Esqueci minha senha</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="********" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20 transition-all pr-12"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-accent text-accent-foreground font-bold py-4 rounded-xl hover:bg-accent/90 transition-all transform active:scale-[0.98] shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                "Fazer Login"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Nao tem uma conta? <Link href="/cadastro" className="text-accent font-semibold hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </section>

      {/* LADO DIREITO: VISUAL DRAGON */}
      <section className="hidden lg:flex w-1/2 relative overflow-hidden bg-card">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-muted" />
        
        {/* Accent glows */}
        <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-accent rounded-full opacity-10 blur-[100px]" />
        <div className="absolute w-[400px] h-[400px] bottom-0 left-0 bg-accent rounded-full opacity-5 blur-[80px]" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Central Dragon Sphere */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-64 h-64 rounded-full bg-accent/20 blur-xl animate-pulse" />
            
            {/* Main sphere */}
            <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-accent via-accent/80 to-accent/60 shadow-2xl shadow-accent/30 flex items-center justify-center animate-float">
              {/* Inner highlight */}
              <div className="absolute top-6 left-6 w-20 h-20 rounded-full bg-white/20 blur-md" />
              
              {/* Dragon Icon */}
              <DragonIcon className="w-28 h-28 text-accent-foreground drop-shadow-lg" />
            </div>
            
            {/* Orbiting particles */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-3 h-3 bg-accent rounded-full shadow-lg shadow-accent/50 animate-bounce" />
            <div className="absolute bottom-0 right-0 translate-x-4 translate-y-4 w-2 h-2 bg-accent/70 rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-0 -translate-x-12 w-2 h-2 bg-accent/50 rounded-full" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full h-full flex flex-col justify-end px-16 pb-20">
          <div className="space-y-4">
            <div className="w-16 h-1 bg-accent rounded-full" />
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Automatize com <br /> <span className="text-accent">inteligencia.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-sm">
              IA avancada para transformar seu atendimento e escalar seu negocio.
            </p>
          </div>
        </div>

        {/* Floating stats cards */}
        <div className="absolute top-20 right-16 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
          <div className="text-xs text-muted-foreground mb-1">Conversas hoje</div>
          <div className="text-2xl font-bold text-foreground">1,247</div>
          <div className="text-xs text-accent">+12% vs ontem</div>
        </div>

        <div className="absolute top-44 right-8 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
          <div className="text-xs text-muted-foreground mb-1">Taxa de resolucao</div>
          <div className="text-2xl font-bold text-accent">94%</div>
        </div>
      </section>
    </div>
  )
}
