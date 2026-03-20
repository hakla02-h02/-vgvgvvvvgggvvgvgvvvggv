"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Eye, EyeOff, Cpu } from "lucide-react"
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFA]">
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 z-10">
        <div className="w-full max-w-md">
          {/* Logo MadBot */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-[#047C58] rounded-lg flex items-center justify-center shadow-lg shadow-green-900/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">MadBot</span>
          </div>

          {/* Boas-vindas */}
          <div className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-3">Olá novamente!</h1>
            <p className="text-gray-500">Insira suas credenciais para acessar sua conta.</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">E-mail</label>
              <input 
                type="email" 
                id="email" 
                placeholder="email@provedor.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#10B981] focus:ring-[3px] focus:ring-[#10B981]/20 transition-all bg-white"
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">Senha</label>
                <Link href="#" className="text-sm font-medium text-[#3B82F6] hover:underline">Esqueci minha senha</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#10B981] focus:ring-[3px] focus:ring-[#10B981]/20 transition-all bg-white pr-12"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-all transform active:scale-[0.98] shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                "Fazer Login"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Não tem uma conta? <Link href="/cadastro" className="text-[#7C3AED] font-semibold hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </section>

      {/* LADO DIREITO: VISUAL */}
      <section className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#064E3B] to-[#047C58]">
        {/* Leaf Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10c-5 15-20 25-20 40s10 30 20 40c10-10 20-25 20-40s-15-25-20-40z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}
        />
        
        {/* Organic Shapes (Glows & Blurs) */}
        <div className="absolute w-[600px] h-[600px] -top-20 -right-20 bg-[#10B981] rounded-full opacity-10 blur-[80px]" />
        <div className="absolute w-[400px] h-[400px] bottom-10 left-10 bg-[#047C58] rounded-full opacity-10 blur-[80px]" />
        <div className="absolute w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#dcfce7] rounded-full opacity-20 blur-[80px]" />

        {/* Monstera SVG Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-20 opacity-30">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white fill-current">
            <path d="M100 0C44.8 0 0 44.8 0 100s44.8 100 100 100 100-44.8 100-100S155.2 0 100 0zm0 180c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"/>
            <path d="M100 40c-20 0-40 20-40 60s20 60 40 60 40-20 40-60-20-60-40-60zm0 100c-11 0-20-10-20-40s9-40 20-40 20 10 20 40-9 40-20 40z" opacity="0.5"/>
          </svg>
        </div>

        {/* Visual Content / Illustration */}
        <div className="relative z-10 w-full h-full flex flex-col justify-center px-20">
          <div className="space-y-6">
            <div className="w-20 h-1 bg-[#10B981] rounded-full" />
            <h2 className="text-5xl font-bold text-white leading-tight">
              Inteligência que <br /> <span className="text-[#10B981]">respira</span> dados.
            </h2>
            <p className="text-green-100 text-xl max-w-md">
              A fusão perfeita entre tecnologia avançada e interface intuitiva para o seu negócio.
            </p>
          </div>
          
          {/* Floating Particle-like dots */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-300 rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-lime-400 rounded-full animate-bounce opacity-40" />
          <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white rounded-full" />
        </div>

        {/* Bottom decorative curve */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 320" className="w-full h-auto fill-current text-[#FAFAFA]/5">
            <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,213.3C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>
      </section>
    </div>
  )
}
