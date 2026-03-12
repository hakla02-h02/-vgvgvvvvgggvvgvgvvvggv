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
        <div className="p-4 md:p-8 bg-[#f4f5f7] min-h-full">
          <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-foreground dark:bg-card flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-2xl bg-[#a3e635] opacity-20 blur-md"></div>
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#a3e635] relative z-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Indique e Ganhe
                </h1>
                <p className="text-sm text-muted-foreground">
                  Convide amigos e ganhe comissao por cada venda
                </p>
              </div>
            </div>

            {/* Main Hero Card - Dark */}
            <div className="bg-foreground dark:bg-card rounded-[28px] p-6 md:p-8 mb-6 relative overflow-hidden">
              {/* Glows */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#a3e635] opacity-15 blur-[60px] rounded-full pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500 opacity-10 blur-[50px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-3 py-1 bg-[#a3e635]/20 rounded-full">
                    <span className="text-[#a3e635] text-xs font-semibold">Plano Basico</span>
                  </div>
                  <div className="px-3 py-1 bg-card/10 rounded-full">
                    <span className="text-background dark:text-foreground/70 text-xs">R$ 0,10 por venda</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#a3e635]"></div>
                      <span className="text-muted-foreground text-xs">Indicados</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-background dark:text-foreground">{totalReferrals}</p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span className="text-muted-foreground text-xs">Vendas</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-background dark:text-foreground">{totalSales}</p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      <span className="text-muted-foreground text-xs">Ganhos</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-background dark:text-foreground">
                      R$ {totalEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Link Section */}
                <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#a3e635]" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    <span className="text-background dark:text-foreground text-sm font-medium">Seu Link de Indicacao</span>
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
                              className="bg-foreground dark:bg-card border-white/10 rounded-xl text-background dark:text-foreground placeholder:text-muted-foreground focus:border-[#a3e635]/50"
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
                              className="bg-[#a3e635] text-black hover:bg-[#95d62e] rounded-xl px-4"
                            >
                              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              className="border-white/10 text-background dark:text-foreground hover:bg-card/5 rounded-xl"
                            >
                              Cancelar
                            </Button>
                          </div>
                          {editError && <p className="text-xs text-red-400">{editError}</p>}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <div className="flex-1 bg-foreground dark:bg-card border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 font-mono truncate">
                            {referralLink}
                          </div>
                          <Button
                            onClick={handleCopy}
                            className={cn(
                              "rounded-xl px-4 transition-all",
                              copied 
                                ? "bg-[#a3e635] text-black" 
                                : "bg-card/10 text-background dark:text-foreground hover:bg-card/20"
                            )}
                          >
                            {copied ? "Copiado!" : "Copiar"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleStartEdit}
                            className="border-white/10 text-background dark:text-foreground hover:bg-card/5 rounded-xl"
                          >
                            Editar
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite seu cupom (ex: joao10)"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                            setCreateError("")
                          }}
                          className="bg-foreground dark:bg-card border-white/10 rounded-xl text-background dark:text-foreground placeholder:text-muted-foreground focus:border-[#a3e635]/50"
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
                          className="bg-[#a3e635] text-black hover:bg-[#95d62e] rounded-xl px-6"
                        >
                          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
                        </Button>
                      </div>
                      {createError && <p className="text-xs text-red-400">{createError}</p>}
                      <p className="text-xs text-muted-foreground">
                        Apenas letras minusculas, numeros e hifens. Entre 3 e 20 caracteres.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Referrals List */}
            <div className="bg-card rounded-[24px] p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#f0fdf4] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#16a34a]" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">Seus Indicados</h2>
                    <p className="text-xs text-muted-foreground">{referrals.length} {referrals.length === 1 ? "pessoa" : "pessoas"}</p>
                  </div>
                </div>
              </div>

              {referrals.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Nenhum indicado ainda</p>
                    <p className="text-sm text-muted-foreground mt-1">Compartilhe seu link e veja seus indicados aqui</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {referrals.map((ref) => (
                    <div
                      key={ref.id}
                      onClick={() => setSelectedUser(ref)}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-gray-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a3e635] to-[#16a34a] flex items-center justify-center text-background dark:text-foreground font-bold text-sm">
                            {ref.name.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                              ref.banned ? "bg-red-500" : "bg-green-500"
                            )}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{ref.name}</p>
                          <p className="text-xs text-muted-foreground">{ref.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Indicado em</p>
                          <p className="text-xs font-medium text-gray-600">{formatDate(ref.referral_date)}</p>
                        </div>
                        <div className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium",
                          ref.banned 
                            ? "bg-red-100 text-red-600" 
                            : "bg-green-100 text-green-600"
                        )}>
                          {ref.banned ? "Inativo" : "Ativo"}
                        </div>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
