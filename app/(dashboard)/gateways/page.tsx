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

  return (
    <>
      <DashboardHeader title="Gateways" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f4f5f7] min-h-[calc(100vh-60px)] flex flex-col">
          <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
            
            {/* Header - Nunca muda */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-foreground dark:bg-card flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#a3e635]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Conectar Gateway
                </h1>
                <p className="text-sm text-muted-foreground">
                  Escolha um gateway para receber pagamentos no seu bot
                </p>
              </div>
            </div>

            {/* Gateway Cards */}
            <div className="space-y-4">
              {AVAILABLE_GATEWAYS.map((gateway) => {
                const isConnected = isGatewayConnected(gateway.id)
                const gatewayData = getGatewayData(gateway.id)
                const isComingSoon = 'comingSoon' in gateway && gateway.comingSoon

                return (
                  <div 
                    key={gateway.id}
                    className={`rounded-[24px] transition-all ${
                      isComingSoon
                        ? "bg-card border border-gray-200 opacity-60"
                        : isConnected 
                          ? "bg-foreground dark:bg-card text-background dark:text-foreground" 
                          : "bg-card border border-gray-200 hover:border-[" + gateway.color + "] hover:shadow-lg cursor-pointer group"
                    }`} 
                    onClick={!isConnected && !isComingSoon ? () => handleOpenConnect(gateway) : undefined}
                  >
                    {isConnected ? (
                      // Connected State
                      <div className="p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-[50px] rounded-full pointer-events-none" style={{ backgroundColor: gateway.color }}></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: gateway.color + "20" }}>
                                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                                  <rect x="3" y="6" width="18" height="12" rx="2" stroke={gateway.color} strokeWidth="1.5"/>
                                  <path d="M3 10h18" stroke={gateway.color} strokeWidth="1.5"/>
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">{gateway.name}</h3>
                                <p className="text-sm text-muted-foreground">{gateway.description}</p>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1.5 bg-[#22c55e]/20 text-[#4ade80] text-xs font-semibold px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></span>
                              Ativo
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={gatewayData?.is_active ?? false}
                                onCheckedChange={(checked) => handleToggleActive(gateway.id, checked)}
                              />
                              <span className="text-sm text-muted-foreground">
                                {gatewayData?.is_active ? "Gateway ativo" : "Gateway pausado"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenConnect(gateway); }}
                                className="w-9 h-9 rounded-xl bg-card/10 hover:bg-card/20 flex items-center justify-center text-gray-300 transition-colors"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDisconnect(gateway.id); }}
                                className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mt-4">
                            Conectado em {new Date(gatewayData!.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Not Connected State
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                              style={{ 
                                background: `linear-gradient(to bottom right, ${gateway.color}15, ${gateway.color}08)` 
                              }}
                            >
                              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                                <rect x="3" y="6" width="18" height="12" rx="2" stroke={gateway.color} strokeWidth="1.5"/>
                                <path d="M3 10h18" stroke={gateway.color} strokeWidth="1.5"/>
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-foreground">{gateway.name}</h3>
                              <p className="text-sm text-muted-foreground">{gateway.description}</p>
                            </div>
                          </div>
                          {isComingSoon ? (
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                              Em breve
                            </span>
                          ) : (
                            <div className="flex items-center gap-2 font-medium text-sm group-hover:gap-3 transition-all" style={{ color: gateway.color }}>
                              Conectar
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-5 pt-5 border-t border-border">
                          {gateway.methods.includes("pix") && (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">PIX</span>
                          )}
                          {gateway.methods.includes("credit_card") && (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">Credito</span>
                          )}
                          {gateway.methods.includes("debit_card") && (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">Debito</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Help Section */}
            <div className="mt-auto pt-12 flex items-center gap-3 text-muted-foreground pb-4">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              <p className="text-sm">
                <span className="text-gray-600 font-medium">Precisa de ajuda?</span>
                {" "}Acesse a documentacao do gateway escolhido para obter suas credenciais.
              </p>
            </div>

          </div>
        </div>
      </ScrollArea>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={(open) => { setConnectDialogOpen(open); if (!open) setSelectedGateway(null); }}>
        <DialogContent className="sm:max-w-md bg-card border-0 rounded-[24px] p-0 overflow-hidden">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: (selectedGateway?.color || "#00bcff") + "15" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke={selectedGateway?.color || "#00bcff"} strokeWidth="2"/>
                  <path d="M3 10h18" stroke={selectedGateway?.color || "#00bcff"} strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  {selectedGateway && isGatewayConnected(selectedGateway.id) ? "Configurar" : "Conectar"} {selectedGateway?.name || "Gateway"}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {selectedGateway && isGatewayConnected(selectedGateway.id) ? "Atualize seu Access Token" : "Insira seu Access Token para conectar"}
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-600 transition-colors"
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
                className="w-full bg-foreground dark:bg-card text-background dark:text-foreground hover:bg-[#222] h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
