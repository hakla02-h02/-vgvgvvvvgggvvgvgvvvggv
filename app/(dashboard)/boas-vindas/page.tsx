"use client"

import { useState, useEffect } from "react"
import { useBots } from "@/lib/bot-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Bot, Save, Trash2, Plus, X, Loader2, Check, MessageSquare, Link2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FlowButton {
  text: string
  url: string
}

interface Flow {
  id: string
  name: string
  bot_id: string
  status: string
  flow_nodes: Array<{
    id: string
    type: string
    config: {
      text?: string
      buttons?: FlowButton[]
    }
  }>
}

export default function BoasVindasPage() {
  const { bots, selectedBot, setSelectedBot } = useBots()
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [flow, setFlow] = useState<Flow | null>(null)
  const [welcomeMessage, setWelcomeMessage] = useState("")
  const [buttons, setButtons] = useState<FlowButton[]>([])

  // Carregar fluxo quando bot mudar
  useEffect(() => {
    if (selectedBot?.id) {
      loadFlow()
    } else {
      setFlow(null)
      setWelcomeMessage("")
      setButtons([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBot?.id])

  const loadFlow = async () => {
    if (!selectedBot?.id) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/flows?botId=${selectedBot.id}`)
      const data = await res.json()
      
      if (data.flows && data.flows.length > 0) {
        const existingFlow = data.flows[0]
        setFlow(existingFlow)
        
        // Extrair mensagem e botoes do node de mensagem
        const messageNode = existingFlow.flow_nodes?.find((n: { type: string }) => n.type === "message")
        if (messageNode?.config) {
          setWelcomeMessage(messageNode.config.text || "")
          setButtons(messageNode.config.buttons || [])
        }
      } else {
        setFlow(null)
        setWelcomeMessage("")
        setButtons([])
      }
    } catch (error) {
      console.error("Error loading flow:", error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!selectedBot?.id || !user?.id) {
      toast({ title: "Erro", description: "Selecione um bot primeiro", variant: "destructive" })
      return
    }

    if (!welcomeMessage.trim()) {
      toast({ title: "Erro", description: "Digite uma mensagem de boas-vindas", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: selectedBot.id,
          userId: user.id,
          flowId: flow?.id || null,
          welcomeMessage: welcomeMessage.trim(),
          buttons: buttons.filter(b => b.text && b.url)
        })
      })

      const data = await res.json()

      if (data.success) {
        setFlow(data.flow)
        toast({ title: "Sucesso", description: "Mensagem de boas-vindas salva!" })
      } else {
        toast({ title: "Erro", description: data.error || "Erro ao salvar", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error saving:", error)
      toast({ title: "Erro", description: "Erro ao salvar", variant: "destructive" })
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!flow?.id) return

    if (!confirm("Tem certeza que deseja apagar este fluxo?")) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/flows?flowId=${flow.id}`, { method: "DELETE" })
      const data = await res.json()

      if (data.success) {
        setFlow(null)
        setWelcomeMessage("")
        setButtons([])
        toast({ title: "Sucesso", description: "Fluxo apagado!" })
      } else {
        toast({ title: "Erro", description: data.error || "Erro ao apagar", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting:", error)
      toast({ title: "Erro", description: "Erro ao apagar", variant: "destructive" })
    }
    setDeleting(false)
  }

  const addButton = () => {
    if (buttons.length >= 3) return
    setButtons([...buttons, { text: "", url: "" }])
  }

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index))
  }

  const updateButton = (index: number, field: "text" | "url", value: string) => {
    const newButtons = [...buttons]
    newButtons[index][field] = value
    setButtons(newButtons)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Mensagem de Boas-vindas</h1>
        <p className="text-muted-foreground mt-1">
          Configure a mensagem que sera enviada quando alguem iniciar o bot
        </p>
      </div>

      {/* Selecao de Bot */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Selecione o Bot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedBot?.id || ""}
            onValueChange={(id) => {
              const bot = bots.find((b) => b.id === id)
              if (bot) setSelectedBot(bot)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha um bot..." />
            </SelectTrigger>
            <SelectContent>
              {bots.map((bot) => (
                <SelectItem key={bot.id} value={bot.id}>
                  {bot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedBot && (
        <>
          {loading ? (
            <Card>
              <CardContent className="py-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Editor */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Mensagem
                  </CardTitle>
                  <CardDescription>
                    {flow ? "Edite a mensagem existente" : "Crie uma nova mensagem de boas-vindas"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="welcome">Texto da mensagem</Label>
                    <Textarea
                      id="welcome"
                      placeholder="Ola! Seja bem-vindo ao nosso bot..."
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      rows={5}
                      className="mt-1.5 resize-none"
                    />
                  </div>

                  {/* Botoes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-1.5">
                        <Link2 className="h-4 w-4" />
                        Botoes (opcional)
                      </Label>
                      {buttons.length < 3 && (
                        <Button variant="ghost" size="sm" onClick={addButton}>
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                      )}
                    </div>
                    
                    {buttons.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum botao adicionado
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {buttons.map((btn, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder="Texto do botao"
                                value={btn.text}
                                onChange={(e) => updateButton(i, "text", e.target.value)}
                              />
                              <Input
                                placeholder="https://exemplo.com"
                                value={btn.url}
                                onChange={(e) => updateButton(i, "url", e.target.value)}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeButton(i)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Acoes */}
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSave} disabled={saving} className="flex-1">
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {flow ? "Atualizar" : "Salvar"}
                    </Button>
                    {flow && (
                      <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                        {deleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Preview</CardTitle>
                  <CardDescription>Como vai aparecer no Telegram</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#0e1621] rounded-xl p-4 min-h-[200px]">
                    {welcomeMessage ? (
                      <div className="space-y-2">
                        {/* Mensagem */}
                        <div className="bg-[#182533] text-white rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                          <p className="text-sm whitespace-pre-wrap">{welcomeMessage}</p>
                        </div>
                        
                        {/* Botoes */}
                        {buttons.filter(b => b.text).length > 0 && (
                          <div className="flex flex-col gap-1.5 max-w-[85%]">
                            {buttons.filter(b => b.text).map((btn, i) => (
                              <div
                                key={i}
                                className="bg-[#2b5278] text-[#5eb5f7] text-center text-sm py-2 px-4 rounded-lg"
                              >
                                {btn.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                        Digite uma mensagem para ver o preview
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  {flow && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500" />
                      Fluxo ativo
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {!selectedBot && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Selecione um bot para configurar a mensagem de boas-vindas
          </CardContent>
        </Card>
      )}
    </div>
  )
}
