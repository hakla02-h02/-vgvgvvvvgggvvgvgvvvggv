"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { DragonIcon } from "@/components/dragon-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl">
            <DragonIcon className="h-9 w-9" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dragon</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre com seu email e senha
            </p>
          </div>
        </div>

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
                className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground pr-11"
                autoComplete="current-password"
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
              "Entrar"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Nao tem conta?{" "}
          <Link href="/cadastro" className="text-accent hover:underline font-medium">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
