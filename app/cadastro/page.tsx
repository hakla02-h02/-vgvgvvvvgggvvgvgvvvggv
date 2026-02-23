"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Eye, EyeOff, Gift } from "lucide-react"
import { DragonIcon } from "@/components/dragon-icon"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

  // Pick up referral coupon from URL query param first, then fallback to localStorage
  useEffect(() => {
    const refParam = searchParams.get("ref")
    if (refParam) {
      setReferralCoupon(refParam.toLowerCase())
      // Also save to localStorage as backup
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
      // Clear the coupon from localStorage after successful registration
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/images/dragon-logo.png"
            alt="Dragon"
            width={180}
            height={180}
            className="object-contain"
            priority
          />
          <p className="text-sm text-muted-foreground">
            Crie sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {referralCoupon && (
            <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 p-3">
              <Gift className="h-4 w-4 text-accent shrink-0" />
              <span className="text-sm text-accent">
                Cupom de indicacao: <span className="font-semibold">{referralCoupon}</span>
              </span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-sm text-foreground">
              Nome
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground"
              autoComplete="name"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

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
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="text-sm text-foreground">
              Telefone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground"
              autoComplete="tel"
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
                placeholder="Minimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground pr-11"
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password" className="text-sm text-foreground">
              Confirmar Senha
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground pr-11"
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showConfirm ? "Esconder senha" : "Mostrar senha"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Criar Conta"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ja tem conta?{" "}
          <Link href="/login" className="text-accent hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
