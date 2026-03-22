"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft, Bot, MessageSquare, CreditCard, TrendingUp, TrendingDown,
  Package, Wallet, Crown, Save, Loader2, Plus, Trash2, RefreshCw,
  Users, DollarSign, HelpCircle, AlertTriangle, Lock, Pencil,
  Globe, Link2, Settings2
} from "lucide-react"

// Types
interface Flow {
  id: string
  user_id: string
  name: string
  mode: "basic" | "n8n"
  status: "active" | "paused"
  config: FlowConfig
  welcome_message?: string
  media_cache_chat_id?: string
  support_username?: string
  created_at: string
  updated_at: string
}

interface FlowConfig {
  plans?: FlowPlan[]
  upsell?: UpsellConfig
  downsell?: DownsellConfig
  orderBump?: OrderBumpConfig
  packs?: PackConfig[]
  payments?: PaymentConfig
  subscription?: SubscriptionConfig
}

interface FlowPlan {
  id: string
  name: string
  price: number
  duration_days: number
  description?: string
  active: boolean
}

interface UpsellConfig {
  enabled: boolean
  message?: string
  media_url?: string
  plans?: FlowPlan[]
}

interface DownsellConfig {
  enabled: boolean
  message?: string
  discount_percent?: number
  plans?: FlowPlan[]
}

interface OrderBumpConfig {
  enabled: boolean
  name?: string
  price?: number
  description?: string
}

interface PackConfig {
  id: string
  name: string
  items: string[]
  price: number
  discount_percent?: number
}

interface PaymentConfig {
  gateway?: string
  pix_key?: string
}

interface SubscriptionConfig {
  enabled: boolean
  plans?: {
    id: string
    name: string
    price: number
    interval: "monthly" | "yearly"
  }[]
}

interface FlowBot {
  id: string
  flow_id: string
  bot_id: string
  bot?: {
    id: string
    username: string
    first_name: string
    photo_url?: string
  }
}

interface AvailableBot {
  id: string
  username: string
  first_name: string
  photo_url?: string
}

interface TelegramChat {
  id: string
  title: string
  type: string
}

export default function FlowEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { session } = useAuth()
  const { toast } = useToast()
  const flowId = params.id as string

  // State
  const [flow, setFlow] = useState<Flow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("bots")
  const [hasChanges, setHasChanges] = useState(false)

  // Edit name
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState("")

  // Country/Region
  const [region, setRegion] = useState<"BR" | "GLOBAL">("BR")

  // Bots
  const [flowBots, setFlowBots] = useState<FlowBot[]>([])
  const [availableBots, setAvailableBots] = useState<AvailableBot[]>([])
  const [selectedBotToAdd, setSelectedBotToAdd] = useState<string>("")
  const [showAddBotDialog, setShowAddBotDialog] = useState(false)
  const [isLoadingBots, setIsLoadingBots] = useState(false)

  // Welcome message
  const [welcomeMessage, setWelcomeMessage] = useState("")

  // Plans
  const [plans, setPlans] = useState<FlowPlan[]>([])

  // Upsell
  const [upsellEnabled, setUpsellEnabled] = useState(false)
  const [upsellMessage, setUpsellMessage] = useState("")

  // Downsell
  const [downsellEnabled, setDownsellEnabled] = useState(false)
  const [downsellMessage, setDownsellMessage] = useState("")
  const [downsellDiscount, setDownsellDiscount] = useState(10)

  // Order Bump
  const [orderBumpEnabled, setOrderBumpEnabled] = useState(false)
  const [orderBumpName, setOrderBumpName] = useState("")
  const [orderBumpPrice, setOrderBumpPrice] = useState("")

  // Packs
  const [packs, setPacks] = useState<PackConfig[]>([])

  // Payments
  const [paymentGateway, setPaymentGateway] = useState("")
  const [pixKey, setPixKey] = useState("")

  // Subscription
  const [subscriptionEnabled, setSubscriptionEnabled] = useState(false)

  // Sidebar
  const [mediaCacheChat, setMediaCacheChat] = useState<string>("")
  const [supportUsername, setSupportUsername] = useState("")
  const [telegramChats, setTelegramChats] = useState<TelegramChat[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(false)

  // Stats (placeholder)
  const [stats] = useState({ leads: 0, vips: 0, revenue: 0 })

  // Fetch flow
  const fetchFlow = useCallback(async () => {
    if (!flowId || !session?.userId) return

    setIsLoading(true)
    const { data, error } = await supabase
      .from("flows")
      .select("*")
      .eq("id", flowId)
      .eq("user_id", session.userId)
      .single()

    if (error || !data) {
      console.error("[v0] Error fetching flow:", error)
      router.push("/fluxos")
      return
    }

    const flowData = data as Flow
    setFlow(flowData)
    setEditName(flowData.name)
    setWelcomeMessage(flowData.welcome_message || "")
    setMediaCacheChat(flowData.media_cache_chat_id || "")
    setSupportUsername(flowData.support_username || "")

    // Parse config
    const config = flowData.config || {}
    setPlans(config.plans || [])
    setUpsellEnabled(config.upsell?.enabled || false)
    setUpsellMessage(config.upsell?.message || "")
    setDownsellEnabled(config.downsell?.enabled || false)
    setDownsellMessage(config.downsell?.message || "")
    setDownsellDiscount(config.downsell?.discount_percent || 10)
    setOrderBumpEnabled(config.orderBump?.enabled || false)
    setOrderBumpName(config.orderBump?.name || "")
    setOrderBumpPrice(config.orderBump?.price?.toString() || "")
    setPacks(config.packs || [])
    setPaymentGateway(config.payments?.gateway || "")
    setPixKey(config.payments?.pix_key || "")
    setSubscriptionEnabled(config.subscription?.enabled || false)

    setIsLoading(false)
  }, [flowId, session?.userId, router])

  // Fetch flow bots
  const fetchFlowBots = useCallback(async () => {
    if (!flowId) return

    const { data } = await supabase
      .from("flow_bots")
      .select(`
        id,
        flow_id,
        bot_id,
        bots:bot_id (
          id,
          username,
          first_name,
          photo_url
        )
      `)
      .eq("flow_id", flowId)

    if (data) {
      setFlowBots(data as unknown as FlowBot[])
    }
  }, [flowId])

  // Fetch available bots (not linked to this flow)
  const fetchAvailableBots = useCallback(async () => {
    if (!session?.userId) return

    setIsLoadingBots(true)
    const { data } = await supabase
      .from("bots")
      .select("id, username, first_name, photo_url")
      .eq("user_id", session.userId)

    if (data) {
      // Filter out bots already linked
      const linkedBotIds = flowBots.map(fb => fb.bot_id)
      setAvailableBots(data.filter(b => !linkedBotIds.includes(b.id)))
    }
    setIsLoadingBots(false)
  }, [session?.userId, flowBots])

  useEffect(() => {
    fetchFlow()
    fetchFlowBots()
  }, [fetchFlow, fetchFlowBots])

  // Save flow
  const handleSave = async () => {
    if (!flow) return

    setIsSaving(true)

    const config: FlowConfig = {
      plans,
      upsell: {
        enabled: upsellEnabled,
        message: upsellMessage,
      },
      downsell: {
        enabled: downsellEnabled,
        message: downsellMessage,
        discount_percent: downsellDiscount,
      },
      orderBump: {
        enabled: orderBumpEnabled,
        name: orderBumpName,
        price: parseFloat(orderBumpPrice) || 0,
      },
      packs,
      payments: {
        gateway: paymentGateway,
        pix_key: pixKey,
      },
      subscription: {
        enabled: subscriptionEnabled,
      },
    }

    const { error } = await supabase
      .from("flows")
      .update({
        name: editName,
        welcome_message: welcomeMessage,
        media_cache_chat_id: mediaCacheChat,
        support_username: supportUsername,
        config,
        updated_at: new Date().toISOString(),
      })
      .eq("id", flow.id)

    if (error) {
      console.error("[v0] Error saving flow:", error)
      toast({
        title: "Erro",
        description: "Nao foi possivel salvar as alteracoes",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Configuracoes salvas com sucesso!",
      })
      setHasChanges(false)
    }

    setIsSaving(false)
  }

  // Add bot to flow
  const handleAddBot = async () => {
    if (!selectedBotToAdd || !flowId) return

    // Check max 5 bots
    if (flowBots.length >= 5) {
      toast({
        title: "Limite atingido",
        description: "Maximo de 5 bots por fluxo",
        variant: "destructive",
      })
      return
    }

    const { error } = await supabase
      .from("flow_bots")
      .insert({
        flow_id: flowId,
        bot_id: selectedBotToAdd,
      })

    if (error) {
      console.error("[v0] Error adding bot:", error)
      toast({
        title: "Erro",
        description: "Nao foi possivel adicionar o bot",
        variant: "destructive",
      })
    } else {
      toast({ title: "Bot adicionado!" })
      setShowAddBotDialog(false)
      setSelectedBotToAdd("")
      fetchFlowBots()
    }
  }

  // Remove bot from flow
  const handleRemoveBot = async (flowBotId: string) => {
    const { error } = await supabase
      .from("flow_bots")
      .delete()
      .eq("id", flowBotId)

    if (error) {
      console.error("[v0] Error removing bot:", error)
    } else {
      fetchFlowBots()
    }
  }

  // Refresh telegram chats
  const handleRefreshChats = async () => {
    setIsLoadingChats(true)
    // TODO: Implement telegram chat fetching
    setTimeout(() => {
      setTelegramChats([])
      setIsLoadingChats(false)
    }, 1000)
  }

  // Add plan
  const handleAddPlan = () => {
    setPlans([
      ...plans,
      {
        id: crypto.randomUUID(),
        name: "",
        price: 0,
        duration_days: 30,
        active: true,
      },
    ])
    setHasChanges(true)
  }

  // Remove plan
  const handleRemovePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id))
    setHasChanges(true)
  }

  // Update plan
  const handleUpdatePlan = (id: string, field: keyof FlowPlan, value: string | number | boolean) => {
    setPlans(plans.map(p => p.id === id ? { ...p, [field]: value } : p))
    setHasChanges(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!flow) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Fluxo nao encontrado</p>
      </div>
    )
  }

  const tabs = [
    { id: "bots", label: "Bots", icon: Bot },
    { id: "welcome", label: "Boas-vindas", icon: MessageSquare, locked: false },
    { id: "plans", label: "Planos", icon: CreditCard, locked: false },
    { id: "upsell", label: "Upsell", icon: TrendingUp, locked: false },
    { id: "downsell", label: "Downsell", icon: TrendingDown, locked: false },
    { id: "orderbump", label: "Order Bump", icon: Package, locked: false },
    { id: "packs", label: "Packs", icon: Package, locked: false },
    { id: "payments", label: "Pagamentos", icon: Wallet, locked: false },
    { id: "subscription", label: "Assinatura", icon: Crown, locked: false },
  ]

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/fluxos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-3">
            {isEditingName ? (
              <Input
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value)
                  setHasChanges(true)
                }}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                className="w-48 h-8"
                autoFocus
              />
            ) : (
              <button
                className="flex items-center gap-2 hover:bg-secondary/50 px-2 py-1 rounded-lg transition-colors"
                onClick={() => setIsEditingName(true)}
              >
                <h1 className="text-lg font-semibold text-foreground">{editName}</h1>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}

            {/* Region Toggle */}
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  region === "BR" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setRegion("BR")}
              >
                <span>🇧🇷</span> Brasil
              </button>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  region === "GLOBAL" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setRegion("GLOBAL")}
              >
                <span>🇺🇸</span> Global
              </button>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Configuracao
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/50 bg-card px-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isLocked = tab.locked

            return (
              <button
                key={tab.id}
                onClick={() => !isLocked && setActiveTab(tab.id)}
                disabled={isLocked}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-accent text-accent"
                    : isLocked
                    ? "border-transparent text-muted-foreground/50 cursor-not-allowed"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Bots Tab */}
          {activeTab === "bots" && (
            <div className="space-y-6">
              {/* Stats */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    Resumo do Fluxo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-secondary/30">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Leads</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.leads}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-secondary/30">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Crown className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">VIPs</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.vips}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-secondary/30">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Receita</span>
                      </div>
                      <p className="text-2xl font-bold">R$ {stats.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Linked Bots */}
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Bots Vinculados</CardTitle>
                  </div>
                  <span className="text-sm text-muted-foreground">{flowBots.length}/5 bot(s)</span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gerencie os bots que executam este fluxo
                  </p>

                  {flowBots.length === 0 ? (
                    <div className="flex flex-col items-center py-8 border border-dashed border-border/50 rounded-xl">
                      <Bot className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="font-medium text-foreground mb-1">Nenhum bot vinculado</p>
                      <p className="text-sm text-muted-foreground mb-4">Adicione bots para executar este fluxo</p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          fetchAvailableBots()
                          setShowAddBotDialog(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Bot
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {flowBots.map((fb) => (
                        <div
                          key={fb.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <Bot className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {fb.bot?.first_name || "Bot"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                @{fb.bot?.username || "unknown"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveBot(fb.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {flowBots.length < 5 && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            fetchAvailableBots()
                            setShowAddBotDialog(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Bot
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add Bot Section */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Adicionar Bot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Select
                      value={selectedBotToAdd}
                      onValueChange={setSelectedBotToAdd}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione um bot para adicionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBots.map((bot) => (
                          <SelectItem key={bot.id} value={bot.id}>
                            @{bot.username} - {bot.first_name}
                          </SelectItem>
                        ))}
                        {availableBots.length === 0 && (
                          <SelectItem value="none" disabled>
                            Nenhum bot disponivel
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={fetchAvailableBots}
                      disabled={isLoadingBots}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingBots ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Adicione multiplos bots para executar este fluxo simultaneamente (max. 10)
                  </p>
                  <Button
                    variant="link"
                    className="px-0 text-accent"
                    onClick={() => router.push("/bots")}
                  >
                    Criar novo bot
                  </Button>

                  {/* Tip */}
                  <div className="mt-4 p-4 rounded-xl border border-border/50 bg-secondary/20">
                    <p className="text-sm font-medium text-foreground mb-2">Dica</p>
                    <p className="text-xs text-muted-foreground">
                      Com multiplos bots, voce pode distribuir o atendimento entre eles. Cada bot recebera leads independentemente e executara o mesmo fluxo.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Welcome Tab */}
          {activeTab === "welcome" && (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4 text-accent" />
                    Mensagem de Boas-vindas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Texto da mensagem</Label>
                    <Textarea
                      value={welcomeMessage}
                      onChange={(e) => {
                        setWelcomeMessage(e.target.value)
                        setHasChanges(true)
                      }}
                      placeholder="Ola! Seja bem-vindo ao nosso bot..."
                      rows={6}
                      className="bg-secondary/30 border-border/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Esta mensagem sera enviada quando o usuario iniciar o bot
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === "plans" && (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4 text-accent" />
                    Planos de Acesso
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleAddPlan}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Plano
                  </Button>
                </CardHeader>
                <CardContent>
                  {plans.length === 0 ? (
                    <div className="flex flex-col items-center py-8 border border-dashed border-border/50 rounded-xl">
                      <CreditCard className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="font-medium text-foreground mb-1">Nenhum plano configurado</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Adicione planos para vender acesso
                      </p>
                      <Button variant="outline" onClick={handleAddPlan}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Plano
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {plans.map((plan) => (
                        <div
                          key={plan.id}
                          className="p-4 rounded-xl border border-border/50 bg-secondary/20"
                        >
                          <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Nome</Label>
                              <Input
                                value={plan.name}
                                onChange={(e) => handleUpdatePlan(plan.id, "name", e.target.value)}
                                placeholder="Ex: Plano Mensal"
                                className="bg-secondary/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Preco (R$)</Label>
                              <Input
                                type="number"
                                value={plan.price}
                                onChange={(e) => handleUpdatePlan(plan.id, "price", parseFloat(e.target.value) || 0)}
                                placeholder="49.90"
                                className="bg-secondary/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Duracao (dias)</Label>
                              <Input
                                type="number"
                                value={plan.duration_days}
                                onChange={(e) => handleUpdatePlan(plan.id, "duration_days", parseInt(e.target.value) || 30)}
                                placeholder="30"
                                className="bg-secondary/50"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={plan.active}
                                  onCheckedChange={(checked) => handleUpdatePlan(plan.id, "active", checked)}
                                />
                                <span className="text-sm text-muted-foreground">Ativo</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemovePlan(plan.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Upsell Tab */}
          {activeTab === "upsell" && (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      Configurar Upsell
                    </CardTitle>
                    <Switch
                      checked={upsellEnabled}
                      onCheckedChange={(checked) => {
                        setUpsellEnabled(checked)
                        setHasChanges(true)
                      }}
                    />
                  </div>
                </CardHeader>
                {upsellEnabled && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Mensagem do Upsell</Label>
                      <Textarea
                        value={upsellMessage}
                        onChange={(e) => {
                          setUpsellMessage(e.target.value)
                          setHasChanges(true)
                        }}
                        placeholder="Aproveite! Upgrade para o plano premium com 20% de desconto..."
                        rows={4}
                        className="bg-secondary/30 border-border/50"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )}

          {/* Downsell Tab */}
          {activeTab === "downsell" && (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingDown className="h-4 w-4 text-rose-400" />
                      Configurar Downsell
                    </CardTitle>
                    <Switch
                      checked={downsellEnabled}
                      onCheckedChange={(checked) => {
                        setDownsellEnabled(checked)
                        setHasChanges(true)
                      }}
                    />
                  </div>
                </CardHeader>
                {downsellEnabled && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Mensagem do Downsell</Label>
                      <Textarea
                        value={downsellMessage}
                        onChange={(e) => {
                          setDownsellMessage(e.target.value)
                          setHasChanges(true)
                        }}
                        placeholder="Espere! Temos uma oferta especial para voce..."
                        rows={4}
                        className="bg-secondary/30 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Desconto (%)</Label>
                      <Input
                        type="number"
                        value={downsellDiscount}
                        onChange={(e) => {
                          setDownsellDiscount(parseInt(e.target.value) || 0)
                          setHasChanges(true)
                        }}
                        placeholder="10"
                        className="w-32 bg-secondary/30"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )}

          {/* Order Bump Tab */}
          {activeTab === "orderbump" && (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Package className="h-4 w-4 text-amber-400" />
                      Configurar Order Bump
                    </CardTitle>
                    <Switch
                      checked={orderBumpEnabled}
                      onCheckedChange={(checked) => {
                        setOrderBumpEnabled(checked)
                        setHasChanges(true)
                      }}
                    />
                  </div>
                </CardHeader>
                {orderBumpEnabled && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome do Produto</Label>
                      <Input
                        value={orderBumpName}
                        onChange={(e) => {
                          setOrderBumpName(e.target.value)
                          setHasChanges(true)
                        }}
                        placeholder="Ex: Bonus Exclusivo"
                        className="bg-secondary/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preco (R$)</Label>
                      <Input
                        value={orderBumpPrice}
                        onChange={(e) => {
                          setOrderBumpPrice(e.target.value)
                          setHasChanges(true)
                        }}
                        placeholder="19.90"
                        className="w-32 bg-secondary/30"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )}

          {/* Packs Tab */}
          {activeTab === "packs" && (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-4 w-4 text-accent" />
                    Packs e Combos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center py-8 border border-dashed border-border/50 rounded-xl">
                    <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="font-medium text-foreground mb-1">Em breve</p>
                    <p className="text-sm text-muted-foreground">
                      Configure packs e combos para vender produtos agrupados
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wallet className="h-4 w-4 text-accent" />
                    Configuracoes de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Gateway de Pagamento</Label>
                    <Select
                      value={paymentGateway}
                      onValueChange={(value) => {
                        setPaymentGateway(value)
                        setHasChanges(true)
                      }}
                    >
                      <SelectTrigger className="bg-secondary/30">
                        <SelectValue placeholder="Selecione o gateway..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pushinpay">PushinPay</SelectItem>
                        <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chave PIX (opcional)</Label>
                    <Input
                      value={pixKey}
                      onChange={(e) => {
                        setPixKey(e.target.value)
                        setHasChanges(true)
                      }}
                      placeholder="sua@chavepix.com"
                      className="bg-secondary/30"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Crown className="h-4 w-4 text-amber-400" />
                      Assinatura Recorrente
                    </CardTitle>
                    <Switch
                      checked={subscriptionEnabled}
                      onCheckedChange={(checked) => {
                        setSubscriptionEnabled(checked)
                        setHasChanges(true)
                      }}
                    />
                  </div>
                </CardHeader>
                {subscriptionEnabled && (
                  <CardContent>
                    <div className="flex flex-col items-center py-8 border border-dashed border-border/50 rounded-xl">
                      <Crown className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="font-medium text-foreground mb-1">Em breve</p>
                      <p className="text-sm text-muted-foreground">
                        Configure planos de assinatura recorrente
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-border/50 bg-card p-6 overflow-auto">
          {/* Media Cache */}
          <Card className="border-border/50 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Settings2 className="h-4 w-4 text-accent" />
                Cache de Midia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Canal ou grupo para cache do Telegram
              </p>
              <div className="flex items-center gap-2">
                <Select
                  value={mediaCacheChat}
                  onValueChange={(value) => {
                    setMediaCacheChat(value)
                    setHasChanges(true)
                  }}
                >
                  <SelectTrigger className="bg-secondary/30">
                    <SelectValue placeholder="Selecionar canal/grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {telegramChats.map((chat) => (
                      <SelectItem key={chat.id} value={chat.id}>
                        {chat.title}
                      </SelectItem>
                    ))}
                    {telegramChats.length === 0 && (
                      <SelectItem value="none" disabled>
                        Nenhum canal disponivel
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefreshChats}
                  disabled={isLoadingChats}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingChats ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {/* Instructions */}
              <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/30">
                <p className="text-xs font-medium text-success mb-2">Como configurar:</p>
                <ol className="text-xs text-muted-foreground space-y-1">
                  <li>1. Crie um <span className="text-success font-medium">canal</span> ou <span className="text-success font-medium">grupo</span> no Telegram</li>
                  <li>2. Adicione o bot como <span className="text-accent font-medium">administrador</span></li>
                  <li>3. De permissao de <span className="font-medium">postar mensagens</span></li>
                  <li>4. Clique no botao <span className="text-accent font-medium">&quot;Atualizar&quot;</span> ao lado</li>
                </ol>
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-success/20">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  <span className="text-[10px] text-warning">Necessario para enviar midia</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                @ Suporte
                <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={supportUsername}
                onChange={(e) => {
                  setSupportUsername(e.target.value.replace("@", ""))
                  setHasChanges(true)
                }}
                placeholder="@username"
                className="bg-secondary/30"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Bot Dialog */}
      <Dialog open={showAddBotDialog} onOpenChange={setShowAddBotDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Adicionar Bot ao Fluxo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedBotToAdd} onValueChange={setSelectedBotToAdd}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um bot..." />
              </SelectTrigger>
              <SelectContent>
                {availableBots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id}>
                    @{bot.username} - {bot.first_name}
                  </SelectItem>
                ))}
                {availableBots.length === 0 && (
                  <SelectItem value="none" disabled>
                    Nenhum bot disponivel
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBotDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddBot} disabled={!selectedBotToAdd}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
