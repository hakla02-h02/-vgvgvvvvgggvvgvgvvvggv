"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { 
  DollarSign, 
  Clock, 
  TrendingUp,
  RefreshCw,
  Search,
  Copy,
  Check,
  CreditCard,
  X
} from "lucide-react"

interface Payment {
  id: string
  bot_id: string
  telegram_user_id: string
  telegram_username: string | null
  telegram_first_name: string | null
  telegram_last_name: string | null
  gateway: string
  external_payment_id: string
  amount: number
  description: string
  status: string
  created_at: string
  updated_at: string
  bots?: {
    name: string
    username: string
  }
}

export default function VendasPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/payments/list", { credentials: "include" })
      const data = await res.json()
      if (data.payments) {
        setPayments(data.payments)
      }
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getUserName = (payment: Payment) => {
    if (payment.telegram_first_name) {
      return payment.telegram_last_name 
        ? `${payment.telegram_first_name} ${payment.telegram_last_name}`
        : payment.telegram_first_name
    }
    return payment.bots?.name || "Usuario"
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredPayments = payments.filter((p) => {
    const matchesTab = activeTab === "all" || p.status === activeTab
    const matchesSearch = searchQuery === "" || 
      getUserName(p).toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.telegram_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.external_payment_id?.includes(searchQuery)
    return matchesTab && matchesSearch
  })

  const stats = {
    faturamento: payments.filter((p) => p.status === "approved").reduce((acc, p) => acc + Number(p.amount), 0),
    total: payments.length,
    pendentes: payments.filter((p) => p.status === "pending").reduce((acc, p) => acc + Number(p.amount), 0),
    pendentesCount: payments.filter((p) => p.status === "pending").length,
  }

  const tabs = [
    { id: "all", label: "Todas", count: payments.length },
    { id: "approved", label: "Aprovadas", count: payments.filter(p => p.status === "approved").length },
    { id: "pending", label: "Pendentes", count: stats.pendentesCount },
    { id: "rejected", label: "Rejeitadas", count: payments.filter(p => p.status === "rejected").length },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <header className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Vendas</h1>
          <p className="text-sm text-muted-foreground">Acompanhe suas vendas e transacoes</p>
        </div>
        <button 
          onClick={fetchPayments}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a2a2e] text-gray-300 text-sm font-medium hover:bg-[#3a3a3e] transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 space-y-5">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1c1c1e] border border-[#2a2a2e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Faturamento</span>
              <div className="w-8 h-8 rounded-xl bg-[#bfff00]/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-[#bfff00]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#bfff00]">{formatCurrency(stats.faturamento)}</p>
            <p className="text-xs text-gray-500 mt-1">vendas aprovadas</p>
          </div>

          <div className="bg-[#1c1c1e] border border-[#2a2a2e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total de Vendas</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">transacoes totais</p>
          </div>

          <div className="bg-[#1c1c1e] border border-[#2a2a2e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pendentes</span>
              <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{formatCurrency(stats.pendentes)}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.pendentesCount} aguardando</p>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nome, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-[#1c1c1e] border border-[#2a2a2e] rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#bfff00]/50"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#1c1c1e] border border-[#2a2a2e] rounded-xl overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#bfff00] text-[#1c1c1e]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Payments List */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#2a2a2e] flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-base font-semibold text-white">Nenhuma venda encontrada</h3>
              <p className="text-sm text-gray-500 mt-1">As vendas aparecerao aqui</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <button
                key={payment.id}
                onClick={() => setSelectedPayment(payment)}
                className="w-full flex items-center gap-4 p-4 bg-[#1c1c1e] border border-[#2a2a2e] rounded-2xl hover:border-[#3a3a3e] transition-all text-left group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#bfff00]/10 flex items-center justify-center text-[#bfff00] font-bold text-sm shrink-0 border border-[#bfff00]/20">
                  {payment.telegram_first_name?.charAt(0).toUpperCase() || payment.bots?.name?.charAt(0).toUpperCase() || "?"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">{getUserName(payment)}</span>
                    {payment.telegram_username && (
                      <span className="text-xs text-gray-500">@{payment.telegram_username}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <span className="truncate">{payment.description || "Pagamento"}</span>
                    <span>•</span>
                    <span className="shrink-0">{formatDate(payment.created_at)}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <p className={`text-base font-bold ${
                    payment.status === "approved" ? "text-[#bfff00]" : 
                    payment.status === "pending" ? "text-yellow-400" : 
                    "text-gray-400"
                  }`}>
                    {formatCurrency(Number(payment.amount))}
                  </p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    payment.status === "approved" ? "bg-[#bfff00]/10 text-[#bfff00]" :
                    payment.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-red-500/10 text-red-400"
                  }`}>
                    {payment.status === "approved" ? "Aprovada" : payment.status === "pending" ? "Pendente" : "Rejeitada"}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Payment Details Dialog - Compact Dark Design */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-[360px] bg-[#1c1c1e] border-[#2a2a2e] p-0 gap-0 overflow-hidden rounded-2xl [&>button]:hidden">
          {selectedPayment && (
            <div className="p-4">
              {/* Close button */}
              <button
                onClick={() => setSelectedPayment(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-[#2a2a2e] flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="h-4 w-4" />
              </button>

              {/* User Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#bfff00]/10 flex items-center justify-center text-[#bfff00] font-bold border border-[#bfff00]/20">
                  {selectedPayment.telegram_first_name?.charAt(0).toUpperCase() || selectedPayment.bots?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate text-sm">{getUserName(selectedPayment)}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedPayment.telegram_username ? `@${selectedPayment.telegram_username} • ` : ""}
                    ID: {selectedPayment.telegram_user_id}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedPayment.telegram_user_id || "")}
                  className="w-8 h-8 rounded-lg bg-[#2a2a2e] flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#bfff00]" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Status */}
              <div className={`flex items-center justify-center gap-2 py-2 rounded-xl mb-4 ${
                selectedPayment.status === "approved" ? "bg-[#bfff00]/10" :
                selectedPayment.status === "pending" ? "bg-yellow-500/10" :
                "bg-red-500/10"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  selectedPayment.status === "approved" ? "bg-[#bfff00]" :
                  selectedPayment.status === "pending" ? "bg-yellow-400" :
                  "bg-red-400"
                }`} />
                <span className={`text-xs font-semibold ${
                  selectedPayment.status === "approved" ? "text-[#bfff00]" :
                  selectedPayment.status === "pending" ? "text-yellow-400" :
                  "text-red-400"
                }`}>
                  {selectedPayment.status === "approved" ? "Pagamento Aprovado" : 
                   selectedPayment.status === "pending" ? "Aguardando Pagamento" : "Rejeitado"}
                </span>
              </div>

              {/* Amount */}
              <div className="bg-[#2a2a2e] rounded-xl p-4 mb-3 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Valor</p>
                <p className={`text-2xl font-bold ${
                  selectedPayment.status === "approved" ? "text-[#bfff00]" : "text-white"
                }`}>
                  {formatCurrency(Number(selectedPayment.amount))}
                </p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#2a2a2e] rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Metodo</p>
                  <p className="text-sm font-medium text-white mt-0.5">PIX</p>
                </div>
                <div className="bg-[#2a2a2e] rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Gateway</p>
                  <p className="text-sm font-medium text-white mt-0.5 capitalize">{selectedPayment.gateway}</p>
                </div>
              </div>

              {/* Product */}
              <div className="bg-[#2a2a2e] rounded-xl p-3 mb-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Produto</p>
                <p className="text-sm font-medium text-white mt-0.5">{selectedPayment.description || "Pagamento"}</p>
              </div>

              {/* Payment ID */}
              <div className="bg-[#2a2a2e] rounded-xl p-3 mb-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">ID Pagamento</p>
                  <p className="text-xs font-mono text-white mt-0.5 truncate">{selectedPayment.external_payment_id}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedPayment.external_payment_id)}
                  className="w-7 h-7 rounded-lg bg-[#3a3a3e] flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0 ml-2"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>

              {/* Dates + Bot */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#2a2a2e] rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Criado</p>
                  <p className="text-[11px] text-white mt-0.5">{new Date(selectedPayment.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="bg-[#2a2a2e] rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Atualizado</p>
                  <p className="text-[11px] text-white mt-0.5">{new Date(selectedPayment.updated_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="bg-[#2a2a2e] rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Bot</p>
                  <p className="text-[11px] text-white mt-0.5 truncate">{selectedPayment.bots?.name || "Bot"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
