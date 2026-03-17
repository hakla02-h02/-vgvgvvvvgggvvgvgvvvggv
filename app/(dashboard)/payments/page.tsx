"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

import { useBots } from "@/lib/bot-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"
import {
  CheckCircle, Clock, XCircle, Search, Download, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Wallet, Receipt, TrendingUp, ArrowRight, Calendar, CreditCard, RefreshCw, Eye, Banknote, PiggyBank,
  ChevronRight, Sparkles, Filter, BarChart3, Loader2, AlertCircle, Copy, ExternalLink, User, Package,
} from "lucide-react"
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface Payment {
  id: string
  user_id: string
  bot_id: string | null
  telegram_user_id: string | null
  telegram_user_name: string | null
  telegram_username: string | null
  gateway: string
  external_payment_id: string
  amount: number
  description: string
  product_name: string | null
  product_type: "main_product" | "upsell" | "downsell" | "order_bump" | null
  payment_method: string | null
  qr_code: string | null
  qr_code_url: string | null
  copy_paste: string | null
  status: "pending" | "approved" | "rejected" | "cancelled"
  created_at: string
  updated_at: string
  bots?: {
    id: string
    name: string
  } | null
}

interface PaymentStats {
  total: number
  approved: number
  pending: number
  rejected: number
  cancelled: number
  totalApproved: number
  totalPending: number
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  approved: { bg: "bg-[#22c55e]/10", text: "text-[#22c55e]", icon: CheckCircle, label: "Aprovada" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-500", icon: Clock, label: "Pendente" },
  rejected: { bg: "bg-red-500/10", text: "text-red-500", icon: XCircle, label: "Rejeitada" },
  cancelled: { bg: "bg-muted", text: "text-muted-foreground", icon: XCircle, label: "Cancelada" },
}

const productTypeLabels: Record<string, string> = {
  main_product: "Produto Principal",
  upsell: "Upsell",
  downsell: "Downsell",
  order_bump: "Order Bump",
}

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => res.json())

// Generate mock chart data based on real stats
const generateChartData = (totalApproved: number) => {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"]
  const baseValue = totalApproved / 7
  return days.map((dia) => ({
    dia,
    valor: Math.round(baseValue * (0.5 + Math.random())),
  }))
}

export default function PaymentsPage() {
  const { selectedBot } = useBots()
  const [filtro, setFiltro] = useState("todos")
  const [busca, setBusca] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Fetch payments from API - fetch all if no bot selected, or filter by bot
  const { data, error, isLoading, mutate } = useSWR<{
    payments: Payment[]
    stats: PaymentStats
    total: number
  }>(
    `/api/payments/list?status=${filtro}${selectedBot ? `&botId=${selectedBot.id}` : ""}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  console.log("[v0] API Response:", { data, error, isLoading, url: `/api/payments/list?status=${filtro}${selectedBot ? `&botId=${selectedBot.id}` : ""}` })
  
  const payments = data?.payments || []
  const stats = data?.stats || {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0,
    totalApproved: 0,
    totalPending: 0,
  }

  const receitaData = generateChartData(stats.totalApproved)
  const ticketMedio = stats.approved > 0 ? Math.round(stats.totalApproved / stats.approved) : 0

  // Filter by search
  const filtradas = payments.filter((p) => {
    const searchLower = busca.toLowerCase()
    return (
      (p.telegram_user_name?.toLowerCase().includes(searchLower) || false) ||
      (p.description?.toLowerCase().includes(searchLower) || false) ||
      (p.product_name?.toLowerCase().includes(searchLower) || false) ||
      (p.external_payment_id?.toLowerCase().includes(searchLower) || false)
    )
  })

  // Get user initials from name
  const getInitials = (name: string | null) => {
    if (!name) return "?"
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Format date
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <>
      <DashboardHeader title={selectedBot ? `Financeiro - ${selectedBot.name}` : "Financeiro - Todos os Bots"} />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-4 md:p-6">
          
          {/* Hero Finance Card */}
          <div className="bg-foreground dark:bg-card rounded-[28px] p-6 md:p-8 relative overflow-hidden">
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
                    <span className="text-4xl md:text-5xl font-bold text-background dark:text-foreground tracking-tight">
                      {formatCurrency(stats.totalApproved)}
                    </span>
                    {stats.totalApproved > 0 && (
                      <span className="flex items-center gap-1 text-[#22c55e] text-sm font-medium bg-[#22c55e]/10 px-2 py-1 rounded-full">
                        <ArrowUpRight className="h-3 w-3" />
                        +{stats.approved}
                      </span>
                    )}
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
                  <p className="text-lg font-bold text-amber-400">{formatCurrency(stats.totalPending)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ticket Medio</p>
                  <p className="text-lg font-bold text-background dark:text-foreground">{formatCurrency(ticketMedio)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Taxa Conv.</p>
                  <p className="text-lg font-bold text-[#a3e635]">
                    {stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Receita Hoje */}
            <div className="bg-card rounded-[24px] p-5 border border-border relative overflow-hidden group hover:border-[#a3e635]/30 transition-colors">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#a3e635] opacity-0 group-hover:opacity-5 blur-[40px] rounded-full transition-opacity" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#a3e635]/10 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-[#65a30d]" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-[#22c55e]">
                  <CheckCircle className="h-3 w-3" />
                  {stats.approved}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalApproved)}</p>
              <p className="text-xs text-muted-foreground mt-1">Receita Total</p>
            </div>

            {/* Transacoes */}
            <div className="bg-card rounded-[24px] p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Transacoes</p>
            </div>

            {/* Pendentes */}
            <div className="bg-card rounded-[24px] p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
                  {stats.pending}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalPending)}</p>
              <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
            </div>

            {/* Rejeitadas/Canceladas */}
            <div className="bg-card rounded-[24px] p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                  {stats.rejected + stats.cancelled}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.rejected + stats.cancelled}</p>
              <p className="text-xs text-muted-foreground mt-1">Rejeitadas</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "todos", label: "Todas", count: stats.total },
              { key: "approved", label: "Aprovadas", count: stats.approved },
              { key: "pending", label: "Pendentes", count: stats.pending },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFiltro(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filtro === tab.key 
                    ? "bg-foreground dark:bg-card text-background dark:text-foreground shadow-lg shadow-black/10" 
                    : "bg-card text-gray-600 hover:bg-muted border border-border"
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                  filtro === tab.key ? "bg-card/20 text-background dark:text-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="bg-card rounded-[24px] border border-border overflow-hidden">
            {/* Header */}
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Transacoes Recentes</h3>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "Carregando..." : `${filtradas.length} transacoes`}
                  </p>
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
                <button 
                  onClick={() => mutate()}
                  className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground dark:bg-muted text-background dark:text-foreground text-sm font-medium hover:bg-gray-800 dark:hover:bg-muted/80 transition-colors">
                  <Download className="h-4 w-4" />
                  Exportar
                </button>
              </div>
            </div>

            {/* Transaction Items */}
            <div className="divide-y divide-border">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <p className="text-sm text-muted-foreground">Erro ao carregar transacoes</p>
                </div>
              ) : filtradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Receipt className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Nenhuma transacao encontrada</p>
                </div>
              ) : (
                filtradas.map((payment) => {
                  const status = statusConfig[payment.status] || statusConfig.pending
                  const Icon = status.icon
                  return (
                    <div key={payment.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a3e635]/20 to-[#22c55e]/20 flex items-center justify-center text-sm font-bold text-[#65a30d]">
                        {getInitials(payment.telegram_user_name)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground truncate">
                            {payment.telegram_user_name || "Usuario"}
                          </span>
                          {payment.product_type && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {productTypeLabels[payment.product_type] || payment.product_type}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground truncate">
                            {payment.product_name || payment.description || "Pagamento"}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                          <span className="text-xs text-muted-foreground uppercase">
                            {payment.payment_method || payment.gateway || "PIX"}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                          <span className="text-xs text-muted-foreground">{formatTime(payment.created_at)}</span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className="font-bold text-foreground">{formatCurrency(payment.amount)}</p>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bg} mt-1`}>
                          <Icon className={`h-3 w-3 ${status.text}`} />
                          <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                        </div>
                      </div>

                      {/* Action */}
                      <button 
                        onClick={() => {
                          setSelectedPayment(payment)
                          setShowDetails(true)
                        }}
                        className="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center transition-colors"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/50">
              <p className="text-sm text-muted-foreground">Mostrando {filtradas.length} de {stats.total}</p>
              <button className="flex items-center gap-2 text-sm font-medium text-[#65a30d] hover:text-[#4d7c0f] transition-colors">
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Payment Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Detalhes da Transacao
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="flex flex-col gap-4 py-4">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#a3e635]/20 to-[#22c55e]/20 flex items-center justify-center text-lg font-bold text-[#65a30d]">
                  {getInitials(selectedPayment.telegram_user_name)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{selectedPayment.telegram_user_name || "Usuario"}</p>
                  {selectedPayment.telegram_username && (
                    <p className="text-sm text-[#22c55e]">
                      @{selectedPayment.telegram_username}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    ID: {selectedPayment.telegram_user_id || "N/A"}
                  </p>
                </div>
                {selectedPayment.telegram_user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(selectedPayment.telegram_user_id || "")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig[selectedPayment.status].bg}`}>
                  {(() => {
                    const StatusIcon = statusConfig[selectedPayment.status].icon
                    return <StatusIcon className={`h-3.5 w-3.5 ${statusConfig[selectedPayment.status].text}`} />
                  })()}
                  <span className={`text-sm font-medium ${statusConfig[selectedPayment.status].text}`}>
                    {statusConfig[selectedPayment.status].label}
                  </span>
                </div>
              </div>

              {/* Payment Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Valor</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Metodo</p>
                  <p className="text-lg font-semibold text-foreground uppercase">
                    {selectedPayment.payment_method || selectedPayment.gateway || "PIX"}
                  </p>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Produto</span>
                </div>
                <p className="font-medium text-foreground">{selectedPayment.product_name || selectedPayment.description || "Pagamento"}</p>
                {selectedPayment.product_type && (
                  <Badge variant="outline" className="mt-2">
                    {productTypeLabels[selectedPayment.product_type] || selectedPayment.product_type}
                  </Badge>
                )}
              </div>

              {/* Payment ID */}
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">ID do Pagamento (Gateway)</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-foreground">{selectedPayment.external_payment_id}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(selectedPayment.external_payment_id)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Criado em</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(selectedPayment.created_at)}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(selectedPayment.created_at)}</p>
                </div>
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Atualizado em</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(selectedPayment.updated_at)}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(selectedPayment.updated_at)}</p>
                </div>
              </div>

              {/* Bot Info */}
              {selectedPayment.bots && (
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Bot</p>
                  <p className="text-sm font-medium text-foreground">{selectedPayment.bots.name}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
