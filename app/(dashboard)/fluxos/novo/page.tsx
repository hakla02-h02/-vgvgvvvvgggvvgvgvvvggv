"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import {
  ArrowLeft, Zap, Workflow, Bot, CheckCircle2, 
  Loader2, Sparkles, MessageSquare, CreditCard, 
  TrendingUp, Clock, GitBranch
} from "lucide-react"

export default function NovoFluxoPage() {
  const router = useRouter()
  const { session } = useAuth()

  const [flowName, setFlowName] = useState("")
  const [flowMode, setFlowMode] = useState<"basic" | "n8n">("basic")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    console.log("[v0] handleCreate called")
    console.log("[v0] session:", session)
    console.log("[v0] flowName:", flowName)
    console.log("[v0] flowMode:", flowMode)
    
    if (!session?.userId) {
      console.log("[v0] No session userId - returning")
      return
    }
    if (!flowName.trim()) {
      console.log("[v0] No flow name - returning")
      return
    }
    if (flowMode === "n8n") {
      console.log("[v0] n8n mode selected - returning")
      return
    }

    setIsCreating(true)
    console.log("[v0] Creating flow...")

    const { data, error } = await supabase
      .from("flows")
      .insert({
        user_id: session.userId,
        name: flowName.trim(),
        mode: flowMode,
        status: "active",
        config: {},
      })
      .select()
      .single()

    console.log("[v0] Supabase response - data:", data, "error:", error)

    if (error) {
      console.error("[v0] Error creating flow:", error)
      setIsCreating(false)
      return
    }

    console.log("[v0] Redirecting to /fluxos/" + data.id)
    router.push(`/fluxos/${data.id}`)
  }

  const canCreate = flowName.trim().length > 0 && flowMode === "basic"

  return (
    <div className="flex flex-col h-full overflow-auto bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push("/fluxos")}
              className="hover:bg-secondary/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Criar Novo Fluxo</h1>
              <p className="text-xs text-muted-foreground">Configure seu fluxo de automacao</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push("/fluxos")}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!canCreate || isCreating}
              className="min-w-[140px]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Workflow className="h-4 w-4 mr-2" />
                  Criar Fluxo
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container max-w-6xl mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Flow Name Section */}
            <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-accent via-accent/50 to-transparent" />
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Nome do Fluxo</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Escolha um nome descritivo para identificar seu fluxo
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        placeholder="Ex: Boas-vindas Premium, Funil de Vendas..."
                        value={flowName}
                        onChange={(e) => setFlowName(e.target.value.slice(0, 30))}
                        className="h-12 text-base bg-background/50 border-border/50 focus:border-accent/50 focus:ring-accent/20"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Um nome claro ajuda a organizar seus fluxos
                        </p>
                        <span className={`text-xs font-medium ${
                          flowName.length > 25 ? "text-warning" : "text-muted-foreground"
                        }`}>
                          {flowName.length}/30
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flow Mode Section */}
            <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 via-purple-500/50 to-transparent" />
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <GitBranch className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Modo do Fluxo</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Escolha o tipo de editor que melhor se adapta ao seu projeto
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Mode Card */}
                  <button
                    type="button"
                    onClick={() => setFlowMode("basic")}
                    className={`group relative flex flex-col p-5 rounded-2xl border-2 transition-all text-left ${
                      flowMode === "basic"
                        ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                        : "border-border/40 bg-background/30 hover:border-border hover:bg-secondary/20"
                    }`}
                  >
                    {flowMode === "basic" && (
                      <div className="absolute top-4 right-4">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent">
                          <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20 mb-4">
                      <Zap className="h-7 w-7 text-accent" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-1">Modo Basico</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Editor visual simples e intuitivo com blocos pre-configurados
                    </p>
                    
                    <div className="space-y-2.5 pt-4 border-t border-border/30">
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4 text-accent" />
                        <span>Mensagens de texto e midia</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4 text-accent" />
                        <span>Planos e pagamentos</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        <span>Upsell, Downsell e Order Bump</span>
                      </div>
                    </div>
                    
                    <Badge className="mt-4 w-fit bg-accent/10 text-accent border-accent/30 hover:bg-accent/20">
                      Recomendado
                    </Badge>
                  </button>

                  {/* n8n Mode Card (Coming Soon) */}
                  <button
                    type="button"
                    disabled
                    className="group relative flex flex-col p-5 rounded-2xl border-2 border-border/30 bg-background/20 opacity-50 cursor-not-allowed text-left"
                  >
                    <Badge className="absolute top-4 right-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
                      Em breve
                    </Badge>
                    
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4">
                      <Workflow className="h-7 w-7 text-purple-400" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-1">Fluxo n8n</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Editor visual avancado com blocos arrastaveis estilo n8n
                    </p>
                    
                    <div className="space-y-2.5 pt-4 border-t border-border/30">
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-purple-400" />
                        <span>Tudo do Modo Basico +</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <GitBranch className="h-4 w-4 text-purple-400" />
                        <span>Condicoes logicas (IF/ELSE)</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <span>Delays e agendamentos</span>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="mt-4 w-fit border-purple-500/30 text-purple-400">
                      Avancado
                    </Badge>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Bots Info Card */}
            <Card className="border-accent/30 bg-accent/5 backdrop-blur">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 border border-accent/30">
                    <Bot className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-accent mb-1">Sobre os Bots</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Apos criar o fluxo, voce podera vincular ate <strong className="text-foreground">5 bots</strong> na aba &quot;Bots&quot;. 
                      Um mesmo fluxo pode ser executado por multiplos bots simultaneamente, 
                      permitindo escalar suas automacoes facilmente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            
            {/* What are Flows */}
            <Card className="border-border/50 bg-card/30 backdrop-blur sticky top-24">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/50 border border-border/50">
                    <Workflow className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground">O que sao Fluxos?</h3>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Fluxos sao sequencias de mensagens e acoes automaticas que seu bot executa 
                  quando um usuario interage com ele. Crie conversas complexas, aceite pagamentos, 
                  faca remarketing e muito mais.
                </p>

                <div className="space-y-4 pt-4 border-t border-border/30">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-accent" />
                      Modo Basico
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Perfeito para iniciantes. Interface simplificada com blocos 
                      pre-configurados para criar automacoes rapidamente.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Workflow className="h-4 w-4 text-purple-400" />
                      Fluxo n8n
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Para usuarios avancados. Arraste e conecte blocos para criar 
                      automacoes complexas com logica condicional.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-border/50 bg-card/30 backdrop-blur">
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-4">Dicas Rapidas</h3>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-bold mt-0.5">1</span>
                    <span className="text-muted-foreground">Use nomes claros como &quot;Vendas Black Friday&quot; ou &quot;Suporte 24h&quot;</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-bold mt-0.5">2</span>
                    <span className="text-muted-foreground">Comece pelo Modo Basico e evolua conforme necessario</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-bold mt-0.5">3</span>
                    <span className="text-muted-foreground">Voce pode duplicar fluxos depois para criar variacoes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
