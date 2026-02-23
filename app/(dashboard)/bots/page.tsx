"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Search,
  Bot as BotIcon,
  MoreHorizontal,
  Activity,
  Users,
  Trash2,
  Pencil,
  Circle,
  Settings,
  ChevronLeft,
  DollarSign,
  Tag,
  CalendarDays,
  Hash,
  LinkIcon,
  KeyRound,
  Save,
  X,
  Loader2,
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create form
  const [newName, setNewName] = useState("")
  const [newToken, setNewToken] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupId, setNewGroupId] = useState("")
  const [newGroupLink, setNewGroupLink] = useState("")
  const [createError, setCreateError] = useState("")

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
      // Re-register webhook if token changed
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

  async function handleCreate() {
    setCreateError("")
    if (!newName.trim()) { setCreateError("Digite um nome para o bot"); return }
    if (!newToken.trim()) { setCreateError("Digite o token do bot"); return }

    setIsSubmitting(true)
    try {
      const createdBot = await addBot({
        name: newName.trim(),
        token: newToken.trim(),
        group_name: newGroupName.trim() || undefined,
        group_id: newGroupId.trim() || undefined,
        group_link: newGroupLink.trim() || undefined,
      })
      await fetch("/api/telegram/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: createdBot.token, action: "register" }),
      })
      setNewName(""); setNewToken(""); setNewGroupName(""); setNewGroupId(""); setNewGroupLink("")
      setCreateOpen(false)
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar bot")
    } finally {
      setIsSubmitting(false)
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
      if (configBot?.id === id) setConfigBot(null)
    } catch { /* handled */ }
  }

  // ── CONFIG PANEL ──
  if (configBot) {
    return (
      <>
        <DashboardHeader title="Configurar Bot" description={configBot.name} />
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">

            {/* Back */}
            <Button
              variant="ghost"
              onClick={() => setConfigBot(null)}
              className="self-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para lista
            </Button>

            {/* Bot header card */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="bg-accent/5 border-b border-border px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                    <BotIcon className="h-7 w-7 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-foreground truncate">{configBot.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className={configBot.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}>
                        {configBot.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Criado em {new Date(configBot.created_at).toLocaleDateString("pt-BR")}
                      </span>
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
            </div>

            {/* Config sections - 2 columns */}
            <div className="grid gap-6 md:grid-cols-2">

              {/* Bot Info */}
              <section className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <BotIcon className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Informacoes do Bot</h3>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nome</Label>
                    <Input value={cfgName} onChange={(e) => setCfgName(e.target.value)} className="bg-secondary border-border" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <KeyRound className="h-3 w-3" />
                      Token do Telegram
                    </Label>
                    <div className="relative">
                      <Input
                        value={cfgToken}
                        onChange={(e) => setCfgToken(e.target.value)}
                        type={showToken ? "text" : "password"}
                        className="bg-secondary border-border font-mono text-xs pr-20"
                      />
                      <button
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-accent hover:underline"
                      >
                        {showToken ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Pegue o token com o @BotFather no Telegram</p>
                  </div>
                </div>
              </section>

              {/* Group */}
              <section className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <Hash className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Grupo do Telegram</h3>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nome do Grupo</Label>
                    <Input value={cfgGroupName} onChange={(e) => setCfgGroupName(e.target.value)} placeholder="VIP Premium" className="bg-secondary border-border" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">ID do Grupo</Label>
                    <Input value={cfgGroupId} onChange={(e) => setCfgGroupId(e.target.value)} placeholder="-1001234567890" className="bg-secondary border-border font-mono text-xs" />
                    <p className="text-[11px] text-muted-foreground">ID numerico ou @ do grupo</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <LinkIcon className="h-3 w-3" />
                      Link do Grupo
                    </Label>
                    <Input value={cfgGroupLink} onChange={(e) => setCfgGroupLink(e.target.value)} placeholder="https://t.me/+abc123" className="bg-secondary border-border" />
                  </div>
                </div>
              </section>
            </div>

            {/* Save config */}
            <Button onClick={handleSaveConfig} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90 h-11 gap-2 self-end">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Salvando..." : "Salvar Configuracoes"}
            </Button>

            {/* ── PLANS ── */}
            <section className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Planos</h3>
                </div>
                <span className="text-xs text-muted-foreground">{plans.length} plano(s)</span>
              </div>

              <div className="p-6 flex flex-col gap-4">
                {/* Existing plans */}
                {loadingPlans ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : plans.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border py-8 text-center">
                    <DollarSign className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum plano criado</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Adicione planos para seus clientes escolherem</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors ${
                          plan.active ? "border-border bg-secondary/30" : "border-border/50 bg-secondary/10 opacity-60"
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                          <DollarSign className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground truncate">{plan.name}</span>
                            {!plan.active && (
                              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">Inativo</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-sm font-bold text-accent">
                              R$ {plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {plan.duration_days} dias
                            </span>
                          </div>
                          {plan.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{plan.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={plan.active}
                            onCheckedChange={(checked) => handleTogglePlan(plan.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePlan(plan.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new plan */}
                <div className="rounded-xl border border-border bg-secondary/20 p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Adicionar Plano</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Nome do plano</Label>
                      <Input value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} placeholder="Mensal" className="bg-secondary border-border" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Preco (R$)</Label>
                      <Input value={newPlanPrice} onChange={(e) => setNewPlanPrice(e.target.value)} placeholder="29,90" className="bg-secondary border-border" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Duracao (dias)</Label>
                      <Input value={newPlanDays} onChange={(e) => setNewPlanDays(e.target.value)} placeholder="30" type="number" className="bg-secondary border-border" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Descricao (opcional)</Label>
                      <Input value={newPlanDesc} onChange={(e) => setNewPlanDesc(e.target.value)} placeholder="Acesso completo por 30 dias" className="bg-secondary border-border" />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddPlan}
                    disabled={addingPlan || !newPlanName.trim() || !newPlanPrice.trim()}
                    className="mt-3 bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                  >
                    {addingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {addingPlan ? "Adicionando..." : "Adicionar Plano"}
                  </Button>
                </div>
              </div>
            </section>

            {/* Delete bot */}
            <Button
              variant="ghost"
              onClick={() => handleDelete(configBot.id)}
              className="w-full rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive h-12 gap-3 font-medium"
            >
              <Trash2 className="h-4 w-4" />
              Excluir este bot
            </Button>
          </div>
        </ScrollArea>
      </>
    )
  }

  // ── BOT LIST ──
  return (
    <>
      <DashboardHeader title="Meus Robos" description="Crie e gerencie seus bots do Telegram" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
          {/* Top bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar bots..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-72 bg-secondary pl-9 border-border" />
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Bot
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Criar Novo Bot</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Nome do Bot</Label>
                    <Input placeholder="Meu Bot de Vendas" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-secondary border-border" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Token do Telegram</Label>
                    <Input placeholder="123456:ABC-DEF..." value={newToken} onChange={(e) => setNewToken(e.target.value)} className="bg-secondary border-border font-mono text-xs" />
                    <p className="text-xs text-muted-foreground">Pegue o token com o @BotFather no Telegram</p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="mb-3 text-sm font-medium text-foreground">Grupo do Telegram (opcional)</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground text-xs">Nome do Grupo</Label>
                        <Input placeholder="VIP Premium" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="bg-secondary border-border" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground text-xs">ID do Grupo</Label>
                        <Input placeholder="-1001234567890 ou @meugrupo" value={newGroupId} onChange={(e) => setNewGroupId(e.target.value)} className="bg-secondary border-border font-mono text-xs" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground text-xs">Link do Grupo</Label>
                        <Input placeholder="https://t.me/+abc123" value={newGroupLink} onChange={(e) => setNewGroupLink(e.target.value)} className="bg-secondary border-border" />
                      </div>
                    </div>
                  </div>
                  {createError && <p className="text-sm text-destructive">{createError}</p>}
                  <Button onClick={handleCreate} disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {isSubmitting ? "Criando..." : "Criar Bot"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-3 md:p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <BotIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total de Bots</p>
                  <p className="text-lg font-bold text-foreground">{bots.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Activity className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ativos</p>
                  <p className="text-lg font-bold text-foreground">{activeBots}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Com Grupo</p>
                  <p className="text-lg font-bold text-foreground">{bots.filter((b) => b.group_name).length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bot list */}
          {bots.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                  <BotIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">Nenhum bot criado</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Crie seu primeiro bot para comecar</p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Bot
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredBots.map((bot) => (
                <Card
                  key={bot.id}
                  className={`cursor-pointer bg-card border-border transition-colors hover:bg-secondary/50 ${selectedBot?.id === bot.id ? "ring-1 ring-accent" : ""}`}
                  onClick={() => setSelectedBot(bot)}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <BotIcon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{bot.name}</h3>
                            <Circle className={`h-2 w-2 ${bot.status === "active" ? "fill-success text-success" : "fill-muted-foreground text-muted-foreground"}`} />
                            <Badge variant="outline" className={bot.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}>
                              {bot.status === "active" ? "Ativo" : "Inativo"}
                            </Badge>
                            {selectedBot?.id === bot.id && (
                              <Badge variant="outline" className="border-accent/30 bg-accent/5 text-accent text-xs">Selecionado</Badge>
                            )}
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">{bot.token.slice(0, 15)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); openConfig(bot) }}
                          className="gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          <span className="hidden md:inline text-xs">Configurar</span>
                        </Button>
                        <Switch
                          checked={bot.status === "active"}
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem className="flex items-center gap-2 text-foreground" onClick={(e) => { e.stopPropagation(); openConfig(bot) }}>
                              <Settings className="h-3.5 w-3.5" />
                              Configurar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(bot.id) }}>
                              <Trash2 className="h-3.5 w-3.5" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Criado em {new Date(bot.created_at).toLocaleDateString("pt-BR")}</span>
                      {bot.group_name && (
                        <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">
                          <LinkIcon className="mr-1 h-2.5 w-2.5" />
                          {bot.group_name}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  )
}
