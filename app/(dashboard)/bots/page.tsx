"use client"

import { useState, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CreateBotWizard } from "@/components/create-bot-wizard"
import {
  Plus,
  Search,
  Bot as BotIcon,
  MoreHorizontal,
  Activity,
  Users,
  Trash2,
  Settings,
  ChevronLeft,
  DollarSign,
  Tag,
  CalendarDays,
  Hash,
  LinkIcon,
  KeyRound,
  Save,
  Loader2,
  Zap,
  TrendingUp,
  ChevronDown,
  Filter,
  MoreVertical,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
        {/* Header */}
        <header className="px-4 md:px-8 py-5 flex items-center justify-between flex-shrink-0 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setConfigBot(null)}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Configurar Bot</h1>
              <p className="text-sm text-gray-500">{configBot.name}</p>
            </div>
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#111] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            
            {/* Bot Status Card */}
            <div className="bg-[#111] rounded-[24px] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#a3e635] opacity-10 blur-[80px] rounded-full" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#a3e635]/10 flex items-center justify-center">
                    <BotIcon className="h-8 w-8 text-[#a3e635]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{configBot.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        configBot.status === "active" 
                          ? "bg-[#22c55e]/20 text-[#22c55e]" 
                          : "bg-gray-700 text-gray-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${configBot.status === "active" ? "bg-[#22c55e] animate-pulse" : "bg-gray-500"}`} />
                        {configBot.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                      <span className="text-sm text-gray-500">Criado em {new Date(configBot.created_at).toLocaleDateString("pt-BR")}</span>
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
            </div>

            {/* Config Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Bot Info */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#a3e635]/10 flex items-center justify-center">
                    <BotIcon className="h-5 w-5 text-[#65a30d]" />
                  </div>
                  <h3 className="font-bold text-gray-900">Informacoes do Bot</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Nome</Label>
                    <Input value={cfgName} onChange={(e) => setCfgName(e.target.value)} className="mt-1.5 bg-gray-50 border-gray-200 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <KeyRound className="h-3 w-3" />
                      Token do Telegram
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        value={cfgToken}
                        onChange={(e) => setCfgToken(e.target.value)}
                        type={showToken ? "text" : "password"}
                        className="bg-gray-50 border-gray-200 rounded-xl font-mono text-xs pr-20"
                      />
                      <button
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#65a30d] font-medium hover:underline"
                      >
                        {showToken ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Pegue o token com o @BotFather no Telegram</p>
                  </div>
                </div>
              </div>

              {/* Group */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Hash className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Grupo do Telegram</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Nome do Grupo</Label>
                    <Input value={cfgGroupName} onChange={(e) => setCfgGroupName(e.target.value)} placeholder="VIP Premium" className="mt-1.5 bg-gray-50 border-gray-200 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">ID do Grupo</Label>
                    <Input value={cfgGroupId} onChange={(e) => setCfgGroupId(e.target.value)} placeholder="-1001234567890" className="mt-1.5 bg-gray-50 border-gray-200 rounded-xl font-mono text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <LinkIcon className="h-3 w-3" />
                      Link do Grupo
                    </Label>
                    <Input value={cfgGroupLink} onChange={(e) => setCfgGroupLink(e.target.value)} placeholder="https://t.me/+abc123" className="mt-1.5 bg-gray-50 border-gray-200 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Plans Section */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Tag className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Planos de Cobranca</h3>
                    <p className="text-xs text-gray-500">{plans.length} plano(s) configurado(s)</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Existing plans */}
                {loadingPlans ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : plans.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-7 w-7 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">Nenhum plano criado</p>
                    <p className="text-sm text-gray-400 mt-1">Adicione planos para seus clientes escolherem</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                          plan.active ? "border-gray-200 bg-gray-50/50" : "border-gray-100 bg-gray-50/30 opacity-60"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#a3e635]/10 flex items-center justify-center flex-shrink-0">
                          <DollarSign className="h-5 w-5 text-[#65a30d]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{plan.name}</span>
                            {!plan.active && (
                              <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-md">Inativo</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-lg font-bold text-[#65a30d]">
                              R$ {plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {plan.duration_days} dias
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={plan.active}
                            onCheckedChange={(checked) => handleTogglePlan(plan.id, checked)}
                          />
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="w-9 h-9 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new plan */}
                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Adicionar Novo Plano</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-gray-500">Nome do plano</Label>
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
                      <Label className="text-xs text-gray-500">Descricao (opcional)</Label>
                      <Input value={newPlanDesc} onChange={(e) => setNewPlanDesc(e.target.value)} placeholder="Acesso completo" className="mt-1.5 bg-white border-gray-200 rounded-xl" />
                    </div>
                  </div>
                  <button
                    onClick={handleAddPlan}
                    disabled={addingPlan || !newPlanName.trim() || !newPlanPrice.trim()}
                    className="mt-4 flex items-center gap-2 bg-[#111] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {addingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {addingPlan ? "Adicionando..." : "Adicionar Plano"}
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Bot */}
            <button
              onClick={() => handleDelete(configBot.id)}
              className="w-full rounded-2xl border-2 border-dashed border-red-200 bg-red-50/50 text-red-600 py-4 font-medium hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir este bot
            </button>
          </div>
        </ScrollArea>
      </div>
    )
  }

  // ── BOT LIST ──
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#f4f5f8]">
      {/* Header */}
      <header className="px-4 md:px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Meus Bots</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie seus bots do Telegram</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-[#111] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Criar Bot
          </button>
        </div>
      </header>

      <CreateBotWizard
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreateBot={handleCreate}
      />

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
        {/* Stats Row */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          {/* Total Bots - Dark Card */}
          <div className="bg-[#111] rounded-[24px] p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#a3e635] opacity-10 blur-[40px] rounded-full" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#a3e635]/10 flex items-center justify-center mb-3">
                <BotIcon className="h-5 w-5 text-[#a3e635]" />
              </div>
              <p className="text-xs text-gray-500">Total de Bots</p>
              <p className="text-3xl font-bold text-white mt-0.5">{bots.length}</p>
            </div>
          </div>

          {/* Active Bots */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center mb-3">
              <Activity className="h-5 w-5 text-[#22c55e]" />
            </div>
            <p className="text-xs text-gray-500">Bots Ativos</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">{activeBots}</p>
          </div>

          {/* With Groups */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">Com Grupo</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">{bots.filter((b) => b.group_name).length}</p>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500">Performance</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">98%</p>
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
              className="w-full bg-white rounded-xl border border-gray-200 pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a3e635]/30 focus:border-[#a3e635] transition-all"
            />
          </div>
        </div>

        {/* Bot List */}
        {bots.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BotIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Nenhum bot criado</h3>
            <p className="text-gray-500 mt-2">Crie seu primeiro bot para comecar a vender</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-6 flex items-center gap-2 bg-[#111] text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors mx-auto"
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Bot
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBots.map((bot) => {
              const isSelected = selectedBot?.id === bot.id
              const isActive = bot.status === "active"
              
              return (
                <div
                  key={bot.id}
                  onClick={() => setSelectedBot(bot)}
                  className={`bg-white rounded-[24px] border shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "border-[#a3e635] ring-2 ring-[#a3e635]/20" : "border-gray-100"
                  }`}
                >
                  <div className="p-5 flex items-center gap-4">
                    {/* Bot Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-[#a3e635]/10" : "bg-gray-100"
                    }`}>
                      <BotIcon className={`h-7 w-7 ${isActive ? "text-[#65a30d]" : "text-gray-400"}`} />
                    </div>

                    {/* Bot Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{bot.name}</h3>
                        {isSelected && (
                          <span className="bg-[#a3e635]/10 text-[#65a30d] text-xs font-medium px-2 py-0.5 rounded-md">
                            Em uso
                          </span>
                        )}
                      </div>
                      {bot.group_name && (
                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                          <LinkIcon className="h-3.5 w-3.5" />
                          {bot.group_name}
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-4">
                      {/* Status Badge */}
                      <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${
                        isActive ? "bg-[#22c55e]/10" : "bg-gray-100"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isActive ? "bg-[#22c55e] animate-pulse" : "bg-gray-400"}`} />
                        <span className={`text-sm font-medium ${isActive ? "text-[#22c55e]" : "text-gray-500"}`}>
                          {isActive ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      {/* Toggle */}
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

                      {/* Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-gray-200">
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

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-[24px]">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(bot.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); openConfig(bot) }}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#65a30d] transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Configurar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
