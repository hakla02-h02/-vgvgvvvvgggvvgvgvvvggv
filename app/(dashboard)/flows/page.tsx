"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import {
  Plus, GitBranch, MessageSquare, Timer, Split, Zap,
  ArrowRight, GripVertical, ChevronRight, Users, CreditCard,
} from "lucide-react"

interface FlowNode {
  id: string
  type: "trigger" | "message" | "delay" | "condition" | "payment" | "action"
  label: string
}

const sampleFlow: FlowNode[] = [
  { id: "1", type: "trigger", label: "Usuario inicia bot" },
  { id: "2", type: "message", label: "Mensagem de boas-vindas" },
  { id: "3", type: "delay", label: "Esperar 5 minutos" },
  { id: "4", type: "condition", label: "Usuario respondeu?" },
  { id: "5", type: "payment", label: "Gerar PIX" },
  { id: "6", type: "action", label: "Adicionar ao grupo VIP" },
]

const nodeIcons: Record<string, React.ElementType> = {
  trigger: Zap, message: MessageSquare, delay: Timer,
  condition: Split, payment: CreditCard, action: Users,
}

const nodeColors: Record<string, string> = {
  trigger: "border-accent bg-accent/5",
  message: "border-blue-500/30 bg-blue-500/5",
  delay: "border-warning/30 bg-warning/5",
  condition: "border-purple-500/30 bg-purple-500/5",
  payment: "border-success/30 bg-success/5",
  action: "border-cyan-500/30 bg-cyan-500/5",
}

const nodeIconColors: Record<string, string> = {
  trigger: "text-accent", message: "text-blue-400", delay: "text-warning",
  condition: "text-purple-400", payment: "text-success", action: "text-cyan-400",
}

const fluxos = [
  { id: "f1", nome: "Funil de Vendas", etapas: 6, status: "ativo" },
  { id: "f2", nome: "Upsell", etapas: 8, status: "ativo" },
  { id: "f3", nome: "Captura de Leads", etapas: 4, status: "pausado" },
  { id: "f4", nome: "Remarketing", etapas: 10, status: "ativo" },
]

const statusStyles: Record<string, string> = {
  ativo: "bg-success/10 text-success border-success/20",
  pausado: "bg-warning/10 text-warning border-warning/20",
}

export default function FlowsPage() {
  const { selectedBot } = useBots()
  const [activeFlow, setActiveFlow] = useState(fluxos[0])

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
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Novo Fluxo
            </Button>
          </div>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-5">
            {/* Lista de fluxos */}
            <div className="flex flex-col gap-3 lg:col-span-2">
              {fluxos.map((fluxo) => (
                <Card
                  key={fluxo.id}
                  className={`cursor-pointer bg-card border-border rounded-2xl transition-colors hover:bg-secondary/50 ${
                    activeFlow.id === fluxo.id ? "ring-1 ring-accent" : ""
                  }`}
                  onClick={() => setActiveFlow(fluxo)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{fluxo.nome}</h3>
                        <p className="text-xs text-muted-foreground">{fluxo.etapas} etapas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`rounded-lg ${statusStyles[fluxo.status]}`}>
                        {fluxo.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Visual builder */}
            <Card className="bg-card border-border rounded-2xl lg:col-span-3">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-foreground">
                    {activeFlow.nome}
                  </CardTitle>
                  <Badge variant="outline" className={`rounded-lg ${statusStyles[activeFlow.status]}`}>
                    {activeFlow.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {sampleFlow.map((node, i) => {
                    const Icon = nodeIcons[node.type]
                    return (
                      <div key={node.id}>
                        <div className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors hover:bg-secondary/50 ${nodeColors[node.type]}`}>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/50">
                            <Icon className={`h-4 w-4 ${nodeIconColors[node.type]}`} />
                          </div>
                          <p className="flex-1 text-sm font-medium text-foreground">{node.label}</p>
                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                        </div>
                        {i < sampleFlow.length - 1 && (
                          <div className="flex justify-center py-1">
                            <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
