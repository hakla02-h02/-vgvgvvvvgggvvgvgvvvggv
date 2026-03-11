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
  ExternalLink,
  ArrowRight,
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

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Gateways" />
        <NoBotSelected />
      </>
    )
  }

  const mercadoPago = AVAILABLE_GATEWAYS[0]
  const gatewayData = gateways.find((g) => g.gateway_name === "mercadopago")
  const isConnected = !!gatewayData

  const handleOpenConnect = () => {
    if (gatewayData) {
      setAccessToken(gatewayData.access_token)
    } else {
      setAccessToken("")
    }
    setError("")
    setSuccess("")
    setConnectDialogOpen(true)
  }

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      setError("Digite o Access Token")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      await connectGateway("mercadopago", accessToken.trim())
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

  const handleDisconnect = async () => {
    if (!gatewayData) return

    try {
      await disconnectGateway(gatewayData.id)
    } catch (err) {
      console.error("Error disconnecting gateway:", err)
    }
  }

  const handleToggleActive = async (isActive: boolean) => {
    if (!gatewayData) return

    try {
      await updateGateway(gatewayData.id, { is_active: isActive })
    } catch (err) {
      console.error("Error toggling gateway:", err)
    }
  }

  return (
    <>
      <DashboardHeader title="Gateways" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f4f5f7] min-h-full">
          <div className="max-w-3xl mx-auto">
            
            {/* Header - Nunca muda */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#a3e635]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Conectar Gateway
                </h1>
                <p className="text-sm text-gray-500">
                  Escolha um gateway para receber pagamentos no seu bot
                </p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              
              {/* Gateway Card - Takes 3 columns */}
              <div className={`lg:col-span-3 rounded-[24px] transition-all ${
                isConnected 
                  ? "bg-[#111] text-white" 
                  : "bg-white border border-gray-200 hover:border-[#00bcff] hover:shadow-lg cursor-pointer group"
              }`} onClick={!isConnected ? handleOpenConnect : undefined}>
                
                {isConnected ? (
                  // Connected State - Dark theme
                  <div className="p-6 relative overflow-hidden">
                    {/* Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00bcff] opacity-10 blur-[50px] rounded-full pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#00bcff]/20 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                              <rect x="3" y="6" width="18" height="12" rx="2" stroke="#00bcff" strokeWidth="1.5"/>
                              <path d="M3 10h18" stroke="#00bcff" strokeWidth="1.5"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{mercadoPago.name}</h3>
                            <p className="text-sm text-gray-400">{mercadoPago.description}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 bg-[#22c55e]/20 text-[#4ade80] text-xs font-semibold px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></span>
                          Ativo
                        </span>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={gatewayData?.is_active ?? false}
                            onCheckedChange={handleToggleActive}
                          />
                          <span className="text-sm text-gray-400">
                            {gatewayData?.is_active ? "Gateway ativo" : "Gateway pausado"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenConnect(); }}
                            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDisconnect(); }}
                            className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Connected date */}
                      <p className="text-xs text-gray-500 mt-4">
                        Conectado em {new Date(gatewayData!.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Not Connected State - Light theme
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00bcff]/10 to-[#00bcff]/5 flex items-center justify-center group-hover:from-[#00bcff]/20 group-hover:to-[#00bcff]/10 transition-all">
                          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                            <rect x="3" y="6" width="18" height="12" rx="2" stroke="#00bcff" strokeWidth="1.5"/>
                            <path d="M3 10h18" stroke="#00bcff" strokeWidth="1.5"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{mercadoPago.name}</h3>
                          <p className="text-sm text-gray-500">{mercadoPago.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[#00bcff] font-medium text-sm group-hover:gap-3 transition-all">
                        Conectar
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-2 mt-5 pt-5 border-t border-gray-100">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">PIX</span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">Credito</span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">Debito</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Help Card - Takes 2 columns */}
              <div className="lg:col-span-2 bg-[#111] rounded-[24px] p-5 relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#a3e635] opacity-10 blur-[40px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="w-9 h-9 rounded-xl bg-[#a3e635]/20 flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#a3e635]" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                  </div>
                  
                  <h3 className="text-white font-semibold text-sm mb-2">
                    Como obter o Access Token?
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4">
                    Acesse o painel de desenvolvedores do Mercado Pago, va em "Suas integracoes" e copie o token de producao.
                  </p>
                  
                  <a
                    href={mercadoPago.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#a3e635] text-xs font-medium hover:underline"
                  >
                    Acessar Mercado Pago
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </ScrollArea>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-0 rounded-[24px] p-0 overflow-hidden">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#00bcff]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="#00bcff" strokeWidth="2"/>
                  <path d="M3 10h18" stroke="#00bcff" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  {isConnected ? "Configurar" : "Conectar"} Mercado Pago
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  {isConnected ? "Atualize seu Access Token" : "Insira seu Access Token para conectar"}
                </DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <div className="space-y-4">
              <div>
                <Label htmlFor="accessToken" className="text-sm font-medium text-gray-700">
                  Access Token
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="accessToken"
                    type={showToken ? "text" : "password"}
                    placeholder="APP_USR-0000000000000000-..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="pr-10 h-11 rounded-xl border-gray-200 focus:border-[#00bcff] focus:ring-[#00bcff]/20"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

              <button
                onClick={handleConnect}
                disabled={isSubmitting}
                className="w-full bg-[#111] text-white hover:bg-[#222] h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  isConnected ? "Salvar alteracoes" : "Conectar Gateway"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
