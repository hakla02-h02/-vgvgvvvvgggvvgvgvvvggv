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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl animate-pulse">
            <DragonIcon className="h-7 w-7" />
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl animate-pulse">
          <DragonIcon className="h-7 w-7" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* LADO ESQUERDO: FORMULARIO */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 z-10 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo Dragon */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <DragonIcon className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">Dragon</span>
          </div>

          {/* Boas-vindas */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Crie sua conta</h1>
            <p className="text-muted-foreground">Preencha os dados abaixo para comecar.</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {referralCoupon && (
              <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 p-3">
                <Gift className="h-4 w-4 text-accent shrink-0" />
                <span className="text-sm text-accent">
                  Cupom de indicacao: <span className="font-semibold">{referralCoupon}</span>
                </span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">Nome</label>
              <input 
                type="text" 
                id="name" 
                placeholder="Seu nome completo" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20 transition-all"
                autoComplete="name"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

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
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-foreground">Telefone</label>
              <input 
                type="tel" 
                id="phone" 
                placeholder="(11) 99999-9999" 
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20 transition-all"
                autoComplete="tel"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="Minimo 6 caracteres" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20 transition-all pr-12"
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">Confirmar Senha</label>
              <div className="relative">
                <input 
                  type={showConfirm ? "text" : "password"} 
                  id="confirm-password" 
                  placeholder="Repita a senha" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20 transition-all pr-12"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Esconder senha" : "Mostrar senha"}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                "Criar Conta"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-muted-foreground">
            Ja tem uma conta? <Link href="/login" className="text-accent font-semibold hover:underline">Entrar</Link>
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
              Comece sua <br /> <span className="text-accent">jornada.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-sm">
              Crie sua conta e tenha acesso a automacao inteligente para seu negocio.
            </p>
          </div>
        </div>

        {/* Floating stats cards */}
        <div className="absolute top-20 right-16 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
          <div className="text-xs text-muted-foreground mb-1">Usuarios ativos</div>
          <div className="text-2xl font-bold text-foreground">5,832</div>
          <div className="text-xs text-accent">+23% este mes</div>
        </div>

        <div className="absolute top-44 right-8 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
          <div className="text-xs text-muted-foreground mb-1">Satisfacao</div>
          <div className="text-2xl font-bold text-accent">98%</div>
        </div>
      </section>
    </div>
  )
}
