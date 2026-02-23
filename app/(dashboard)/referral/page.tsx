"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { useAuth } from "@/lib/auth-context"
import { Users, DollarSign, Copy, Link2, Check, Loader2, UserPlus, Pencil, X, Crown, ShoppingBag } from "lucide-react"
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
  name: string
  email: string
  created_at: string
}

export default function ReferralPage() {
  const { selectedBot } = useBots()
  const { session } = useAuth()
  const userId = session?.userId
  const [couponInput, setCouponInput] = useState("")
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

  // Only fetch when userId is available
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

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Indique e Ganhe" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Indique e Ganhe" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          {/* Plano Atual */}
          <Card className="bg-card border-border rounded-2xl">
            <CardContent className="flex items-center gap-4 p-4 md:p-5">
              <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <Crown className="h-5 w-5 md:h-6 md:w-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">Seu Plano de Indicacao</p>
                <p className="text-base md:text-lg font-bold text-foreground">Basico</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Comissao por venda</p>
                <p className="text-base md:text-lg font-bold text-accent">R$ 0,10</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-3 md:gap-4 grid-cols-3">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-4 md:p-5">
                <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Indicados</p>
                  <p className="text-xl md:text-3xl font-bold text-foreground">{totalReferrals}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-4 md:p-5">
                <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Vendas</p>
                  <p className="text-xl md:text-3xl font-bold text-foreground">{totalReferrals}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-4 md:p-5">
                <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Ganhos</p>
                  <p className="text-xl md:text-3xl font-bold text-foreground">
                    R$ {totalEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coupon Section */}
          <Card className="bg-card border-border rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Link2 className="h-4 w-4 text-accent" />
                Seu Link de Indicacao
              </CardTitle>
            </CardHeader>
            <CardContent>
              {coupon ? (
                <div className="flex flex-col gap-3">
                  {isEditing ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Digite o novo codigo do cupom:
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Novo cupom (ex: maria20)"
                          value={editInput}
                          onChange={(e) => {
                            setEditInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                            setEditError("")
                          }}
                          className="bg-secondary border-border rounded-xl text-foreground placeholder:text-muted-foreground"
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
                          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl shrink-0"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="border-border rounded-xl shrink-0 min-w-[44px]"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {editError && (
                        <p className="text-xs text-destructive">{editError}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Apenas letras minusculas, numeros e hifens. Entre 3 e 20 caracteres.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={referralLink}
                          className="bg-secondary border-border rounded-xl text-sm text-foreground font-mono"
                        />
                        <Button
                          variant="outline"
                          onClick={handleCopy}
                          className="border-border rounded-xl shrink-0 min-w-[44px]"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-accent" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleStartEdit}
                          className="border-border rounded-xl shrink-0 min-w-[44px]"
                          title="Editar cupom"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Compartilhe este link para ganhar R$ 0,10 por cada venda feita.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    Crie seu cupom personalizado para comecar a indicar.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite seu cupom (ex: joao10)"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                        setCreateError("")
                      }}
                      className="bg-secondary border-border rounded-xl text-foreground placeholder:text-muted-foreground"
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
                      className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl shrink-0"
                    >
                      {isCreating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Gerar"
                      )}
                    </Button>
                  </div>
                  {createError && (
                    <p className="text-xs text-destructive">{createError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Apenas letras minusculas, numeros e hifens. Entre 3 e 20 caracteres.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referrals List */}
          <Card className="bg-card border-border rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                <UserPlus className="h-4 w-4 text-accent" />
                Seus Indicados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Nenhum indicado ainda</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Compartilhe seu link e veja seus indicados aqui.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {referrals.map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center justify-between rounded-xl bg-secondary p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                          {ref.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{ref.name}</p>
                          <p className="text-xs text-muted-foreground">{ref.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(ref.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  )
}
