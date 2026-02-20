"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import {
  Users, Crown, Search, TrendingUp, Clock, Eye, X,
  Zap, MessageSquare, CreditCard, CheckCircle2, ArrowDown,
  Calendar, Activity, ChevronRight,
} from "lucide-react"

// --- Mock data ---

const kpis = {
  totalUsuarios: 3240,
  totalUsuariosDelta: 12.4,
  assinantes: 812,
  assinantesDelta: 8.2,
  expirando7d: 47,
  taxaConversao: 25.1,
  taxaConversaoDelta: 3.2,
}

const funnel = [
  { id: "start", label: "Iniciaram o Bot", count: 3240, icon: Zap },
  { id: "msg", label: "Receberam Mensagem", count: 2890, icon: MessageSquare },
  { id: "pay", label: "Chegaram ao Pagamento", count: 1450, icon: CreditCard },
  { id: "sub", label: "Assinaram", count: 812, icon: CheckCircle2 },
]

const mockUsers = [
  { id: "u1", nome: "Carlos M.", telegram: "@carlosm", assinante: true, diasRestantes: 24, plano: "Mensal", iniciadoEm: "2025-12-01", ultimaAtividade: "Hoje", etapa: 4 },
  { id: "u2", nome: "Ana P.", telegram: "@anap", assinante: true, diasRestantes: 12, plano: "Mensal", iniciadoEm: "2025-12-05", ultimaAtividade: "Hoje", etapa: 4 },
  { id: "u3", nome: "Lucas S.", telegram: "@lucass", assinante: false, diasRestantes: 0, plano: null, iniciadoEm: "2026-01-10", ultimaAtividade: "Ha 2 dias", etapa: 2 },
  { id: "u4", nome: "Maria R.", telegram: "@mariar", assinante: true, diasRestantes: 3, plano: "Trimestral", iniciadoEm: "2025-09-15", ultimaAtividade: "Ontem", etapa: 4 },
  { id: "u5", nome: "Pedro L.", telegram: "@pedrol", assinante: false, diasRestantes: 0, plano: null, iniciadoEm: "2026-02-01", ultimaAtividade: "Ha 5 dias", etapa: 1 },
  { id: "u6", nome: "Julia F.", telegram: "@juliaf", assinante: false, diasRestantes: 0, plano: null, iniciadoEm: "2026-02-10", ultimaAtividade: "Ha 1 dia", etapa: 3 },
  { id: "u7", nome: "Rafael G.", telegram: "@rafaelg", assinante: true, diasRestantes: 30, plano: "Mensal", iniciadoEm: "2026-02-15", ultimaAtividade: "Hoje", etapa: 4 },
  { id: "u8", nome: "Fernanda C.", telegram: "@fernandac", assinante: false, diasRestantes: 0, plano: null, iniciadoEm: "2026-02-18", ultimaAtividade: "Hoje", etapa: 2 },
  { id: "u9", nome: "Diego A.", telegram: "@diegoa", assinante: true, diasRestantes: 7, plano: "Mensal", iniciadoEm: "2026-01-20", ultimaAtividade: "Ontem", etapa: 4 },
  { id: "u10", nome: "Camila B.", telegram: "@camilab", assinante: false, diasRestantes: 0, plano: null, iniciadoEm: "2026-02-19", ultimaAtividade: "Hoje", etapa: 1 },
]

type FilterType = "todos" | "assinantes" | "nao_assinantes" | "expirando"

function KPICard({ icon: Icon, label, value, delta, deltaLabel, iconBg, iconColor }: {
  icon: React.ElementType; label: string; value: string; delta?: number; deltaLabel?: string;
  iconBg: string; iconColor: string;
}) {
  return (
    <Card className="bg-card border-border rounded-2xl overflow-hidden relative group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            <span className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{value}</span>
            {delta !== undefined && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center gap-0.5 rounded-md bg-success/10 px-1.5 py-0.5">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-[11px] font-semibold text-success">{'+' + delta + '%'}</span>
                </div>
                {deltaLabel && <span className="text-[11px] text-muted-foreground">{deltaLabel}</span>}
              </div>
            )}
          </div>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FunnelVisual() {
  const maxCount = funnel[0].count
  const stepColors = [
    "from-accent/80 to-accent/40",
    "from-chart-2/80 to-chart-2/40",
    "from-warning/80 to-warning/40",
    "from-success/80 to-success/40",
  ]
  const dotColors = ["bg-accent", "bg-chart-2", "bg-warning", "bg-success"]

  return (
    <Card className="bg-card border-border rounded-2xl">
      <CardContent className="p-5 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Funil de Conversao</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Acompanhe onde seus usuarios estao parando</p>
          </div>
          <Badge variant="outline" className="border-accent/30 text-accent bg-accent/5 rounded-lg text-[11px]">
            {'Taxa: ' + ((funnel[funnel.length - 1].count / funnel[0].count) * 100).toFixed(1) + '%'}
          </Badge>
        </div>

        <div className="flex flex-col gap-0">
          {funnel.map((step, i) => {
            const pct = (step.count / maxCount) * 100
            const drop = i > 0 ? ((funnel[i - 1].count - step.count) / funnel[i - 1].count * 100).toFixed(1) : null
            const Icon = step.icon

            return (
              <div key={step.id}>
                <div className="flex items-center gap-4">
                  {/* Left: Icon + step number */}
                  <div className="flex flex-col items-center gap-0 shrink-0 w-10">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${dotColors[i]}/15`}>
                      <Icon className={`h-4 w-4 ${dotColors[i].replace("bg-", "text-")}`} />
                    </div>
                  </div>

                  {/* Right: Info + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{step.label}</span>
                      <div className="flex items-center gap-2">
                        {drop && (
                          <span className="text-[11px] font-medium text-destructive/80">{'-' + drop + '%'}</span>
                        )}
                        <span className="text-sm font-bold text-foreground tabular-nums">
                          {step.count.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-secondary/80 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${stepColors[i]} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Connector line */}
                {i < funnel.length - 1 && (
                  <div className="flex items-center gap-4 py-1">
                    <div className="w-10 flex justify-center">
                      <div className="w-px h-4 bg-border" />
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <ArrowDown className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground">
                        {(funnel[i].count - funnel[i + 1].count).toLocaleString("pt-BR") + ' desistiram'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function UserDetailDrawer({ user, onClose }: {
  user: typeof mockUsers[0]; onClose: () => void;
}) {
  const etapaLabels = ["", "Iniciou bot", "Viu mensagem", "Pagamento", "Assinante"]
  const etapaColors = ["", "text-muted-foreground", "text-chart-2", "text-warning", "text-success"]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent text-lg font-bold">
              {user.nome.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{user.nome}</h3>
              <p className="text-sm text-muted-foreground">{user.telegram}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Status badge */}
        <div className="mb-6">
          <Badge
            variant="outline"
            className={`rounded-lg px-3 py-1 text-xs font-semibold ${
              user.assinante
                ? "bg-success/10 text-success border-success/20"
                : "bg-secondary text-muted-foreground border-border"
            }`}
          >
            {user.assinante ? "Assinante Ativo" : "Nao Assinante"}
          </Badge>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Inicio</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {new Date(user.iniciadoEm).toLocaleDateString("pt-BR")}
            </span>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Atividade</span>
            </div>
            <span className="text-sm font-medium text-foreground">{user.ultimaAtividade}</span>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Crown className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Plano</span>
            </div>
            <span className="text-sm font-medium text-foreground">{user.plano || "Nenhum"}</span>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Expira em</span>
            </div>
            <span className={`text-sm font-medium ${
              user.diasRestantes <= 7 && user.diasRestantes > 0 ? "text-destructive" :
              user.diasRestantes <= 14 && user.diasRestantes > 0 ? "text-warning" : "text-foreground"
            }`}>
              {user.assinante ? user.diasRestantes + " dias" : "--"}
            </span>
          </div>
        </div>

        {/* Funnel position */}
        <div className="bg-secondary/50 rounded-xl p-4">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Posicao no Funil</span>
          <div className="flex items-center gap-2 mt-3">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className={`h-2 flex-1 rounded-full transition-colors ${
                  step <= user.etapa ? "bg-accent" : "bg-secondary"
                }`} />
              </div>
            ))}
          </div>
          <p className={`text-sm font-medium mt-2 ${etapaColors[user.etapa]}`}>
            {etapaLabels[user.etapa]}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { selectedBot } = useBots()
  const [busca, setBusca] = useState("")
  const [filtro, setFiltro] = useState<FilterType>("todos")
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null)

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Usuarios" />
        <NoBotSelected />
      </>
    )
  }

  const assinantes = mockUsers.filter((u) => u.assinante)
  const naoAssinantes = mockUsers.filter((u) => !u.assinante)
  const expirando = assinantes.filter((u) => u.diasRestantes <= 7)

  const filtrados = mockUsers.filter((u) => {
    const matchBusca =
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.telegram.toLowerCase().includes(busca.toLowerCase())
    if (!matchBusca) return false
    switch (filtro) {
      case "assinantes": return u.assinante
      case "nao_assinantes": return !u.assinante
      case "expirando": return u.assinante && u.diasRestantes <= 7
      default: return true
    }
  })

  const filterTabs = [
    { key: "todos" as FilterType, label: "Todos", count: mockUsers.length },
    { key: "assinantes" as FilterType, label: "Assinantes", count: assinantes.length },
    { key: "nao_assinantes" as FilterType, label: "Gratuitos", count: naoAssinantes.length },
    { key: "expirando" as FilterType, label: "Expirando", count: expirando.length },
  ]

  return (
    <>
      <DashboardHeader title="Usuarios" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">

          {/* KPI Cards */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <KPICard
              icon={Users} label="Total Usuarios" value={kpis.totalUsuarios.toLocaleString("pt-BR")}
              delta={kpis.totalUsuariosDelta} deltaLabel="esta semana"
              iconBg="bg-accent/10" iconColor="text-accent"
            />
            <KPICard
              icon={Crown} label="Assinantes" value={kpis.assinantes.toLocaleString("pt-BR")}
              delta={kpis.assinantesDelta} deltaLabel="esta semana"
              iconBg="bg-success/10" iconColor="text-success"
            />
            <KPICard
              icon={Clock} label="Expirando em 7d" value={kpis.expirando7d.toString()}
              iconBg="bg-warning/10" iconColor="text-warning"
            />
            <KPICard
              icon={TrendingUp} label="Conversao" value={kpis.taxaConversao + '%'}
              delta={kpis.taxaConversaoDelta} deltaLabel="vs mes anterior"
              iconBg="bg-chart-2/10" iconColor="text-chart-2"
            />
          </div>

          {/* Funnel */}
          <FunnelVisual />

          {/* Users Table */}
          <Card className="bg-card border-border rounded-2xl">
            <CardContent className="p-5 md:p-6">
              {/* Header */}
              <div className="flex flex-col gap-4 mb-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-foreground">Gerenciamento de Usuarios</h3>
                  <p className="text-xs text-muted-foreground">Visualize e gerencie todos os usuarios do seu bot</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Filters */}
                  <div className="flex gap-1.5 flex-wrap">
                    {filterTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setFiltro(tab.key)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          filtro === tab.key
                            ? "bg-accent/15 text-accent shadow-sm"
                            : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        {tab.label}
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                          filtro === tab.key ? "bg-accent/20 text-accent" : "bg-background/50 text-muted-foreground"
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full sm:w-56 bg-secondary/60 pl-9 border-border rounded-lg h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* User cards list */}
              <div className="flex flex-col gap-2">
                {filtrados.map((user) => {
                  const etapaLabels = ["", "Iniciou bot", "Viu mensagem", "Pagamento", "Assinante"]
                  return (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-3 md:gap-4 w-full rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-transparent hover:border-border p-3 md:p-4 transition-all text-left group"
                    >
                      {/* Avatar */}
                      <div className={`flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        user.assinante ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"
                      }`}>
                        {user.nome.charAt(0)}
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">{user.nome}</span>
                          <span className="text-xs text-muted-foreground hidden sm:inline">{user.telegram}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">{etapaLabels[user.etapa]}</span>
                          {user.assinante && user.diasRestantes <= 7 && (
                            <Badge variant="outline" className="rounded-md border-destructive/30 text-destructive bg-destructive/5 text-[9px] px-1.5 py-0">
                              {'Expira em ' + user.diasRestantes + 'd'}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Status */}
                        <Badge
                          variant="outline"
                          className={`rounded-lg text-[10px] font-semibold hidden sm:flex ${
                            user.assinante
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-secondary text-muted-foreground border-border"
                          }`}
                        >
                          {user.assinante ? "Assinante" : "Gratuito"}
                        </Badge>

                        {/* Dias bar (only subscribers) */}
                        {user.assinante && (
                          <div className="items-center gap-2 hidden md:flex">
                            <div className="h-1.5 w-14 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  user.diasRestantes <= 7 ? "bg-destructive" :
                                  user.diasRestantes <= 14 ? "bg-warning" : "bg-success"
                                }`}
                                style={{ width: `${Math.min((user.diasRestantes / 30) * 100, 100)}%` }}
                              />
                            </div>
                            <span className={`text-[11px] font-medium tabular-nums w-6 text-right ${
                              user.diasRestantes <= 7 ? "text-destructive" :
                              user.diasRestantes <= 14 ? "text-warning" : "text-muted-foreground"
                            }`}>
                              {user.diasRestantes + 'd'}
                            </span>
                          </div>
                        )}

                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    </button>
                  )
                })}

                {filtrados.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary mb-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Nenhum usuario encontrado</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Tente ajustar os filtros ou busca</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* User detail drawer */}
      {selectedUser && (
        <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </>
  )
}
