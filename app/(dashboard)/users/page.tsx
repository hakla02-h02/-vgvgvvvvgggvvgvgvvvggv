"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import {
  Users, UserCheck, UserX, Crown, Search, TrendingUp,
  TrendingDown, Clock, ArrowRight, Eye, ChevronDown, ChevronUp,
  Zap, MessageSquare, CreditCard, CheckCircle2,
} from "lucide-react"

// --- Hardcoded Data ---

const funnelSteps = [
  { label: "Iniciaram o Bot", icon: Zap, count: 3240, color: "text-accent" },
  { label: "Viram Mensagem", icon: MessageSquare, count: 2890, color: "text-chart-2" },
  { label: "Chegaram ao Pagamento", icon: CreditCard, count: 1450, color: "text-warning" },
  { label: "Assinaram", icon: CheckCircle2, count: 812, color: "text-success" },
]

const usuarios = [
  {
    id: "u1", nome: "Carlos M.", telegram: "@carlosm",
    assinante: true, diasRestantes: 24, plano: "Mensal",
    iniciadoEm: "2025-12-01", ultimaAtividade: "Hoje",
    etapaFunil: "Assinante",
  },
  {
    id: "u2", nome: "Ana P.", telegram: "@anap",
    assinante: true, diasRestantes: 12, plano: "Mensal",
    iniciadoEm: "2025-12-05", ultimaAtividade: "Hoje",
    etapaFunil: "Assinante",
  },
  {
    id: "u3", nome: "Lucas S.", telegram: "@lucass",
    assinante: false, diasRestantes: 0, plano: null,
    iniciadoEm: "2026-01-10", ultimaAtividade: "Ha 2 dias",
    etapaFunil: "Viu mensagem",
  },
  {
    id: "u4", nome: "Maria R.", telegram: "@mariar",
    assinante: true, diasRestantes: 3, plano: "Trimestral",
    iniciadoEm: "2025-09-15", ultimaAtividade: "Ontem",
    etapaFunil: "Assinante",
  },
  {
    id: "u5", nome: "Pedro L.", telegram: "@pedrol",
    assinante: false, diasRestantes: 0, plano: null,
    iniciadoEm: "2026-02-01", ultimaAtividade: "Ha 5 dias",
    etapaFunil: "Iniciou bot",
  },
  {
    id: "u6", nome: "Julia F.", telegram: "@juliaf",
    assinante: false, diasRestantes: 0, plano: null,
    iniciadoEm: "2026-02-10", ultimaAtividade: "Ha 1 dia",
    etapaFunil: "Chegou ao pagamento",
  },
  {
    id: "u7", nome: "Rafael G.", telegram: "@rafaelg",
    assinante: true, diasRestantes: 30, plano: "Mensal",
    iniciadoEm: "2026-02-15", ultimaAtividade: "Hoje",
    etapaFunil: "Assinante",
  },
  {
    id: "u8", nome: "Fernanda C.", telegram: "@fernandac",
    assinante: false, diasRestantes: 0, plano: null,
    iniciadoEm: "2026-02-18", ultimaAtividade: "Hoje",
    etapaFunil: "Viu mensagem",
  },
  {
    id: "u9", nome: "Diego A.", telegram: "@diegoa",
    assinante: true, diasRestantes: 7, plano: "Mensal",
    iniciadoEm: "2026-01-20", ultimaAtividade: "Ontem",
    etapaFunil: "Assinante",
  },
  {
    id: "u10", nome: "Camila B.", telegram: "@camilab",
    assinante: false, diasRestantes: 0, plano: null,
    iniciadoEm: "2026-02-19", ultimaAtividade: "Hoje",
    etapaFunil: "Iniciou bot",
  },
]

type FilterType = "todos" | "assinantes" | "nao_assinantes" | "expirando"

export default function UsersPage() {
  const { selectedBot } = useBots()
  const [busca, setBusca] = useState("")
  const [filtro, setFiltro] = useState<FilterType>("todos")
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Usuarios" />
        <NoBotSelected />
      </>
    )
  }

  const totalUsuarios = usuarios.length
  const assinantes = usuarios.filter((u) => u.assinante)
  const naoAssinantes = usuarios.filter((u) => !u.assinante)
  const expirandoEm7Dias = assinantes.filter((u) => u.diasRestantes <= 7)
  const taxaConversao = ((assinantes.length / totalUsuarios) * 100).toFixed(1)

  const filtrados = usuarios.filter((u) => {
    const matchBusca =
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.telegram.toLowerCase().includes(busca.toLowerCase())

    if (!matchBusca) return false

    switch (filtro) {
      case "assinantes":
        return u.assinante
      case "nao_assinantes":
        return !u.assinante
      case "expirando":
        return u.assinante && u.diasRestantes <= 7
      default:
        return true
    }
  })

  return (
    <>
      <DashboardHeader title="Usuarios" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">

          {/* Stats Cards */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Usuarios</p>
                  <p className="text-xl font-bold text-foreground">3.240</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-[10px] text-success">+12% esta semana</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10">
                  <Crown className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assinantes</p>
                  <p className="text-xl font-bold text-foreground">812</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-[10px] text-success">+8% esta semana</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expirando</p>
                  <p className="text-xl font-bold text-foreground">47</p>
                  <span className="text-[10px] text-muted-foreground">Proximos 7 dias</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-chart-2/10">
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Taxa Conversao</p>
                  <p className="text-xl font-bold text-foreground">25.1%</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-[10px] text-success">+3.2% vs mes passado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Funnel */}
          <Card className="bg-card border-border rounded-2xl">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Funil de Conversao</h3>
              <div className="flex flex-col gap-3">
                {funnelSteps.map((step, i) => {
                  const pct = ((step.count / funnelSteps[0].count) * 100).toFixed(0)
                  const dropOff =
                    i > 0
                      ? (
                          ((funnelSteps[i - 1].count - step.count) / funnelSteps[i - 1].count) *
                          100
                        ).toFixed(1)
                      : null

                  return (
                    <div key={step.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <step.icon className={`h-4 w-4 ${step.color}`} />
                          <span className="text-sm text-foreground">{step.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {dropOff && (
                            <div className="flex items-center gap-1">
                              <TrendingDown className="h-3 w-3 text-destructive" />
                              <span className="text-[10px] text-destructive">-{dropOff}%</span>
                            </div>
                          )}
                          <span className="text-sm font-semibold text-foreground tabular-nums">
                            {step.count.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 rounded-full bg-secondary">
                        <div
                          className="h-2.5 rounded-full bg-accent transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {i < funnelSteps.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowRight className="h-3 w-3 text-muted-foreground rotate-90" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card className="bg-card border-border rounded-2xl">
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-foreground">Gerenciamento de Usuarios</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuario..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full sm:w-64 bg-secondary pl-9 border-border rounded-xl"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "todos" as FilterType, label: "Todos", count: totalUsuarios },
                  { key: "assinantes" as FilterType, label: "Assinantes", count: assinantes.length },
                  { key: "nao_assinantes" as FilterType, label: "Nao Assinantes", count: naoAssinantes.length },
                  { key: "expirando" as FilterType, label: "Expirando", count: expirandoEm7Dias.length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFiltro(tab.key)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      filtro === tab.key
                        ? "bg-accent/15 text-accent"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                        filtro === tab.key
                          ? "bg-accent/20 text-accent"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Usuario</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Plano</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Dias Restantes</TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell">Etapa do Funil</TableHead>
                    <TableHead className="text-muted-foreground text-right">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((user) => (
                    <>
                      <TableRow
                        key={user.id}
                        className="border-border cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() =>
                          setExpandedUser(expandedUser === user.id ? null : user.id)
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                              {user.nome.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{user.nome}</p>
                              <p className="text-xs text-muted-foreground">{user.telegram}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`rounded-lg ${
                              user.assinante
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-secondary text-muted-foreground border-border"
                            }`}
                          >
                            {user.assinante ? "Assinante" : "Gratuito"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-foreground">
                            {user.plano || "--"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.assinante ? (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-secondary">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    user.diasRestantes <= 7 ? "bg-destructive" : user.diasRestantes <= 14 ? "bg-warning" : "bg-success"
                                  }`}
                                  style={{
                                    width: `${Math.min((user.diasRestantes / 30) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                              <span
                                className={`text-xs font-medium ${
                                  user.diasRestantes <= 7 ? "text-destructive" : user.diasRestantes <= 14 ? "text-warning" : "text-foreground"
                                }`}
                              >
                                {user.diasRestantes}d
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">--</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">{user.etapaFunil}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            {expandedUser === user.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Detail */}
                      {expandedUser === user.id && (
                        <TableRow key={`${user.id}-detail`} className="border-border bg-secondary/30">
                          <TableCell colSpan={6} className="p-4">
                            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  Inicio
                                </span>
                                <span className="text-sm text-foreground">
                                  {new Date(user.iniciadoEm).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  Ultima Atividade
                                </span>
                                <span className="text-sm text-foreground">{user.ultimaAtividade}</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  Plano
                                </span>
                                <span className="text-sm text-foreground">{user.plano || "Nenhum"}</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  Etapa do Funil
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`w-fit rounded-lg text-[10px] ${
                                    user.etapaFunil === "Assinante"
                                      ? "bg-success/10 text-success border-success/20"
                                      : user.etapaFunil === "Chegou ao pagamento"
                                        ? "bg-warning/10 text-warning border-warning/20"
                                        : "bg-secondary text-muted-foreground border-border"
                                  }`}
                                >
                                  {user.etapaFunil}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                  {filtrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <UserX className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Nenhum usuario encontrado</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  )
}
