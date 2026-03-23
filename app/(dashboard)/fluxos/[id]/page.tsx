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
import { useBots } from "@/lib/bot-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft, Bot, MessageSquare, CreditCard, TrendingUp, TrendingDown,
  Package, Wallet, Crown, Save, Loader2, Plus, Trash2, RefreshCw,
  Users, DollarSign, HelpCircle, AlertTriangle, Lock, Pencil,
  Globe, Link2, Settings2, Zap
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
  const { session, isLoading: isAuthLoading } = useAuth()
  const { bots: userBots, addBot, refreshBots, isLoading: isBotsLoading } = useBots()
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
  
  // Bots
  const [flowBots, setFlowBots] = useState<FlowBot[]>([])
  const [availableBots, setAvailableBots] = useState<AvailableBot[]>([])
  const [selectedBotToAdd, setSelectedBotToAdd] = useState<string>("")
  const [showAddBotDialog, setShowAddBotDialog] = useState(false)
  const [isLoadingBots, setIsLoadingBots] = useState(false)
  
  // Create bot inline
  const [showCreateBotForm, setShowCreateBotForm] = useState(false)
  const [newBotToken, setNewBotToken] = useState("")
  const [isCreatingBot, setIsCreatingBot] = useState(false)
  


  // VIP Group
  const [vipGroup, setVipGroup] = useState<{ id: string; telegram_group_id: string; group_name: string; group_type: string } | null>(null)
  const [availableGroups, setAvailableGroups] = useState<{ id: string; title: string; type: string; isAdmin: boolean; canInvite: boolean }[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState("")

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

  // Delete flow
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch flow
  const fetchFlow = useCallback(async () => {
    if (!flowId || !session?.userId || isAuthLoading) return

    setIsLoading(true)
    const { data, error } = await supabase
      .from("flows")
      .select("*")
      .eq("id", flowId)
      .eq("user_id", session.userId)
      .single()

    if (error || !data) {
      console.error("[v0] Error fetching flow:", error)
      if (!isAuthLoading) {
        router.push("/fluxos")
      }
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
  }, [flowId, session?.userId, router, isAuthLoading])

  // Fetch flow bots - using correct column names from bots table
  const fetchFlowBots = useCallback(async () => {
    if (!flowId) return

    const { data, error } = await supabase
      .from("flow_bots")
      .select(`
        id,
        flow_id,
        bot_id,
        bots:bot_id (
          id,
          name,
          token,
          status
        )
      `)
      .eq("flow_id", flowId)

    console.log("[v0] fetchFlowBots result:", data, "Error:", error)

    if (data) {
      // Map to expected FlowBot format
      const mapped = data.map((fb: any) => ({
        id: fb.id,
        flow_id: fb.flow_id,
        bot_id: fb.bot_id,
        bot: fb.bots ? {
          id: fb.bots.id,
          username: fb.bots.name,
          first_name: fb.bots.name,
          photo_url: null
        } : null
      }))
      setFlowBots(mapped)
    }
  }, [flowId])

  // Fetch available bots (bots that are not already linked to THIS flow)
  const fetchAvailableBots = useCallback(async () => {
    if (!session?.userId) return

    setIsLoadingBots(true)
    
    // Get user's bots - using correct column names from bots table
    const { data: userBotsData, error: botsError } = await supabase
      .from("bots")
      .select("id, name, token, status")
      .eq("user_id", session.userId)

    console.log("[v0] User bots from DB:", userBotsData, "Error:", botsError)

    if (!userBotsData || userBotsData.length === 0) {
      setAvailableBots([])
      setIsLoadingBots(false)
      return
    }
    
    // Get bots linked to THIS flow only
    const linkedBotIds = flowBots.map(fb => fb.bot_id)
    console.log("[v0] Bots linked to THIS flow:", linkedBotIds)
    
    // Filter: exclude only bots already in THIS flow (allow bots to be in multiple flows)
    // Map to AvailableBot format
    const available = userBotsData
      .filter(b => !linkedBotIds.includes(b.id))
      .map(b => ({
        id: b.id,
        username: b.name,
        first_name: b.name,
        photo_url: null
      }))
    
    console.log("[v0] Available bots mapped:", available)
    
    setAvailableBots(available)
    setIsLoadingBots(false)
  }, [session?.userId, flowBots])

  useEffect(() => {
    if (!isAuthLoading && session?.userId) {
      fetchFlow()
      fetchFlowBots()
    }
  }, [fetchFlow, fetchFlowBots, isAuthLoading, session?.userId])

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

  // Create bot inline and add to flow
  const handleCreateBotInline = async () => {
    if (!newBotToken.trim()) {
      toast({ title: "Erro", description: "Digite o token do bot", variant: "destructive" })
      return
    }

    setIsCreatingBot(true)

    try {
      // Validate token with Telegram API
      const response = await fetch(`https://api.telegram.org/bot${newBotToken.trim()}/getMe`)
      const result = await response.json()

      if (!result.ok) {
        toast({ title: "Token invalido", description: "Verifique o token e tente novamente", variant: "destructive" })
        setIsCreatingBot(false)
        return
      }

      const botInfo = result.result
      
      // Create bot using context
      const newBot = await addBot({
        name: botInfo.first_name || "Bot",
        token: newBotToken.trim(),
      })
      
      // Link to this flow
      const { error } = await supabase
        .from("flow_bots")
        .insert({
          flow_id: flowId,
          bot_id: newBot.id,
        })

      if (error) {
        toast({ title: "Erro", description: "Bot criado mas nao foi possivel vincular ao fluxo", variant: "destructive" })
      } else {
        toast({ title: "Sucesso!", description: "Bot criado e vinculado ao fluxo" })
        setNewBotToken("")
        setShowCreateBotForm(false)
        fetchFlowBots()
        refreshBots()
      }
    } catch {
      toast({ title: "Erro", description: "Erro ao criar bot", variant: "destructive" })
    }

    setIsCreatingBot(false)
  }

  // Add existing bot to flow
  const handleAddBot = async () => {
    console.log("[v0] handleAddBot called - selectedBotToAdd:", selectedBotToAdd, "flowId:", flowId)
    
    if (!selectedBotToAdd || !flowId) {
      console.log("[v0] Missing selectedBotToAdd or flowId, returning")
      return
    }

    // Check max 5 bots
    if (flowBots.length >= 5) {
      toast({
        title: "Limite atingido",
        description: "Maximo de 5 bots por fluxo",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Inserting into flow_bots:", { flow_id: flowId, bot_id: selectedBotToAdd })
    
    const { data, error } = await supabase
      .from("flow_bots")
      .insert({
        flow_id: flowId,
        bot_id: selectedBotToAdd,
      })
      .select()

    console.log("[v0] Insert result - data:", data, "error:", error)

    if (error) {
      console.log("[v0] Error inserting flow_bot:", error)
      toast({
        title: "Erro",
        description: error.message || "Nao foi possivel adicionar o bot",
        variant: "destructive",
      })
    } else {
      toast({ title: "Bot vinculado!" })
      setShowAddBotDialog(false)
      setSelectedBotToAdd("")
      fetchFlowBots()
      fetchAvailableBots()
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

  // Fetch VIP group for this flow
  const fetchVipGroup = useCallback(async () => {
    if (!flowId) return
    
    try {
      const res = await fetch(`/api/vip-groups?flow_id=${flowId}`)
      const data = await res.json()
      if (data.vipGroup) {
        setVipGroup(data.vipGroup)
        setSelectedGroupId(data.vipGroup.telegram_group_id)
      }
    } catch (error) {
      console.error("[v0] Error fetching VIP group:", error)
    }
  }, [flowId])

  // Load VIP group on mount
  useEffect(() => {
    fetchVipGroup()
  }, [fetchVipGroup])

  // Fetch groups where bot is admin (directly from Telegram)
  const fetchBotGroups = async () => {
    if (flowBots.length === 0) {
      toast({
        title: "Nenhum bot vinculado",
        description: "Vincule um bot primeiro para buscar os grupos",
        variant: "destructive"
      })
      return
    }

    setIsLoadingGroups(true)
    setAvailableGroups([])

    try {
      const firstBot = flowBots[0]
      
      // Get bot token
      const { data: botData } = await supabase
        .from("bots")
        .select("token")
        .eq("id", firstBot.bot_id)
        .single()

      if (!botData?.token) {
        toast({ title: "Erro", description: "Token do bot nao encontrado", variant: "destructive" })
        setIsLoadingGroups(false)
        return
      }
      
      // Fetch directly from Telegram API
      const res = await fetch(`/api/telegram/get-bot-groups?token=${botData.token}`)
      const data = await res.json()

      if (data.success) {
        setAvailableGroups(data.groups)
        if (data.groups.length === 0) {
          toast({
            title: "Nenhum grupo encontrado",
            description: "Adicione o bot em um grupo e envie uma mensagem la para ele aparecer",
          })
        }
      } else {
        toast({ title: "Erro", description: data.error, variant: "destructive" })
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" })
    }

    setIsLoadingGroups(false)
  }

  // Verify group manually by chat ID
  const handleVerifyGroup = async (chatId: string) => {
    if (!chatId || flowBots.length === 0) return

    try {
      const firstBot = flowBots[0]
      const { data: botData } = await supabase
        .from("bots")
        .select("token")
        .eq("id", firstBot.bot_id)
        .single()

      if (!botData?.token) {
        toast({ title: "Erro", description: "Token do bot nao encontrado", variant: "destructive" })
        return
      }

      // Get chat info
      const chatRes = await fetch(`https://api.telegram.org/bot${botData.token}/getChat?chat_id=${chatId}`)
      const chatData = await chatRes.json()

      if (!chatData.ok) {
        toast({ title: "Erro", description: chatData.description || "Grupo nao encontrado", variant: "destructive" })
        return
      }

      const chat = chatData.result

      // Get bot info
      const meRes = await fetch(`https://api.telegram.org/bot${botData.token}/getMe`)
      const meData = await meRes.json()

      // Check bot status
      const memberRes = await fetch(`https://api.telegram.org/bot${botData.token}/getChatMember?chat_id=${chatId}&user_id=${meData.result.id}`)
      const memberData = await memberRes.json()

      if (!memberData.ok) {
        toast({ title: "Erro", description: "Bot nao esta neste grupo", variant: "destructive" })
        return
      }

      const group = {
        id: String(chat.id),
        title: chat.title || "Grupo",
        type: chat.type,
        isAdmin: memberData.result.status === "administrator" || memberData.result.status === "creator",
        canInvite: memberData.result.can_invite_users === true
      }

      setAvailableGroups([group])
      setSelectedGroupId(group.id)
      toast({ title: "Grupo encontrado!", description: group.title })
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" })
    }
  }

  // Set VIP group
  const handleSetVipGroup = async () => {
    if (!selectedGroupId || !flowId) return

    const selectedGroup = availableGroups.find(g => g.id === selectedGroupId)
    if (!selectedGroup) return

    try {
      const res = await fetch("/api/vip-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flow_id: flowId,
          telegram_group_id: selectedGroupId,
          group_name: selectedGroup.title,
          group_type: selectedGroup.type,
        })
      })

      const data = await res.json()
      if (data.success) {
        setVipGroup(data.vipGroup)
        toast({ title: "Grupo VIP definido!" })
      } else {
        toast({ title: "Erro", description: data.error, variant: "destructive" })
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" })
    }
  }

  // Remove VIP group
  const handleRemoveVipGroup = async () => {
    if (!flowId) return

    try {
      const res = await fetch(`/api/vip-groups?flow_id=${flowId}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setVipGroup(null)
        setSelectedGroupId("")
        toast({ title: "Grupo VIP removido" })
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" })
    }
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

  // Delete flow
  const handleDeleteFlow = async () => {
    if (!flow || !session?.userId) return

    setIsDeleting(true)
    try {
      // First delete flow_bots
      await supabase
        .from("flow_bots")
        .delete()
        .eq("flow_id", flow.id)

      // Then delete vip_groups
      await supabase
        .from("vip_groups")
        .delete()
        .eq("flow_id", flow.id)

      // Finally delete the flow
      const { error } = await supabase
        .from("flows")
        .delete()
        .eq("id", flow.id)
        .eq("user_id", session.userId)

      if (error) throw error

      toast({ title: "Fluxo excluido com sucesso" })
      router.push("/fluxos")
    } catch (error: any) {
      console.error("[v0] Error deleting flow:", error)
      toast({ 
        title: "Erro ao excluir fluxo", 
        description: error.message, 
        variant: "destructive" 
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Show loading while auth or bots are loading
  if (isAuthLoading || isBotsLoading || isLoading) {
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
    { id: "vip", label: "Grupo VIP", icon: Users },
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
                      
                      {/* Se usuario nao tem bots, mostrar criar bot */}
                      {userBots.length === 0 ? (
                        showCreateBotForm ? (
                          <div className="w-full max-w-sm space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="bot-token">Token do Bot</Label>
                              <Input
                                id="bot-token"
                                value={newBotToken}
                                onChange={(e) => setNewBotToken(e.target.value)}
                                placeholder="Cole o token do BotFather aqui..."
                                className="bg-secondary/30"
                              />
                              <p className="text-xs text-muted-foreground">
                                Obtenha o token no @BotFather do Telegram
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  setShowCreateBotForm(false)
                                  setNewBotToken("")
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                className="flex-1"
                                onClick={handleCreateBotInline}
                                disabled={isCreatingBot || !newBotToken.trim()}
                              >
                                {isCreatingBot ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Plus className="h-4 w-4 mr-2" />
                                )}
                                Criar Bot
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setShowCreateBotForm(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Bot
                          </Button>
                        )
                      ) : (
                        /* Se usuario tem bots, mostrar selecionar */
                        <Button
                          variant="outline"
                          onClick={() => {
                            fetchAvailableBots()
                            setShowAddBotDialog(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Selecionar Bot
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {flowBots.map((fb) => (
                        <div
                          key={fb.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20"
                        >
                          <div className="flex items-center gap-3">
                            {fb.bot?.photo_url ? (
                              <img 
                                src={fb.bot.photo_url} 
                                alt={fb.bot.first_name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-accent" />
                              </div>
                            )}
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
                        <div className="flex gap-2">
                          {/* Botao selecionar bot existente */}
                          {userBots.length > flowBots.length && (
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                fetchAvailableBots()
                                setShowAddBotDialog(true)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Selecionar Bot
                            </Button>
                          )}
                          {/* Botao criar novo bot */}
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowCreateBotForm(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Bot
                          </Button>
                        </div>
                      )}
                      
                      {/* Form criar bot inline quando ja tem bots vinculados */}
                      {showCreateBotForm && (
                        <div className="p-4 border border-border/50 rounded-xl bg-secondary/10 space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="bot-token-inline">Token do Bot</Label>
                            <Input
                              id="bot-token-inline"
                              value={newBotToken}
                              onChange={(e) => setNewBotToken(e.target.value)}
                              placeholder="Cole o token do BotFather aqui..."
                              className="bg-secondary/30"
                            />
                            <p className="text-xs text-muted-foreground">
                              Obtenha o token no @BotFather do Telegram
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowCreateBotForm(false)
                                setNewBotToken("")
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleCreateBotInline}
                              disabled={isCreatingBot || !newBotToken.trim()}
                            >
                              {isCreatingBot ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4 mr-2" />
                              )}
                              Criar e Vincular
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  

                </CardContent>
              </Card>
            </div>
          )}

          {/* VIP Group Tab */}
          {activeTab === "vip" && (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-accent" />
                    Grupo VIP
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure o grupo/canal do Telegram onde os compradores serao adicionados automaticamente
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current VIP Group */}
                  {vipGroup ? (
                    <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">{vipGroup.group_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {vipGroup.group_type === "channel" ? "Canal" : "Grupo"} - ID: {vipGroup.telegram_group_id}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveVipGroup}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p>Nenhum grupo VIP configurado</p>
                      <p className="text-xs mt-1">Selecione um grupo abaixo para configurar</p>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-accent" />
                      Como configurar:
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Crie um grupo ou canal no Telegram</li>
                      <li>Adicione o bot como <strong>administrador</strong></li>
                      <li>De permissao de <strong>convidar usuarios</strong> ao bot</li>
                      <li>Envie uma mensagem no grupo</li>
                      <li>Cole o ID do grupo abaixo ou busque automaticamente</li>
                    </ol>
                  </div>

                  {flowBots.length === 0 && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
                      <AlertTriangle className="h-4 w-4 inline mr-2" />
                      Vincule um bot na aba "Bots" primeiro
                    </div>
                  )}

                  {flowBots.length > 0 && (
                    <div className="space-y-4">
                      {/* Manual Group ID Input */}
                      <div className="space-y-2">
                        <Label>Buscar por ID do Grupo</Label>
                        <p className="text-xs text-muted-foreground">
                          Use @RawDataBot no Telegram para descobrir o ID do seu grupo
                        </p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: -1001234567890"
                            className="bg-secondary/30 border-border/50"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleVerifyGroup((e.target as HTMLInputElement).value)
                              }
                            }}
                            id="manual-group-id"
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById("manual-group-id") as HTMLInputElement
                              if (input?.value) handleVerifyGroup(input.value)
                            }}
                          >
                            Verificar
                          </Button>
                        </div>
                      </div>

                      {/* Or Separator */}
                      <div className="flex items-center gap-3">
                        <div className="h-px bg-border flex-1" />
                        <span className="text-xs text-muted-foreground">ou</span>
                        <div className="h-px bg-border flex-1" />
                      </div>

                      {/* Auto Search */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Busca automatica</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchBotGroups}
                            disabled={isLoadingGroups}
                          >
                            {isLoadingGroups ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Buscar Grupos
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          So encontra grupos onde o bot recebeu mensagens recentemente
                        </p>
                      </div>

                      {/* Groups List */}
                      {availableGroups.length > 0 && (
                        <div className="space-y-3">
                          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                            <SelectTrigger className="bg-secondary/30 border-border/50">
                              <SelectValue placeholder="Selecione um grupo" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableGroups.map((group) => (
                                <SelectItem 
                                  key={group.id} 
                                  value={group.id}
                                  disabled={!group.canInvite}
                                >
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{group.title}</span>
                                    {!group.canInvite && (
                                      <span className="text-xs text-destructive">(sem permissao)</span>
                                    )}
                                    {group.canInvite && (
                                      <Badge variant="outline" className="text-[10px]">
                                        {group.type === "channel" ? "Canal" : "Grupo"}
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            onClick={handleSetVipGroup}
                            disabled={!selectedGroupId}
                            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            Definir como Grupo VIP
                          </Button>
                        </div>
                      )}
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

          {/* Danger Zone */}
          <Card className="border-destructive/50 mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Ao excluir este fluxo, todos os bots vinculados e grupos VIP serao desvinculados. Esta acao nao pode ser desfeita.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Fluxo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Flow Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Excluir Fluxo
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Tem certeza que deseja excluir o fluxo <strong className="text-foreground">{flow.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              Esta acao ira:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>- Remover todos os bots vinculados a este fluxo</li>
              <li>- Desvincular o grupo VIP configurado</li>
              <li>- Excluir todas as configuracoes do fluxo</li>
            </ul>
            <p className="text-sm text-destructive font-medium mt-4">
              Esta acao nao pode ser desfeita.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFlow}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Fluxo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bot Dialog */}
      <Dialog open={showAddBotDialog} onOpenChange={setShowAddBotDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Selecionar Bot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isLoadingBots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : availableBots.length === 0 ? (
              <div className="text-center py-6">
                <Bot className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Nenhum bot disponivel</p>
                <p className="text-sm text-muted-foreground mb-4">
{userBots.length === 0
  ? "Voce ainda nao tem bots cadastrados"
  : "Todos os seus bots ja estao neste fluxo"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddBotDialog(false)
                    setShowCreateBotForm(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Novo Bot
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Selecione um bot para vincular a este fluxo.
                </p>
                <Select value={selectedBotToAdd} onValueChange={setSelectedBotToAdd}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um bot..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBots.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id}>
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          <span>{bot.first_name || bot.username}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          {availableBots.length > 0 && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddBotDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddBot} disabled={!selectedBotToAdd}>
                Vincular Bot
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
