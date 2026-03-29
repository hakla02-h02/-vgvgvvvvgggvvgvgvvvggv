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
  User,
  CreditCard,
  Calendar,
  X
} from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

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
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [copied, setCopied] = useState(false)
  const supabase = getSupabase()

  useEffect(() => {
    if (user) {
      fetchPayments()
    }
  }, [user])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("id, bot_id, telegram_user_id, telegram_username, telegram_first_name, telegram_last_name, gateway, external_payment_id, amount, description, status, created_at, updated_at, bots(name, username)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (!error) {
        setPayments(data || [])
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
    return "Usuario"
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const matchesTab = activeTab === "all" || p.status === activeTab
    const matchesSearch = searchQuery === "" || 
      getUserName(p).toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.telegram_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.external_payment_id?.includes(searchQuery)
    return matchesTab && matchesSearch
  })

  // Stats
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
      <header className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-[#2a2a2e]">
        <div>
          <h1 className="text-xl font-bold text-white">Vendas</h1>
          <p className="text-sm text-gray-400">Acompanhe suas vendas e transacoes</p>
        </div>
        <button 
          onClick={fetchPayments}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a2a2e] text-gray-300 text-sm font-medium hover:bg-[#3a3a3e] transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Stats Cards - 3 blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Faturamento */}
          <div className="bg-[#1c1c1e] border border-[#2a2a2e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Faturamento</span>
              <div className="w-8 h-8 rounded-lg bg-[#bfff00]/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-[#bfff00]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#bfff00]">{formatCurrency(stats.faturamento)}</p>
            <p className="text-xs text-gray-500 mt-1">vendas aprovadas</p>
          </div>

          {/* Total de Vendas */}
          <div className="bg-[#1c1c1e] border border-[#2a2a2e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Total de Vendas</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">transacoes totais</p>
          </div>

          {/* Pendentes */}
          <div className="bg-[#1c1c1e] border border-[#2a2a2e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Pendentes</span>
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{formatCurrency(stats.pendentes)}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.pendentesCount} aguardando</p>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nome, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-[#1c1c1e] border border-[#2a2a2e] rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#bfff00]/50"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#1c1c1e] border border-[#2a2a2e] rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#2a2a2e] flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-base font-medium text-white">Nenhuma venda encontrada</h3>
              <p className="text-sm text-gray-500 mt-1">As vendas aparecerao aqui</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <button
                key={payment.id}
                onClick={() => setSelectedPayment(payment)}
                className="w-full flex items-center gap-4 p-4 bg-[#1c1c1e] border border-[#2a2a2e] rounded-xl hover:border-[#3a3a3e] transition-colors text-left"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-[#bfff00]/10 flex items-center justify-center text-[#bfff00] font-semibold text-sm shrink-0">
                  {payment.telegram_first_name?.charAt(0).toUpperCase() || "?"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{getUserName(payment)}</span>
                    {payment.telegram_username && (
                      <span className="text-xs text-gray-500">@{payment.telegram_username}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{payment.description || "Pagamento"}</span>
                    <span>•</span>
                    <span>{formatDate(payment.created_at)}</span>
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="text-right shrink-0">
                  <p className={`font-bold ${
                    payment.status === "approved" ? "text-[#bfff00]" : 
                    payment.status === "pending" ? "text-yellow-400" : 
                    "text-gray-400"
                  }`}>
                    {formatCurrency(Number(payment.amount))}
                  </p>
                  <Badge className={`text-[10px] px-1.5 py-0.5 ${
                    payment.status === "approved" ? "bg-[#bfff00]/10 text-[#bfff00] border-[#bfff00]/20" :
                    payment.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                    "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {payment.status === "approved" ? "Aprovada" : payment.status === "pending" ? "Pendente" : "Rejeitada"}
                  </Badge>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Payment Details Dialog - Dark theme */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-[380px] bg-[#1c1c1e] border-[#2a2a2e] p-0 gap-0 overflow-hidden rounded-[20px] [&>button]:text-gray-400 [&>button]:hover:text-white">
          {selectedPayment && (
            <div className="p-5">
              {/* Header with user info */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#bfff00]/10 flex items-center justify-center text-[#bfff00] font-bold text-lg">
                  {selectedPayment.telegram_first_name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{getUserName(selectedPayment)}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {selectedPayment.telegram_username && (
                      <span>@{selectedPayment.telegram_username}</span>
                    )}
                    <span>•</span>
                    <span>ID: {selectedPayment.telegram_user_id}</span>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedPayment.telegram_user_id || "")}
                  className="w-8 h-8 rounded-lg bg-[#2a2a2e] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-[#bfff00]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Status Badge */}
              <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl mb-4 ${
                selectedPayment.status === "approved" ? "bg-[#bfff00]/10" :
                selectedPayment.status === "pending" ? "bg-yellow-500/10" :
                "bg-red-500/10"
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  selectedPayment.status === "approved" ? "bg-[#bfff00]" :
                  selectedPayment.status === "pending" ? "bg-yellow-400" :
                  "bg-red-400"
                }`} />
                <span className={`text-sm font-medium ${
                  selectedPayment.status === "approved" ? "text-[#bfff00]" :
                  selectedPayment.status === "pending" ? "text-yellow-400" :
                  "text-red-400"
                }`}>
                  {selectedPayment.status === "approved" ? "Pagamento Aprovado" : 
                   selectedPayment.status === "pending" ? "Aguardando Pagamento" : "Pagamento Rejeitado"}
                </span>
              </div>

              {/* Amount */}
              <div className="bg-[#2a2a2e] rounded-xl p-4 mb-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Valor</p>
                <p className={`text-3xl font-bold ${
                  selectedPayment.status === "approved" ? "text-[#bfff00]" : "text-white"
                }`}>
                  {formatCurrency(Number(selectedPayment.amount))}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#2a2a2e] rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Metodo</p>
                  <p className="text-sm font-medium text-white">PIX</p>
                </div>
                <div className="bg-[#2a2a2e] rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Gateway</p>
                  <p className="text-sm font-medium text-white capitalize">{selectedPayment.gateway}</p>
                </div>
              </div>

              {/* Product */}
              <div className="bg-[#2a2a2e] rounded-xl p-3 mb-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Produto</p>
                <p className="text-sm font-medium text-white">{selectedPayment.description || "Pagamento"}</p>
              </div>

              {/* Payment ID */}
              <div className="bg-[#2a2a2e] rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">ID do Pagamento</p>
                    <p className="text-sm font-mono text-white">{selectedPayment.external_payment_id}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedPayment.external_payment_id)}
                    className="w-8 h-8 rounded-lg bg-[#3a3a3e] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#2a2a2e] rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Criado</p>
                  <p className="text-xs text-white">{formatDate(selectedPayment.created_at)}</p>
                </div>
                <div className="bg-[#2a2a2e] rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Atualizado</p>
                  <p className="text-xs text-white">{formatDate(selectedPayment.updated_at)}</p>
                </div>
              </div>

              {/* Bot */}
              <div className="bg-[#2a2a2e] rounded-xl p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Bot</p>
                <p className="text-sm font-medium text-white">{selectedPayment.bots?.name || "Bot"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
