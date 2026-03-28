"use client"

import { useState, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Plus, Search, Bot as BotIcon, MoreVertical, Trash2, Settings,
  Loader2, CheckCircle2, LayoutGrid, List, ChevronRight, Signal, X, AtSign, Save, Camera, Users, DollarSign, Workflow, Power, RefreshCw
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBots, type Bot } from "@/lib/bot-context"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface TelegramBotData {
  telegram_bot_id: number
  name: string
  username: string
  description: string
  short_description: string
  photo_url: string | null
  can_join_groups: boolean
  can_read_all_group_messages: boolean
  supports_inline_queries: boolean
  commands: Array<{ command: string; description: string }>
}

interface ExtendedBot extends Bot {
  telegram_bot_id?: number
  username?: string
  description?: string
  short_description?: string
  photo_url?: string | null
}

export default function BotsPage() {
  const { bots, selectedBot, setSelectedBot, addBot, updateBot, deleteBot } = useBots()
  const { toast } = useToast()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Create Bot Modal - Simplificado (apenas token)
  const [createOpen, setCreateOpen] = useState(false)
  const [newBotToken, setNewBotToken] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validatedBot, setValidatedBot] = useState<TelegramBotData | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Config Modal - Minimalista
  const [configBot, setConfigBot] = useState<ExtendedBot | null>(null)
  const [cfgName, setCfgName] = useState("")
  const [cfgDescription, setCfgDescription] = useState("")
  const [cfgShortDescription, setCfgShortDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const [cfgPhoto, setCfgPhoto] = useState<File | null>(null)
  const [cfgPhotoPreview, setCfgPhotoPreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  
  // Cache de dados do Telegram (foto, username, etc.)
  const [telegramDataCache, setTelegramDataCache] = useState<Record<string, TelegramBotData>>({})
  const [isLoadingTelegramData, setIsLoadingTelegramData] = useState(false)
  
  // Trocar token modal
  const [changeTokenBot, setChangeTokenBot] = useState<Bot | null>(null)
  const [newToken, setNewToken] = useState("")
  const [isChangingToken, setIsChangingToken] = useState(false)
  
  // Cache de fluxos vinculados aos bots
  const [botFlowsCache, setBotFlowsCache] = useState<Record<string, { id: string; name: string } | null>>({})
  
  // Carregar fluxos vinculados aos bots (busca em flows.bot_id E flow_bots)
  const loadBotFlows = useCallback(async (botsToLoad: Bot[]) => {
    const newCache: Record<string, { id: string; name: string } | null> = { ...botFlowsCache }
    
    await Promise.all(botsToLoad.map(async (bot) => {
      // Primeiro tenta por flows.bot_id
      let { data: flow } = await supabase
        .from("flows")
        .select("id, name")
        .eq("bot_id", bot.id)
        .eq("status", "ativo")
        .limit(1)
        .single()
      
      // Se nao encontrou, tenta por flow_bots
      if (!flow) {
        const { data: flowBot } = await supabase
          .from("flow_bots")
          .select("flow_id")
          .eq("bot_id", bot.id)
          .limit(1)
          .single()
        
        if (flowBot) {
          const { data: linkedFlow } = await supabase
            .from("flows")
            .select("id, name")
            .eq("id", flowBot.flow_id)
            .single()
          
          flow = linkedFlow
        }
      }
      
      newCache[bot.id] = flow || null
    }))
    
    setBotFlowsCache(newCache)
  }, [botFlowsCache])
  
  // Carregar fluxos quando bots mudam
  useEffect(() => {
    if (bots.length > 0) {
      loadBotFlows(bots)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bots])
  
  // Carregar dados do Telegram para todos os bots
  const loadTelegramData = useCallback(async (botsToLoad: Bot[]) => {
    // Verificar quais bots precisam carregar
    const botsNeedingData = botsToLoad.filter(bot => !telegramDataCache[bot.id])
    if (botsNeedingData.length === 0) return
    
    setIsLoadingTelegramData(true)
    const newCache: Record<string, TelegramBotData> = { ...telegramDataCache }
    
    // Carregar em paralelo
    await Promise.all(botsNeedingData.map(async (bot) => {
      try {
        const response = await fetch("/api/telegram/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: bot.token }),
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.bot) {
            newCache[bot.id] = data.bot
          }
        }
      } catch {
        // Ignora erros de validação
      }
    }))
    
    setTelegramDataCache(newCache)
    setIsLoadingTelegramData(false)
  }, [telegramDataCache])
  
  // Carregar dados do Telegram quando bots mudam
  useEffect(() => {
    if (bots.length > 0) {
      loadTelegramData(bots)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bots])
  
  // Função para obter dados extendidos de um bot
  const getExtendedBot = useCallback((bot: Bot): ExtendedBot => {
    const telegramData = telegramDataCache[bot.id]
    return {
      ...bot,
      username: telegramData?.username,
      description: telegramData?.description,
      short_description: telegramData?.short_description,
      photo_url: telegramData?.photo_url,
      telegram_bot_id: telegramData?.telegram_bot_id,
    }
  }, [telegramDataCache])

  const filteredBots = bots.filter(
    (bot) =>
      bot.name.toLowerCase().includes(search.toLowerCase()) ||
      bot.token.toLowerCase().includes(search.toLowerCase())
  )

  // Validar token e buscar dados do bot
  async function handleValidateToken() {
    if (!newBotToken.trim()) return
    
    setIsValidating(true)
    setValidatedBot(null)
    
    try {
      const response = await fetch("/api/telegram/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: newBotToken.trim() }),
      })
      
      const data = await response.json()
      
      if (!response.ok || data.error) {
        toast({
          title: "Erro",
          description: data.error || "Token inválido ou bot não encontrado",
          variant: "destructive",
        })
        return
      }
      
      setValidatedBot(data.bot)
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao validar token",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Criar bot após validação
  async function handleCreateBot() {
    if (!validatedBot) return
    
    setIsCreating(true)
    try {
      const createdBot = await addBot({ 
        name: validatedBot.name, 
        token: newBotToken.trim() 
      })
      
      // Registrar webhook
      await fetch("/api/telegram/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: createdBot.token, action: "register" }),
      })
      
      toast({
        title: "Sucesso",
        description: "Bot conectado com sucesso!",
      })
      
      setCreateOpen(false)
      setNewBotToken("")
      setValidatedBot(null)
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao criar bot",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Abrir configurações e buscar dados atualizados do Telegram
  async function openConfig(bot: Bot) {
    const extendedBot = bot as ExtendedBot
    setConfigBot(extendedBot)
    setCfgName(bot.name)
    setCfgDescription("")
    setCfgShortDescription("")
    setIsLoadingConfig(true)
    
    // Buscar dados atualizados do Telegram
    try {
      const response = await fetch("/api/telegram/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: bot.token }),
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.bot) {
          const updatedBot: ExtendedBot = {
            ...extendedBot,
            name: data.bot.name || extendedBot.name,
            username: data.bot.username,
            description: data.bot.description || "",
            short_description: data.bot.short_description || "",
            photo_url: data.bot.photo_url,
          }
          setConfigBot(updatedBot)
          setCfgName(data.bot.name || bot.name)
          setCfgDescription(data.bot.description || "")
          setCfgShortDescription(data.bot.short_description || "")
        }
      }
    } catch {
      // Se falhar ao buscar, usa os dados locais
      setCfgName(bot.name)
      setCfgDescription(extendedBot.description || "")
      setCfgShortDescription(extendedBot.short_description || "")
    } finally {
      setIsLoadingConfig(false)
    }
  }

  // Fechar configurações
  function closeConfig() {
    setConfigBot(null)
    setCfgName("")
    setCfgDescription("")
    setCfgShortDescription("")
    setIsLoadingConfig(false)
    setCfgPhoto(null)
    setCfgPhotoPreview(null)
  }

  // Handler para seleção de foto
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setCfgPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCfgPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Salvar configurações
  async function handleSaveConfig() {
    if (!configBot) return
    setIsSaving(true)
    
    try {
      // Usar FormData para suportar upload de foto
      const formData = new FormData()
      formData.append("token", configBot.token)
      formData.append("name", cfgName.trim())
      formData.append("description", cfgDescription.trim())
      formData.append("shortDescription", cfgShortDescription.trim())
      
      if (cfgPhoto) {
        formData.append("photo", cfgPhoto)
      }
      
      const response = await fetch("/api/telegram/update", {
        method: "POST",
        body: formData,
      })
      
      const result = await response.json()
      
      // Atualizar no banco local
      await updateBot(configBot.id, {
        name: cfgName.trim() || configBot.name,
      })
      
      // Buscar dados atualizados do Telegram para atualizar o cache
      const validateResponse = await fetch("/api/telegram/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: configBot.token }),
      })
      
      if (validateResponse.ok) {
        const validateData = await validateResponse.json()
        if (validateData.bot) {
          // Atualizar o cache com os novos dados do Telegram
          setTelegramDataCache(prev => ({
            ...prev,
            [configBot.id]: validateData.bot
          }))
          
          // Atualizar o configBot com os novos dados
          const updatedBot: ExtendedBot = { 
            ...configBot, 
            name: cfgName.trim() || configBot.name,
            description: validateData.bot.description,
            short_description: validateData.bot.short_description,
            photo_url: validateData.bot.photo_url,
          }
          setConfigBot(updatedBot)
        }
      }
      
      setCfgPhoto(null)
      setCfgPhotoPreview(null)
      
      const photoFailed = cfgPhoto && result.results?.photo === false
      const photoError = result.results?.photoError
      
      toast({
        title: photoFailed ? "Erro na foto" : "Sucesso",
        description: photoFailed 
          ? `Erro do Telegram: ${photoError || "desconhecido"}. Tente PNG quadrado < 5MB.`
          : "Alterações salvas com sucesso!",
        variant: photoFailed ? "destructive" : "default",
      })
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao salvar alterações",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle rapido de ativar/desativar bot
  async function handleQuickToggle(bot: Bot, e: React.MouseEvent) {
    e.stopPropagation()
    const newStatus = bot.status === "active" ? "inactive" : "active"
    
    try {
      await updateBot(bot.id, { status: newStatus })
      await fetch("/api/telegram/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: bot.token, action: newStatus === "active" ? "register" : "unregister" }),
      })
      
      toast({
        title: newStatus === "active" ? "Bot ativado" : "Bot desativado",
        description: newStatus === "active" ? "O bot esta online e recebendo mensagens" : "O bot esta offline",
      })
    } catch {
      toast({
        title: "Erro",
        description: "Nao foi possivel alterar o status do bot",
        variant: "destructive",
      })
    }
  }

  // Trocar token do bot
  async function handleChangeToken() {
    if (!changeTokenBot || !newToken.trim()) return
    
    setIsChangingToken(true)
    try {
      // Validar novo token
      const response = await fetch("/api/telegram/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: newToken.trim() }),
      })
      
      const data = await response.json()
      
      if (!response.ok || data.error) {
        toast({
          title: "Erro",
          description: data.error || "Token invalido",
          variant: "destructive",
        })
        setIsChangingToken(false)
        return
      }
      
      // Desregistrar webhook antigo
      await fetch("/api/telegram/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: changeTokenBot.token, action: "unregister" }),
      })
      
      // Atualizar token no banco
      await updateBot(changeTokenBot.id, { 
        token: newToken.trim(),
        name: data.bot.name || changeTokenBot.name,
      })
      
      // Registrar novo webhook
      await fetch("/api/telegram/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: newToken.trim(), action: "register" }),
      })
      
      // Limpar cache do Telegram para este bot
      setTelegramDataCache(prev => {
        const next = { ...prev }
        delete next[changeTokenBot.id]
        return next
      })
      
      toast({
        title: "Token atualizado",
        description: "O bot foi atualizado com o novo token",
      })
      
      setChangeTokenBot(null)
      setNewToken("")
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao trocar token",
        variant: "destructive",
      })
    } finally {
      setIsChangingToken(false)
    }
  }

  // Excluir bot
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
      
      toast({
        title: "Sucesso",
        description: "Bot excluído com sucesso!",
      })
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao excluir bot",
        variant: "destructive",
      })
    }
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

      {/* Create Bot Dialog - SIMPLIFICADO (apenas token) */}
      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open)
        if (!open) {
          setNewBotToken("")
          setValidatedBot(null)
        }
      }}>
        <DialogContent className="sm:max-w-md bg-card border-border p-0 gap-0 overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <BotIcon className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Conectar Bot</h2>
                <p className="text-sm text-muted-foreground">Cole o token do Telegram</p>
              </div>
            </div>

            {/* Se ainda não validou - mostra input de token */}
            {!validatedBot ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Token do Bot
                  </Label>
                  <Input
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    value={newBotToken}
                    onChange={(e) => setNewBotToken(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleValidateToken()}
                    className="h-12 bg-muted border-border rounded-xl font-mono text-sm"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Pegue o token com o @BotFather no Telegram
                  </p>
                </div>

                <button
                  onClick={handleValidateToken}
                  disabled={isValidating || !newBotToken.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground h-12 rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    "Conectar Bot"
                  )}
                </button>
              </div>
            ) : (
              /* Bot validado - mostra card de confirmação */
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-2xl p-5 border border-border">
                  <div className="flex items-center gap-4">
                    {validatedBot.photo_url ? (
                      <img
                        src={validatedBot.photo_url}
                        alt={validatedBot.name}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <BotIcon className="h-8 w-8 text-accent" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-lg truncate">
                        {validatedBot.name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <AtSign className="h-3.5 w-3.5" />
                        {validatedBot.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Validado</span>
                    </div>
                  </div>
                  
                  {validatedBot.short_description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {validatedBot.short_description}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setValidatedBot(null)
                      setNewBotToken("")
                    }}
                    className="flex-1 h-11 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateBot}
                    disabled={isCreating}
                    className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground h-11 rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Confirmar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Config Bot Dialog - Design limpo e moderno */}
      <Dialog open={!!configBot} onOpenChange={(open) => !open && closeConfig()}>
        <DialogContent className="sm:max-w-md bg-card border-border p-0 gap-0 overflow-hidden rounded-2xl">
          {configBot && (
            <>
              {/* Loading state */}
              {isLoadingConfig ? (
                <div className="p-12 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-accent animate-spin mb-3" />
                  <p className="text-muted-foreground text-sm">Carregando...</p>
                </div>
              ) : (
                <>
                  {/* Header com foto centralizada */}
                  <div className="pt-6 pb-4 px-6 text-center border-b border-border/50">
                    {/* Foto clicavel para upload */}
                    <input
                      type="file"
                      ref={photoInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <div 
                      className="relative inline-block group cursor-pointer mb-3"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      {cfgPhotoPreview || (configBot as ExtendedBot).photo_url ? (
                        <img
                          src={cfgPhotoPreview || (configBot as ExtendedBot).photo_url!}
                          alt={configBot.name}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center border-2 border-border">
                          <BotIcon className="h-8 w-8 text-accent" />
                        </div>
                      )}
                      {/* Overlay para trocar foto */}
                      <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                      {/* Badge de status */}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-card flex items-center justify-center ${
                        configBot.status === "active" ? "bg-green-500" : "bg-muted-foreground"
                      }`}>
                        {configBot.status === "active" && (
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        )}
                      </div>
                    </div>
                    
                    <h2 className="text-lg font-bold text-foreground">Configuracoes do Bot</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Clique na foto para alterar</p>
                    
                    {/* Toggle de status */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <span className={`text-xs font-medium ${configBot.status !== "active" ? "text-foreground" : "text-muted-foreground"}`}>
                        Offline
                      </span>
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
                      <span className={`text-xs font-medium ${configBot.status === "active" ? "text-accent" : "text-muted-foreground"}`}>
                        Online
                      </span>
                    </div>
                  </div>

                  {/* Campos editaveis */}
                  <div className="p-6 space-y-4">
                    {/* Nome */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Nome
                      </Label>
                      <Input 
                        value={cfgName} 
                        onChange={(e) => setCfgName(e.target.value)} 
                        className="h-10 bg-muted/50 border-border/50 rounded-xl text-sm focus:border-accent" 
                        placeholder="Nome do bot"
                      />
                    </div>

                    {/* Username (somente leitura) */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                        <AtSign className="h-3 w-3" />
                        Username
                      </Label>
                      <Input 
                        value={(configBot as ExtendedBot).username || ""} 
                        disabled
                        className="h-10 bg-muted/30 border-border/30 rounded-xl text-sm text-muted-foreground" 
                      />
                    </div>

                    {/* Descricao curta */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Bio
                        </Label>
                        <span className="text-[10px] text-muted-foreground">
                          {cfgShortDescription.length}/120
                        </span>
                      </div>
                      <Input 
                        value={cfgShortDescription} 
                        onChange={(e) => setCfgShortDescription(e.target.value)} 
                        className="h-10 bg-muted/50 border-border/50 rounded-xl text-sm focus:border-accent" 
                        placeholder="Descricao curta visivel no perfil"
                        maxLength={120}
                      />
                    </div>

                    {/* Descricao longa */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Descricao
                        </Label>
                        <span className="text-[10px] text-muted-foreground">
                          {cfgDescription.length}/512
                        </span>
                      </div>
                      <Textarea 
                        value={cfgDescription} 
                        onChange={(e) => setCfgDescription(e.target.value)} 
                        className="min-h-[80px] bg-muted/50 border-border/50 rounded-xl resize-none text-sm focus:border-accent" 
                        placeholder="O que seu bot faz? (visivel ao iniciar conversa)"
                        maxLength={512}
                      />
                    </div>
                  </div>

                  {/* Footer com acoes */}
                  <div className="px-6 py-4 bg-muted/20 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleDelete(configBot.id)}
                        className="text-xs text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir Bot
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={closeConfig}
                          className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveConfig}
                          disabled={isSaving}
                          className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2 rounded-xl font-semibold text-xs hover:bg-accent/90 transition-colors disabled:opacity-50"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5" />
                              Salvar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Token Dialog */}
      <Dialog open={!!changeTokenBot} onOpenChange={(open) => !open && setChangeTokenBot(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Trocar Token</h2>
              <p className="text-sm text-muted-foreground">
                {changeTokenBot?.name}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Novo Token
              </Label>
              <Input
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                className="h-12 bg-muted border-border rounded-xl font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Use quando seu bot for banido. Os dados serao mantidos.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setChangeTokenBot(null)}
                className="flex-1 h-11 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangeToken}
                disabled={isChangingToken || !newToken.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground h-11 rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {isChangingToken ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Trocando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Trocar Token
                  </>
                )}
              </button>
            </div>
          </div>
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
            <h3 className="text-xl font-bold text-foreground">Nenhum bot conectado</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-sm mx-auto">
              Conecte seu primeiro bot em apenas 1 passo
            </p>
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Conectar Bot
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View - Cards compactos */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBots.map((bot) => {
              const isSelected = selectedBot?.id === bot.id
              const isActive = bot.status === "active"
              const extendedBot = getExtendedBot(bot)
              
              return (
                <div
                  key={bot.id}
                  className={`bg-card rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 group ${
                    isSelected ? "border-accent ring-1 ring-accent/20" : "border-border"
                  }`}
                >
                  {/* Topo com foto e status */}
                  <div className="relative pt-3 pb-3 px-3 flex flex-col items-center">
                    {/* Menu no canto */}
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-lg">
                          <DropdownMenuItem
                            className="flex items-center gap-2 py-2 cursor-pointer text-sm"
                            onClick={(e) => { e.stopPropagation(); openConfig(bot) }}
                          >
                            <Settings className="h-3.5 w-3.5" />
                            Configurar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 py-2 cursor-pointer text-sm"
                            onClick={(e) => { 
                              e.stopPropagation()
                              setChangeTokenBot(bot)
                              setNewToken("")
                            }}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Trocar Token
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 py-2 cursor-pointer text-sm text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDelete(bot.id) }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Badge de status */}
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                        isActive 
                          ? "bg-accent/15 text-accent" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-accent" : "bg-muted-foreground"}`} />
                        {isActive ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>

                    {/* Foto do bot */}
                    <div className="mt-5">
                      {isLoadingTelegramData && !telegramDataCache[bot.id] ? (
                        <div className="w-16 h-16 rounded-xl bg-muted animate-pulse" />
                      ) : extendedBot.photo_url ? (
                        <img
                          src={extendedBot.photo_url}
                          alt={bot.name}
                          className="w-16 h-16 rounded-xl object-cover border border-border"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          isActive ? "bg-accent/10" : "bg-muted"
                        }`}>
                          <BotIcon className={`h-7 w-7 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                        </div>
                      )}
                    </div>

                    {/* Nome do bot */}
                    <h3 className="text-base font-bold text-foreground text-center mt-2.5 truncate max-w-full">
                      {bot.name}
                    </h3>

                    {/* Username com badge */}
                    {extendedBot.username && (
                      <div className="mt-1.5 px-3 py-1 bg-muted rounded-full">
                        <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <AtSign className="h-3 w-3" />
                          {extendedBot.username}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Estatisticas */}
                  <div className="px-3 py-2.5 border-t border-border">
                    <div className="grid grid-cols-2">
                      <div className="text-center">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Leads</p>
                        <p className="text-lg font-bold text-foreground">0</p>
                      </div>
                      <div className="text-center border-l border-border">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Vendas</p>
                        <p className="text-lg font-bold text-foreground">0</p>
                      </div>
                    </div>
                  </div>

                  {/* Fluxo Vinculado */}
                  <div className="px-3 py-2 border-t border-border">
                    {botFlowsCache[bot.id] ? (
                      <div className="flex items-center gap-2 justify-center">
                        <Workflow className="h-3.5 w-3.5 text-accent" />
                        <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                          {botFlowsCache[bot.id]?.name}
                        </span>
                        <CheckCircle2 className="h-3 w-3 text-accent" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-center text-muted-foreground">
                        <Workflow className="h-3.5 w-3.5" />
                        <span className="text-xs">Sem fluxo</span>
                      </div>
                    )}
                  </div>

                  {/* Botoes de acao */}
                  <div className="px-3 pb-3 flex gap-2">
                    {/* Toggle Ativar/Desativar */}
                    <button
                      onClick={(e) => handleQuickToggle(bot, e)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition-all ${
                        isActive 
                          ? "bg-red-500/10 hover:bg-red-500/20 text-red-500" 
                          : "bg-accent/10 hover:bg-accent/20 text-accent"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" />
                      {isActive ? "Desativar" : "Ativar"}
                    </button>
                    {/* Ir para Fluxos */}
                    <button
                      onClick={(e) => { 
                        e.stopPropagation()
                        setSelectedBot(bot)
                        router.push("/fluxos")
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground text-muted-foreground font-semibold text-xs transition-all"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                      Fluxos
                    </button>
                  </div>

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="py-2 bg-accent/10 border-t border-accent/20">
                      <p className="text-[11px] font-medium text-accent text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
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
              const extendedBot = getExtendedBot(bot)
              
              return (
                <div
                  key={bot.id}
                  onClick={() => setSelectedBot(bot)}
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-muted ${
                    index !== filteredBots.length - 1 ? "border-b border-border" : ""
                  } ${isSelected ? "bg-accent/5" : ""}`}
                >
                  {/* Icon */}
                  {isLoadingTelegramData && !telegramDataCache[bot.id] ? (
                    <div className="w-12 h-12 rounded-xl bg-muted animate-pulse flex-shrink-0" />
                  ) : extendedBot.photo_url ? (
                    <img
                      src={extendedBot.photo_url}
                      alt={bot.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-border"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-accent/10" : "bg-muted"
                    }`}>
                      <BotIcon className={`h-6 w-6 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{bot.name}</h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive 
                          ? "bg-accent/10 text-accent" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-accent" : "bg-muted-foreground"}`} />
                        {isActive ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>
                    {extendedBot.username && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                        <AtSign className="h-3 w-3" />
                        {extendedBot.username}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">Leads</p>
                      <p className="text-lg font-bold text-foreground">0</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">Vendas</p>
                      <p className="text-lg font-bold text-foreground">0</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation()
                        setSelectedBot(bot)
                        router.push("/fluxos")
                      }}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground text-muted-foreground text-xs font-semibold transition-colors"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                      Fluxos
                    </button>
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
