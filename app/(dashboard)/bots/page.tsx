"use client"

import { useState } from "react"
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
  LinkIcon,
  Hash,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBots, type Bot } from "@/lib/bot-context"

export default function BotsPage() {
  const { bots, selectedBot, setSelectedBot, addBot, updateBot, deleteBot } = useBots()
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create form state
  const [newName, setNewName] = useState("")
  const [newToken, setNewToken] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupId, setNewGroupId] = useState("")
  const [newGroupLink, setNewGroupLink] = useState("")
  const [createError, setCreateError] = useState("")

  // Edit form state
  const [editOpen, setEditOpen] = useState(false)
  const [editBot, setEditBot] = useState<Bot | null>(null)
  const [editName, setEditName] = useState("")
  const [editToken, setEditToken] = useState("")
  const [editGroupName, setEditGroupName] = useState("")
  const [editGroupId, setEditGroupId] = useState("")
  const [editGroupLink, setEditGroupLink] = useState("")
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  const filteredBots = bots.filter(
    (bot) =>
      bot.name.toLowerCase().includes(search.toLowerCase()) ||
      bot.token.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate() {
    setCreateError("")
    if (!newName.trim()) {
      setCreateError("Digite um nome para o bot")
      return
    }
    if (!newToken.trim()) {
      setCreateError("Digite o token do bot")
      return
    }

    setIsSubmitting(true)
    try {
      const createdBot = await addBot({
        name: newName.trim(),
        token: newToken.trim(),
        group_name: newGroupName.trim() || undefined,
        group_id: newGroupId.trim() || undefined,
        group_link: newGroupLink.trim() || undefined,
      })
      // Auto-register Telegram webhook for new bot
      await fetch("/api/telegram/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: createdBot.token,
          action: "register",
        }),
      })
      setNewName("")
      setNewToken("")
      setNewGroupName("")
      setNewGroupId("")
      setNewGroupLink("")
      setCreateOpen(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCreateError(err.message)
      } else {
        setCreateError("Erro ao criar bot")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function openEdit(bot: Bot) {
    setEditBot(bot)
    setEditName(bot.name)
    setEditToken(bot.token)
    setEditGroupName(bot.group_name || "")
    setEditGroupId(bot.group_id || "")
    setEditGroupLink(bot.group_link || "")
    setEditOpen(true)
  }

  async function handleEdit() {
    if (!editBot) return
    setIsEditSubmitting(true)
    try {
      await updateBot(editBot.id, {
        name: editName.trim() || editBot.name,
        token: editToken.trim() || editBot.token,
        group_name: editGroupName.trim() || null,
        group_id: editGroupId.trim() || null,
        group_link: editGroupLink.trim() || null,
      })
      setEditOpen(false)
      setEditBot(null)
    } catch {
      // error handled inside updateBot
    } finally {
      setIsEditSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const botToDelete = bots.find((b) => b.id === id)
      if (botToDelete) {
        // Unregister webhook before deleting
        await fetch("/api/telegram/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            botToken: botToDelete.token,
            action: "unregister",
          }),
        })
      }
      await deleteBot(id)
    } catch {
      // error handled inside deleteBot
    }
  }

  const activeBots = bots.filter((b) => b.status === "active").length

  return (
    <>
      <DashboardHeader title="Bots Management" description="Crie e gerencie seus bots do Telegram" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          {/* Top bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar bots..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-72 bg-secondary pl-9 border-border"
              />
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
                    <Input
                      placeholder="Meu Bot de Vendas"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Token do Telegram</Label>
                    <Input
                      placeholder="123456:ABC-DEF..."
                      value={newToken}
                      onChange={(e) => setNewToken(e.target.value)}
                      className="bg-secondary border-border font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Pegue o token com o @BotFather no Telegram
                    </p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="mb-3 text-sm font-medium text-foreground">Grupo do Telegram (opcional)</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground text-xs">Nome do Grupo</Label>
                        <Input
                          placeholder="VIP Premium"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground text-xs">ID do Grupo</Label>
                        <Input
                          placeholder="-1001234567890 ou @meugrupo"
                          value={newGroupId}
                          onChange={(e) => setNewGroupId(e.target.value)}
                          className="bg-secondary border-border font-mono text-xs"
                        />
                        <p className="text-xs text-muted-foreground">
                          ID numerico (ex: -1001234567890) ou @ do grupo (ex: @meugrupo)
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground text-xs">Link do Grupo</Label>
                        <Input
                          placeholder="https://t.me/+abc123 ou https://t.me/meugrupo"
                          value={newGroupLink}
                          onChange={(e) => setNewGroupLink(e.target.value)}
                          className="bg-secondary border-border"
                        />
                      </div>
                    </div>
                  </div>

                  {createError && (
                    <p className="text-sm text-destructive">{createError}</p>
                  )}

                  <Button
                    onClick={handleCreate}
                    disabled={isSubmitting}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
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
                  <p className="mt-1 text-sm text-muted-foreground">
                    Crie seu primeiro bot para comecar a usar o TeleFlow
                  </p>
                </div>
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
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
                  className={`cursor-pointer bg-card border-border transition-colors hover:bg-secondary/50 ${
                    selectedBot?.id === bot.id ? "ring-1 ring-accent" : ""
                  }`}
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
                            <Circle
                              className={`h-2 w-2 ${
                                bot.status === "active"
                                  ? "fill-success text-success"
                                  : "fill-muted-foreground text-muted-foreground"
                              }`}
                            />
                            <Badge variant="outline" className={bot.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}>
                              {bot.status === "active" ? "Ativo" : "Inativo"}
                            </Badge>
                            {selectedBot?.id === bot.id && (
                              <Badge variant="outline" className="border-accent/30 bg-accent/5 text-accent text-xs">
                                Selecionado
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">
                            {bot.token.slice(0, 15)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 shrink-0">
                        {bot.group_id && (
                          <Badge variant="outline" className="border-border text-muted-foreground font-mono text-xs hidden lg:flex">
                            <Hash className="mr-1 h-3 w-3" />
                            {bot.group_id}
                          </Badge>
                        )}
                        {bot.group_name && (
                          <Badge variant="outline" className="border-border text-muted-foreground hidden md:flex">
                            <LinkIcon className="mr-1 h-3 w-3" />
                            {bot.group_name}
                          </Badge>
                        )}
                        <Switch
                          checked={bot.status === "active"}
                          onCheckedChange={async (checked) => {
                            try {
                              await updateBot(bot.id, { status: checked ? "active" : "inactive" })
                              // Register or unregister Telegram webhook
                              await fetch("/api/telegram/register", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  botToken: bot.token,
                                  action: checked ? "register" : "unregister",
                                }),
                              })
                            } catch {
                              // handled
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-foreground"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEdit(bot)
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(bot.id)
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Criado em {new Date(bot.created_at).toLocaleDateString("pt-BR")}</span>
                      {bot.group_link && (
                        <a
                          href={bot.group_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Link do grupo
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Bot</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Nome do Bot</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Token do Telegram</Label>
              <Input
                value={editToken}
                onChange={(e) => setEditToken(e.target.value)}
                className="bg-secondary border-border font-mono text-xs"
              />
            </div>
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-sm font-medium text-foreground">Grupo do Telegram</p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground text-xs">Nome do Grupo</Label>
                  <Input
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    className="bg-secondary border-border"
                    placeholder="VIP Premium"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground text-xs">ID do Grupo</Label>
                  <Input
                    value={editGroupId}
                    onChange={(e) => setEditGroupId(e.target.value)}
                    className="bg-secondary border-border font-mono text-xs"
                    placeholder="-1001234567890 ou @meugrupo"
                  />
                  <p className="text-xs text-muted-foreground">
                    ID numerico (ex: -1001234567890) ou @ do grupo (ex: @meugrupo)
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground text-xs">Link do Grupo</Label>
                  <Input
                    value={editGroupLink}
                    onChange={(e) => setEditGroupLink(e.target.value)}
                    className="bg-secondary border-border"
                    placeholder="https://t.me/+abc123"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleEdit}
              disabled={isEditSubmitting}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isEditSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
