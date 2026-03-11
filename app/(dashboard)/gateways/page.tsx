"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Settings,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Zap,
  ChevronRight,
  Sparkles,
  Shield,
  Link2,
} from "lucide-react"

export default function GatewaysPage() {
  const { selectedBot } = useBots()
  const { gateways, isLoading, connectGateway, disconnectGateway, updateGateway } = useGateways()

  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Gateways" />
        <NoBotSelected />
      </>
    )
  }

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

  // Separar gateways conectados dos disponiveis
  const connectedGatewaysList = AVAILABLE_GATEWAYS.filter(gw => isGatewayConnected(gw.id))
  const availableGatewaysList = AVAILABLE_GATEWAYS.filter(gw => !isGatewayConnected(gw.id))

  return (
    <>
      <DashboardHeader title="Gateways" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f4f5f7] min-h-full">
          
          {/* Hero Section - Clean and Simple */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#111] flex items-center justify-center">
                <Link2 className="h-5 w-5 text-[#a3e635]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Conectar Gateway
                </h1>
                <p className="text-sm text-gray-500">
                  Escolha um gateway para receber pagamentos no seu bot
                </p>
              </div>
            </div>
          </div>

          {/* Connected Gateways Section */}
          {connectedGatewaysList.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Conectado
                </h2>
              </div>
              
              <div className="flex flex-col gap-4">
                {connectedGatewaysList.map((gw) => {
                  const gatewayData = getGatewayData(gw.id)
                  
                  return (
                    <div
                      key={gw.id}
                      className="bg-[#111] rounded-[28px] p-6 md:p-8 relative overflow-hidden group"
                    >
                      {/* Glow Effect */}
                      <div className="absolute top-0 right-0 w-60 h-60 bg-[#a3e635] opacity-[0.08] blur-[80px] rounded-full pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.05] blur-[60px] rounded-full pointer-events-none" style={{ backgroundColor: gw.color }}></div>
                      
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          {/* Gateway Icon */}
                          <div
                            className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10"
                            style={{ backgroundColor: `${gw.color}20` }}
                          >
                            <CreditCard
                              className="h-8 w-8"
                              style={{ color: gw.color }}
                            />
                          </div>

                          {/* Gateway Info */}
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-xl font-bold text-white">
                                {gw.name}
                              </h3>
                              <span className="inline-flex items-center gap-1.5 bg-[#22c55e]/20 text-[#4ade80] text-xs font-semibold px-3 py-1 rounded-full">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Ativo
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{gw.description}</p>
                            {gatewayData?.created_at && (
                              <p className="text-xs text-gray-500 mt-2">
                                Conectado em {new Date(gatewayData.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-2.5 border border-white/10">
                            <span className="text-sm text-gray-400">Gateway</span>
                            <Switch
                              checked={gatewayData?.is_active ?? false}
                              onCheckedChange={(checked) => handleToggleActive(gw.id, checked)}
                            />
                          </div>
                          
                          <button
                            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                            onClick={() => handleOpenConnect(gw.id)}
                          >
                            <Settings className="h-5 w-5 text-gray-400" />
                          </button>
                          
                          <button
                            className="w-12 h-12 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-all group"
                            onClick={() => handleDisconnect(gw.id)}
                          >
                            <Trash2 className="h-5 w-5 text-red-400 group-hover:text-red-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Available Gateways Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Gateways Disponiveis
              </h2>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-16 bg-white rounded-[28px] border border-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {availableGatewaysList.map((gw) => {
                  const isComingSoon = gw.comingSoon

                  return (
                    <div
                      key={gw.id}
                      className={`bg-white rounded-[24px] border transition-all overflow-hidden group cursor-pointer ${
                        isComingSoon 
                          ? "opacity-60 border-gray-100 cursor-not-allowed" 
                          : "border-gray-100 hover:border-gray-200 hover:shadow-lg hover:-translate-y-1"
                      }`}
                      onClick={() => !isComingSoon && handleOpenConnect(gw.id)}
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${gw.color}15` }}
                          >
                            <CreditCard
                              className="h-7 w-7"
                              style={{ color: gw.color }}
                            />
                          </div>
                          
                          {isComingSoon ? (
                            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                              Em breve
                            </span>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {gw.name}
                        </h3>
                        <p className="text-sm text-gray-500">{gw.description}</p>

                        {/* Features */}
                        {!isComingSoon && (
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Zap className="h-3.5 w-3.5 text-[#a3e635]" />
                              PIX Instantaneo
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Shield className="h-3.5 w-3.5 text-blue-500" />
                              Seguro
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Help Card */}
          <div className="mt-8 bg-gradient-to-br from-[#f0ffd4] to-[#e8ffc4] rounded-[28px] p-6 border border-[#d9f970]/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4d7c0f]/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-[#4d7c0f]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Seus dados estao seguros</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Seus tokens de acesso sao criptografados com AES-256 e armazenados de forma segura. 
                  Nunca compartilhamos suas credenciais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-0 rounded-[28px] p-0 overflow-hidden">
          {/* Header com cor do gateway */}
          <div 
            className="p-6 pb-4"
            style={{ backgroundColor: selectedGatewayInfo ? `${selectedGatewayInfo.color}10` : '#f4f5f7' }}
          >
            <div className="flex items-center gap-4">
              {selectedGatewayInfo && (
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${selectedGatewayInfo.color}20` }}
                >
                  <CreditCard
                    className="h-7 w-7"
                    style={{ color: selectedGatewayInfo.color }}
                  />
                </div>
              )}
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Conectar {selectedGatewayInfo?.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                  {isGatewayConnected(selectedGatewayId || '') 
                    ? 'Atualize suas credenciais' 
                    : 'Insira seu Access Token para conectar'
                  }
                </DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="p-6 pt-2">
            <div className="space-y-5">
              <div>
                <Label htmlFor="accessToken" className="text-sm font-medium text-gray-700">
                  Access Token
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="accessToken"
                    type={showToken ? "text" : "password"}
                    placeholder="Cole seu access token aqui"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="pr-12 h-12 rounded-xl border-gray-200 focus:border-gray-300 focus:ring-0"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl border border-green-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </div>
              )}

              {selectedGatewayInfo?.helpUrl && (
                <a
                  href={selectedGatewayInfo.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Como obter o Access Token do {selectedGatewayInfo.name}?
                </a>
              )}

              <button
                onClick={handleConnect}
                disabled={isSubmitting}
                className="w-full bg-[#111] text-white hover:bg-[#222] h-12 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    {isGatewayConnected(selectedGatewayId || '') ? 'Atualizar' : 'Conectar Gateway'}
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
