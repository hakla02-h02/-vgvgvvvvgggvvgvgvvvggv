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
  flow_type: "basic" | "complete" | "n8n"
  status: "active" | "paused" | "ativo"
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
    const basicCount = fetchedFlows.filter(f => f.flow_type !== "n8n").length
    const n8nCount = fetchedFlows.filter(f => f.flow_type === "n8n").length
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

      if (botsData && botsData.length > 0) {
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

  // Refresh when page becomes visible (user returns from flow editor)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchFlows()
      }
    }
    
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [fetchFlows])

  // Flow card - Design moderno com metricas visuais
  const FlowCard = ({ flow }: { flow: Flow }) => {
    const bots = flowBots[flow.id] || []
    const isBasic = flow.flow_type !== "n8n"
    
    // Mock stats for now - these would come from real data
    const starts = 0
    const conversions = 0
    const conversionRate = starts > 0 ? Math.round((conversions / starts) * 100) : 0

    return (
      <div 
        className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 cursor-pointer"
        onClick={() => router.push(`/fluxos/${flow.id}`)}
      >
        {/* Header with gradient */}
        <div className={`relative px-5 py-4 ${isBasic ? "bg-accent/10" : "bg-purple-500/10"}`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-30" style={{ 
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, ${isBasic ? "hsl(100 71% 65% / 0.2)" : "rgb(168 85 247 / 0.2)"} 8px, ${isBasic ? "hsl(100 71% 65% / 0.2)" : "rgb(168 85 247 / 0.2)"} 16px)` 
          }} />
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isBasic ? "bg-accent/20 text-accent" : "bg-purple-500/20 text-purple-400"
              }`}>
                {isBasic ? <Zap className="h-5 w-5" /> : <Workflow className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-foreground truncate max-w-[180px]">{flow.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isBasic ? "bg-accent/20 text-accent" : "bg-purple-500/20 text-purple-400"
                  }`}>
                    {isBasic ? "BASICO" : "N8N"}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    flow.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
                  }`}>
                    {flow.status === "active" ? "Ativo" : "Pausado"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                className="p-1.5 rounded-lg hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/fluxos/${flow.id}`)
                }}
                title="Configurar"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Starts */}
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-foreground">{starts}</div>
              <div className="text-[10px] text-muted-foreground font-medium">Starts</div>
            </div>
            
            {/* Conversions */}
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-foreground">{conversions}</div>
              <div className="text-[10px] text-muted-foreground font-medium">Conv.</div>
            </div>
            
            {/* Conversion Rate */}
            <div className={`rounded-xl p-3 text-center ${
              conversionRate > 0 ? "bg-emerald-500/10" : "bg-secondary/50"
            }`}>
              <div className={`text-lg font-bold ${
                conversionRate > 0 ? "text-emerald-400" : "text-foreground"
              }`}>{conversionRate}%</div>
              <div className="text-[10px] text-muted-foreground font-medium">Taxa</div>
            </div>
          </div>
          
          {/* Bots linked */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {bots.length > 0 ? (
                  bots.slice(0, 3).map((fb) => (
                    <div 
                      key={fb.id}
                      className="w-6 h-6 rounded-full bg-accent/20 border-2 border-card flex items-center justify-center"
                    >
                      <Bot className="h-3 w-3 text-accent" />
                    </div>
                  ))
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                    <Bot className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
                {bots.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                    +{bots.length - 3}
                  </div>
                )}
              </div>
              <span className={`text-xs ${bots.length > 0 ? "text-accent font-medium" : "text-muted-foreground"}`}>
                {bots.length === 0 ? "Nenhum bot conectado" : `${bots.length} bot${bots.length > 1 ? 's' : ''} conectado${bots.length > 1 ? 's' : ''}`}
              </span>
            </div>
            
            <button 
              className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-medium transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/fluxos/${flow.id}`)
              }}
            >
              Editar
              <Link2 className="h-3 w-3" />
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
        {/* Header simples */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Fluxos</h2>
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowImportDialog(true)}
            >
              <Upload className="h-3.5 w-3.5" />
              Importar
            </button>
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-foreground hover:bg-foreground/90 text-xs font-medium text-background transition-colors"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Novo fluxo
            </button>
          </div>
        </div>

        {/* Stats - Inline simples */}
        <div className="flex items-center gap-6 mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{stats.linkedBots}</span>
            <span className="text-sm text-muted-foreground">bots vinculados</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{stats.basicFlows}</span>
            <span className="text-sm text-muted-foreground">fluxos basicos</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{stats.n8nFlows}</span>
            <span className="text-sm text-muted-foreground">fluxos n8n</span>
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
                  onClick={() => setNewFlowMode("n8n")}
                  className={`relative flex flex-col p-5 rounded-xl border-2 transition-all text-left ${
                    newFlowMode === "n8n"
                      ? "border-purple-500 bg-purple-500/5"
                      : "border-border/50 bg-secondary/20 hover:border-border"
                  }`}
                >
                  {newFlowMode === "n8n" && (
                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-purple-500" />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="h-5 w-5 text-purple-400" />
                    <span className="font-semibold">Fluxo N8N</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Editor visual estilo n8n com blocos arrastaveis
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
