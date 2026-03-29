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
  Settings,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Plus,
  Info,
  Globe,
} from "lucide-react"

export default function GatewaysPage() {
  const { selectedBot } = useBots()
  const { gateways, isLoading, connectGateway, disconnectGateway, updateGateway } = useGateways()

  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [accessToken, setAccessToken] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedGateway, setSelectedGateway] = useState<typeof AVAILABLE_GATEWAYS[number] | null>(null)

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Gateways" />
        <NoBotSelected />
      </>
    )
  }
  
  const getGatewayData = (gatewayId: string) => gateways.find((g) => g.gateway_name === gatewayId)
  const isGatewayConnected = (gatewayId: string) => !!getGatewayData(gatewayId)

  const handleOpenConnect = (gateway: typeof AVAILABLE_GATEWAYS[number]) => {
    if ('comingSoon' in gateway && gateway.comingSoon) return
    
    setSelectedGateway(gateway)
    const existingData = getGatewayData(gateway.id)
    if (existingData) {
      setAccessToken(existingData.access_token)
    } else {
      setAccessToken("")
    }
    setError("")
    setSuccess("")
    setConnectDialogOpen(true)
  }

  const handleConnect = async () => {
    if (!selectedGateway) return
    if (!accessToken.trim()) {
      setError("Digite o Access Token")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      await connectGateway(selectedGateway.id, accessToken.trim())
      setSuccess("Gateway conectado com sucesso!")
      setTimeout(() => {
        setConnectDialogOpen(false)
        setAccessToken("")
        setSuccess("")
        setSelectedGateway(null)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar gateway")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDisconnect = async (gatewayId: string) => {
    const data = getGatewayData(gatewayId)
    if (!data) return

    try {
      await disconnectGateway(data.id)
    } catch (err) {
      console.error("Error disconnecting gateway:", err)
    }
  }

  const handleToggleActive = async (gatewayId: string, isActive: boolean) => {
    const data = getGatewayData(gatewayId)
    if (!data) return

    try {
      await updateGateway(data.id, { is_active: isActive })
    } catch (err) {
      console.error("Error toggling gateway:", err)
    }
  }

  const connectedGateways = gateways.filter(g => g.is_active)

  return (
    <>
      <DashboardHeader title="Gateways" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f5f5f7] min-h-[calc(100vh-60px)]">
          <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Gateways de Pagamento
              </h1>
              <p className="text-gray-500">
                Configure seus gateways para receber pagamentos no seu bot
              </p>
            </div>

            {/* Gateway Conectado - Card Escuro com Glow */}
            {connectedGateways.length > 0 && (
              <div className="relative rounded-[20px] p-5 mb-6 overflow-hidden bg-[#1c1c1e]">
                {/* Glow verde na parte inferior */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at center bottom, rgba(190, 255, 0, 0.15) 0%, transparent 70%)"
                  }}
                />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#bfff00]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-[#bfff00]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {connectedGateways[0].gateway_name === "mercadopago" ? "Mercado Pago" : 
                           connectedGateways[0].gateway_name === "pagseguro" ? "PagSeguro" : "Stripe"}
                        </h3>
                        <span className="px-2 py-0.5 bg-[#bfff00] text-[#1c1c1e] text-xs font-bold rounded-full">
                          ATIVO
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Recebendo pagamentos via PIX
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const gateway = AVAILABLE_GATEWAYS.find(g => g.id === connectedGateways[0].gateway_name)
                      if (gateway) handleOpenConnect(gateway)
                    }}
                    className="text-sm text-[#bfff00] hover:text-[#d4ff4d] font-medium flex items-center gap-1 transition-colors"
                  >
                    Configurar
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Info Box - Sistema de Fallback - Card Escuro */}
            <div className="relative rounded-[20px] p-5 mb-8 overflow-hidden bg-[#1c1c1e]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#bfff00]/20 flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-[#bfff00]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Sistema de Fallback Inteligente
                  </h3>
                  <p className="text-sm text-gray-400">
                    Os gateways serao usados na ordem de prioridade. Se o primeiro falhar, o sistema tentara automaticamente o proximo.
                  </p>
                </div>
              </div>
            </div>

            {/* Gateways Disponiveis */}
            <div className="mb-5">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                Gateways Disponiveis
              </h2>
            </div>

            {/* Gateway Grid - Cards Escuros com Glow */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_GATEWAYS.map((gateway) => {
                const isConnected = isGatewayConnected(gateway.id)
                const gatewayData = getGatewayData(gateway.id)
                const isComingSoon = 'comingSoon' in gateway && gateway.comingSoon

                return (
                  <div 
                    key={gateway.id}
                    onClick={!isComingSoon ? () => handleOpenConnect(gateway) : undefined}
                    className={`
                      relative rounded-[20px] p-5 overflow-hidden transition-all
                      ${isComingSoon 
                        ? "bg-[#2c2c2e] opacity-50 cursor-not-allowed" 
                        : isConnected 
                          ? "bg-[#1c1c1e] ring-2 ring-[#bfff00]/50" 
                          : "bg-[#1c1c1e] hover:bg-[#2c2c2e] cursor-pointer group"
                      }
                    `}
                  >
                    {/* Glow verde na parte inferior */}
                    <div 
                      className={`absolute bottom-0 left-0 right-0 h-24 pointer-events-none transition-opacity ${isConnected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                      style={{
                        background: "radial-gradient(ellipse at center bottom, rgba(190, 255, 0, 0.2) 0%, transparent 70%)"
                      }}
                    />

                    {/* Connected Badge */}
                    {isConnected && (
                      <div className="absolute top-4 right-4">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#bfff00]/20 text-[#bfff00] text-xs font-semibold rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#bfff00] animate-pulse"></span>
                          Conectado
                        </span>
                      </div>
                    )}

                    {/* Plus Icon */}
                    {!isConnected && !isComingSoon && (
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-white/70" />
                        </div>
                      </div>
                    )}

                    {/* Logo */}
                    <div className="flex justify-center mb-4 pt-2">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ 
                          background: `linear-gradient(145deg, ${gateway.color}30 0%, ${gateway.color}10 100%)`,
                        }}
                      >
                        {gateway.id === "mercadopago" ? (
                          <svg viewBox="0 0 24 24" className="w-8 h-8" fill={gateway.color}>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                          </svg>
                        ) : gateway.id === "pagseguro" ? (
                          <svg viewBox="0 0 24 24" className="w-8 h-8" fill={gateway.color}>
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="w-8 h-8" fill={gateway.color}>
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Gateway Info */}
                    <div className="text-center relative">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <h3 className="font-bold text-white">{gateway.name}</h3>
                        <span 
                          className="px-2 py-0.5 text-xs font-bold rounded-md"
                          style={{ 
                            backgroundColor: gateway.color + "25",
                            color: gateway.color
                          }}
                        >
                          PIX
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{gateway.description}</p>
                    </div>

                    {/* Connected Controls */}
                    {isConnected && gatewayData && (
                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between relative">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={gatewayData.is_active}
                            onCheckedChange={(checked) => handleToggleActive(gateway.id, checked)}
                            className="data-[state=checked]:bg-[#bfff00]"
                          />
                          <span className="text-xs text-gray-400">
                            {gatewayData.is_active ? "Ativo" : "Pausado"}
                          </span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDisconnect(gateway.id); }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Coming Soon */}
                    {isComingSoon && (
                      <div className="mt-4 text-center relative">
                        <span className="px-3 py-1 bg-white/10 text-gray-400 text-xs font-medium rounded-full">
                          Em breve
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Help Section - Card Escuro */}
            <div className="mt-8 rounded-[20px] bg-[#1c1c1e] p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-400">
                  <span className="text-white font-medium">Precisa de ajuda?</span>
                  {" "}Acesse a documentacao do gateway escolhido para obter suas credenciais.
                </p>
              </div>
            </div>

          </div>
        </div>
      </ScrollArea>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={(open) => { setConnectDialogOpen(open); if (!open) setSelectedGateway(null); }}>
        <DialogContent className="sm:max-w-md bg-[#1c1c1e] border-0 rounded-[20px] p-0 overflow-hidden">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: (selectedGateway?.color || "#00bcff") + "25" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill={selectedGateway?.color || "#00bcff"}>
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  {selectedGateway && isGatewayConnected(selectedGateway.id) ? "Configurar" : "Conectar"} {selectedGateway?.name || "Gateway"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-400">
                  {selectedGateway && isGatewayConnected(selectedGateway.id) ? "Atualize seu Access Token" : "Insira seu Access Token para conectar"}
                </DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <div className="space-y-4">
              <div>
                <Label htmlFor="accessToken" className="text-sm font-medium text-gray-300">
                  Access Token
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="accessToken"
                    type={showToken ? "text" : "password"}
                    placeholder="APP_USR-0000000000000000-..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="pr-10 h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#bfff00] focus:ring-[#bfff00]/20"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/20">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-[#bfff00]/10 text-[#bfff00] text-sm p-3 rounded-xl border border-[#bfff00]/20 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={isSubmitting}
                className="w-full bg-[#bfff00] hover:bg-[#d4ff4d] text-[#1c1c1e] h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  selectedGateway && isGatewayConnected(selectedGateway.id) ? "Salvar alteracoes" : "Conectar Gateway"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
