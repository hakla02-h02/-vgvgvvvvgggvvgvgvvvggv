"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { useGateways, AVAILABLE_GATEWAYS } from "@/lib/gateway-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  CreditCard,
  Plus,
  DollarSign,
  ArrowRightLeft,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Package,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Zap,
  TrendingUp,
  Calendar,
  Filter,
  RefreshCw,
  Shield,
  Sparkles
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GatewaysPage() {
  const { selectedBot } = useBots()
  const { gateways, plans, isLoading, connectGateway, disconnectGateway, updateGateway, addPlan, updatePlan, deletePlan } = useGateways()

  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Plans state
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<{ id: string; name: string; price: number; description: string } | null>(null)
  const [planName, setPlanName] = useState("")
  const [planPrice, setPlanPrice] = useState("")
  const [planDescription, setPlanDescription] = useState("")
  const [planError, setPlanError] = useState("")

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Gateways" />
        <NoBotSelected />
      </>
    )
  }

  // Conta gateways conectados
  const connectedGateways = gateways.filter((g) => g.is_active).length

  // Verifica se um gateway esta conectado
  const isGatewayConnected = (gatewayId: string) => {
    return gateways.some((g) => g.gateway_name === gatewayId && g.is_active)
  }

  const getGatewayData = (gatewayId: string) => {
    return gateways.find((g) => g.gateway_name === gatewayId)
  }

  const handleOpenConnect = (gatewayId: string) => {
    setSelectedGatewayId(gatewayId)
    const existing = getGatewayData(gatewayId)
    if (existing) {
      setAccessToken(existing.access_token)
    } else {
      setAccessToken("")
    }
    setError("")
    setSuccess("")
    setConnectDialogOpen(true)
  }

  const handleConnect = async () => {
    if (!selectedGatewayId) return
    if (!accessToken.trim()) {
      setError("Digite o Access Token")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      await connectGateway(selectedGatewayId, accessToken.trim())
      setSuccess("Gateway conectado com sucesso!")
      setTimeout(() => {
        setConnectDialogOpen(false)
        setAccessToken("")
        setSuccess("")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar gateway")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDisconnect = async (gatewayId: string) => {
    const gateway = getGatewayData(gatewayId)
    if (!gateway) return

    try {
      await disconnectGateway(gateway.id)
    } catch (err) {
      console.error("Error disconnecting gateway:", err)
    }
  }

  const handleToggleActive = async (gatewayId: string, isActive: boolean) => {
    const gateway = getGatewayData(gatewayId)
    if (!gateway) return

    try {
      await updateGateway(gateway.id, { is_active: isActive })
    } catch (err) {
      console.error("Error toggling gateway:", err)
    }
  }

  const selectedGatewayInfo = AVAILABLE_GATEWAYS.find((g) => g.id === selectedGatewayId)

  const handleOpenPlanDialog = (plan?: { id: string; name: string; price: number; description: string | null }) => {
    if (plan) {
      setEditingPlan({ ...plan, description: plan.description || "" })
      setPlanName(plan.name)
      setPlanPrice(plan.price.toString())
      setPlanDescription(plan.description || "")
    } else {
      setEditingPlan(null)
      setPlanName("")
      setPlanPrice("")
      setPlanDescription("")
    }
    setPlanError("")
    setPlanDialogOpen(true)
  }

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      setPlanError("Digite o nome do plano")
      return
    }
    const price = parseFloat(planPrice.replace(",", "."))
    if (isNaN(price) || price <= 0) {
      setPlanError("Digite um preco valido")
      return
    }

    setIsSubmitting(true)
    setPlanError("")

    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, {
          name: planName.trim(),
          price,
          description: planDescription.trim() || undefined,
        })
      } else {
        await addPlan({
          name: planName.trim(),
          price,
          description: planDescription.trim() || undefined,
        })
      }
      setPlanDialogOpen(false)
      setPlanName("")
      setPlanPrice("")
      setPlanDescription("")
      setEditingPlan(null)
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Erro ao salvar plano")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePlan = async (id: string) => {
    try {
      await deletePlan(id)
    } catch (err) {
      console.error("Error deleting plan:", err)
    }
  }

  const handleMovePlan = async (id: string, direction: "up" | "down") => {
    console.log("Move plan", id, direction)
  }

  const activePlans = plans.filter((p) => p.is_active)

  return (
    <>
      <DashboardHeader title="Gateways" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f4f5f7] min-h-full">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Central de Pagamentos
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gerencie gateways e planos de cobranca do seu bot
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                <Calendar size={16} />
                Historico
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              <button className="p-2.5 bg-[#111] text-white rounded-xl hover:bg-[#222] transition-all shadow-sm">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Stats Grid - Big Feature Card + Stats */}
          <div className="grid grid-cols-12 gap-5 mb-8">
            
            {/* Main Feature Card */}
            <div className="col-span-12 lg:col-span-8 bg-[#111] rounded-[28px] p-6 md:p-8 text-white relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#a3e635] opacity-[0.07] blur-[100px] rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500 opacity-[0.05] blur-[80px] rounded-full pointer-events-none"></div>
              
              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}></div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#a3e635] animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-400">Status dos Gateways</span>
                    <span className="px-2 py-0.5 bg-[#a3e635]/20 text-[#a3e635] text-xs font-semibold rounded-full">
                      {connectedGateways > 0 ? "ATIVO" : "OFFLINE"}
                    </span>
                  </div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {/* Gateways Conectados */}
                  <div className="bg-[#1c1c1c] rounded-2xl p-4 md:p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#a3e635]/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-[#a3e635]" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Gateways Conectados</p>
                    <p className="text-2xl md:text-3xl font-bold">{connectedGateways}</p>
                  </div>
                  
                  {/* Planos Ativos */}
                  <div className="bg-[#1c1c1c] rounded-2xl p-4 md:p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-purple-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Planos Ativos</p>
                    <p className="text-2xl md:text-3xl font-bold">{activePlans.length}</p>
                  </div>
                  
                  {/* Transacoes */}
                  <div className="bg-[#1c1c1c] rounded-2xl p-4 md:p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <ArrowRightLeft className="h-5 w-5 text-blue-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Transacoes Hoje</p>
                    <p className="text-2xl md:text-3xl font-bold">0</p>
                  </div>
                  
                  {/* Volume */}
                  <div className="bg-[#1c1c1c] rounded-2xl p-4 md:p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Volume Total</p>
                    <p className="text-2xl md:text-3xl font-bold">R$ 0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
              {/* Security Card */}
              <div className="bg-gradient-to-br from-[#f0ffd4] to-[#e8ffc4] rounded-[28px] p-6 border border-[#d9f970]/50 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#4d7c0f]/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-[#4d7c0f]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pagamentos Seguros</h3>
                    <p className="text-xs text-[#4d7c0f]">Criptografia ponta a ponta</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Seus tokens sao armazenados com criptografia AES-256 e nunca sao expostos.
                </p>
              </div>
              
              {/* Integration Status Card */}
              <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-[#a3e635]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Integracoes</h3>
                    <p className="text-xs text-gray-500">PIX instantaneo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${connectedGateways > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                  <span className="text-sm text-gray-600">
                    {connectedGateways > 0 ? 'Pronto para receber' : 'Configure um gateway'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="gateways" className="w-full">
            <TabsList className="bg-white border border-gray-200 p-1.5 rounded-2xl shadow-sm mb-6">
              <TabsTrigger 
                value="gateways" 
                className="data-[state=active]:bg-[#111] data-[state=active]:text-white rounded-xl px-6 py-2.5 text-sm font-medium transition-all"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Gateways
              </TabsTrigger>
              <TabsTrigger 
                value="plans" 
                className="data-[state=active]:bg-[#111] data-[state=active]:text-white rounded-xl px-6 py-2.5 text-sm font-medium transition-all"
              >
                <Package className="h-4 w-4 mr-2" />
                Planos de Cobranca
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gateways" className="mt-0">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Gateways de Pagamento</h2>
                  <p className="text-sm text-gray-500 mt-1">Conecte seus gateways para receber pagamentos PIX</p>
                </div>
              </div>

              {/* Gateway List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12 bg-white rounded-[28px] border border-gray-100">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {AVAILABLE_GATEWAYS.map((gw) => {
                    const isConnected = isGatewayConnected(gw.id)
                    const gatewayData = getGatewayData(gw.id)
                    const isComingSoon = gw.comingSoon

                    return (
                      <div
                        key={gw.id}
                        className={`bg-white rounded-[24px] border transition-all shadow-sm overflow-hidden ${
                          isComingSoon ? "opacity-60 border-gray-100" : "border-gray-100 hover:shadow-md"
                        } ${isConnected ? "ring-2 ring-[#a3e635]/30" : ""}`}
                      >
                        <div className="flex items-center justify-between p-5 md:p-6">
                          <div className="flex items-center gap-4">
                            {/* Gateway Icon */}
                            <div
                              className="flex h-14 w-14 items-center justify-center rounded-2xl"
                              style={{ backgroundColor: `${gw.color}15` }}
                            >
                              <CreditCard
                                className="h-7 w-7"
                                style={{ color: gw.color }}
                              />
                            </div>

                            {/* Gateway Info */}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-bold text-gray-900">
                                  {gw.name}
                                </h3>
                                {isConnected && (
                                  <span className="inline-flex items-center gap-1 bg-[#22c55e]/10 text-[#22c55e] text-xs font-semibold px-2.5 py-1 rounded-full">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Conectado
                                  </span>
                                )}
                                {isComingSoon && (
                                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                                    Em breve
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{gw.description}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            {isConnected && !isComingSoon && (
                              <>
                                <Switch
                                  checked={gatewayData?.is_active ?? false}
                                  onCheckedChange={(checked) => handleToggleActive(gw.id, checked)}
                                />
                                <button
                                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                  onClick={() => handleOpenConnect(gw.id)}
                                >
                                  <Settings className="h-4 w-4 text-gray-600" />
                                </button>
                              </>
                            )}

                            {!isConnected && !isComingSoon && (
                              <button
                                onClick={() => handleOpenConnect(gw.id)}
                                className="bg-[#111] text-white hover:bg-[#222] px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                                Conectar
                              </button>
                            )}

                            {isComingSoon && (
                              <button disabled className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
                                Em breve
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Connected Footer */}
                        {isConnected && gatewayData && (
                          <div className="flex items-center justify-between px-5 md:px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>
                                Conectado em{" "}
                                {new Date(gatewayData.created_at).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            <button
                              className="text-xs text-red-500 hover:text-red-600 hover:underline font-medium flex items-center gap-1.5 transition-colors"
                              onClick={() => handleDisconnect(gw.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Desconectar
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Help Card */}
              <div className="bg-[#111] rounded-[24px] p-6 mt-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 opacity-10 blur-[60px] rounded-full"></div>
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-[#a3e635]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Como obter o Access Token do Mercado Pago?</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Acesse sua conta no Mercado Pago Developers, va em &quot;Suas integracoes&quot; e copie o Access Token de producao.
                    </p>
                    <a
                      href="https://www.mercadopago.com.br/developers/panel/app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[#a3e635] hover:underline mt-3 font-medium"
                    >
                      Acessar Mercado Pago Developers
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans" className="mt-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Planos de Cobranca</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure os planos que serao usados nos fluxos de pagamento</p>
                </div>
                <button
                  onClick={() => handleOpenPlanDialog()}
                  className="bg-[#111] text-white hover:bg-[#222] px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Novo Plano
                </button>
              </div>

              {/* Plans List */}
              {plans.length === 0 ? (
                <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm">
                  <div className="flex flex-col items-center justify-center gap-4 p-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900">Nenhum plano criado</h3>
                      <p className="mt-1 text-sm text-gray-500">Crie seu primeiro plano para usar nos fluxos de cobranca</p>
                    </div>
                    <button
                      onClick={() => handleOpenPlanDialog()}
                      className="bg-[#111] text-white hover:bg-[#222] px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Criar Primeiro Plano
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {plans.map((plan, index) => (
                    <div
                      key={plan.id}
                      className={`bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md ${
                        !plan.is_active ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between p-5 md:p-6">
                        <div className="flex items-center gap-4">
                          {/* Reorder buttons */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30"
                              onClick={() => handleMovePlan(plan.id, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30"
                              onClick={() => handleMovePlan(plan.id, "down")}
                              disabled={index === plans.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Plan Icon */}
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f0ffd4] to-[#e8ffc4] flex items-center justify-center">
                            <Package className="h-7 w-7 text-[#4d7c0f]" />
                          </div>

                          {/* Plan Info */}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-bold text-gray-900">
                                {plan.name}
                              </h3>
                              {!plan.is_active && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                                  Inativo
                                </span>
                              )}
                            </div>
                            {plan.description && (
                              <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#4d7c0f]">
                              R$ {plan.price.toFixed(2).replace(".", ",")}
                            </p>
                          </div>

                          <Switch
                            checked={plan.is_active}
                            onCheckedChange={(checked) => updatePlan(plan.id, { is_active: checked })}
                          />

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                <MoreHorizontal className="h-5 w-5 text-gray-600" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-xl">
                              <DropdownMenuItem
                                className="flex items-center gap-2 rounded-lg"
                                onClick={() => handleOpenPlanDialog(plan)}
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-500 rounded-lg"
                                onClick={() => handleDeletePlan(plan.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="bg-white border-gray-200 sm:max-w-md rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-3">
              {selectedGatewayInfo && (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${selectedGatewayInfo.color}15` }}
                >
                  <CreditCard
                    className="h-5 w-5"
                    style={{ color: selectedGatewayInfo.color }}
                  />
                </div>
              )}
              {isGatewayConnected(selectedGatewayId || "") ? "Configurar" : "Conectar"} {selectedGatewayInfo?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {isGatewayConnected(selectedGatewayId || "")
                ? "Atualize as credenciais do seu gateway"
                : "Cole seu Access Token para conectar o gateway"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-gray-900 font-medium">Access Token</Label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  placeholder="APP_USR-xxxxxxxx-xxxxx-xxxxx..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="bg-gray-50 border-gray-200 pr-10 font-mono text-xs rounded-xl"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                O token e armazenado de forma segura e nunca e exposto
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => setConnectDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#111] text-white font-medium text-sm hover:bg-[#222] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={handleConnect}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : isGatewayConnected(selectedGatewayId || "") ? (
                  "Atualizar"
                ) : (
                  "Conectar"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="bg-white border-gray-200 sm:max-w-md rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f0ffd4] to-[#e8ffc4]">
                <Package className="h-5 w-5 text-[#4d7c0f]" />
              </div>
              {editingPlan ? "Editar Plano" : "Novo Plano"}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {editingPlan ? "Atualize as informacoes do plano" : "Configure um novo plano de cobranca"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-gray-900 font-medium">Nome do Plano</Label>
              <Input
                placeholder="Ex: Plano Mensal, VIP, Premium..."
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="bg-gray-50 border-gray-200 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-gray-900 font-medium">Preco (R$)</Label>
              <Input
                placeholder="Ex: 29,90"
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
                className="bg-gray-50 border-gray-200 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-gray-900 font-medium">Descricao (opcional)</Label>
              <Input
                placeholder="Ex: Acesso por 30 dias"
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                className="bg-gray-50 border-gray-200 rounded-xl"
              />
            </div>

            {planError && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                {planError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => setPlanDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#111] text-white font-medium text-sm hover:bg-[#222] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={handleSavePlan}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingPlan ? (
                  "Atualizar"
                ) : (
                  "Criar Plano"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
