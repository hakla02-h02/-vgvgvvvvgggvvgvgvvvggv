"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Loader2, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import useSWR from "swr"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Erro ao carregar dados")
  }
  return res.json()
}

interface ReferralUser {
  id: string
  referred_id: string
  name: string
  email: string
  phone: string
  banned: boolean
  user_created_at: string
  referral_date: string
  coupon_code: string
}

export default function ReferralPage() {
  const { session } = useAuth()
  const userId = session?.userId
  const [couponInput, setCouponInput] = useState("")
  const [selectedUser, setSelectedUser] = useState<ReferralUser | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editInput, setEditInput] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [editError, setEditError] = useState("")

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const { data: couponData, mutate: mutateCoupon } = useSWR(
    userId ? `/api/referral/coupon?userId=${userId}` : null,
    fetcher,
    {
      onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 2) return
        setTimeout(() => revalidate({ retryCount }), 3000)
      },
    }
  )
  const { data: statsData } = useSWR(
    userId ? `/api/referral/stats?userId=${userId}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 2) return
        setTimeout(() => revalidate({ retryCount }), 3000)
      },
    }
  )
  const { data: referralsData } = useSWR(
    userId ? `/api/referral/referrals?userId=${userId}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 2) return
        setTimeout(() => revalidate({ retryCount }), 3000)
      },
    }
  )

  const coupon = couponData?.coupon ?? null
  const totalReferrals = statsData?.total_referrals ?? 0
  const totalSales = statsData?.total_sales ?? 0
  const totalEarnings = statsData?.total_earnings ?? 0
  const referrals: ReferralUser[] = referralsData?.referrals ?? []

  const referralLink = coupon && origin
    ? `${origin}/b/${coupon.coupon_code}`
    : ""

  const handleCreateCoupon = useCallback(async () => {
    const code = couponInput.trim().toLowerCase()
    if (!code || !userId) return

    setIsCreating(true)
    setCreateError("")

    try {
      const res = await fetch("/api/referral/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupon_code: code, userId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setCreateError(data.error || "Erro ao criar cupom")
        return
      }

      setCouponInput("")
      mutateCoupon()
    } catch {
      setCreateError("Erro ao criar cupom")
    } finally {
      setIsCreating(false)
    }
  }, [couponInput, mutateCoupon, userId])

  const handleCopy = useCallback(() => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [referralLink])

  const handleStartEdit = useCallback(() => {
    if (coupon) {
      setEditInput(coupon.coupon_code)
      setEditError("")
      setIsEditing(true)
    }
  }, [coupon])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditInput("")
    setEditError("")
  }, [])

  const handleUpdateCoupon = useCallback(async () => {
    const code = editInput.trim().toLowerCase()
    if (!code || !userId) return

    setIsUpdating(true)
    setEditError("")

    try {
      const res = await fetch("/api/referral/coupon", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupon_code: code, userId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setEditError(data.error || "Erro ao atualizar cupom")
        return
      }

      setIsEditing(false)
      setEditInput("")
      mutateCoupon()
    } catch {
      setEditError("Erro ao atualizar cupom")
    } finally {
      setIsUpdating(false)
    }
  }, [editInput, mutateCoupon, userId])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <>
      <DashboardHeader title="Indique e Ganhe" />
      <ScrollArea className="flex-1">
        <div className="p-8 bg-background dark:bg-background min-h-full">
          <div className="max-w-6xl mx-auto">
            
            {/* Two Column Layout - Main Content + Side Panel */}
            <div className="grid grid-cols-[1fr_320px] gap-6">
              
              {/* Left Column - Main Content */}
              <div className="flex flex-col gap-6">
                
                {/* Hero Analytics Panel */}
                <div className="bg-foreground dark:bg-card rounded-[24px] p-8 relative overflow-hidden shadow-xl">
                  {/* Ambient Glows */}
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#a3e635] opacity-20 blur-[80px] rounded-full pointer-events-none"></div>
                  <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500 opacity-15 blur-[60px] rounded-full pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    {/* Header with Plan Badge */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#a3e635]/20 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#a3e635]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
                          </svg>
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-white tracking-tight">
                            Programa de Indicacao
                          </h1>
                          <p className="text-white/60 text-sm">
                            Convide amigos e ganhe comissao por cada venda
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-4 py-1.5 bg-[#a3e635]/20 rounded-full border border-[#a3e635]/30">
                          <span className="text-[#a3e635] text-xs font-semibold">Plano Basico</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid - 3 Column */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-[#a3e635]/30 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Indicados</span>
                          <div className="w-8 h-8 rounded-xl bg-[#a3e635]/20 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#a3e635]" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                          </div>
                        </div>
                        <p className="text-4xl font-bold text-white">{totalReferrals}</p>
                        <p className="text-white/40 text-xs mt-1">pessoas indicadas</p>
                      </div>
                      
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-blue-400/30 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Vendas</span>
                          <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="9" cy="21" r="1"/>
                              <circle cx="20" cy="21" r="1"/>
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                          </div>
                        </div>
                        <p className="text-4xl font-bold text-white">{totalSales}</p>
                        <p className="text-white/40 text-xs mt-1">conversoes realizadas</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-[#a3e635]/20 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-5 border border-[#a3e635]/20 hover:border-[#a3e635]/40 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Ganhos Totais</span>
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="12" y1="1" x2="12" y2="23"/>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                          </div>
                        </div>
                        <p className="text-4xl font-bold text-[#a3e635]">
                          R$ {totalEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-white/40 text-xs mt-1">R$ 0,10 por venda</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Link Module */}
                <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#a3e635]/10 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#a3e635]" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">Seu Link de Indicacao</h2>
                      <p className="text-xs text-muted-foreground">Compartilhe este link com seus amigos</p>
                    </div>
                  </div>

                  {coupon ? (
                    <>
                      {isEditing ? (
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Novo cupom (ex: maria20)"
                              value={editInput}
                              onChange={(e) => {
                                setEditInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                                setEditError("")
                              }}
                              className="bg-muted border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-[#a3e635]/50 h-11"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  handleUpdateCoupon()
                                }
                                if (e.key === "Escape") {
                                  handleCancelEdit()
                                }
                              }}
                              disabled={isUpdating}
                              maxLength={20}
                              autoFocus
                            />
                            <Button
                              onClick={handleUpdateCoupon}
                              disabled={isUpdating || editInput.trim().length < 3}
                              className="bg-[#a3e635] text-black hover:bg-[#95d62e] rounded-xl px-5 h-11"
                            >
                              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              className="border-border text-foreground hover:bg-muted rounded-xl h-11"
                            >
                              Cancelar
                            </Button>
                          </div>
                          {editError && <p className="text-xs text-red-500">{editError}</p>}
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <div className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground font-mono truncate flex items-center">
                            {referralLink}
                          </div>
                          <Button
                            onClick={handleCopy}
                            className={cn(
                              "rounded-xl px-5 h-11 transition-all font-medium",
                              copied 
                                ? "bg-[#a3e635] text-black" 
                                : "bg-foreground text-background hover:bg-foreground/90"
                            )}
                          >
                            {copied ? "Copiado!" : "Copiar Link"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleStartEdit}
                            className="border-border text-foreground hover:bg-muted rounded-xl h-11"
                          >
                            Editar
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-3">
                        <Input
                          placeholder="Digite seu cupom personalizado (ex: joao10)"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                            setCreateError("")
                          }}
                          className="bg-muted border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-[#a3e635]/50 h-11"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleCreateCoupon()
                            }
                          }}
                          disabled={isCreating}
                          maxLength={20}
                        />
                        <Button
                          onClick={handleCreateCoupon}
                          disabled={isCreating || couponInput.length < 3}
                          className="bg-[#a3e635] text-black hover:bg-[#95d62e] rounded-xl px-6 h-11 font-medium"
                        >
                          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Cupom"}
                        </Button>
                      </div>
                      {createError && <p className="text-xs text-red-500">{createError}</p>}
                      <p className="text-xs text-muted-foreground">
                        Apenas letras minusculas, numeros e hifens. Entre 3 e 20 caracteres.
                      </p>
                    </div>
                  )}
                </div>

                {/* Referrals List Module */}
                <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="font-semibold text-foreground">Seus Indicados</h2>
                        <p className="text-xs text-muted-foreground">{referrals.length} {referrals.length === 1 ? "pessoa indicada" : "pessoas indicadas"}</p>
                      </div>
                    </div>
                  </div>

                  {referrals.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-16 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-lg">Nenhum indicado ainda</p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                          Compartilhe seu link de indicacao com amigos e veja seus indicados aparecerem aqui
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {referrals.map((ref) => (
                        <div
                          key={ref.id}
                          onClick={() => setSelectedUser(ref)}
                          className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all cursor-pointer group border border-transparent hover:border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#a3e635] to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {ref.name.charAt(0).toUpperCase()}
                              </div>
                              <span
                                className={cn(
                                  "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card",
                                  ref.banned ? "bg-red-500" : "bg-emerald-500"
                                )}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{ref.name}</p>
                              <p className="text-xs text-muted-foreground">{ref.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Indicado em</p>
                              <p className="text-xs font-medium text-foreground">{formatDate(ref.referral_date)}</p>
                            </div>
                            <div className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium",
                              ref.banned 
                                ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400" 
                                : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            )}>
                              {ref.banned ? "Inativo" : "Ativo"}
                            </div>
                            <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 18l6-6-6-6"/>
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Side Panel */}
              <div className="flex flex-col gap-6">
                
                {/* How It Works Module */}
                <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <h2 className="font-semibold text-foreground">Como Funciona</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#a3e635]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#a3e635] text-xs font-bold">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Compartilhe seu link</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Envie seu link personalizado para amigos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-500 text-xs font-bold">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Eles se cadastram</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Seus amigos criam uma conta pelo seu link</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-emerald-500 text-xs font-bold">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Voce ganha</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Receba R$ 0,10 por cada venda realizada</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips Module */}
                <div className="bg-gradient-to-br from-[#a3e635]/10 to-emerald-500/5 rounded-[20px] p-6 border border-[#a3e635]/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#a3e635]/20 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#a3e635]" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </div>
                    <h2 className="font-semibold text-foreground">Dicas para Ganhar Mais</h2>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#a3e635] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <p className="text-sm text-muted-foreground">Compartilhe nas redes sociais</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#a3e635] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <p className="text-sm text-muted-foreground">Envie para grupos de WhatsApp</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#a3e635] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <p className="text-sm text-muted-foreground">Fale sobre os beneficios da plataforma</p>
                    </li>
                  </ul>
                </div>

                {/* Support Card */}
                <div className="bg-foreground dark:bg-card rounded-[20px] p-5 border border-white/5 relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#a3e635] opacity-20 blur-[40px] rounded-full pointer-events-none"></div>
                  <div className="relative z-10">
                    <h3 className="font-semibold text-white text-sm mb-2">Precisa de Ajuda?</h3>
                    <p className="text-white/60 text-xs mb-4">Fale com nosso suporte para tirar duvidas sobre o programa</p>
                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl h-9 text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Falar com Suporte
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </ScrollArea>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="bg-foreground dark:bg-card border-white/10 text-background dark:text-foreground rounded-[24px] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-background dark:text-foreground">Detalhes do Indicado</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#a3e635] to-[#16a34a] flex items-center justify-center text-background dark:text-foreground font-bold text-xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.name}</p>
                  <div className={cn(
                    "inline-flex px-2 py-0.5 rounded text-xs font-medium mt-1",
                    selectedUser.banned 
                      ? "bg-red-500/20 text-red-400" 
                      : "bg-green-500/20 text-green-400"
                  )}>
                    {selectedUser.banned ? "Inativo" : "Ativo"}
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-card/5 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span className="text-sm text-gray-300">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span className="text-sm text-gray-300">{selectedUser.phone || "Nao informado"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span className="text-sm text-gray-300">Indicado em {formatDate(selectedUser.referral_date)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
