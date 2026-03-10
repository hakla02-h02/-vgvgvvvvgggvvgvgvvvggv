"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    console.log("[v0] handleConnect chamado:", { selectedGatewayId, hasToken: !!accessToken.trim() })
    
    if (!selectedGatewayId) {
      console.log("[v0] ERRO: selectedGatewayId vazio")
      return
    }
    if (!accessToken.trim()) {
      console.log("[v0] ERRO: accessToken vazio")
      setError("Digite o Access Token")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      console.log("[v0] Chamando connectGateway...")
      await connectGateway(selectedGatewayId, accessToken.trim())
      console.log("[v0] connectGateway retornou com sucesso!")
      setSuccess("Gateway conectado com sucesso!")
      setTimeout(() => {
        setConnectDialogOpen(false)
        setAccessToken("")
        setSuccess("")
      }, 1500)
    } catch (err) {
      console.error("[v0] ERRO no connectGateway:", err)
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
    // Reordering logic can be added later if needed
    console.log("Move plan", id, direction)
  }

  const activePlans = plans.filter((p) => p.is_active)

  return (
    <>
      <DashboardHeader title="Gateways" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          {/* Stats - Dashboard Style */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {/* Gateways Conectados */}
            <div className="bg-[#111] rounded-[24px] p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#a3e635] opacity-10 blur-[40px] rounded-full" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#a3e635]/10 flex items-center justify-center mb-3">
                  <CreditCard className="h-5 w-5 text-[#a3e635]" />
                </div>
                <p className="text-xs text-gray-500">Gateways</p>
                <p className="text-2xl font-bold text-white mt-0.5">{connectedGateways}</p>
              </div>
            </div>
            
            {/* Planos */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500">Planos</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{activePlans.length}</p>
            </div>
            
            {/* Transacoes */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500">Transacoes</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">0</p>
            </div>
            
            {/* Volume */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-500">Volume</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">R$ 0</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="gateways" className="w-full">
            <TabsList className="bg-gray-100 border border-gray-200 p-1.5 rounded-2xl">
              <TabsTrigger value="gateways" className="data-[state=active]:bg-[#111] data-[state=active]:text-white rounded-xl px-6 py-2.5 text-sm font-medium transition-all">
                <CreditCard className="h-4 w-4 mr-2" />
                Gateways
              </TabsTrigger>
              <TabsTrigger value="plans" className="data-[state=active]:bg-[#111] data-[state=active]:text-white rounded-xl px-6 py-2.5 text-sm font-medium transition-all">
                <Package className="h-4 w-4 mr-2" />
                Planos de Cobranca
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gateways" className="mt-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Gateways de Pagamento</h2>
                  <p className="text-sm text-gray-500 mt-1">Conecte seus gateways para receber pagamentos PIX</p>
                </div>
              </div>

          {/* Gateway List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {AVAILABLE_GATEWAYS.map((gw) => {
                const isConnected = isGatewayConnected(gw.id)
                const gatewayData = getGatewayData(gw.id)
                const isComingSoon = gw.comingSoon

                return (
                  <div
                    key={gw.id}
                    className={`bg-white rounded-[24px] border transition-all shadow-sm ${
                      isComingSoon ? "opacity-60 border-gray-100" : "border-gray-100"
                    } ${isConnected ? "ring-2 ring-[#a3e635]/30" : ""}`}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-4 md:p-5">
                        <div className="flex items-center gap-4">
                          {/* Gateway Icon */}
                          <div
                            className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${gw.color}15` }}
                          >
                            <CreditCard
                              className="h-6 w-6 md:h-7 md:w-7"
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
                                <span className="inline-flex items-center gap-1 bg-[#22c55e]/10 text-[#22c55e] text-xs font-medium px-2.5 py-1 rounded-full">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Conectado
                                </span>
                              )}
                              {isComingSoon && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenConnect(gw.id)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {!isConnected && !isComingSoon && (
                            <button
                              onClick={() => handleOpenConnect(gw.id)}
                              className="bg-[#111] text-white hover:bg-gray-800 px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                              Conectar
                            </button>
                          )}

                          {isComingSoon && (
                            <Button variant="outline" disabled className="border-border">
                              Em breve
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Connected Footer */}
                      {isConnected && gatewayData && (
                        <div className="flex items-center justify-between px-4 md:px-5 py-3 border-t border-border/50 bg-secondary/20">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              Conectado em{" "}
                              {new Date(gatewayData.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDisconnect(gw.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Desconectar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </div>
                )
              })}
            </div>
          )}

              {/* Help Card */}
              <Card className="bg-secondary/30 border-border rounded-2xl mt-4">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                      <AlertCircle className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Como obter o Access Token do Mercado Pago?</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Acesse sua conta no Mercado Pago Developers, va em &quot;Suas integracoes&quot; e copie o Access Token de producao.
                      </p>
                      <Button
                        variant="link"
                        className="h-auto p-0 mt-2 text-accent"
                        asChild
                      >
                        <a
                          href="https://www.mercadopago.com.br/developers/panel/app"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Acessar Mercado Pago Developers
                          <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans" className="mt-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Planos de Cobranca</h2>
                  <p className="text-sm text-muted-foreground">Configure os planos que serao usados nos fluxos de pagamento</p>
                </div>
                <Button
                  onClick={() => handleOpenPlanDialog()}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Plano
                </Button>
              </div>

              {/* Plans List */}
              {plans.length === 0 ? (
                <Card className="bg-card border-border rounded-2xl">
                  <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground">Nenhum plano criado</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Crie seu primeiro plano para usar nos fluxos de cobranca</p>
                    </div>
                    <Button
                      onClick={() => handleOpenPlanDialog()}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Plano
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-3">
                  {plans.map((plan, index) => (
                    <Card
                      key={plan.id}
                      className={`bg-card border-border rounded-2xl ${!plan.is_active ? "opacity-60" : ""}`}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between p-4 md:p-5">
                          <div className="flex items-center gap-4">
                            {/* Reorder buttons */}
                            <div className="flex flex-col gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => handleMovePlan(plan.id, "up")}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => handleMovePlan(plan.id, "down")}
                                disabled={index === plans.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Plan Icon */}
                            <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-accent/10">
                              <Package className="h-6 w-6 md:h-7 md:w-7 text-accent" />
                            </div>

                            {/* Plan Info */}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base md:text-lg font-semibold text-foreground">
                                  {plan.name}
                                </h3>
                                {!plan.is_active && (
                                  <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                                    Inativo
                                  </Badge>
                                )}
                              </div>
                              {plan.description && (
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                              )}
                            </div>
                          </div>

                          {/* Price and Actions */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-accent">
                                R$ {plan.price.toFixed(2).replace(".", ",")}
                              </p>
                            </div>

                            <Switch
                              checked={plan.is_active}
                              onCheckedChange={(checked) => updatePlan(plan.id, { is_active: checked })}
                            />

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-popover border-border w-44">
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-foreground"
                                  onClick={() => handleOpenPlanDialog(plan)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-destructive"
                                  onClick={() => handleDeletePlan(plan.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              {selectedGatewayInfo && (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${selectedGatewayInfo.color}15` }}
                >
                  <CreditCard
                    className="h-4 w-4"
                    style={{ color: selectedGatewayInfo.color }}
                  />
                </div>
              )}
              {isGatewayConnected(selectedGatewayId || "") ? "Configurar" : "Conectar"} {selectedGatewayInfo?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isGatewayConnected(selectedGatewayId || "")
                ? "Atualize as credenciais do seu gateway"
                : "Cole seu Access Token para conectar o gateway"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Access Token</Label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  placeholder="APP_USR-xxxxxxxx-xxxxx-xxxxx..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="bg-secondary border-border pr-10 font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                O token e armazenado de forma segura e nunca e exposto
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setConnectDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleConnect}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : isGatewayConnected(selectedGatewayId || "") ? (
                  "Atualizar"
                ) : (
                  "Conectar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Package className="h-4 w-4 text-accent" />
              </div>
              {editingPlan ? "Editar Plano" : "Novo Plano"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingPlan ? "Atualize as informacoes do plano" : "Configure um novo plano de cobranca"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Nome do Plano</Label>
              <Input
                placeholder="Ex: Plano Mensal, VIP, Premium..."
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Preco (R$)</Label>
              <Input
                placeholder="Ex: 29,90"
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Descricao (opcional)</Label>
              <Input
                placeholder="Ex: Acesso por 30 dias"
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            {planError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {planError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setPlanDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleSavePlan}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : editingPlan ? (
                  "Atualizar"
                ) : (
                  "Criar Plano"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
