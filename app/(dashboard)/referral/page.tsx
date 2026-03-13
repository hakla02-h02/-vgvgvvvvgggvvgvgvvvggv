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
        <div className="min-h-full bg-gray-50 text-gray-900 pb-8">
          <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:max-w-2xl space-y-6 pt-6">
            
            {/* Hero Section */}
            <section className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 text-balance">
                Convide amigos e ganhe <span className="text-lime-600">comissoes</span>
              </h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Ganhe ate 30% de comissao recorrente por cada novo usuario indicado.
              </p>
            </section>

            {/* Earnings Hero Card */}
            <div className="relative overflow-hidden rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-1">Ganhos Totais</p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                      R$ {totalEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    {totalEarnings > 0 && (
                      <span className="text-lime-600 text-xs font-bold bg-lime-100 px-2 py-1 rounded-full">+12.5%</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Usuarios Indicados</p>
                    <p className="text-xl font-bold text-gray-900">{totalReferrals}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Comissao Atual</p>
                    <p className="text-xl font-bold text-lime-600">25%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Link Section */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seu link de indicacao</label>
              
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
                          className="flex-1 bg-white border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-lime-500 h-12"
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
                        <button
                          onClick={handleUpdateCoupon}
                          disabled={isUpdating || editInput.trim().length < 3}
                          className="bg-white border border-gray-200 p-3 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                          {isUpdating ? <Loader2 className="h-5 w-5 animate-spin text-gray-600" /> : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-lime-600" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="bg-white border border-gray-200 p-3 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                      {editError && <p className="text-xs text-red-500">{editError}</p>}
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl px-4 flex items-center h-12">
                          <span className="text-gray-600 text-sm truncate">{referralLink}</span>
                        </div>
                        <button
                          onClick={handleCopy}
                          className="flex-shrink-0 bg-white border border-gray-200 p-3 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          {copied ? (
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-lime-600" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={handleStartEdit}
                          className="flex-shrink-0 bg-white border border-gray-200 p-3 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      </div>
                      <button 
                        onClick={handleCopy}
                        className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="18" cy="5" r="3"/>
                          <circle cx="6" cy="12" r="3"/>
                          <circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        {copied ? "Link Copiado!" : "Compartilhar Link"}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Input
                    placeholder="Digite seu cupom (ex: joao10)"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                      setCreateError("")
                    }}
                    className="w-full bg-white border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-lime-500 h-12"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleCreateCoupon()
                      }
                    }}
                    disabled={isCreating}
                    maxLength={20}
                  />
                  <button 
                    onClick={handleCreateCoupon}
                    disabled={isCreating || couponInput.length < 3}
                    className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Criar Cupom
                      </>
                    )}
                  </button>
                  {createError && <p className="text-xs text-red-500">{createError}</p>}
                  <p className="text-xs text-gray-400 text-center">
                    Apenas letras minusculas, numeros e hifens. Entre 3 e 20 caracteres.
                  </p>
                </div>
              )}
            </div>

            {/* Program Steps */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Como funciona</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-lime-600" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold leading-tight text-gray-900">Compartilhe seu link exclusivo</p>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <line x1="19" y1="8" x2="19" y2="14"/>
                      <line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold leading-tight text-gray-900">Seu amigo se cadastra e assina</p>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-lime-600" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold leading-tight text-gray-900">Voce recebe sua comissao</p>
                </div>
              </div>
            </section>

            {/* Referral Table */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Indicacoes Recentes</h3>
                {referrals.length > 0 && (
                  <button className="text-xs text-lime-600 font-medium hover:text-lime-700 transition-colors">Ver todas</button>
                )}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {referrals.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-10 text-center px-6">
                    <div className="w-12 h-12 rounded-full bg-lime-100 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Nenhum indicado ainda</p>
                      <p className="text-xs text-gray-500 mt-1">Compartilhe seu link e veja seus indicados aqui</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[300px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="px-4 py-3 font-semibold text-gray-500">Usuario</th>
                          <th className="px-4 py-3 font-semibold text-gray-500">Status</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 text-right">Comissao</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {referrals.slice(0, 5).map((ref) => (
                          <tr key={ref.id} onClick={() => setSelectedUser(ref)} className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">{ref.name}</span>
                                <span className="text-[10px] text-gray-400">{formatDate(ref.referral_date)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-[10px] font-bold",
                                ref.banned 
                                  ? "bg-red-100 text-red-600" 
                                  : "bg-lime-100 text-lime-700"
                              )}>
                                {ref.banned ? "Inativo" : "Ativo"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-semibold text-gray-900">R$ 0,10</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* CTA AI Card */}
            <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-r from-orange-50 to-white border border-orange-200 flex items-center gap-4">
              <div className="relative w-14 h-14 flex-shrink-0">
                <div className="absolute inset-0 bg-orange-200 rounded-full blur-lg"></div>
                <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                    <path d="M8.5 8.5v.01"/>
                    <path d="M16 15.5v.01"/>
                    <path d="M12 12v.01"/>
                    <path d="M11 17v.01"/>
                    <path d="M7 14v.01"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-gray-900 font-bold leading-tight">Escale seus ganhos</h4>
                <p className="text-xs text-gray-500">Torne-se um embaixador e tenha beneficios exclusivos de IA.</p>
              </div>
            </div>

          </div>
        </div>
      </ScrollArea>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 rounded-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Detalhes do Indicado</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg text-gray-900">{selectedUser.name}</p>
                  <div className={cn(
                    "inline-flex px-2 py-0.5 rounded text-xs font-medium mt-1",
                    selectedUser.banned 
                      ? "bg-red-100 text-red-600" 
                      : "bg-lime-100 text-lime-700"
                  )}>
                    {selectedUser.banned ? "Inativo" : "Ativo"}
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span className="text-sm text-gray-600">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span className="text-sm text-gray-600">{selectedUser.phone || "Nao informado"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span className="text-sm text-gray-600">Indicado em {formatDate(selectedUser.referral_date)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
