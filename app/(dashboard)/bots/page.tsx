"use client"

import { useState, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Plus, Search, Bot as BotIcon, MoreHorizontal, Activity, Users, Trash2, Settings, ChevronLeft,
  DollarSign, Tag, CalendarDays, Hash, LinkIcon, KeyRound, Save, Loader2, Zap, TrendingUp,
  Filter, MoreVertical, Sparkles, MessageSquare, Shield, Globe, Eye, EyeOff, Copy, ExternalLink,
  ChevronRight, Signal, Cpu, Clock, CheckCircle2, LayoutGrid, List, X,
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

  // Config Modal
  const [configBot, setConfigBot] = useState<Bot | null>(null)
  const [cfgName, setCfgName] = useState("")
  const [cfgToken, setCfgToken] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showToken, setShowToken] = useState(false)

  // Create Bot Modal
  const [newBotName, setNewBotName] = useState("")
  const [newBotToken, setNewBotToken] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  // Plans
  const [plans, setPlans] = useState<BotPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [newPlanName, setNewPlanName] = useState("")
  const [newPlanPrice, setNewPlanPrice] = useState("")
  const [newPlanDays, setNewPlanDays] = useState("30")
  const [addingPlan, setAddingPlan] = useState(false)

  const filteredBots = bots.filter(
    (bot) =>
      bot.name.toLowerCase().includes(search.toLowerCase()) ||
      bot.token.toLowerCase().includes(search.toLowerCase())
  )

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
    setShowToken(false)
  }

  function closeConfig() {
    setConfigBot(null)
    setCfgName("")
    setCfgToken("")
    setShowToken(false)
    setPlans([])
  }

  async function handleSaveConfig() {
    if (!configBot) return
    setIsSaving(true)
    try {
      await updateBot(configBot.id, {
        name: cfgName.trim() || configBot.name,
        token: cfgToken.trim() || configBot.token,
      })
      if (cfgToken.trim() !== configBot.token) {
        await fetch("/api/telegram/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ botToken: cfgToken.trim(), action: "register" }),
        })
      }
      setConfigBot({ ...configBot, name: cfgName.trim() || configBot.name, token: cfgToken.trim() || configBot.token })
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
        description: null,
      })
      .select()
      .single()

    if (!error && data) {
      setPlans((prev) => [...prev, data as BotPlan])
      setNewPlanName("")
      setNewPlanPrice("")
      setNewPlanDays("30")
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

  async function handleCreateBot() {
    if (!newBotName.trim() || !newBotToken.trim()) {
      setCreateError("Preencha todos os campos")
      return
    }
    setIsCreating(true)
    setCreateError("")
    try {
      const createdBot = await addBot({ name: newBotName.trim(), token: newBotToken.trim() })
      await fetch("/api/telegram/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: createdBot.token, action: "register" }),
      })
      setCreateOpen(false)
      setNewBotName("")
      setNewBotToken("")
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar bot")
    } finally {
      setIsCreating(false)
    }
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
      if (configBot?.id === id) closeConfig()
    } catch { /* handled */ }
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <header className="px-4 md:px-8 py-6 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Meus Bots</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{bots.length} bot(s) cadastrado(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 bg-card rounded-xl p-1 border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                viewMode === "grid" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                viewMode === "list" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Bot</span>
          </button>
        </div>
      </header>

      {/* Create Bot Dialog - Simplificado */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border p-0 gap-0 overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <BotIcon className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Criar Novo Bot</h2>
                <p className="text-sm text-muted-foreground">Adicione seu bot do Telegram</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Nome do Bot</Label>
                <Input
                  placeholder="Ex: Bot de Vendas"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  className="h-11 bg-muted border-border rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                  Token do Telegram
                </Label>
                <Input
                  placeholder="123456:ABC-DEF..."
                  value={newBotToken}
                  onChange={(e) => setNewBotToken(e.target.value)}
                  className="h-11 bg-muted border-border rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">Pegue o token com o @BotFather no Telegram</p>
              </div>
            </div>

            {createError && (
              <p className="text-sm text-destructive mt-4">{createError}</p>
            )}
          </div>

          <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-end gap-3">
            <button
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateBot}
              disabled={isCreating || !newBotName.trim() || !newBotToken.trim()}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isCreating ? "Criando..." : "Criar Bot"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Config Bot Dialog - Popup bonito */}
      <Dialog open={!!configBot} onOpenChange={(open) => !open && closeConfig()}>
        <DialogContent className="sm:max-w-lg bg-card border-border p-0 gap-0 overflow-hidden max-h-[90vh]">
          {configBot && (
            <>
              {/* Header com status */}
              <div className="p-6 pb-4 bg-gradient-to-br from-accent/5 to-transparent border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center relative">
                      <BotIcon className="h-8 w-8 text-accent" />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-card ${
                        configBot.status === "active" ? "bg-green-500" : "bg-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{configBot.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          configBot.status === "active" 
                            ? "bg-green-500/10 text-green-600" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <Signal className="h-3 w-3" />
                          {configBot.status === "active" ? "Online" : "Offline"}
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
              </div>

              <ScrollArea className="max-h-[60vh]">
                <div className="p-6 space-y-6">
                  {/* Informacoes do Bot */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      Informacoes
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Nome do Bot</Label>
                        <Input 
                          value={cfgName} 
                          onChange={(e) => setCfgName(e.target.value)} 
                          className="h-10 bg-muted border-0 rounded-xl" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-2">
                          <KeyRound className="h-3 w-3" />
                          Token do Telegram
                        </Label>
                        <div className="relative">
                          <Input
                            value={cfgToken}
                            onChange={(e) => setCfgToken(e.target.value)}
                            type={showToken ? "text" : "password"}
                            className="h-10 bg-muted border-0 rounded-xl font-mono text-xs pr-20"
                          />
                          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                            <button
                              onClick={() => navigator.clipboard.writeText(cfgToken)}
                              className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center transition-colors"
                            >
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => setShowToken(!showToken)}
                              className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center transition-colors"
                            >
                              {showToken ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Planos */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      Planos ({plans.length})
                    </h3>

                    {loadingPlans ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : plans.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border py-6 text-center">
                        <DollarSign className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Nenhum plano criado</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {plans.map((plan) => (
                          <div
                            key={plan.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              plan.active 
                                ? "border-accent/30 bg-accent/5" 
                                : "border-border bg-muted/30 opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-accent" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{plan.name}</p>
                                <p className="text-xs text-muted-foreground">{plan.duration_days} dias</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-accent text-sm">
                                R$ {plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                              <Switch
                                checked={plan.active}
                                onCheckedChange={(checked) => handleTogglePlan(plan.id, checked)}
                              />
                              <button
                                onClick={() => handleDeletePlan(plan.id)}
                                className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Adicionar Plano Inline */}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Nome"
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                        className="h-9 bg-muted border-0 rounded-lg text-sm flex-1"
                      />
                      <Input
                        placeholder="R$"
                        value={newPlanPrice}
                        onChange={(e) => setNewPlanPrice(e.target.value)}
                        className="h-9 bg-muted border-0 rounded-lg text-sm w-20"
                      />
                      <Input
                        placeholder="Dias"
                        value={newPlanDays}
                        onChange={(e) => setNewPlanDays(e.target.value)}
                        type="number"
                        className="h-9 bg-muted border-0 rounded-lg text-sm w-16"
                      />
                      <button
                        onClick={handleAddPlan}
                        disabled={addingPlan || !newPlanName.trim() || !newPlanPrice.trim()}
                        className="h-9 w-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50"
                      >
                        {addingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Zona de Perigo */}
                  <div className="pt-4 border-t border-border">
                    <button
                      onClick={() => handleDelete(configBot.id)}
                      className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir este bot
                    </button>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer com Salvar */}
              <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-end gap-3">
                <button
                  onClick={closeConfig}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar bots..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card rounded-xl border border-border pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>
        </div>

        {/* Empty State */}
        {bots.length === 0 ? (
          <div className="bg-card rounded-[28px] border border-border p-12 text-center">
            <div className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <BotIcon className="h-12 w-12 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Nenhum bot criado</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-sm mx-auto">Crie seu primeiro bot para comecar</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Bot
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBots.map((bot) => {
              const isSelected = selectedBot?.id === bot.id
              const isActive = bot.status === "active"
              
              return (
                <div
                  key={bot.id}
                  onClick={() => setSelectedBot(bot)}
                  className={`bg-card rounded-2xl border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group ${
                    isSelected ? "border-accent ring-2 ring-accent/20" : "border-border"
                  }`}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative ${
                        isActive ? "bg-accent/10" : "bg-muted"
                      }`}>
                        <BotIcon className={`h-6 w-6 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
                          isActive ? "bg-green-500" : "bg-muted-foreground"
                        }`} />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
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
                            className="flex items-center gap-2 py-2.5 cursor-pointer text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDelete(bot.id) }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Info */}
                    <h3 className="text-lg font-bold text-foreground truncate">{bot.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Criado em {new Date(bot.created_at).toLocaleDateString("pt-BR")}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                      }`}>
                        {isActive ? "Online" : "Offline"}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); openConfig(bot) }}
                        className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
                      >
                        Configurar
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="px-5 py-3 bg-accent/10 border-t border-accent/20 rounded-b-2xl">
                      <p className="text-xs font-medium text-accent text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Bot selecionado
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {filteredBots.map((bot, index) => {
              const isSelected = selectedBot?.id === bot.id
              const isActive = bot.status === "active"
              
              return (
                <div
                  key={bot.id}
                  onClick={() => setSelectedBot(bot)}
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-muted ${
                    index !== filteredBots.length - 1 ? "border-b border-border" : ""
                  } ${isSelected ? "bg-accent/5" : ""}`}
                >
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center relative flex-shrink-0 ${
                    isActive ? "bg-accent/10" : "bg-muted"
                  }`}>
                    <BotIcon className={`h-5 w-5 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                      isActive ? "bg-green-500" : "bg-muted-foreground"
                    }`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{bot.name}</h3>
                      {isSelected && (
                        <span className="text-[10px] font-medium text-accent bg-accent/20 px-2 py-0.5 rounded-full flex-shrink-0">
                          Em uso
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      Criado em {new Date(bot.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  {/* Status */}
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0 ${
                    isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                  }`}>
                    {isActive ? "Online" : "Offline"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); openConfig(bot) }}
                      className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(bot.id) }}
                      className="w-9 h-9 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
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
