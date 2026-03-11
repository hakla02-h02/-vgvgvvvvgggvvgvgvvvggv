"use client"

import { useState, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CreateBotWizard } from "@/components/create-bot-wizard"
import {
  Plus, Search, Bot as BotIcon, MoreHorizontal, Activity, Users, Trash2, Settings, ChevronLeft,
  DollarSign, Tag, CalendarDays, Hash, LinkIcon, KeyRound, Save, Loader2, Zap, TrendingUp,
  Filter, MoreVertical, Sparkles, MessageSquare, Shield, Globe, Eye, EyeOff, Copy, ExternalLink,
  ChevronRight, Signal, Cpu, Clock, CheckCircle2,
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBots, type Bot } from "@/lib/bot-context"
import { supabase } from "@/lib/supabase"

interface BotPlan {
  id: string
  bot_id: string
  name: string
  price: number
  duration_days: number
  description: string | null
  active: boolean
  created_at: string
}

export default function BotsPage() {
  const { bots, selectedBot, setSelectedBot, addBot, updateBot, deleteBot } = useBots()
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Config panel
  const [configBot, setConfigBot] = useState<Bot | null>(null)
  const [cfgName, setCfgName] = useState("")
  const [cfgToken, setCfgToken] = useState("")
  const [cfgGroupName, setCfgGroupName] = useState("")
  const [cfgGroupId, setCfgGroupId] = useState("")
  const [cfgGroupLink, setCfgGroupLink] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showToken, setShowToken] = useState(false)

  // Plans
  const [plans, setPlans] = useState<BotPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [newPlanName, setNewPlanName] = useState("")
  const [newPlanPrice, setNewPlanPrice] = useState("")
  const [newPlanDays, setNewPlanDays] = useState("30")
  const [newPlanDesc, setNewPlanDesc] = useState("")
  const [addingPlan, setAddingPlan] = useState(false)

  const filteredBots = bots.filter(
    (bot) =>
      bot.name.toLowerCase().includes(search.toLowerCase()) ||
      bot.token.toLowerCase().includes(search.toLowerCase())
  )

  const activeBots = bots.filter((b) => b.status === "active").length

  // Fetch plans when config bot changes
  const fetchPlans = useCallback(async (botId: string) => {
    setLoadingPlans(true)
    const { data, error } = await supabase
      .from("bot_plans")
      .select("*")
      .eq("bot_id", botId)
      .order("created_at", { ascending: true })

    if (!error && data) {
      setPlans(data as BotPlan[])
    } else {
      setPlans([])
    }
    setLoadingPlans(false)
  }, [])

  useEffect(() => {
    if (configBot) {
      fetchPlans(configBot.id)
    }
  }, [configBot, fetchPlans])

  function openConfig(bot: Bot) {
    setConfigBot(bot)
    setCfgName(bot.name)
    setCfgToken(bot.token)
    setCfgGroupName(bot.group_name || "")
    setCfgGroupId(bot.group_id || "")
    setCfgGroupLink(bot.group_link || "")
    setShowToken(false)
  }

  async function handleSaveConfig() {
    if (!configBot) return
    setIsSaving(true)
    try {
      await updateBot(configBot.id, {
        name: cfgName.trim() || configBot.name,
        token: cfgToken.trim() || configBot.token,
        group_name: cfgGroupName.trim() || null,
        group_id: cfgGroupId.trim() || null,
        group_link: cfgGroupLink.trim() || null,
      })
      if (cfgToken.trim() !== configBot.token) {
        await fetch("/api/telegram/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ botToken: cfgToken.trim(), action: "register" }),
        })
      }
      setConfigBot({ ...configBot, name: cfgName.trim() || configBot.name, token: cfgToken.trim() || configBot.token, group_name: cfgGroupName.trim() || null, group_id: cfgGroupId.trim() || null, group_link: cfgGroupLink.trim() || null })
    } catch {
      // handled
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAddPlan() {
    if (!configBot || !newPlanName.trim() || !newPlanPrice.trim()) return
    setAddingPlan(true)
    const { data, error } = await supabase
      .from("bot_plans")
      .insert({
        bot_id: configBot.id,
        name: newPlanName.trim(),
        price: parseFloat(newPlanPrice.replace(",", ".")),
        duration_days: parseInt(newPlanDays) || 30,
        description: newPlanDesc.trim() || null,
      })
      .select()
      .single()

    if (!error && data) {
      setPlans((prev) => [...prev, data as BotPlan])
      setNewPlanName("")
      setNewPlanPrice("")
      setNewPlanDays("30")
      setNewPlanDesc("")
    }
    setAddingPlan(false)
  }

  async function handleDeletePlan(planId: string) {
    const { error } = await supabase.from("bot_plans").delete().eq("id", planId)
    if (!error) {
      setPlans((prev) => prev.filter((p) => p.id !== planId))
    }
  }

  async function handleTogglePlan(planId: string, active: boolean) {
    const { error } = await supabase.from("bot_plans").update({ active }).eq("id", planId)
    if (!error) {
      setPlans((prev) => prev.map((p) => p.id === planId ? { ...p, active } : p))
    }
  }

  async function handleCreate(data: {
    name: string
    token: string
    group_name?: string
    group_id?: string
    group_link?: string
  }) {
    const createdBot = await addBot(data)
    await fetch("/api/telegram/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botToken: createdBot.token, action: "register" }),
    })
  }

  async function handleDelete(id: string) {
    try {
      const b = bots.find((b) => b.id === id)
      if (b) {
        await fetch("/api/telegram/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ botToken: b.token, action: "unregister" }),
        })
      }
      await deleteBot(id)
      if (configBot?.id === id) setConfigBot(null)
    } catch { /* handled */ }
  }

  // ── CONFIG PANEL ──
  if (configBot) {
    return (
      <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#f4f5f8]">
        {/* Header Minimalista */}
        <header className="px-4 md:px-8 py-5 flex items-center gap-4 flex-shrink-0 bg-white border-b border-gray-100">
          <button
            onClick={() => setConfigBot(null)}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Configuracoes</h1>
            <p className="text-sm text-gray-500">{configBot.name}</p>
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#a3e635] text-[#111] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#bef264] transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            
            {/* Bot Status Hero */}
            <div className="bg-[#111] rounded-[28px] p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-[#a3e635] opacity-[0.08] blur-[100px] rounded-full" />
              <div className="absolute bottom-0 left-20 w-[150px] h-[150px] bg-[#22c55e] opacity-[0.05] blur-[60px] rounded-full" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#a3e635]/20 to-[#22c55e]/20 flex items-center justify-center relative">
                      <BotIcon className="h-10 w-10 text-[#a3e635]" />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#111] ${
                        configBot.status === "active" ? "bg-[#22c55e]" : "bg-gray-500"
                      }`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">{configBot.name}</h2>
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          configBot.status === "active" 
                            ? "bg-[#22c55e]/20 text-[#22c55e]" 
                            : "bg-gray-700 text-gray-400"
                        }`}>
                          <Signal className="h-3 w-3" />
                          {configBot.status === "active" ? "Online" : "Offline"}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(configBot.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={configBot.status === "active"}
                    onCheckedChange={async (checked) => {
                      await updateBot(configBot.id, { status: checked ? "active" : "inactive" })
                      setConfigBot({ ...configBot, status: checked ? "active" : "inactive" })
                      await fetch("/api/telegram/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ botToken: configBot.token, action: checked ? "register" : "unregister" }),
                      })
                    }}
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-1">Mensagens Hoje</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#a3e635]">{plans.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Planos Ativos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">100%</p>
                    <p className="text-xs text-gray-500 mt-1">Uptime</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Config Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Bot Info */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-[#a3e635]/10 flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-[#65a30d]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Informacoes</h3>
                    <p className="text-xs text-gray-500">Dados do bot</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Nome do Bot</Label>
                    <Input value={cfgName} onChange={(e) => setCfgName(e.target.value)} className="bg-gray-50 border-0 rounded-xl h-11" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 flex items-center gap-2">
                      <KeyRound className="h-3 w-3" />
                      Token do Telegram
                    </Label>
                    <div className="relative">
                      <Input
                        value={cfgToken}
                        onChange={(e) => setCfgToken(e.target.value)}
                        type={showToken ? "text" : "password"}
                        className="bg-gray-50 border-0 rounded-xl h-11 font-mono text-xs pr-24"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          onClick={() => navigator.clipboard.writeText(cfgToken)}
                          className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                        <button
                          onClick={() => setShowToken(!showToken)}
                          className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          {showToken ? <EyeOff className="h-3.5 w-3.5 text-gray-400" /> : <Eye className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group Config */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Grupo VIP</h3>
                    <p className="text-xs text-gray-500">Configuracoes do grupo</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Nome do Grupo</Label>
                    <Input value={cfgGroupName} onChange={(e) => setCfgGroupName(e.target.value)} placeholder="VIP Premium" className="bg-gray-50 border-0 rounded-xl h-11" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">ID do Grupo</Label>
                    <Input value={cfgGroupId} onChange={(e) => setCfgGroupId(e.target.value)} placeholder="-1001234567890" className="bg-gray-50 border-0 rounded-xl h-11 font-mono text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 flex items-center gap-2">
                      <LinkIcon className="h-3 w-3" />
                      Link de Convite
                    </Label>
                    <Input value={cfgGroupLink} onChange={(e) => setCfgGroupLink(e.target.value)} placeholder="https://t.me/+abc123" className="bg-gray-50 border-0 rounded-xl h-11" />
                  </div>
                </div>
              </div>
            </div>

            {/* Plans Section */}
            <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#a3e635]/10 flex items-center justify-center">
                    <Tag className="h-5 w-5 text-[#65a30d]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Planos de Assinatura</h3>
                    <p className="text-xs text-gray-500">{plans.length} plano(s) configurado(s)</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {loadingPlans ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : plans.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-semibold">Nenhum plano criado</p>
                    <p className="text-sm text-gray-500 mt-1">Adicione planos para seus clientes</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`relative rounded-2xl border p-5 transition-all ${
                          plan.active 
                            ? "border-[#a3e635]/30 bg-[#a3e635]/5" 
                            : "border-gray-200 bg-gray-50/50 opacity-60"
                        }`}
                      >
                        {plan.active && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className="h-5 w-5 text-[#65a30d]" />
                          </div>
                        )}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-[#a3e635]/20 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-[#65a30d]" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{plan.name}</p>
                            <p className="text-xs text-gray-500">{plan.duration_days} dias</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-[#65a30d] mb-4">
                          R$ {plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <Switch
                            checked={plan.active}
                            onCheckedChange={(checked) => handleTogglePlan(plan.id, checked)}
                          />
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Plan */}
                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5 mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Adicionar Novo Plano</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-gray-500">Nome</Label>
                      <Input value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} placeholder="Mensal" className="mt-1.5 bg-white border-gray-200 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Preco (R$)</Label>
                      <Input value={newPlanPrice} onChange={(e) => setNewPlanPrice(e.target.value)} placeholder="29,90" className="mt-1.5 bg-white border-gray-200 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Duracao (dias)</Label>
                      <Input value={newPlanDays} onChange={(e) => setNewPlanDays(e.target.value)} placeholder="30" type="number" className="mt-1.5 bg-white border-gray-200 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Descricao</Label>
                      <Input value={newPlanDesc} onChange={(e) => setNewPlanDesc(e.target.value)} placeholder="Acesso completo" className="mt-1.5 bg-white border-gray-200 rounded-xl" />
                    </div>
                  </div>
                  <button
                    onClick={handleAddPlan}
                    disabled={addingPlan || !newPlanName.trim() || !newPlanPrice.trim()}
                    className="mt-4 flex items-center gap-2 bg-[#111] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {addingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Adicionar Plano
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-[24px] border border-red-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-700">Zona de Perigo</h3>
                    <p className="text-xs text-red-500">Acoes irreversiveis</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(configBot.id)}
                  className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Bot
                </button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    )
  }

  // ── BOT LIST ──
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#f4f5f8]">
      {/* Header */}
      <header className="px-4 md:px-8 py-6 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Meus Bots</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie seus bots do Telegram</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-[#a3e635] text-[#111] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#bef264] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Bot
          </button>
        </div>
      </header>

      <CreateBotWizard
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreateBot={handleCreate}
      />

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
        {/* Stats Hero */}
        <div className="bg-[#111] rounded-[28px] p-6 md:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#a3e635] opacity-[0.08] blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#22c55e] opacity-[0.05] blur-[80px] rounded-full" />
          
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#a3e635]/20 flex items-center justify-center">
                  <BotIcon className="h-4 w-4 text-[#a3e635]" />
                </div>
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <p className="text-4xl font-bold text-white">{bots.length}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center">
                  <Signal className="h-4 w-4 text-[#22c55e]" />
                </div>
                <span className="text-xs text-gray-500">Online</span>
              </div>
              <p className="text-4xl font-bold text-[#22c55e]">{activeBots}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-xs text-gray-500">Com Grupo</span>
              </div>
              <p className="text-4xl font-bold text-white">{bots.filter((b) => b.group_name).length}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#a3e635]/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#a3e635]" />
                </div>
                <span className="text-xs text-gray-500">Uptime</span>
              </div>
              <p className="text-4xl font-bold text-[#a3e635]">99.9%</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar bots..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white rounded-xl border border-gray-200 pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#a3e635]/30 focus:border-[#a3e635] transition-all"
            />
          </div>
        </div>

        {/* Bot Grid */}
        {bots.length === 0 ? (
          <div className="bg-white rounded-[28px] border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <BotIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Nenhum bot criado</h3>
            <p className="text-gray-500 mt-2 mb-6">Crie seu primeiro bot para comecar</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 bg-[#a3e635] text-[#111] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#bef264] transition-colors mx-auto"
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Bot
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBots.map((bot) => {
              const isSelected = selectedBot?.id === bot.id
              const isActive = bot.status === "active"
              
              return (
                <div
                  key={bot.id}
                  onClick={() => setSelectedBot(bot)}
                  className={`bg-white rounded-[24px] border cursor-pointer transition-all hover:shadow-lg group ${
                    isSelected ? "border-[#a3e635] ring-2 ring-[#a3e635]/20" : "border-gray-100"
                  }`}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        isActive ? "bg-gradient-to-br from-[#a3e635]/20 to-[#22c55e]/20" : "bg-gray-100"
                      }`}>
                        <BotIcon className={`h-7 w-7 ${isActive ? "text-[#65a30d]" : "text-gray-400"}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-[#22c55e] animate-pulse" : "bg-gray-300"}`} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem
                              className="flex items-center gap-2 py-2.5 cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); openConfig(bot) }}
                            >
                              <Settings className="h-4 w-4" />
                              Configurar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 py-2.5 cursor-pointer text-red-600"
                              onClick={(e) => { e.stopPropagation(); handleDelete(bot.id) }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Info */}
                    <h3 className="text-lg font-bold text-gray-900 truncate">{bot.name}</h3>
                    {bot.group_name && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 truncate">
                        <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                        {bot.group_name}
                      </p>
                    )}

                    {/* Toggle */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                      <span className={`text-xs font-medium ${isActive ? "text-[#22c55e]" : "text-gray-400"}`}>
                        {isActive ? "Ativo" : "Inativo"}
                      </span>
                      <Switch
                        checked={isActive}
                        onCheckedChange={async (checked) => {
                          try {
                            await updateBot(bot.id, { status: checked ? "active" : "inactive" })
                            await fetch("/api/telegram/register", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ botToken: bot.token, action: checked ? "register" : "unregister" }),
                            })
                          } catch { /* handled */ }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  {isSelected && (
                    <div className="px-5 py-3 bg-[#a3e635]/10 border-t border-[#a3e635]/20 rounded-b-[24px]">
                      <p className="text-xs font-medium text-[#65a30d] text-center">Bot em uso</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
