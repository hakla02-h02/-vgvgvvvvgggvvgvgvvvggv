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
  Link2,
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
          <div className="max-w-2xl mx-auto">
            
            {/* Page Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center">
                <Link2 className="w-5 h-5 text-[#a3e635]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Conectar Gateway</h1>
                <p className="text-sm text-gray-500">Escolha um gateway para receber pagamentos no seu bot</p>
              </div>
            </div>

            {/* Gateway Card - Mercado Pago */}
            <div className={`rounded-[24px] border overflow-hidden transition-all ${
              isConnected 
                ? "bg-white border-[#22c55e]/30 shadow-[0_0_0_1px_rgba(34,197,94,0.1)]" 
                : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer"
            }`} onClick={!isConnected ? handleOpenConnect : undefined}>
              
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* MP Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      isConnected ? "bg-[#00bcff]/10" : "bg-[#00bcff]/5"
                    }`}>
                      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                        <rect x="3" y="6" width="18" height="12" rx="2" stroke="#00bcff" strokeWidth="2"/>
                        <path d="M3 10h18" stroke="#00bcff" strokeWidth="2"/>
                        <path d="M7 14h4" stroke="#00bcff" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    
                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{mercadoPago.name}</h3>
                        {isConnected && (
                          <span className="inline-flex items-center gap-1 bg-[#22c55e]/10 text-[#16a34a] text-xs font-semibold px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Conectado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{mercadoPago.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {isConnected ? (
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={gatewayData?.is_active ?? false}
                        onCheckedChange={handleToggleActive}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenConnect(); }}
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-[#00bcff]">
                      Conectar
                    </div>
                  )}
                </div>

                {/* Connected Details */}
                {isConnected && gatewayData && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Conectado em {new Date(gatewayData.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDisconnect(); }}
                      className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Desconectar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tutorial Card - Dark style like the screenshot */}
            <div className="mt-5 bg-[#111] rounded-[24px] p-5 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[60%] h-12 bg-[#a3e635] opacity-15 blur-[30px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#a3e635]/20 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#a3e635]" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-base mb-1">
                    Como obter o Access Token do Mercado Pago?
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Acesse sua conta no Mercado Pago Developers, va em "Suas integracoes" e copie o Access Token de producao.
                  </p>
                  <a
                    href={mercadoPago.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-[#a3e635] text-sm font-medium hover:underline"
                  >
                    Acessar Mercado Pago Developers
                    <ExternalLink className="h-3.5 w-3.5" />
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
                  <path d="M7 14h4" stroke="#00bcff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  {isConnected ? "Configurar" : "Conectar"} Mercado Pago
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  {isConnected ? "Atualize seu Access Token" : "Insira seu Access Token"}
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
                <p className="text-xs text-gray-400 mt-1.5">
                  Use o Access Token de producao
                </p>
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

              {!isConnected && (
                <a
                  href={mercadoPago.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Como obter o Access Token?
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
