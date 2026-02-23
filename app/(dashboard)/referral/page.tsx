"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { Users, DollarSign, Copy, Link2, Check, Loader2, UserPlus } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ReferralUser {
  id: string
  name: string
  email: string
  created_at: string
}

export default function ReferralPage() {
  const { selectedBot } = useBots()
  const [couponInput, setCouponInput] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [copied, setCopied] = useState(false)

  const { data: couponData, mutate: mutateCoupon } = useSWR("/api/referral/coupon", fetcher)
  const { data: statsData } = useSWR("/api/referral/stats", fetcher, { refreshInterval: 30000 })
  const { data: referralsData } = useSWR("/api/referral/referrals", fetcher, { refreshInterval: 30000 })

  const coupon = couponData?.coupon
  const stats = statsData || { total_referrals: 0, total_earnings: 0 }
  const referrals: ReferralUser[] = referralsData?.referrals || []

  const referralLink = coupon
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/b/${coupon.coupon_code}`
    : ""

  const handleCreateCoupon = useCallback(async () => {
    const code = couponInput.trim().toLowerCase()
    if (!code) return

    setIsCreating(true)
    setCreateError("")

    try {
      const res = await fetch("/api/referral/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupon_code: code }),
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
  }, [couponInput, mutateCoupon])

  const handleCopy = useCallback(() => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [referralLink])

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
          {/* Stats Cards - Only 2: Indicados + Ganhos */}
          <div className="grid gap-3 md:gap-4 grid-cols-2">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-4 md:p-5">
                <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Indicados</p>
                  <p className="text-xl md:text-3xl font-bold text-foreground">{stats.total_referrals}</p>
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
                    R$ {stats.total_earnings.toLocaleString("pt-BR")}
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
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Compartilhe este link para ganhar por cada pessoa que se cadastrar.
                  </p>
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
