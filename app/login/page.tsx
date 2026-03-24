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

      {/* LADO DIREITO: DESIGN PREMIUM */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#0c0c0c]">
        {/* Background mesh gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_rgba(184,255,41,0.08)_0%,_transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_rgba(184,255,41,0.05)_0%,_transparent_50%)]" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-[#b8ff29]/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-32 left-16 w-48 h-48 rounded-full bg-[#b8ff29]/8 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center w-full h-full px-16">
          {/* Main headline */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b8ff29]/10 border border-[#b8ff29]/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-[#b8ff29] animate-pulse" />
              <span className="text-sm text-[#b8ff29] font-medium">Plataforma ativa 24/7</span>
            </div>
            
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Escale seu negocio<br />
              <span className="text-[#b8ff29]">sem limites</span>
            </h2>
            
            <p className="text-lg text-[#888] leading-relaxed max-w-md">
              Automacao inteligente que trabalha por voce enquanto voce foca no que realmente importa.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mb-16">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#b8ff29]/20 to-[#b8ff29]/5 flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#b8ff29]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">10k+</div>
                <div className="text-sm text-[#666]">Mensagens/dia</div>
              </div>
            </div>
            
            <div className="w-px h-16 bg-[#222]" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#b8ff29]/20 to-[#b8ff29]/5 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#b8ff29]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-sm text-[#666]">Uptime</div>
              </div>
            </div>
            
            <div className="w-px h-16 bg-[#222]" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#b8ff29]/20 to-[#b8ff29]/5 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#b8ff29]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{`<`}1s</div>
                <div className="text-sm text-[#666]">Resposta</div>
              </div>
            </div>
          </div>

          {/* Testimonial card */}
          <div className="bg-[#111]/80 backdrop-blur-sm border border-[#1a1a1a] rounded-2xl p-6 max-w-md">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-[#b8ff29]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-[#ccc] text-sm leading-relaxed mb-4">
              &ldquo;Triplicamos nossas vendas em 3 meses usando a automacao. O suporte e incrivel e a plataforma e muito intuitiva.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b8ff29] to-[#8acc00] flex items-center justify-center text-[#0a0a0a] font-bold text-sm">
                MR
              </div>
              <div>
                <div className="text-white text-sm font-medium">Marcos Ribeiro</div>
                <div className="text-[#666] text-xs">CEO, TechStore</div>
              </div>
            </div>
          </div>
        </div>

        {/* Corner accent */}
        <div className="absolute bottom-0 right-0 w-32 h-32">
          <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-[#b8ff29]" />
          <div className="absolute bottom-4 right-10 w-1.5 h-1.5 rounded-full bg-[#b8ff29]/50" />
          <div className="absolute bottom-10 right-4 w-1.5 h-1.5 rounded-full bg-[#b8ff29]/50" />
        </div>
      </div>
    </div>
  )
}
