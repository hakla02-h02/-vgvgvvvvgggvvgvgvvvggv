"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Plus, Zap, Link2, Workflow, Settings, RotateCcw, 
  Loader2, Bot, Upload, CheckCircle2, Sparkles
} from "lucide-react"

// Types
interface Flow {
  id: string
  user_id: string
  name: string
  mode: "basic" | "n8n"
  status: "active" | "paused"
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface FlowBot {
  id: string
  flow_id: string
  bot_id: string
  bot?: {
    id: string
    username: string
    first_name: string
  }
}

interface FlowStats {
  linkedBots: number
  basicFlows: number
  n8nFlows: number
}

export default function FluxosPage() {
  const router = useRouter()
  const { session } = useAuth()
  const { toast } = useToast()

  // State
  const [flows, setFlows] = useState<Flow[]>([])
  const [flowBots, setFlowBots] = useState<Record<string, FlowBot[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<FlowStats>({ linkedBots: 0, basicFlows: 0, n8nFlows: 0 })

  // Create flow modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newFlowName, setNewFlowName] = useState("")
  const [newFlowMode, setNewFlowMode] = useState<"basic" | "n8n">("basic")
  const [isCreating, setIsCreating] = useState(false)

  // Import flow dialog
  const [showImportDialog, setShowImportDialog] = useState(false)

  // Create flow handler
  const handleCreateFlow = async () => {
    if (!session?.userId) {
      toast({ title: "Erro", description: "Voce precisa estar logado", variant: "destructive" })
      return
    }
    if (!newFlowName.trim()) {
      toast({ title: "Erro", description: "Digite um nome para o fluxo", variant: "destructive" })
      return
    }
    if (newFlowMode === "n8n") {
      toast({ title: "Em breve", description: "Modo n8n ainda nao disponivel", variant: "destructive" })
      return
    }

    setIsCreating(true)

    const { data, error } = await supabase
      .from("flows")
      .insert({
        user_id: session.userId,
        name: newFlowName.trim(),
        flow_type: newFlowMode === "n8n" ? "n8n" : "complete",
        status: "ativo",
        config: {},
      })
      .select()
      .single()

    if (error) {
      toast({ title: "Erro ao criar", description: error.message, variant: "destructive" })
      setIsCreating(false)
      return
    }

    toast({ title: "Fluxo criado!", description: "Redirecionando para o editor..." })
    setShowCreateModal(false)
    setNewFlowName("")
    router.push(`/fluxos/${data.id}`)
  }

  // Fetch flows
  const fetchFlows = useCallback(async () => {
    if (!session?.userId) {
      setFlows([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    // Fetch flows
    const { data: flowsData, error } = await supabase
      .from("flows")
      .select("*")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching flows:", error)
      setIsLoading(false)
      return
    }

    const fetchedFlows = (flowsData || []) as Flow[]
    setFlows(fetchedFlows)

    // Calculate stats
    const linkedBotsCount = 0 // Will be calculated from flow_bots
    const basicCount = fetchedFlows.filter(f => f.mode === "basic" || !f.mode).length
    const n8nCount = fetchedFlows.filter(f => f.mode === "n8n").length
    setStats({ linkedBots: linkedBotsCount, basicFlows: basicCount, n8nFlows: n8nCount })

    // Fetch flow_bots for each flow
    const flowIds = fetchedFlows.map(f => f.id)
    if (flowIds.length > 0) {
      const { data: botsData } = await supabase
        .from("flow_bots")
        .select(`
          id,
          flow_id,
          bot_id,
          bots:bot_id (
            id,
            username,
            first_name
          )
        `)
        .in("flow_id", flowIds)

      if (botsData) {
        const grouped: Record<string, FlowBot[]> = {}
        let totalLinked = 0
        for (const fb of botsData) {
          if (!grouped[fb.flow_id]) grouped[fb.flow_id] = []
          grouped[fb.flow_id].push(fb as unknown as FlowBot)
          totalLinked++
        }
        setFlowBots(grouped)
        setStats(prev => ({ ...prev, linkedBots: totalLinked }))
      }
    }

    setIsLoading(false)
  }, [session?.userId])

  useEffect(() => {
    fetchFlows()
  }, [fetchFlows])



  // Flow card component - Design horizontal moderno
  const FlowCard = ({ flow }: { flow: Flow }) => {
    const bots = flowBots[flow.id] || []
    const isBasic = flow.mode === "basic" || !flow.mode

    return (
      <div 
        className="group relative bg-gradient-to-br from-card to-card/80 rounded-2xl border border-border/40 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={() => router.push(`/fluxos/${flow.id}`)}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative p-5">
          {/* Top row - Icon, Name, Badge, Menu */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isBasic 
                ? "bg-gradient-to-br from-accent/20 to-accent/5 ring-1 ring-accent/20" 
                : "bg-gradient-to-br from-purple-500/20 to-purple-500/5 ring-1 ring-purple-500/20"
            }`}>
              {isBasic ? (
                <Zap className="h-6 w-6 text-accent" />
              ) : (
                <Workflow className="h-6 w-6 text-purple-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate text-base mb-1">{flow.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  isBasic
                    ? "bg-accent/15 text-accent"
                    : "bg-purple-500/15 text-purple-400"
                }`}>
                  {isBasic ? "Basico" : "N8N"}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  {bots.length === 0 ? "Sem bot" : `${bots.length} bot${bots.length > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Starts</p>
                <p className="text-sm font-bold text-foreground">0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Conversao</p>
                <p className="text-sm font-bold text-foreground">0%</p>
              </div>
            </div>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2">
            <button 
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/50 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Open remarketing
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Remarketing
            </button>
            <button 
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent/10 hover:bg-accent text-xs font-medium text-accent hover:text-accent-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/fluxos/${flow.id}`)
              }}
            >
              <Settings className="h-3.5 w-3.5" />
              Editar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/50 border border-border/50 mb-6">
        <Workflow className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum fluxo configurado</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Crie seu primeiro fluxo de automacao para comecar a automatizar suas vendas e capturar leads.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setShowImportDialog(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Importar Fluxo
        </Button>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Primeiro Fluxo
        </Button>
      </div>
    </div>
  )

  const maxFlows = 50
  const currentFlows = flows.length

  return (
    <div className="flex h-full flex-col bg-background">
      <DashboardHeader
        title="Meus Fluxos"
        description="Gerencie seus fluxos de automacao e chatbots"
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Seus Fluxos</h2>
            <p className="text-sm text-muted-foreground">Gerencie e edite seus fluxos de automacao</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 bg-card hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowImportDialog(true)}
            >
              <Upload className="h-4 w-4" />
              Importar
            </button>
            <button 
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-sm font-semibold text-accent-foreground transition-colors"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4" />
              Criar Fluxo
              <span className="ml-1 text-xs opacity-70">({currentFlows}/{maxFlows})</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Design glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Vinculados */}
          <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-5 hover:border-emerald-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
                <Link2 className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80">Vinculados</p>
                <p className="text-3xl font-black text-foreground">{stats.linkedBots}</p>
              </div>
            </div>
          </div>
          
          {/* Basicos */}
          <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 p-5 hover:border-accent/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/20 transition-colors" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 ring-1 ring-accent/30">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent/80">Basicos</p>
                <p className="text-3xl font-black text-foreground">{stats.basicFlows}</p>
              </div>
            </div>
          </div>
          
          {/* N8N */}
          <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 p-5 hover:border-purple-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 ring-1 ring-purple-500/30">
                <Workflow className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-400/80">Fluxos N8N</p>
                <p className="text-3xl font-black text-foreground">{stats.n8nFlows}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Flows Grid or Empty State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground">Carregando fluxos...</p>
            </div>
          </div>
        ) : flows.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {flows.map(flow => (
              <FlowCard key={flow.id} flow={flow} />
            ))}
          </div>
        )}
      </main>

      {/* Create Flow Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <DialogTitle className="text-lg">Criar Novo Fluxo</DialogTitle>
                <p className="text-sm text-muted-foreground">Configure seu fluxo de automacao</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Nome do Fluxo */}
            <div className="space-y-2">
              <Label htmlFor="flow-name">
                Nome do Fluxo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="flow-name"
                placeholder="Ex: Boas-vindas e Vendas"
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value.slice(0, 30))}
                className="bg-secondary/30 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                {newFlowName.length}/30 caracteres
              </p>
            </div>

            {/* Modo do Fluxo */}
            <div className="space-y-3">
              <Label>
                Modo do Fluxo <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                {/* Basico */}
                <button
                  type="button"
                  onClick={() => setNewFlowMode("basic")}
                  className={`relative flex flex-col p-5 rounded-xl border-2 transition-all text-left ${
                    newFlowMode === "basic"
                      ? "border-accent bg-accent/5"
                      : "border-border/50 bg-secondary/20 hover:border-border"
                  }`}
                >
                  {newFlowMode === "basic" && (
                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-accent" />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-accent" />
                    <span className="font-semibold">Basico</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Editor visual simples com blocos pre-configurados
                  </p>
                </button>

                {/* n8n */}
                <button
                  type="button"
                  disabled
                  className="relative flex flex-col p-5 rounded-xl border-2 border-border/30 bg-secondary/10 opacity-50 cursor-not-allowed text-left"
                >
                  <Badge className="absolute top-3 right-3 text-[9px] bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Em breve
                  </Badge>
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="h-5 w-5 text-purple-400" />
                    <span className="font-semibold">Fluxo n8n</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Editor visual com blocos arrastaveis
                  </p>
                </button>
              </div>
            </div>

            {/* Dica */}
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">Sobre os Bots</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Apos criar o fluxo, voce podera adicionar bots na aba &quot;Bots&quot;. Um mesmo fluxo pode ser executado por multiplos bots.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateFlow} 
              disabled={!newFlowName.trim() || isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Workflow className="h-4 w-4 mr-2" />
              )}
              Criar Fluxo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Flow Dialog (placeholder) */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Importar Fluxo</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">
              Funcionalidade em desenvolvimento
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
