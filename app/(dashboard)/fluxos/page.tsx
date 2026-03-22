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
        mode: newFlowMode,
        status: "active",
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



  // Flow card component
  const FlowCard = ({ flow }: { flow: Flow }) => {
    const bots = flowBots[flow.id] || []
    const isBasic = flow.mode === "basic" || !flow.mode

    return (
      <Card 
        className="group border-border/60 bg-card hover:bg-secondary/20 hover:border-border transition-all cursor-pointer"
        onClick={() => router.push(`/fluxos/${flow.id}`)}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isBasic 
                ? "bg-accent/10 border border-accent/30" 
                : "bg-purple-500/10 border border-purple-500/30"
            }`}>
              {isBasic ? (
                <Zap className="h-5 w-5 text-accent" />
              ) : (
                <Workflow className="h-5 w-5 text-purple-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{flow.name}</h3>
              <Badge 
                variant="outline" 
                className={`mt-1.5 text-[10px] uppercase tracking-wide ${
                  isBasic
                    ? "bg-accent/10 text-accent border-accent/30"
                    : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                }`}
              >
                {isBasic ? "Basico" : "n8n"}
              </Badge>
              
              <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <Bot className="h-3.5 w-3.5" />
                <span>
                  {bots.length === 0 
                    ? "Nenhum bot vinculado ainda" 
                    : `${bots.length} bot(s) vinculado(s)`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-border/40">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">Starts</p>
              <p className="text-lg font-bold text-foreground">0</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">Conversao</p>
              <p className="text-lg font-bold text-foreground">0%</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-border/40">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Open remarketing
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Remarketing
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/fluxos/${flow.id}`)
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Editar Fluxo
            </Button>
          </div>
        </CardContent>
      </Card>
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
          <div />
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Fluxo
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Fluxo ({currentFlows}/{maxFlows})
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-border/60 bg-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/30">
                <Link2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Vinculados</p>
                <p className="text-2xl font-bold text-foreground">{stats.linkedBots}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/60 bg-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/30">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Basicos</p>
                <p className="text-2xl font-bold text-foreground">{stats.basicFlows}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/60 bg-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30">
                <Workflow className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Fluxos n8n</p>
                <p className="text-2xl font-bold text-foreground">{stats.n8nFlows}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flows Grid or Empty State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : flows.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
