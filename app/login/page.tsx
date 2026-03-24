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
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl animate-pulse">
          <DragonIcon className="h-5 w-5" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a]">
      {/* LADO ESQUERDO: FORMULARIO */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 py-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-[400px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#b8ff29] rounded-xl flex items-center justify-center">
              <DragonIcon className="w-5 h-5 text-[#0a0a0a]" />
            </div>
            <span className="text-xl font-semibold text-white">Dragon</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h1>
            <p className="text-[#888] text-base">Entre com suas credenciais para continuar.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#ccc]">E-mail</label>
              <input 
                type="email" 
                id="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-[#222] bg-[#111] text-base text-white placeholder:text-[#555] focus:outline-none focus:border-[#b8ff29] focus:ring-1 focus:ring-[#b8ff29]/30 transition-all"
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-[#ccc]">Senha</label>
                <Link href="#" className="text-sm text-[#888] hover:text-[#b8ff29] transition-colors">Esqueceu?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="Digite sua senha" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-[#222] bg-[#111] text-base text-white placeholder:text-[#555] focus:outline-none focus:border-[#b8ff29] focus:ring-1 focus:ring-[#b8ff29]/30 transition-all"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-[#b8ff29] text-[#0a0a0a] text-base font-semibold rounded-xl hover:bg-[#a8ef19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-base text-[#888]">
            Nao tem conta?{" "}
            <Link href="/cadastro" className="text-[#b8ff29] font-medium hover:underline">Criar conta</Link>
          </p>
        </div>
      </div>

      {/* LADO DIREITO: VISUAL BRANDING */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#080808]">
        {/* Background pattern sutil */}
        <div className="absolute inset-0 opacity-[0.015]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Glow central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#b8ff29]/[0.03] rounded-full blur-[120px]" />

        {/* Content centralizado */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          {/* Logo grande */}
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-3xl bg-[#b8ff29] flex items-center justify-center shadow-[0_0_80px_rgba(184,255,41,0.3)]">
              <DragonIcon className="w-16 h-16 text-[#080808]" />
            </div>
          </div>

          {/* Nome */}
          <h2 className="text-5xl font-bold text-white tracking-tight mb-3">Dragon</h2>
          <p className="text-[#555] text-lg">Automacao para Telegram</p>
        </div>

        {/* Linha accent inferior */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#b8ff29] rounded-full" />
      </div>
    </div>
  )
}
