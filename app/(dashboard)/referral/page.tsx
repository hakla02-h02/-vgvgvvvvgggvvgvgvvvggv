"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { Users, DollarSign, Copy, Link2, Check, Loader2, UserPlus, Pencil, X, Crown, ShoppingBag, Eye, Phone, Mail, Calendar, Shield, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
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
                  <p className="text-xl md:text-3xl font-bold text-foreground">{totalSales}</p>
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <UserPlus className="h-4 w-4 text-accent" />
                  Seus Indicados
                </CardTitle>
                {referrals.length > 0 && (
                  <Badge variant="secondary" className="text-xs font-medium rounded-lg">
                    {referrals.length} {referrals.length === 1 ? "pessoa" : "pessoas"}
                  </Badge>
                )}
              </div>
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
                      className="group flex items-center justify-between rounded-xl bg-secondary/70 p-3 transition-colors hover:bg-secondary"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                            {ref.name.charAt(0).toUpperCase()}
                          </div>
                          {/* Status dot */}
                          <span
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                              ref.banned ? "bg-destructive" : "bg-accent"
                            )}
                          />
                        </div>
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{ref.name}</p>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1.5 py-0 h-4 rounded-md border shrink-0",
                                ref.banned
                                  ? "border-destructive/30 text-destructive"
                                  : "border-accent/30 text-accent"
                              )}
                            >
                              {ref.banned ? "Inativo" : "Ativo"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{ref.email}</p>
                        </div>
                      </div>
                      {/* Right side */}
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Indicado em</p>
                          <p className="text-xs font-medium text-foreground">{formatDate(ref.referral_date)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(ref)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalhes do Indicado</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="flex flex-col gap-5">
              {/* Profile header */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-lg font-bold text-accent">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card",
                      selectedUser.banned ? "bg-destructive" : "bg-accent"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground truncate">{selectedUser.name}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[11px] px-2 py-0.5 rounded-md border mt-1",
                      selectedUser.banned
                        ? "border-destructive/30 text-destructive bg-destructive/5"
                        : "border-accent/30 text-accent bg-accent/5"
                    )}
                  >
                    {selectedUser.banned ? "Conta Inativa" : "Conta Ativa"}
                  </Badge>
                </div>
              </div>

              {/* Info list */}
              <div className="flex flex-col gap-3 rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground truncate">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">Telefone</p>
                    <p className="text-sm text-foreground">{selectedUser.phone || "Nao informado"}</p>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">Data de Cadastro</p>
                    <p className="text-sm text-foreground">{formatDate(selectedUser.user_created_at)}</p>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">Indicado via Cupom</p>
                    <p className="text-sm text-foreground font-mono">{selectedUser.coupon_code}</p>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">Data da Indicacao</p>
                    <p className="text-sm text-foreground">{formatDate(selectedUser.referral_date)}</p>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">Status da Conta</p>
                    <p className={cn(
                      "text-sm font-medium",
                      selectedUser.banned ? "text-destructive" : "text-accent"
                    )}>
                      {selectedUser.banned ? "Banido / Inativo" : "Ativo"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Earnings estimate */}
              <div className="rounded-xl bg-accent/5 border border-accent/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Comissao por venda deste indicado</p>
                    <p className="text-lg font-bold text-accent mt-0.5">R$ 0,10</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <DollarSign className="h-5 w-5 text-accent" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
