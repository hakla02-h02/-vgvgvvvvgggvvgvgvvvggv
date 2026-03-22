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
  Loader2, CheckCircle2, LayoutGrid, List, ChevronRight, Signal, X, AtSign, Save, Camera
} from "lucide-react"
import { useRef } from "react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBots, type Bot } from "@/lib/bot-context"
import { useToast } from "@/hooks/use-toast"

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
    console.log("[v0] PHOTO SELECT - Event triggered")
    console.log("[v0] PHOTO SELECT - Files:", e.target.files)
    
    const file = e.target.files?.[0]
    console.log("[v0] PHOTO SELECT - Selected file:", file)
    
    if (file) {
      console.log("[v0] PHOTO SELECT - File details:", file.name, file.size, file.type)
      setCfgPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        console.log("[v0] PHOTO SELECT - FileReader completed, preview ready")
        setCfgPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Salvar configurações
  async function handleSaveConfig() {
    if (!configBot) return
    setIsSaving(true)
    
    console.log("[v0] SAVE CONFIG - Starting...")
    console.log("[v0] SAVE CONFIG - cfgPhoto:", cfgPhoto)
    console.log("[v0] SAVE CONFIG - cfgPhoto details:", cfgPhoto ? `name: ${cfgPhoto.name}, size: ${cfgPhoto.size}, type: ${cfgPhoto.type}` : "null")
    
    try {
      // Usar FormData para suportar upload de foto
      const formData = new FormData()
      formData.append("token", configBot.token)
      formData.append("name", cfgName.trim())
      formData.append("description", cfgDescription.trim())
      formData.append("shortDescription", cfgShortDescription.trim())
      
      if (cfgPhoto) {
        console.log("[v0] SAVE CONFIG - Appending photo to FormData")
        formData.append("photo", cfgPhoto)
        
        // Verificar se foi adicionado
        const photoFromForm = formData.get("photo")
        console.log("[v0] SAVE CONFIG - Photo in FormData:", photoFromForm)
      }
      
      console.log("[v0] SAVE CONFIG - Sending request to /api/telegram/update")
      
      const response = await fetch("/api/telegram/update", {
        method: "POST",
        body: formData,
      })
      
      const result = await response.json()
      console.log("[v0] SAVE CONFIG - API Response:", JSON.stringify(result))
      
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
      toast({
        title: photoFailed ? "Parcialmente salvo" : "Sucesso",
        description: photoFailed 
          ? "Alterações salvas, mas houve erro ao atualizar a foto. Tente uma imagem menor ou use o @BotFather."
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

      {/* Config Bot Dialog - COMPACTO */}
      <Dialog open={!!configBot} onOpenChange={(open) => !open && closeConfig()}>
        <DialogContent className="sm:max-w-sm bg-card border-border p-0 gap-0 overflow-hidden">
          {configBot && (
            <>
              {/* Loading state */}
              {isLoadingConfig ? (
                <div className="p-8 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-accent animate-spin mb-3" />
                  <p className="text-muted-foreground text-sm">Carregando...</p>
                </div>
              ) : (
                <>
                  {/* Header compacto com foto clicável */}
                  <div className="p-4 pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      {/* Foto clicável para upload */}
                      <input
                        type="file"
                        ref={photoInputRef}
                        onChange={handlePhotoSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <div 
                        className="relative group cursor-pointer"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        {cfgPhotoPreview || (configBot as ExtendedBot).photo_url ? (
                          <img
                            src={cfgPhotoPreview || (configBot as ExtendedBot).photo_url!}
                            alt={configBot.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                            <BotIcon className="h-6 w-6 text-accent" />
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                          configBot.status === "active" ? "bg-green-500" : "bg-muted-foreground"
                        }`} />
                        {/* Overlay para trocar foto */}
                        <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-foreground truncate">Configurações</h2>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          configBot.status === "active" 
                            ? "bg-green-500/10 text-green-600" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <Signal className="h-2.5 w-2.5" />
                          {configBot.status === "active" ? "Online" : "Offline"}
                        </span>
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

                  {/* Campos editáveis - mais compactos */}
                  <div className="p-4 space-y-3">
                    {/* Nome */}
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Nome
                      </Label>
                      <Input 
                        value={cfgName} 
                        onChange={(e) => setCfgName(e.target.value)} 
                        className="h-9 bg-muted border-0 rounded-lg text-sm" 
                        placeholder="Nome do bot"
                      />
                    </div>

                    {/* Username (somente leitura) */}
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <AtSign className="h-3 w-3" />
                        Username
                      </Label>
                      <Input 
                        value={(configBot as ExtendedBot).username || ""} 
                        disabled
                        className="h-9 bg-muted/50 border-0 rounded-lg text-sm text-muted-foreground" 
                      />
                    </div>

                    {/* Descrição curta */}
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Bio
                      </Label>
                      <Input 
                        value={cfgShortDescription} 
                        onChange={(e) => setCfgShortDescription(e.target.value)} 
                        className="h-9 bg-muted border-0 rounded-lg text-sm" 
                        placeholder="Descrição curta"
                        maxLength={120}
                      />
                      <p className="text-[10px] text-muted-foreground mt-1 text-right">
                        {cfgShortDescription.length}/120
                      </p>
                    </div>

                    {/* Descrição longa */}
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Descrição
                      </Label>
                      <Textarea 
                        value={cfgDescription} 
                        onChange={(e) => setCfgDescription(e.target.value)} 
                        className="min-h-[60px] bg-muted border-0 rounded-lg resize-none text-sm" 
                        placeholder="O que seu bot faz..."
                        maxLength={512}
                      />
                      <p className="text-[10px] text-muted-foreground mt-1 text-right">
                        {cfgDescription.length}/512
                      </p>
                    </div>
                  </div>

                  {/* Footer compacto */}
                  <div className="px-4 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
                    <button
                      onClick={() => handleDelete(configBot.id)}
                      className="text-xs text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={closeConfig}
                        className="px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveConfig}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-semibold text-xs hover:bg-accent/90 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        {isSaving ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  </div>
                </>
              )}
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
          /* Grid View */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
{filteredBots.map((bot) => {
  const isSelected = selectedBot?.id === bot.id
  const isActive = bot.status === "active"
  const extendedBot = getExtendedBot(bot)
              
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
                      <div className="flex items-center gap-3 relative">
                        {isLoadingTelegramData && !telegramDataCache[bot.id] ? (
                          <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
                        ) : extendedBot.photo_url ? (
                          <img
                            src={extendedBot.photo_url}
                            alt={bot.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isActive ? "bg-accent/10" : "bg-muted"
                          }`}>
                            <BotIcon className={`h-6 w-6 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                          </div>
                        )}
                        <div className={`w-3.5 h-3.5 rounded-full border-2 border-card absolute left-9 top-9 ${
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
                    {extendedBot.username && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <AtSign className="h-3 w-3" />
                        {extendedBot.username}
                      </p>
                    )}
                    {extendedBot.short_description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {extendedBot.short_description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                      }`}>
                        {isActive ? "Conectado" : "Desconectado"}
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
                    <div className="w-11 h-11 rounded-xl bg-muted animate-pulse flex-shrink-0" />
                  ) : extendedBot.photo_url ? (
                    <img
                      src={extendedBot.photo_url}
                      alt={bot.name}
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center relative flex-shrink-0 ${
                      isActive ? "bg-accent/10" : "bg-muted"
                    }`}>
                      <BotIcon className={`h-5 w-5 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                        isActive ? "bg-green-500" : "bg-muted-foreground"
                      }`} />
                    </div>
                  )}

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
                    {extendedBot.username && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                        <AtSign className="h-3 w-3" />
                        {extendedBot.username}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0 ${
                    isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                  }`}>
                    {isActive ? "Conectado" : "Desconectado"}
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
