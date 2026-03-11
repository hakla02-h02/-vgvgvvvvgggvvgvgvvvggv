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
  Settings,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Zap,
  HelpCircle,
  Copy,
  Check,
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
  const [expandedTutorial, setExpandedTutorial] = useState(false)

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
  const isConnected = gatewayData?.is_active ?? false

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

  const tutorialSteps = [
    {
      step: 1,
      title: "Acesse sua conta do Mercado Pago",
      description: "Entre em mercadopago.com.br e faca login na sua conta",
    },
    {
      step: 2,
      title: "Va ate Suas Integracoes",
      description: "No menu, clique em 'Seu negocio' > 'Configuracoes' > 'Gestao e Administracao' > 'Credenciais'",
    },
    {
      step: 3,
      title: "Crie uma aplicacao",
      description: "Clique em 'Criar aplicacao' e preencha os dados solicitados",
    },
    {
      step: 4,
      title: "Copie o Access Token",
      description: "Na aba 'Credenciais de producao', copie o Access Token e cole aqui",
    },
  ]

  return (
    <>
      <DashboardHeader title="Gateways" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f4f5f7] min-h-full">
          <div className="max-w-3xl mx-auto">
            
            {/* Main Gateway Card */}
            <div className={`rounded-[32px] overflow-hidden transition-all ${
              isConnected 
                ? "bg-[#111]" 
                : "bg-white border border-gray-200"
            }`}>
              
              {/* Header */}
              <div className={`p-6 md:p-8 ${isConnected ? "" : "border-b border-gray-100"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      isConnected 
                        ? "bg-[#00bcff]/20" 
                        : "bg-[#00bcff]/10"
                    }`}>
                      <CreditCard className="w-8 h-8 text-[#00bcff]" />
                    </div>
                    
                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className={`text-xl md:text-2xl font-bold ${
                          isConnected ? "text-white" : "text-gray-900"
                        }`}>
                          {mercadoPago.name}
                        </h2>
                        {isConnected && (
                          <span className="inline-flex items-center gap-1.5 bg-[#22c55e]/20 text-[#4ade80] text-xs font-semibold px-3 py-1 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Conectado
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${
                        isConnected ? "text-gray-400" : "text-gray-500"
                      }`}>
                        {mercadoPago.description}
                      </p>
                    </div>
                  </div>

                  {/* Status Toggle - Only when connected */}
                  {isConnected && (
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                      <span className="text-sm text-gray-400">
                        {gatewayData?.is_active ? "Ativo" : "Pausado"}
                      </span>
                      <Switch
                        checked={gatewayData?.is_active ?? false}
                        onCheckedChange={handleToggleActive}
                      />
                    </div>
                  )}
                </div>

                {/* Connected Info */}
                {isConnected && gatewayData && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Conectado em</p>
                          <p className="text-sm text-white font-medium">
                            {new Date(gatewayData.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-white/10"></div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                          <p className={`text-sm font-medium ${gatewayData.is_active ? "text-[#4ade80]" : "text-yellow-400"}`}>
                            {gatewayData.is_active ? "Recebendo pagamentos" : "Pagamentos pausados"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleOpenConnect}
                          className="h-11 px-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium flex items-center gap-2 transition-all"
                        >
                          <Settings className="h-4 w-4" />
                          Configurar
                        </button>
                        <button
                          onClick={handleDisconnect}
                          className="h-11 px-5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                          Desconectar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connect Button - Only when not connected */}
                {!isConnected && (
                  <div className="mt-6">
                    <button
                      onClick={handleOpenConnect}
                      className="w-full h-14 rounded-2xl bg-[#111] hover:bg-[#222] text-white text-base font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <Zap className="h-5 w-5 text-[#a3e635]" />
                      Conectar Mercado Pago
                    </button>
                  </div>
                )}
              </div>

              {/* Features - Only when not connected */}
              {!isConnected && (
                <div className="px-6 md:px-8 pb-6 md:pb-8">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-xl bg-[#a3e635]/20 flex items-center justify-center mx-auto mb-2">
                        <Zap className="h-5 w-5 text-[#65a30d]" />
                      </div>
                      <p className="text-xs font-medium text-gray-700">PIX Instantaneo</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-xl bg-[#00bcff]/20 flex items-center justify-center mx-auto mb-2">
                        <CreditCard className="h-5 w-5 text-[#00bcff]" />
                      </div>
                      <p className="text-xs font-medium text-gray-700">Cartao de Credito</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-2">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-xs font-medium text-gray-700">Cartao de Debito</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tutorial Card */}
            <div className="mt-6 bg-white rounded-[28px] border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpandedTutorial(!expandedTutorial)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#00bcff]/10 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-[#00bcff]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      Como obter o Access Token do Mercado Pago?
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Siga o passo a passo para conectar sua conta
                    </p>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform ${
                  expandedTutorial ? "rotate-180" : ""
                }`}>
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expandedTutorial && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="pt-6 space-y-4">
                    {tutorialSteps.map((item, index) => (
                      <div key={item.step} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-[#111] text-white text-sm font-bold flex items-center justify-center">
                            {item.step}
                          </div>
                          {index < tutorialSteps.length - 1 && (
                            <div className="w-px h-full bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="pb-4">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <a
                    href={mercadoPago.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#00bcff]/10 hover:bg-[#00bcff]/20 text-[#0284c7] font-medium text-sm transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir pagina de credenciais do Mercado Pago
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-0 rounded-[28px] p-0 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 bg-[#00bcff]/5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00bcff]/20">
                <CreditCard className="h-7 w-7 text-[#00bcff]" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {isConnected ? "Configurar" : "Conectar"} Mercado Pago
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                  {isConnected ? "Atualize seu Access Token" : "Insira seu Access Token para conectar"}
                </DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="p-6 pt-4">
            <div className="space-y-5">
              <div>
                <Label htmlFor="accessToken" className="text-sm font-medium text-gray-700">
                  Access Token
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="accessToken"
                    type={showToken ? "text" : "password"}
                    placeholder="APP_USR-0000000000000000-000000-..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="pr-12 h-12 rounded-xl border-gray-200 focus:border-[#00bcff] focus:ring-[#00bcff]/20"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Use o Access Token de producao, nao o de teste
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
                    {isConnected ? "Atualizar Token" : "Conectar Gateway"}
                  </>
                )}
              </button>

              {!isConnected && (
                <a
                  href={mercadoPago.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
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
