"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useBots } from "@/lib/bot-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Trash2, Bot, MessageSquare, CheckCircle, AlertCircle, Plus, X } from "lucide-react"

interface FlowNode {
  id: string
  type: string
  label: string
  position: number
  config: Record<string, unknown>
}

interface Flow {
  id: string
  name: string
  status: string
  bot_id: string
  flow_nodes: FlowNode[]
}

interface ButtonItem {
  text: string
  url: string
}

export default function FluxosSimplesPage() {
  const { user } = useAuth()
  const { bots } = useBots()
  const { toast } = useToast()
  
  const [selectedBotId, setSelectedBotId] = useState<string>("")
  const [currentFlow, setCurrentFlow] = useState<Flow | null>(null)
  const [welcomeMessage, setWelcomeMessage] = useState("")
  const [buttons, setButtons] = useState<ButtonItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Carregar fluxo quando selecionar bot
  useEffect(() => {
    if (!selectedBotId) {
      setCurrentFlow(null)
      setWelcomeMessage("")
      setButtons([])
      return
    }
    
    loadFlow()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBotId])
  
  const loadFlow = async () => {
    setIsLoading(true)
    
    try {
      const res = await fetch(`/api/flows?botId=${selectedBotId}`)
      const data = await res.json()
      
      if (data.flows && data.flows.length > 0) {
        const flow = data.flows[0]
        setCurrentFlow(flow)
        
        // Extrair mensagem de boas-vindas dos nodes
        const messageNode = flow.flow_nodes?.find((n: FlowNode) => n.type === "message")
        if (messageNode?.config) {
          setWelcomeMessage((messageNode.config as Record<string, unknown>).text as string || "")
          
          // Extrair botoes
          const buttonsRaw = (messageNode.config as Record<string, unknown>).buttons
          if (buttonsRaw) {
            try {
              const parsed = typeof buttonsRaw === "string" ? JSON.parse(buttonsRaw) : buttonsRaw
              setButtons(parsed || [])
            } catch {
              setButtons([])
            }
          } else {
            setButtons([])
          }
        }
      } else {
        setCurrentFlow(null)
        setWelcomeMessage("")
        setButtons([])
      }
    } catch (err) {
      console.error("Erro ao carregar fluxo:", err)
    }
    
    setIsLoading(false)
  }
  
  const handleSave = async () => {
    if (!selectedBotId || !user) {
      toast({
        title: "Erro",
        description: "Selecione um bot primeiro",
        variant: "destructive"
      })
      return
    }
    
    if (!welcomeMessage.trim()) {
      toast({
        title: "Erro", 
        description: "Digite uma mensagem de boas-vindas",
        variant: "destructive"
      })
      return
    }
    
    setIsSaving(true)
    
    try {
      const res = await fetch("/api/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: selectedBotId,
          userId: user.id,
          name: "Fluxo de Boas-vindas",
          welcomeMessage: welcomeMessage.trim(),
          buttons: buttons.filter(b => b.text && b.url)
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast({
          title: "Sucesso!",
          description: data.message,
        })
        // Recarregar fluxo
        await loadFlow()
      } else {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Erro ao salvar:", err)
      toast({
        title: "Erro",
        description: "Erro ao salvar fluxo",
        variant: "destructive"
      })
    }
    
    setIsSaving(false)
  }
  
  const handleDelete = async () => {
    if (!currentFlow) return
    
    if (!confirm("Tem certeza que deseja deletar este fluxo?")) return
    
    setIsDeleting(true)
    
    try {
      const res = await fetch(`/api/flows?flowId=${currentFlow.id}`, {
        method: "DELETE"
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast({
          title: "Fluxo deletado",
          description: "O fluxo foi removido com sucesso"
        })
        setCurrentFlow(null)
        setWelcomeMessage("")
        setButtons([])
      } else {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Erro ao deletar:", err)
    }
    
    setIsDeleting(false)
  }
  
  const addButton = () => {
    if (buttons.length >= 3) {
      toast({
        title: "Limite",
        description: "Maximo de 3 botoes permitido",
        variant: "destructive"
      })
      return
    }
    setButtons([...buttons, { text: "", url: "" }])
  }
  
  const updateButton = (index: number, field: "text" | "url", value: string) => {
    const newButtons = [...buttons]
    newButtons[index][field] = value
    setButtons(newButtons)
  }
  
  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index))
  }
  
  const selectedBot = bots.find(b => b.id === selectedBotId)
  
  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Fluxo de Boas-vindas</h1>
          <p className="text-gray-500 mt-1">Configure a mensagem que o bot envia quando alguem inicia uma conversa</p>
        </div>
        
        {/* Selecionar Bot */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Selecione o Bot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedBotId} onValueChange={setSelectedBotId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um bot..." />
              </SelectTrigger>
              <SelectContent>
                {bots.map(bot => (
                  <SelectItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedBot && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ccff00] rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedBot.name}</p>
                  <p className="text-xs text-gray-500">
                    {currentFlow ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Fluxo configurado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600">
                        <AlertCircle className="h-3 w-3" />
                        Sem fluxo
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Configurar Mensagem */}
        {selectedBotId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mensagem de Boas-vindas
              </CardTitle>
              <CardDescription>
                Esta mensagem sera enviada quando o usuario enviar /start
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {/* Textarea da mensagem */}
                  <div className="space-y-2">
                    <Label>Mensagem</Label>
                    <Textarea
                      placeholder="Digite a mensagem de boas-vindas..."
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      rows={5}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      {welcomeMessage.length}/4096 caracteres
                    </p>
                  </div>
                  
                  {/* Botoes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Botoes (opcional)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addButton}
                        disabled={buttons.length >= 3}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    
                    {buttons.map((button, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Texto do botao"
                            value={button.text}
                            onChange={(e) => updateButton(index, "text", e.target.value)}
                          />
                          <Input
                            placeholder="URL (https://...)"
                            value={button.url}
                            onChange={(e) => updateButton(index, "url", e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeButton(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {buttons.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-2">
                        Nenhum botao adicionado
                      </p>
                    )}
                  </div>
                  
                  {/* Preview */}
                  {welcomeMessage && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="bg-[#0088cc] text-white p-4 rounded-2xl rounded-bl-none max-w-sm">
                        <p className="whitespace-pre-wrap text-sm">{welcomeMessage}</p>
                        {buttons.filter(b => b.text && b.url).length > 0 && (
                          <div className="mt-3 space-y-2">
                            {buttons.filter(b => b.text && b.url).map((btn, i) => (
                              <div key={i} className="bg-white/20 text-center py-2 px-4 rounded-lg text-sm">
                                {btn.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Botoes de acao */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !welcomeMessage.trim()}
                      className="flex-1 bg-[#ccff00] text-black hover:bg-[#b8e600]"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar Fluxo
                    </Button>
                    
                    {currentFlow && (
                      <Button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        variant="destructive"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Info */}
        {!selectedBotId && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Bot className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Selecione um bot para configurar o fluxo de boas-vindas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
