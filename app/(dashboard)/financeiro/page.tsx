"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  Users,
  CreditCard
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

interface Payment {
  id: string
  bot_id: string
  telegram_user_id: string
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

export default function FinanceiroPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const supabase = createClient()

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
        .select("*, bots(name, username)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching payments:", error)
      } else {
        setPayments(data || [])
      }
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>
      case "approved":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Aprovado</Badge>
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejeitado</Badge>
      case "refunded":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Reembolsado</Badge>
      case "cancelled":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  // Filter payments by status
  const filteredPayments = payments.filter((p) => {
    if (activeTab === "all") return true
    return p.status === activeTab
  })

  // Calculate stats
  const stats = {
    total: payments.reduce((acc, p) => acc + Number(p.amount), 0),
    approved: payments.filter((p) => p.status === "approved").reduce((acc, p) => acc + Number(p.amount), 0),
    pending: payments.filter((p) => p.status === "pending").reduce((acc, p) => acc + Number(p.amount), 0),
    rejected: payments.filter((p) => p.status === "rejected").length,
    totalCount: payments.length,
    approvedCount: payments.filter((p) => p.status === "approved").length,
    pendingCount: payments.filter((p) => p.status === "pending").length,
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Acompanhe suas vendas e pagamentos</p>
        </div>
        <Button onClick={fetchPayments} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Vendas
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.total)}</div>
            <p className="text-xs text-muted-foreground">{stats.totalCount} transacoes</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aprovados
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{formatCurrency(stats.approved)}</div>
            <p className="text-xs text-muted-foreground">{stats.approvedCount} pagamentos</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{formatCurrency(stats.pending)}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingCount} aguardando</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversao
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalCount > 0 ? Math.round((stats.approvedCount / stats.totalCount) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">aprovados/total</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Historico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                Todos ({payments.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pendentes ({stats.pendingCount})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Aprovados ({stats.approvedCount})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejeitados ({stats.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Nenhum pagamento encontrado</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Os pagamentos aparecerao aqui quando seus clientes fizerem compras
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {payment.description || "Pagamento"}
                            </p>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>ID: {payment.telegram_user_id}</span>
                            <span>•</span>
                            <span>{payment.bots?.name || "Bot"}</span>
                            <span>•</span>
                            <span>{formatDate(payment.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          payment.status === "approved" ? "text-emerald-500" : 
                          payment.status === "pending" ? "text-yellow-500" : 
                          "text-foreground"
                        }`}>
                          {formatCurrency(Number(payment.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {payment.gateway}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
