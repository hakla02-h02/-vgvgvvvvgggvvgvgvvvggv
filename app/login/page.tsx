"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Eye, EyeOff, Zap, Shield, Clock } from "lucide-react"
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

      {/* LADO DIREITO: VISUAL INOVADOR */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        {/* Background com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-[#111] to-[#0a0a0a]" />
        
        {/* Linhas diagonais animadas */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#b8ff29] to-transparent"
              style={{
                width: '200%',
                left: '-50%',
                top: `${12 + i * 12}%`,
                transform: `rotate(-15deg)`,
                animation: `slideRight ${3 + i * 0.5}s linear infinite`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0.3 + (i * 0.1)
              }}
            />
          ))}
        </div>

        {/* Circulos decorativos */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full border border-[#222] opacity-40" />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full border border-[#1a1a1a] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#b8ff29]/10" />

        {/* Conteudo central */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          {/* Logo grande com glow */}
          <div className="relative mb-16">
            <div className="absolute inset-0 w-40 h-40 rounded-3xl bg-[#b8ff29]/20 blur-3xl" />
            <div className="absolute inset-0 w-40 h-40 rounded-3xl bg-[#b8ff29]/10 blur-xl animate-pulse" />
            <div className="relative w-40 h-40 rounded-3xl bg-gradient-to-br from-[#b8ff29] to-[#8acc00] flex items-center justify-center shadow-2xl shadow-[#b8ff29]/20">
              <DragonIcon className="w-20 h-20 text-[#0a0a0a]" />
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-4 mb-12 w-full max-w-lg">
            <div className="bg-[#111] border border-[#222] rounded-2xl p-5 text-center hover:border-[#b8ff29]/30 transition-colors">
              <div className="w-10 h-10 bg-[#b8ff29]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5 text-[#b8ff29]" />
              </div>
              <div className="text-2xl font-bold text-white">1.2k</div>
              <div className="text-xs text-[#666] mt-1">Conversas/dia</div>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-2xl p-5 text-center hover:border-[#b8ff29]/30 transition-colors">
              <div className="w-10 h-10 bg-[#b8ff29]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-[#b8ff29]" />
              </div>
              <div className="text-2xl font-bold text-[#b8ff29]">94%</div>
              <div className="text-xs text-[#666] mt-1">Resolucao</div>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-2xl p-5 text-center hover:border-[#b8ff29]/30 transition-colors">
              <div className="w-10 h-10 bg-[#b8ff29]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-[#b8ff29]" />
              </div>
              <div className="text-2xl font-bold text-white">2.5s</div>
              <div className="text-xs text-[#666] mt-1">Resposta</div>
            </div>
          </div>

          {/* Texto */}
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-white mb-3">Automatize com inteligencia</h2>
            <p className="text-[#888] leading-relaxed">
              IA avancada para transformar seu atendimento e escalar seu negocio de forma eficiente.
            </p>
          </div>
        </div>

        {/* Pontos decorativos nos cantos */}
        <div className="absolute top-8 right-8 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#b8ff29]" />
          <div className="w-2 h-2 rounded-full bg-[#b8ff29]/50" />
          <div className="w-2 h-2 rounded-full bg-[#b8ff29]/25" />
        </div>
        <div className="absolute bottom-8 left-8 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#b8ff29]/25" />
          <div className="w-2 h-2 rounded-full bg-[#b8ff29]/50" />
          <div className="w-2 h-2 rounded-full bg-[#b8ff29]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideRight {
          0% { transform: rotate(-15deg) translateX(-10%); }
          100% { transform: rotate(-15deg) translateX(10%); }
        }
      `}</style>
    </div>
  )
}
