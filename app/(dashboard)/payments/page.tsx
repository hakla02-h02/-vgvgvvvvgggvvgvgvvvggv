"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import {
  CheckCircle, Clock, XCircle, Search, Download, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Wallet, Receipt, TrendingUp, ArrowRight, Calendar, CreditCard, RefreshCw, Eye, Banknote, PiggyBank,
  ChevronRight, Sparkles, Filter, BarChart3,
} from "lucide-react"
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const vendas = [
  { id: "PIX-2847", user: "Carlos M.", avatar: "CM", valor: "R$ 197", valorNum: 197, status: "aprovada", hora: "14:23", plano: "Mensal", metodo: "PIX" },
  { id: "PIX-2846", user: "Ana P.", avatar: "AP", valor: "R$ 497", valorNum: 497, status: "aprovada", hora: "14:18", plano: "Anual", metodo: "PIX" },
  { id: "PIX-2845", user: "Lucas S.", avatar: "LS", valor: "R$ 97", valorNum: 97, status: "pendente", hora: "14:10", plano: "Semanal", metodo: "PIX" },
  { id: "PIX-2844", user: "Maria R.", avatar: "MR", valor: "R$ 297", valorNum: 297, status: "aprovada", hora: "13:55", plano: "Trimestral", metodo: "Cartao" },
  { id: "PIX-2843", user: "Pedro L.", avatar: "PL", valor: "R$ 47", valorNum: 47, status: "expirada", hora: "13:40", plano: "Semanal", metodo: "PIX" },
  { id: "PIX-2842", user: "Julia F.", avatar: "JF", valor: "R$ 197", valorNum: 197, status: "aprovada", hora: "13:32", plano: "Mensal", metodo: "PIX" },
  { id: "PIX-2841", user: "Rafael G.", avatar: "RG", valor: "R$ 497", valorNum: 497, status: "aprovada", hora: "13:20", plano: "Anual", metodo: "Cartao" },
  { id: "PIX-2840", user: "Camila T.", avatar: "CT", valor: "R$ 97", valorNum: 97, status: "cancelada", hora: "13:10", plano: "Semanal", metodo: "PIX" },
]

const receitaData = [
  { dia: "Seg", valor: 2400 },
  { dia: "Ter", valor: 1398 },
  { dia: "Qua", valor: 4800 },
  { dia: "Qui", valor: 3908 },
  { dia: "Sex", valor: 4800 },
  { dia: "Sab", valor: 3800 },
  { dia: "Dom", valor: 4300 },
]

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  aprovada: { bg: "bg-[#22c55e]/10", text: "text-[#22c55e]", icon: CheckCircle, label: "Aprovada" },
  pendente: { bg: "bg-amber-500/10", text: "text-amber-500", icon: Clock, label: "Pendente" },
  expirada: { bg: "bg-muted", text: "text-muted-foreground", icon: XCircle, label: "Expirada" },
  cancelada: { bg: "bg-red-500/10", text: "text-red-500", icon: XCircle, label: "Cancelada" },
}

export default function PaymentsPage() {
  const { selectedBot } = useBots()
  const [filtro, setFiltro] = useState("todos")
  const [busca, setBusca] = useState("")

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Financeiro" />
        <NoBotSelected />
      </>
    )
  }

  const filtradas = vendas.filter((v) => {
    const matchFiltro = filtro === "todos" || v.status === filtro
    const matchBusca =
      v.user.toLowerCase().includes(busca.toLowerCase()) ||
      v.id.toLowerCase().includes(busca.toLowerCase())
    return matchFiltro && matchBusca
  })

  const totalAprovado = vendas.filter(v => v.status === "aprovada").reduce((acc, v) => acc + v.valorNum, 0)
  const totalPendente = vendas.filter(v => v.status === "pendente").reduce((acc, v) => acc + v.valorNum, 0)
  const ticketMedio = Math.round(totalAprovado / vendas.filter(v => v.status === "aprovada").length)

  return (
    <>
      <DashboardHeader title="Financeiro" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-4 md:p-6">
          
          {/* Hero Finance Card - Totalmente Novo */}
          <div className="bg-[#111] rounded-[28px] p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#a3e635] opacity-[0.08] blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#22c55e] opacity-[0.05] blur-[80px] rounded-full" />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#a3e635]/20 flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-[#a3e635]" />
                    </div>
                    <span className="text-sm text-muted-foreground">Saldo Disponivel</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                      R$ {totalAprovado.toLocaleString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-1 text-[#22c55e] text-sm font-medium bg-[#22c55e]/10 px-2 py-1 rounded-full">
                      <ArrowUpRight className="h-3 w-3" />
                      +18.2%
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-[#a3e635] text-[#111] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#bef264] transition-colors">
                  <Banknote className="h-4 w-4" />
                  Sacar
                </button>
              </div>

              {/* Mini Chart */}
              <div className="h-[100px] -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={receitaData}>
                    <defs>
                      <linearGradient id="financeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a3e635" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#a3e635" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="#a3e635"
                      strokeWidth={2}
                      fill="url(#financeGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pendente</p>
                  <p className="text-lg font-bold text-amber-400">R$ {totalPendente}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ticket Medio</p>
                  <p className="text-lg font-bold text-white">R$ {ticketMedio}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Taxa Conv.</p>
                  <p className="text-lg font-bold text-[#a3e635]">87.5%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - Novo Layout */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Receita Hoje */}
            <div className="bg-card rounded-[24px] p-5 border border-border relative overflow-hidden group hover:border-[#a3e635]/30 transition-colors">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#a3e635] opacity-0 group-hover:opacity-5 blur-[40px] rounded-full transition-opacity" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#a3e635]/10 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-[#65a30d]" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-[#22c55e]">
                  <ArrowUpRight className="h-3 w-3" />
                  32%
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">R$ 1.847</p>
              <p className="text-xs text-muted-foreground mt-1">Receita Hoje</p>
            </div>

            {/* Transacoes */}
            <div className="bg-card rounded-[24px] p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs text-muted-foreground">Hoje</span>
              </div>
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-xs text-muted-foreground mt-1">Transacoes</p>
            </div>

            {/* Reembolsos */}
            <div className="bg-card rounded-[24px] p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-red-500" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                  <ArrowDownRight className="h-3 w-3" />
                  2
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">R$ 97</p>
              <p className="text-xs text-muted-foreground mt-1">Reembolsos</p>
            </div>

            {/* Projecao */}
            <div className="bg-[#a3e635] rounded-[24px] p-5 relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-card opacity-10 blur-[30px] rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#111]/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[#111]" />
                  </div>
                  <Sparkles className="h-4 w-4 text-[#111]/60" />
                </div>
                <p className="text-2xl font-bold text-[#111]">R$ 12.4K</p>
                <p className="text-xs text-[#111]/70 mt-1">Projecao Mensal</p>
              </div>
            </div>
          </div>

          {/* Quick Actions + Metodos de Pagamento */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Metodos */}
            <div className="lg:col-span-2 bg-card rounded-[24px] p-6 border border-border">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-foreground">Metodos de Pagamento</h3>
                <button className="text-xs text-muted-foreground hover:text-[#65a30d] font-medium transition-colors">Ver relatorio</button>
              </div>
              <div className="space-y-4">
                {[
                  { metodo: "PIX", valor: "R$ 1.432", percent: 78, icon: Banknote, cor: "#22c55e" },
                  { metodo: "Cartao de Credito", valor: "R$ 312", percent: 17, icon: CreditCard, cor: "#3b82f6" },
                  { metodo: "Boleto", valor: "R$ 97", percent: 5, icon: Receipt, cor: "#f59e0b" },
                ].map((item) => (
                  <div key={item.metodo} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.cor}15` }}>
                      <item.icon className="h-5 w-5" style={{ color: item.cor }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-foreground">{item.metodo}</span>
                        <span className="text-sm font-semibold text-foreground">{item.valor}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.percent}%`, backgroundColor: item.cor }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acoes Rapidas */}
            <div className="bg-[#111] rounded-[24px] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#a3e635] opacity-[0.08] blur-[60px] rounded-full" />
              <div className="relative z-10">
                <h3 className="font-bold text-white mb-5">Acoes Rapidas</h3>
                <div className="space-y-3">
                  {[
                    { label: "Gerar Relatorio", icon: BarChart3 },
                    { label: "Exportar CSV", icon: Download },
                    { label: "Ver Calendario", icon: Calendar },
                  ].map((acao) => (
                    <button
                      key={acao.label}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-card/5 hover:bg-card/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <acao.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-gray-300">{acao.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-[#a3e635] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "todos", label: "Todas", count: vendas.length },
              { key: "aprovada", label: "Aprovadas", count: vendas.filter(v => v.status === "aprovada").length },
              { key: "pendente", label: "Pendentes", count: vendas.filter(v => v.status === "pendente").length },
              { key: "expirada", label: "Expiradas", count: vendas.filter(v => v.status === "expirada").length },
              { key: "cancelada", label: "Canceladas", count: vendas.filter(v => v.status === "cancelada").length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFiltro(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filtro === tab.key 
                    ? "bg-[#111] text-white shadow-lg shadow-black/10" 
                    : "bg-card text-gray-600 hover:bg-muted border border-border"
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                  filtro === tab.key ? "bg-card/20 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Transactions List - Novo Design */}
          <div className="bg-card rounded-[24px] border border-border overflow-hidden">
            {/* Header */}
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Transacoes Recentes</h3>
                  <p className="text-xs text-muted-foreground">Ultimas 24 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="bg-muted pl-9 border-0 rounded-xl text-sm"
                  />
                </div>
                <button className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                  <Filter className="h-4 w-4" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111] text-white text-sm font-medium hover:bg-gray-800 transition-colors">
                  <Download className="h-4 w-4" />
                  Exportar
                </button>
              </div>
            </div>

            {/* Transaction Items */}
            <div className="divide-y divide-gray-50">
              {filtradas.map((v) => {
                const status = statusConfig[v.status]
                const Icon = status.icon
                return (
                  <div key={v.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a3e635]/20 to-[#22c55e]/20 flex items-center justify-center text-sm font-bold text-[#65a30d]">
                      {v.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{v.user}</span>
                        <span className="text-xs text-muted-foreground font-mono">{v.id}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground">{v.plano}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-xs text-muted-foreground">{v.metodo}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-xs text-muted-foreground">{v.hora}</span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="font-bold text-foreground">{v.valor}</p>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bg} mt-1`}>
                        <Icon className={`h-3 w-3 ${status.text}`} />
                        <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <button className="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/50">
              <p className="text-sm text-muted-foreground">Mostrando {filtradas.length} de {vendas.length}</p>
              <button className="flex items-center gap-2 text-sm font-medium text-[#65a30d] hover:text-[#4d7c0f] transition-colors">
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
