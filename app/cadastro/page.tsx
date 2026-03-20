"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Eye, EyeOff, Gift } from "lucide-react"
import { DragonIcon } from "@/components/dragon-icon"

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg animate-pulse">
            <DragonIcon className="h-5 w-5" />
          </div>
        </div>
      }
    >
      <CadastroContent />
    </Suspense>
  )
}

function CadastroContent() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [referralCoupon, setReferralCoupon] = useState<string | null>(null)
  const { register, session, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/")
    }
  }, [isLoading, session, router])

  useEffect(() => {
    const refParam = searchParams.get("ref")
    if (refParam) {
      setReferralCoupon(refParam.toLowerCase())
      localStorage.setItem("referral_coupon", refParam.toLowerCase())
    } else {
      const storedCoupon = localStorage.getItem("referral_coupon")
      if (storedCoupon) {
        setReferralCoupon(storedCoupon)
      }
    }
  }, [searchParams])

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Digite seu nome")
      return
    }

    if (!email.trim()) {
      setError("Digite seu email")
      return
    }

    const phoneDigits = phone.replace(/\D/g, "")
    if (!phoneDigits || phoneDigits.length < 10) {
      setError("Digite um numero de telefone valido")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem")
      return
    }

    setIsSubmitting(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phoneDigits,
        password,
        referralCoupon: referralCoupon || undefined,
      })
      localStorage.removeItem("referral_coupon")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Erro ao criar conta")
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
      <div className="flex w-full lg:w-[480px] flex-col justify-center px-6 py-12 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
              <DragonIcon className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Dragon</span>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground mb-1.5">Crie sua conta</h1>
            <p className="text-sm text-muted-foreground">Preencha os dados para comecar.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {referralCoupon && (
              <div className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-3 py-2">
                <Gift className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="text-xs text-accent">
                  Cupom: <span className="font-medium">{referralCoupon}</span>
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">Nome</label>
              <input 
                type="text" 
                id="name" 
                placeholder="Seu nome completo" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                autoComplete="name"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

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
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">Telefone</label>
              <input 
                type="tel" 
                id="phone" 
                placeholder="(11) 99999-9999" 
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                autoComplete="tel"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Senha</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    placeholder="••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-9 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">Confirmar</label>
                <div className="relative">
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    id="confirm-password" 
                    placeholder="••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-9 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
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
                "Criar conta"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ja tem conta? <Link href="/login" className="text-accent font-medium hover:underline">Entrar</Link>
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
              <div className="text-3xl font-semibold text-foreground">5.8k</div>
              <div className="text-xs text-muted-foreground mt-1">Usuarios</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-semibold text-accent">98%</div>
              <div className="text-xs text-muted-foreground mt-1">Satisfacao</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-semibold text-foreground">24/7</div>
              <div className="text-xs text-muted-foreground mt-1">Suporte</div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-foreground mb-2">Comece sua jornada</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Crie sua conta e tenha acesso a automacao inteligente para escalar seu negocio.
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
