"use client"

import { useState, useEffect, useCallback } from "react"
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
  Plus, GitBranch, MessageSquare, Timer, Split, Zap,
  ArrowRight, GripVertical, ChevronRight, Users, CreditCard,
  Pencil, Trash2, Loader2,
} from "lucide-react"

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

interface FlowNode {
  id: string
  flow_id: string
  type: NodeType
  label: string
  config: Record<string, string>
  position: number
  created_at: string
  updated_at: string
}

// ---- Constants ----

const nodeIcons: Record<NodeType, React.ElementType> = {
  trigger: Zap, message: MessageSquare, delay: Timer,
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
    description: "Enviar uma mensagem para o usuario",
    configFields: [
      { key: "text", label: "Texto da mensagem", placeholder: "Digite a mensagem...", inputType: "textarea" },
    ],
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

    // Build the label based on template + config
    let label = selectedTemplate.label
    if (selectedTemplate.type === "message" && nodeConfigValues.text) {
      label = nodeConfigValues.text.length > 40 ? nodeConfigValues.text.slice(0, 40) + "..." : nodeConfigValues.text
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
        config: nodeConfigValues,
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
    setShowAddNodeDialog(false)
    setIsAddingNode(false)
  }

  // ---- Edit node ----
  const openEditNode = (node: FlowNode) => {
    setEditingNode(node)
    setEditNodeLabel(node.label)
    setEditNodeConfig(node.config || {})
    setShowEditNodeDialog(true)
  }

  const handleSaveNode = async () => {
    if (!editingNode) return

    setIsSavingNode(true)
    const { error } = await supabase
      .from("flow_nodes")
      .update({
        label: editNodeLabel,
        config: editNodeConfig,
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
          ? { ...n, label: editNodeLabel, config: editNodeConfig }
          : n
      )
    )
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
                                <p className="flex-1 text-sm font-medium text-foreground">{node.label}</p>
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
        <DialogContent className="bg-card border-border rounded-2xl max-w-md">
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

              {selectedTemplate.configFields.length === 0 ? (
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
                  onClick={() => setSelectedTemplate(null)}
                >
                  Voltar
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
                  disabled={isAddingNode}
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
        <DialogContent className="bg-card border-border rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Bloco</DialogTitle>
          </DialogHeader>
          {editingNode && (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Label</Label>
                <Input
                  value={editNodeLabel}
                  onChange={(e) => setEditNodeLabel(e.target.value)}
                  className="bg-secondary border-border rounded-xl text-foreground"
                />
              </div>

              {/* Show config fields based on node type */}
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

              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-xl border-border text-foreground"
                  onClick={() => setShowEditNodeDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
                  disabled={isSavingNode || !editNodeLabel.trim()}
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
