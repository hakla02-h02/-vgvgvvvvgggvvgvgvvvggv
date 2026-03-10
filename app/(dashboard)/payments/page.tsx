"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import {
  CheckCircle, Clock, XCircle, Search, Download, DollarSign, TrendingUp, CreditCard, ArrowUpRight, ChevronDown, MoreHorizontal, Eye,
} from "lucide-react"

const vendas = [
  { id: "PIX-2847", user: "Carlos M.", avatar: "CM", valor: "R$ 197", valorNum: 197, status: "aprovada", hora: "14:23", plano: "Mensal" },
  { id: "PIX-2846", user: "Ana P.", avatar: "AP", valor: "R$ 497", valorNum: 497, status: "aprovada", hora: "14:18", plano: "Anual" },
  { id: "PIX-2845", user: "Lucas S.", avatar: "LS", valor: "R$ 97", valorNum: 97, status: "pendente", hora: "14:10", plano: "Semanal" },
  { id: "PIX-2844", user: "Maria R.", avatar: "MR", valor: "R$ 297", valorNum: 297, status: "aprovada", hora: "13:55", plano: "Trimestral" },
  { id: "PIX-2843", user: "Pedro L.", avatar: "PL", valor: "R$ 47", valorNum: 47, status: "expirada", hora: "13:40", plano: "Semanal" },
  { id: "PIX-2842", user: "Julia F.", avatar: "JF", valor: "R$ 197", valorNum: 197, status: "aprovada", hora: "13:32", plano: "Mensal" },
  { id: "PIX-2841", user: "Rafael G.", avatar: "RG", valor: "R$ 497", valorNum: 497, status: "aprovada", hora: "13:20", plano: "Anual" },
  { id: "PIX-2840", user: "Camila T.", avatar: "CT", valor: "R$ 97", valorNum: 97, status: "cancelada", hora: "13:10", plano: "Semanal" },
]

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  aprovada: { bg: "bg-[#22c55e]/10", text: "text-[#22c55e]", icon: CheckCircle, label: "Aprovada" },
  pendente: { bg: "bg-amber-500/10", text: "text-amber-500", icon: Clock, label: "Pendente" },
  expirada: { bg: "bg-gray-100", text: "text-gray-500", icon: XCircle, label: "Expirada" },
  cancelada: { bg: "bg-red-500/10", text: "text-red-500", icon: XCircle, label: "Cancelada" },
}

export default function PaymentsPage() {
  const { selectedBot } = useBots()
  const [filtro, setFiltro] = useState("todos")
  const [busca, setBusca] = useState("")

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Vendas" />
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
  const totalPendente = vendas.filter(v => v.status === "pendente").length
  const totalVendas = vendas.length

  return (
    <>
      <DashboardHeader title="Vendas" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-4 md:p-6">
          
          {/* Stats Cards - Dashboard Style */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {/* Receita Total */}
            <div className="bg-[#111] rounded-[24px] p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#a3e635] opacity-10 blur-[40px] rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#a3e635]/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-[#a3e635]" />
                  </div>
                  <div className="flex items-center gap-1 text-[#22c55e]">
                    <ArrowUpRight className="h-3 w-3" />
                    <span className="text-xs font-medium">+23%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Receita Total</p>
                <p className="text-2xl font-bold text-white mt-0.5">R$ {totalAprovado.toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {/* Vendas Aprovadas */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-[#22c55e]" />
                </div>
              </div>
              <p className="text-xs text-gray-500">Aprovadas</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{vendas.filter(v => v.status === "aprovada").length}</p>
            </div>

            {/* Pendentes */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <p className="text-xs text-gray-500">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalPendente}</p>
            </div>

            {/* Total de Transacoes */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500">Total Transacoes</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalVendas}</p>
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filtro === tab.key 
                    ? "bg-[#111] text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                  filtro === tab.key ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Historico de Transacoes</h3>
                <p className="text-xs text-gray-500 mt-0.5">Todas as vendas do seu bot</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full sm:w-56 bg-gray-50 pl-9 border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200">
                  <Download className="h-4 w-4" />
                  Exportar
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="text-gray-500 text-xs font-medium">Transacao</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium">Cliente</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium">Plano</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium">Valor</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium">Status</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium">Hora</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtradas.map((v) => {
                    const status = statusConfig[v.status]
                    const Icon = status.icon
                    return (
                      <TableRow key={v.id} className="border-gray-100 hover:bg-gray-50/50">
                        <TableCell>
                          <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">{v.id}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#a3e635]/10 flex items-center justify-center text-xs font-semibold text-[#65a30d]">
                              {v.avatar}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{v.user}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{v.plano}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold text-gray-900">{v.valor}</span>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg}`}>
                            <Icon className={`h-3 w-3 ${status.text}`} />
                            <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">{v.hora}</span>
                        </TableCell>
                        <TableCell>
                          <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Mostrando {filtradas.length} de {vendas.length} transacoes</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors">
                  Anterior
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-[#111] text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                  Proximo
                </button>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
