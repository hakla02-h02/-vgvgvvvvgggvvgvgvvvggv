"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, session, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] LoginPage: isLoading =", isLoading, "session =", !!session)
    if (!isLoading && session) {
      router.replace("/")
    }
  }, [isLoading, session, router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    console.log("[v0] LoginPage: handleSubmit called, email =", email)

    if (!email.trim()) {
      setError("Digite seu email")
      return
    }

    setIsSubmitting(true)
    try {
      console.log("[v0] LoginPage: calling login()")
      login(email.trim())
    } catch (err: unknown) {
      console.log("[v0] LoginPage: login error", err)
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
              Digite seu email para entrar
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

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Coloque qualquer email para criar sua conta
        </p>
      </div>
    </div>
  )
}
