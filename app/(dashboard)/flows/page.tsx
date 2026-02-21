"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import {
  Plus, GitBranch, MessageSquare, Timer, Split,
  ArrowRight, GripVertical, ChevronRight, Users, CreditCard,
  Pencil, Trash2, Loader2, Image, Video, Link, X, Upload, FileCheck,
} from "lucide-react"
import NextImage from "next/image"
import { Switch } from "@/components/ui/switch"

// ---- Types ----

interface Flow {
  id: string
  bot_id: string
  user_id: string
  name: string
  status: "ativo" | "pausado"
  created_at: string
  updated_at: string
}

type NodeType = "trigger" | "message" | "delay" | "condition" | "payment" | "action"

interface InlineButton {
  text: string
  url: string
}

interface FlowNode {
  id: string
  flow_id: string
  type: NodeType
  label: string
  config: Record<string, unknown>
  position: number
  created_at: string
  updated_at: string
}

// ---- Dragon Icon (works like lucide icon) ----
function DragonTriggerIcon({ className }: { className?: string }) {
  return (
    <NextImage
      src="/images/dragon-icon.png"
      alt=""
      width={20}
      height={20}
      className={className}
    />
  )
}

// ---- Constants ----

const nodeIcons: Record<NodeType, React.ElementType> = {
  trigger: DragonTriggerIcon, message: MessageSquare, delay: Timer,
  condition: Split, payment: CreditCard, action: Users,
}

const nodeColors: Record<NodeType, string> = {
  trigger: "border-accent bg-accent/5",
  message: "border-blue-500/30 bg-blue-500/5",
  delay: "border-warning/30 bg-warning/5",
  condition: "border-purple-500/30 bg-purple-500/5",
  payment: "border-success/30 bg-success/5",
  action: "border-cyan-500/30 bg-cyan-500/5",
}

const nodeIconColors: Record<NodeType, string> = {
  trigger: "text-accent", message: "text-blue-400", delay: "text-warning",
  condition: "text-purple-400", payment: "text-success", action: "text-cyan-400",
}

const statusStyles: Record<string, string> = {
  ativo: "bg-success/10 text-success border-success/20",
  pausado: "bg-warning/10 text-warning border-warning/20",
}

// Available action templates users can pick from
const actionTemplates: { type: NodeType; label: string; description: string; configFields: { key: string; label: string; placeholder: string; inputType: "text" | "textarea" | "number" }[] }[] = [
  {
    type: "trigger",
    label: "Usuario inicia bot",
    description: "Gatilho inicial quando o usuario inicia o bot",
    configFields: [],
  },
  {
    type: "message",
    label: "Mensagem",
    description: "Enviar mensagem com midia e botoes",
    configFields: [],
  },
  {
    type: "delay",
    label: "Delay",
    description: "Aguardar um tempo antes da proxima acao",
    configFields: [
      { key: "seconds", label: "Tempo em segundos", placeholder: "300", inputType: "number" },
    ],
  },
  {
    type: "condition",
    label: "Condicao",
    description: "Verificar uma condicao do usuario",
    configFields: [
      { key: "condition", label: "Condicao", placeholder: "Ex: Usuario respondeu?", inputType: "text" },
    ],
  },
  {
    type: "payment",
    label: "Pagamento",
    description: "Gerar cobranca ou PIX",
    configFields: [
      { key: "amount", label: "Valor (R$)", placeholder: "49.90", inputType: "text" },
      { key: "description", label: "Descricao", placeholder: "Pagamento do produto X", inputType: "text" },
    ],
  },
  {
    type: "action",
    label: "Acao",
    description: "Executar uma acao automatica",
    configFields: [
      { key: "action_name", label: "Nome da acao", placeholder: "Ex: Adicionar ao grupo VIP", inputType: "text" },
    ],
  },
]

// ---- Component ----

export default function FlowsPage() {
  const { selectedBot } = useBots()
  const { session } = useAuth()

  // Flows state
  const [flows, setFlows] = useState<Flow[]>([])
  const [activeFlow, setActiveFlow] = useState<Flow | null>(null)
  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [isLoadingFlows, setIsLoadingFlows] = useState(true)
  const [isLoadingNodes, setIsLoadingNodes] = useState(false)

  // New flow dialog
  const [showNewFlowDialog, setShowNewFlowDialog] = useState(false)
  const [newFlowName, setNewFlowName] = useState("")
  const [isCreatingFlow, setIsCreatingFlow] = useState(false)

  // Add node dialog
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof actionTemplates[0] | null>(null)
  const [nodeConfigValues, setNodeConfigValues] = useState<Record<string, string>>({})
  const [isAddingNode, setIsAddingNode] = useState(false)

  // Message node config (media + inline buttons)
  const [msgText, setMsgText] = useState("")
  const [msgMediaUrl, setMsgMediaUrl] = useState("")
  const [msgMediaType, setMsgMediaType] = useState<"photo" | "video" | "none">("none")
  const [msgHasButtons, setMsgHasButtons] = useState(false)
  const [msgButtons, setMsgButtons] = useState<InlineButton[]>([])

  const resetMessageConfig = () => {
    setMsgText("")
    setMsgMediaUrl("")
    setMsgMediaType("none")
    setMsgHasButtons(false)
    setMsgButtons([])
  }

  const addMsgButton = () => {
    setMsgButtons((prev) => [...prev, { text: "", url: "" }])
  }

  const updateMsgButton = (index: number, field: "text" | "url", value: string) => {
    setMsgButtons((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)))
  }

  const removeMsgButton = (index: number) => {
    setMsgButtons((prev) => prev.filter((_, i) => i !== index))
  }

  // Edit node dialog
  const [showEditNodeDialog, setShowEditNodeDialog] = useState(false)
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null)
  const [editNodeLabel, setEditNodeLabel] = useState("")
  const [editNodeConfig, setEditNodeConfig] = useState<Record<string, string>>({})
  const [isSavingNode, setIsSavingNode] = useState(false)

  // Delete confirmation
  const [showDeleteNodeDialog, setShowDeleteNodeDialog] = useState(false)
  const [deletingNode, setDeletingNode] = useState<FlowNode | null>(null)
  const [isDeletingNode, setIsDeletingNode] = useState(false)

  // Delete flow
  const [showDeleteFlowDialog, setShowDeleteFlowDialog] = useState(false)
  const [isDeletingFlow, setIsDeletingFlow] = useState(false)

  // ---- Fetch flows for selected bot ----
  const fetchFlows = useCallback(async () => {
    if (!selectedBot || !session) {
      setFlows([])
      setActiveFlow(null)
      setNodes([])
      setIsLoadingFlows(false)
      return
    }

    setIsLoadingFlows(true)
    const { data, error } = await supabase
      .from("flows")
      .select("*")
      .eq("bot_id", selectedBot.id)
      .eq("user_id", session.userId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching flows:", error)
      setIsLoadingFlows(false)
      return
    }

    const fetched = (data || []) as Flow[]
    setFlows(fetched)

    if (fetched.length > 0) {
      setActiveFlow(fetched[0])
    } else {
      setActiveFlow(null)
      setNodes([])
    }
    setIsLoadingFlows(false)
  }, [selectedBot, session])

  useEffect(() => {
    fetchFlows()
  }, [fetchFlows])

  // ---- Fetch nodes for active flow ----
  const fetchNodes = useCallback(async () => {
    if (!activeFlow) {
      setNodes([])
      return
    }

    setIsLoadingNodes(true)
    const { data, error } = await supabase
      .from("flow_nodes")
      .select("*")
      .eq("flow_id", activeFlow.id)
      .order("position", { ascending: true })

    if (error) {
      console.error("Error fetching nodes:", error)
      setIsLoadingNodes(false)
      return
    }

    setNodes((data || []) as FlowNode[])
    setIsLoadingNodes(false)
  }, [activeFlow])

  useEffect(() => {
    fetchNodes()
  }, [fetchNodes])

  // ---- Create new flow ----
  const handleCreateFlow = async () => {
    if (!selectedBot || !session || !newFlowName.trim()) return

    setIsCreatingFlow(true)
    const { data, error } = await supabase
      .from("flows")
      .insert({
        bot_id: selectedBot.id,
        user_id: session.userId,
        name: newFlowName.trim(),
        status: "ativo",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating flow:", error)
      setIsCreatingFlow(false)
      return
    }

    const newFlow = data as Flow
    setFlows((prev) => [...prev, newFlow])
    setActiveFlow(newFlow)
    setNewFlowName("")
    setShowNewFlowDialog(false)
    setIsCreatingFlow(false)
  }

  // ---- Delete flow ----
  const handleDeleteFlow = async () => {
    if (!activeFlow) return

    setIsDeletingFlow(true)
    const { error } = await supabase
      .from("flows")
      .delete()
      .eq("id", activeFlow.id)

    if (error) {
      console.error("Error deleting flow:", error)
      setIsDeletingFlow(false)
      return
    }

    setFlows((prev) => {
      const updated = prev.filter((f) => f.id !== activeFlow.id)
      if (updated.length > 0) {
        setActiveFlow(updated[0])
      } else {
        setActiveFlow(null)
        setNodes([])
      }
      return updated
    })
    setShowDeleteFlowDialog(false)
    setIsDeletingFlow(false)
  }

  // ---- Add node ----
  const handleAddNode = async () => {
    if (!activeFlow || !selectedTemplate) return

    setIsAddingNode(true)

    let label = selectedTemplate.label
    let config: Record<string, unknown> = { ...nodeConfigValues }

    if (selectedTemplate.type === "message") {
      // Build rich message config
      label = msgText ? (msgText.length > 40 ? msgText.slice(0, 40) + "..." : msgText) : "Mensagem"
      const validButtons = msgButtons.filter((b) => b.text.trim() && b.url.trim())
      config = {
        text: msgText,
        media_url: msgMediaType !== "none" ? msgMediaUrl : "",
        media_type: msgMediaType !== "none" ? msgMediaType : "",
        buttons: validButtons.length > 0 ? JSON.stringify(validButtons) : "",
      }
    } else if (selectedTemplate.type === "delay" && nodeConfigValues.seconds) {
      const secs = parseInt(nodeConfigValues.seconds)
      if (secs >= 60) {
        label = `Esperar ${Math.floor(secs / 60)} minuto${Math.floor(secs / 60) > 1 ? "s" : ""}`
      } else {
        label = `Esperar ${secs} segundo${secs > 1 ? "s" : ""}`
      }
    } else if (selectedTemplate.type === "condition" && nodeConfigValues.condition) {
      label = nodeConfigValues.condition
    } else if (selectedTemplate.type === "payment" && nodeConfigValues.description) {
      label = nodeConfigValues.description
    } else if (selectedTemplate.type === "action" && nodeConfigValues.action_name) {
      label = nodeConfigValues.action_name
    }

    const newPosition = nodes.length

    const { data, error } = await supabase
      .from("flow_nodes")
      .insert({
        flow_id: activeFlow.id,
        type: selectedTemplate.type,
        label,
        config,
        position: newPosition,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding node:", error)
      setIsAddingNode(false)
      return
    }

    setNodes((prev) => [...prev, data as FlowNode])
    setSelectedTemplate(null)
    setNodeConfigValues({})
    resetMessageConfig()
    setShowAddNodeDialog(false)
    setIsAddingNode(false)
  }

  // ---- Edit node ----
  const openEditNode = (node: FlowNode) => {
    setEditingNode(node)
    setEditNodeLabel(node.label)
    const cfg = node.config || {}
    setEditNodeConfig(cfg as Record<string, string>)

    // If it's a message node, populate the rich message state
    if (node.type === "message") {
      setMsgText((cfg.text as string) || "")
      setMsgMediaUrl((cfg.media_url as string) || "")
      const mType = (cfg.media_type as string) || ""
      setMsgMediaType(mType === "photo" || mType === "video" ? mType : "none")
      const btnStr = (cfg.buttons as string) || ""
      if (btnStr) {
        try {
          const parsed = JSON.parse(btnStr) as InlineButton[]
          setMsgButtons(parsed)
          setMsgHasButtons(parsed.length > 0)
        } catch {
          setMsgButtons([])
          setMsgHasButtons(false)
        }
      } else {
        setMsgButtons([])
        setMsgHasButtons(false)
      }
    } else {
      resetMessageConfig()
    }

    setShowEditNodeDialog(true)
  }

  const handleSaveNode = async () => {
    if (!editingNode) return

    setIsSavingNode(true)

    let finalConfig: Record<string, unknown> = { ...editNodeConfig }
    let finalLabel = editNodeLabel

    if (editingNode.type === "message") {
      const validButtons = msgButtons.filter((b) => b.text.trim() && b.url.trim())
      finalConfig = {
        text: msgText,
        media_url: msgMediaType !== "none" ? msgMediaUrl : "",
        media_type: msgMediaType !== "none" ? msgMediaType : "",
        buttons: validButtons.length > 0 ? JSON.stringify(validButtons) : "",
      }
      finalLabel = msgText ? (msgText.length > 40 ? msgText.slice(0, 40) + "..." : msgText) : "Mensagem"
    }

    const { error } = await supabase
      .from("flow_nodes")
      .update({
        label: finalLabel,
        config: finalConfig,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingNode.id)

    if (error) {
      console.error("Error updating node:", error)
      setIsSavingNode(false)
      return
    }

    setNodes((prev) =>
      prev.map((n) =>
        n.id === editingNode.id
          ? { ...n, label: finalLabel, config: finalConfig }
          : n
      )
    )
    resetMessageConfig()
    setShowEditNodeDialog(false)
    setEditingNode(null)
    setIsSavingNode(false)
  }

  // ---- Delete node ----
  const handleDeleteNode = async () => {
    if (!deletingNode) return

    setIsDeletingNode(true)
    const { error } = await supabase
      .from("flow_nodes")
      .delete()
      .eq("id", deletingNode.id)

    if (error) {
      console.error("Error deleting node:", error)
      setIsDeletingNode(false)
      return
    }

    // Re-order remaining nodes
    const remaining = nodes.filter((n) => n.id !== deletingNode.id)
    const reordered = remaining.map((n, i) => ({ ...n, position: i }))

    // Update positions in DB
    for (const node of reordered) {
      await supabase
        .from("flow_nodes")
        .update({ position: node.position })
        .eq("id", node.id)
    }

    setNodes(reordered)
    setShowDeleteNodeDialog(false)
    setDeletingNode(null)
    setIsDeletingNode(false)
  }

  // ---- Toggle flow status ----
  const toggleFlowStatus = async (flow: Flow) => {
    const newStatus = flow.status === "ativo" ? "pausado" : "ativo"
    const { error } = await supabase
      .from("flows")
      .update({ status: newStatus })
      .eq("id", flow.id)

    if (error) {
      console.error("Error updating flow status:", error)
      return
    }

    setFlows((prev) =>
      prev.map((f) => (f.id === flow.id ? { ...f, status: newStatus } : f))
    )
    if (activeFlow?.id === flow.id) {
      setActiveFlow((prev) => (prev ? { ...prev, status: newStatus } : prev))
    }
  }

  // ---- Render ----

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Fluxos" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Fluxos" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Crie e gerencie fluxos de automacao</p>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
              onClick={() => setShowNewFlowDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Fluxo
            </Button>
          </div>

          {isLoadingFlows ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : flows.length === 0 ? (
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                  <GitBranch className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-foreground">Nenhum fluxo criado</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Crie seu primeiro fluxo de automacao para este bot
                  </p>
                </div>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
                  onClick={() => setShowNewFlowDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Fluxo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:gap-6 lg:grid-cols-5">
              {/* Lista de fluxos */}
              <div className="flex flex-col gap-3 lg:col-span-2">
                {flows.map((fluxo) => (
                  <Card
                    key={fluxo.id}
                    className={`cursor-pointer bg-card border-border rounded-2xl transition-colors hover:bg-secondary/50 ${
                      activeFlow?.id === fluxo.id ? "ring-1 ring-accent" : ""
                    }`}
                    onClick={() => setActiveFlow(fluxo)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                          <GitBranch className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{fluxo.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {fluxo.status === "ativo" ? "Ativo" : "Pausado"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`rounded-lg cursor-pointer ${statusStyles[fluxo.status]}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFlowStatus(fluxo)
                          }}
                        >
                          {fluxo.status}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Visual builder */}
              {activeFlow && (
                <Card className="bg-card border-border rounded-2xl lg:col-span-3">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-foreground">
                        {activeFlow.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`rounded-lg ${statusStyles[activeFlow.status]}`}>
                          {activeFlow.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setShowDeleteFlowDialog(true)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingNodes ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {nodes.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground mb-3">
                              Nenhuma acao adicionada. Comece adicionando blocos ao fluxo.
                            </p>
                          </div>
                        )}

                        {nodes.map((node, i) => {
                          const Icon = nodeIcons[node.type]
                          return (
                            <div key={node.id}>
                              <div
                                className={`group flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors hover:bg-secondary/50 ${nodeColors[node.type]}`}
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/50">
                                  <Icon className={`h-4 w-4 ${nodeIconColors[node.type]}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{node.label}</p>
                                  {node.type === "message" && (
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {node.config?.media_type && node.config.media_type !== "" && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                          {node.config.media_type === "photo" ? <Image className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                                          {node.config.media_type === "photo" ? "Foto" : "Video"}
                                        </span>
                                      )}
                                      {node.config?.buttons && node.config.buttons !== "" && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Link className="h-3 w-3" />
                                          {(() => { try { return JSON.parse(node.config.buttons as string).length } catch { return 0 } })()}{" "}
                                          {"botao(es)"}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={() => openEditNode(node)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      setDeletingNode(node)
                                      setShowDeleteNodeDialog(true)
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                              </div>
                              {i < nodes.length - 1 && (
                                <div className="flex justify-center py-1">
                                  <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Add action button at the end */}
                        {nodes.length > 0 && (
                          <div className="flex justify-center py-1">
                            <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground/50" />
                          </div>
                        )}
                        <Button
                          variant="outline"
                          className="w-full rounded-xl border-dashed border-border hover:border-accent hover:bg-accent/5 text-muted-foreground hover:text-accent transition-colors"
                          onClick={() => {
                            setSelectedTemplate(null)
                            setNodeConfigValues({})
                            setShowAddNodeDialog(true)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar acao
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ---- New Flow Dialog ---- */}
      <Dialog open={showNewFlowDialog} onOpenChange={setShowNewFlowDialog}>
        <DialogContent className="bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Novo Fluxo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="flow-name" className="text-foreground">Nome do fluxo</Label>
              <Input
                id="flow-name"
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
                placeholder="Ex: Funil de Vendas"
                className="bg-secondary border-border rounded-xl text-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFlow()
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl border-border text-foreground"
              onClick={() => setShowNewFlowDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
              disabled={!newFlowName.trim() || isCreatingFlow}
              onClick={handleCreateFlow}
            >
              {isCreatingFlow && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Add Node Dialog ---- */}
      <Dialog open={showAddNodeDialog} onOpenChange={setShowAddNodeDialog}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Adicionar Acao</DialogTitle>
          </DialogHeader>

          {!selectedTemplate ? (
            <div className="flex flex-col gap-2 py-2">
              <p className="text-sm text-muted-foreground mb-2">Escolha o tipo de acao:</p>
              {actionTemplates.map((tpl) => {
                const Icon = nodeIcons[tpl.type]
                return (
                  <button
                    key={tpl.type}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:bg-secondary/50 ${nodeColors[tpl.type]}`}
                    onClick={() => {
                      setSelectedTemplate(tpl)
                      setNodeConfigValues({})
                      resetMessageConfig()
                    }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/50">
                      <Icon className={`h-4 w-4 ${nodeIconColors[tpl.type]}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tpl.label}</p>
                      <p className="text-xs text-muted-foreground">{tpl.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = nodeIcons[selectedTemplate.type]
                  return (
                    <>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/50 border ${nodeColors[selectedTemplate.type]}`}>
                        <Icon className={`h-4 w-4 ${nodeIconColors[selectedTemplate.type]}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{selectedTemplate.label}</p>
                        <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                      </div>
                    </>
                  )
                })()}
              </div>

              {selectedTemplate.type === "message" ? (
                <MessageConfigForm
                  msgText={msgText}
                  setMsgText={setMsgText}
                  msgMediaType={msgMediaType}
                  setMsgMediaType={setMsgMediaType}
                  msgMediaUrl={msgMediaUrl}
                  setMsgMediaUrl={setMsgMediaUrl}
                  msgHasButtons={msgHasButtons}
                  setMsgHasButtons={setMsgHasButtons}
                  msgButtons={msgButtons}
                  addMsgButton={addMsgButton}
                  updateMsgButton={updateMsgButton}
                  removeMsgButton={removeMsgButton}
                />
              ) : selectedTemplate.configFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Este bloco nao precisa de configuracao.
                </p>
              ) : (
                selectedTemplate.configFields.map((field) => (
                  <div key={field.key} className="flex flex-col gap-2">
                    <Label className="text-foreground">{field.label}</Label>
                    {field.inputType === "textarea" ? (
                      <Textarea
                        value={nodeConfigValues[field.key] || ""}
                        onChange={(e) =>
                          setNodeConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className="bg-secondary border-border rounded-xl text-foreground min-h-[80px]"
                      />
                    ) : (
                      <Input
                        type={field.inputType}
                        value={nodeConfigValues[field.key] || ""}
                        onChange={(e) =>
                          setNodeConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className="bg-secondary border-border rounded-xl text-foreground"
                      />
                    )}
                  </div>
                ))
              )}

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-border text-foreground"
                  onClick={() => {
                    setSelectedTemplate(null)
                    resetMessageConfig()
                  }}
                >
                  Voltar
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
                  disabled={isAddingNode || (selectedTemplate.type === "message" && !msgText.trim())}
                  onClick={handleAddNode}
                >
                  {isAddingNode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Adicionar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---- Edit Node Dialog ---- */}
      <Dialog open={showEditNodeDialog} onOpenChange={setShowEditNodeDialog}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Bloco</DialogTitle>
          </DialogHeader>
          {editingNode && (
            <div className="flex flex-col gap-4 py-2">
              {editingNode.type === "message" ? (
                <MessageConfigForm
                  msgText={msgText}
                  setMsgText={setMsgText}
                  msgMediaType={msgMediaType}
                  setMsgMediaType={setMsgMediaType}
                  msgMediaUrl={msgMediaUrl}
                  setMsgMediaUrl={setMsgMediaUrl}
                  msgHasButtons={msgHasButtons}
                  setMsgHasButtons={setMsgHasButtons}
                  msgButtons={msgButtons}
                  addMsgButton={addMsgButton}
                  updateMsgButton={updateMsgButton}
                  removeMsgButton={removeMsgButton}
                />
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Label</Label>
                    <Input
                      value={editNodeLabel}
                      onChange={(e) => setEditNodeLabel(e.target.value)}
                      className="bg-secondary border-border rounded-xl text-foreground"
                    />
                  </div>

                  {(() => {
                    const tpl = actionTemplates.find((t) => t.type === editingNode.type)
                    if (!tpl || tpl.configFields.length === 0) return null
                    return tpl.configFields.map((field) => (
                      <div key={field.key} className="flex flex-col gap-2">
                        <Label className="text-foreground">{field.label}</Label>
                        {field.inputType === "textarea" ? (
                          <Textarea
                            value={editNodeConfig[field.key] || ""}
                            onChange={(e) =>
                              setEditNodeConfig((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            placeholder={field.placeholder}
                            className="bg-secondary border-border rounded-xl text-foreground min-h-[80px]"
                          />
                        ) : (
                          <Input
                            type={field.inputType}
                            value={editNodeConfig[field.key] || ""}
                            onChange={(e) =>
                              setEditNodeConfig((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            placeholder={field.placeholder}
                            className="bg-secondary border-border rounded-xl text-foreground"
                          />
                        )}
                      </div>
                    ))
                  })()}
                </>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-xl border-border text-foreground"
                  onClick={() => {
                    resetMessageConfig()
                    setShowEditNodeDialog(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
                  disabled={isSavingNode || (editingNode.type === "message" ? !msgText.trim() : !editNodeLabel.trim())}
                  onClick={handleSaveNode}
                >
                  {isSavingNode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---- Delete Node Dialog ---- */}
      <Dialog open={showDeleteNodeDialog} onOpenChange={setShowDeleteNodeDialog}>
        <DialogContent className="bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Apagar Bloco</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja apagar o bloco{" "}
            <span className="font-medium text-foreground">{deletingNode?.label}</span>?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl border-border text-foreground"
              onClick={() => setShowDeleteNodeDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={isDeletingNode}
              onClick={handleDeleteNode}
            >
              {isDeletingNode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apagar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Delete Flow Dialog ---- */}
      <Dialog open={showDeleteFlowDialog} onOpenChange={setShowDeleteFlowDialog}>
        <DialogContent className="bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Apagar Fluxo</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja apagar o fluxo{" "}
            <span className="font-medium text-foreground">{activeFlow?.name}</span>? Todos os blocos serao removidos.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl border-border text-foreground"
              onClick={() => setShowDeleteFlowDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={isDeletingFlow}
              onClick={handleDeleteFlow}
            >
              {isDeletingFlow && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apagar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ---- Message Config Form (media + inline keyboard buttons) ----

function MessageConfigForm({
  msgText,
  setMsgText,
  msgMediaType,
  setMsgMediaType,
  msgMediaUrl,
  setMsgMediaUrl,
  msgHasButtons,
  setMsgHasButtons,
  msgButtons,
  addMsgButton,
  updateMsgButton,
  removeMsgButton,
}: {
  msgText: string
  setMsgText: (v: string) => void
  msgMediaType: "photo" | "video" | "none"
  setMsgMediaType: (v: "photo" | "video" | "none") => void
  msgMediaUrl: string
  setMsgMediaUrl: (v: string) => void
  msgHasButtons: boolean
  setMsgHasButtons: (v: boolean) => void
  msgButtons: InlineButton[]
  addMsgButton: () => void
  updateMsgButton: (index: number, field: "text" | "url", value: string) => void
  removeMsgButton: (index: number) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [fileName, setFileName] = useState("")

  async function handleFileUpload(file: File) {
    setUploading(true)
    setUploadError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mediaType", msgMediaType)

      const res = await fetch("/api/upload-media", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setUploadError(data.error || "Erro ao fazer upload")
        return
      }

      setMsgMediaUrl(data.url)
      setFileName(file.name)
    } catch {
      setUploadError("Erro de conexao ao fazer upload")
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Texto da mensagem */}
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Texto da mensagem</Label>
        <Textarea
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          placeholder="Digite a mensagem que o bot vai enviar..."
          className="bg-secondary border-border rounded-xl text-foreground min-h-[80px]"
        />
      </div>

      {/* Midia */}
      <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
        <div className="flex items-center justify-between">
          <Label className="text-foreground text-sm">Midia (opcional)</Label>
          <Select
            value={msgMediaType}
            onValueChange={(v) => {
              setMsgMediaType(v as "photo" | "video" | "none")
              if (v === "none") {
                setMsgMediaUrl("")
                setFileName("")
                setUploadError("")
              }
            }}
          >
            <SelectTrigger className="w-[140px] h-8 bg-secondary border-border rounded-lg text-foreground text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="photo">
                <span className="flex items-center gap-1.5"><Image className="h-3 w-3" /> Foto</span>
              </SelectItem>
              <SelectItem value="video">
                <span className="flex items-center gap-1.5"><Video className="h-3 w-3" /> Video</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {msgMediaType !== "none" && (
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={msgMediaType === "photo" ? "image/jpeg,image/png,image/gif,image/webp" : "video/mp4,video/webm,video/quicktime"}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
                e.target.value = ""
              }}
            />

            {msgMediaUrl ? (
              <div className="flex flex-col gap-2">
                {msgMediaType === "photo" ? (
                  <div className="relative rounded-lg overflow-hidden border border-border bg-secondary">
                    <img src={msgMediaUrl} alt="Preview" className="w-full max-h-[160px] object-cover" />
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-border bg-secondary">
                    <video src={msgMediaUrl} className="w-full max-h-[160px] object-cover" controls />
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {fileName || "Arquivo enviado"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => {
                      setMsgMediaUrl("")
                      setFileName("")
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors ${
                  uploading
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-secondary/50"
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    <span className="text-xs text-muted-foreground">Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center">
                      Clique ou arraste {msgMediaType === "photo" ? "uma foto" : "um video"} aqui
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {msgMediaType === "photo" ? "JPG, PNG, GIF, WEBP" : "MP4, WEBM, MOV"} - Max 50MB
                    </span>
                  </>
                )}
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-destructive">{uploadError}</p>
            )}
          </div>
        )}
      </div>

      {/* Botoes Inline */}
      <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <Label className="text-foreground text-sm">Botoes com link</Label>
          </div>
          <Switch
            checked={msgHasButtons}
            onCheckedChange={(checked) => {
              setMsgHasButtons(checked)
              if (checked && msgButtons.length === 0) {
                addMsgButton()
              }
            }}
          />
        </div>

        {msgHasButtons && (
          <div className="flex flex-col gap-2">
            {msgButtons.map((btn, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border/50 bg-secondary/30 p-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Input
                    value={btn.text}
                    onChange={(e) => updateMsgButton(i, "text", e.target.value)}
                    placeholder="Titulo do botao"
                    className="bg-secondary border-border rounded-lg text-foreground text-sm h-8"
                  />
                  <Input
                    value={btn.url}
                    onChange={(e) => updateMsgButton(i, "url", e.target.value)}
                    placeholder="https://link-do-botao.com"
                    className="bg-secondary border-border rounded-lg text-foreground text-sm h-8"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeMsgButton(i)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {msgButtons.length < 6 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-lg border-dashed border-border text-muted-foreground text-xs"
                onClick={addMsgButton}
              >
                <Plus className="mr-1.5 h-3 w-3" />
                Adicionar botao
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Maximo de 6 botoes. Cada botao aparece abaixo da mensagem no Telegram.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
