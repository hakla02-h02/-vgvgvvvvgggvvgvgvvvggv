"use client"

import { useState, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { useAuth } from "@/lib/auth-context"
import {
  Plus, Target, Play, Pause, Send,
  UserX, ShoppingCart, CheckCircle2, Trash2, RefreshCw,
  Megaphone, MessageSquare, Loader2, ArrowRight, Zap, Users, Sparkles
} from "lucide-react"

// ==================== TYPES ====================
interface CampaignNode {
  id?: string
  type: "message" | "delay"
  label: string
  config: Record<string, unknown>
  position: number
}

interface Campaign {
  id: string
  bot_id: string
  user_id: string
  name: string
  status: "rascunho" | "ativa" | "pausada" | "concluida"
  audience?: "started_not_continued" | "not_paid" | "paid"
  campaign_type: "basic" | "complete"
  created_at: string
  updated_at: string
  nodes: CampaignNode[]
  sent_count?: number
  open_rate?: number
}

const AUDIENCES = [
  {
    id: "started_not_continued",
    name: "Iniciou mas nao continuou",
    shortName: "Abandonou",
    description: "Usuarios que deram /start mas nao avancaram",
    icon: UserX,
    color: "#f97316",
    bgGradient: "from-orange-500/20 to-orange-500/5",
  },
  {
    id: "not_paid",
    name: "Nao finalizou pagamento",
    shortName: "Nao pagou",
    description: "Chegaram ate o pagamento mas nao finalizaram",
    icon: ShoppingCart,
    color: "#ef4444",
    bgGradient: "from-red-500/20 to-red-500/5",
  },
  {
    id: "paid",
    name: "Clientes que pagaram",
    shortName: "Pagou",
    description: "Usuarios que ja realizaram compra",
    icon: CheckCircle2,
    color: "#22c55e",
    bgGradient: "from-emerald-500/20 to-emerald-500/5",
  }
]

// ==================== MAIN PAGE ====================
export default function CampaignsPage() {
  const { selectedBot } = useBots()
  const { session } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createStep, setCreateStep] = useState(1)
  const [newCampaignName, setNewCampaignName] = useState("")
  const [newCampaignAudience, setNewCampaignAudience] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activating, setActivating] = useState<string | null>(null)

  const fetchCampaigns = useCallback(async () => {
    if (!selectedBot) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/campaigns?bot_id=${selectedBot.id}`)
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch { /* ignore */ }
    setIsLoading(false)
  }, [selectedBot])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await fetch(`/api/campaigns?id=${id}`, { method: "DELETE" })
      setCampaigns((prev) => prev.filter((c) => c.id !== id))
    } catch { /* ignore */ }
    setDeleting(null)
  }

  const handleToggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === "ativa" ? "pausada" : "ativa"
    setActivating(campaign.id)
    try {
      await fetch("/api/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: campaign.id, status: newStatus }),
      })
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? { ...c, status: newStatus } : c))
      )
    } catch { /* ignore */ }
    setActivating(null)
  }

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim() || !newCampaignAudience || !selectedBot || !session?.userId) return
    
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_id: selectedBot.id,
          user_id: session.userId,
          name: newCampaignName,
          audience: newCampaignAudience,
          status: "rascunho",
          campaign_type: "basic",
          nodes: []
        }),
      })
      const data = await res.json()
      if (data.campaign) {
        setCampaigns((prev) => [data.campaign, ...prev])
      }
    } catch { /* ignore */ }
    
    resetCreateModal()
  }

  const resetCreateModal = () => {
    setShowCreateModal(false)
    setNewCampaignName("")
    setNewCampaignAudience(null)
    setCreateStep(1)
  }

  const getAudienceInfo = (audienceId: string) => {
    return AUDIENCES.find(a => a.id === audienceId)
  }

  if (!selectedBot) {
    return <NoBotSelected />
  }

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === "ativa").length,
    totalSent: campaigns.reduce((acc, c) => acc + (c.sent_count || 0), 0),
  }

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="min-h-[calc(100vh-60px)] bg-[#f5f5f7]">
          <div className="max-w-5xl mx-auto px-6 py-8">
            
            {/* Hero Section - Unique */}
            <div className="relative mb-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#bfff00] to-[#9fdf00] flex items-center justify-center shadow-xl shadow-[#bfff00]/30">
                    <Megaphone className="h-8 w-8 text-black" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Remarketing</h1>
                    <p className="text-gray-500 mt-1">Reconquiste leads com campanhas automatizadas</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20 group"
                >
                  <Plus className="h-5 w-5" />
                  <span>Nova Campanha</span>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

            {/* Mini Stats Row - Inline Compact */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#bfff00]" />
                <span className="text-sm font-semibold text-gray-700">{stats.total} campanhas</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-gray-700">{stats.active} ativas</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
                <Send className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">{stats.totalSent.toLocaleString("pt-BR")} enviadas</span>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : campaigns.length === 0 ? (
              /* Empty State - Unique Design */
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#bfff00]/5 to-transparent rounded-3xl" />
                <div className="relative bg-white rounded-3xl border border-gray-200/80 shadow-sm p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 mb-6">
                    <Zap className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Comece a reconquistar seus leads</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Crie campanhas de remarketing para reengajar usuarios que abandonaram o funil ou nao finalizaram a compra.
                  </p>
                  
                  {/* Quick Audience Preview */}
                  <div className="flex items-center justify-center gap-4 mb-8">
                    {AUDIENCES.map((aud) => {
                      const Icon = aud.icon
                      return (
                        <div key={aud.id} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100">
                          <Icon className="h-4 w-4" style={{ color: aud.color }} />
                          <span className="text-xs font-medium text-gray-600">{aud.shortName}</span>
                        </div>
                      )
                    })}
                  </div>

                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#bfff00] text-black text-sm font-bold hover:bg-[#d4ff4d] transition-all shadow-lg shadow-[#bfff00]/30"
                  >
                    <Sparkles className="h-5 w-5" />
                    Criar Primeira Campanha
                  </button>
                </div>
              </div>
            ) : (
              /* Campaigns Grid - Card Layout (NOT Table) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((campaign) => {
                  const audience = getAudienceInfo(campaign.audience || "not_paid")
                  const AudienceIcon = audience?.icon || Users
                  const msgCount = campaign.nodes?.filter((n) => n.type === "message").length || 0
                  const isActive = campaign.status === "ativa"
                  const isPaused = campaign.status === "pausada"
                  
                  return (
                    <div
                      key={campaign.id}
                      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isActive 
                          ? "border-emerald-200 shadow-lg shadow-emerald-100" 
                          : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
                      }`}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
                      )}
                      
                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${audience?.bgGradient || "from-gray-100 to-gray-50"}`}
                            >
                              <AudienceIcon className="h-6 w-6" style={{ color: audience?.color }} />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{campaign.name}</h3>
                              <p className="text-xs text-gray-500">{audience?.shortName || "Publico"}</p>
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isActive 
                              ? "bg-emerald-100 text-emerald-700" 
                              : isPaused 
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                          }`}>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                            {isActive ? "Ativa" : isPaused ? "Pausada" : "Rascunho"}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 mb-4">
                          <div>
                            <p className="text-2xl font-black text-gray-900">{campaign.sent_count || 0}</p>
                            <p className="text-xs text-gray-500">enviadas</p>
                          </div>
                          <div className="w-px h-8 bg-gray-200" />
                          <div>
                            <p className="text-2xl font-black text-gray-900">{campaign.open_rate || 0}%</p>
                            <p className="text-xs text-gray-500">abertura</p>
                          </div>
                          <div className="w-px h-8 bg-gray-200" />
                          <div>
                            <p className="text-2xl font-black text-gray-900">{msgCount}</p>
                            <p className="text-xs text-gray-500">mensagens</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                          <button 
                            onClick={() => handleToggleStatus(campaign)}
                            disabled={activating === campaign.id}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                              isActive
                                ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {activating === campaign.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isActive ? (
                              <>
                                <Pause className="h-4 w-4" />
                                Pausar
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                Ativar
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => handleDelete(campaign.id)}
                            disabled={deleting === campaign.id}
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            {deleting === campaign.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </div>
      </ScrollArea>

      {/* Create Campaign Modal - Unique Design */}
      <Dialog open={showCreateModal} onOpenChange={(open) => !open && resetCreateModal()}>
        <DialogContent className="sm:max-w-[520px] bg-white border-0 p-0 gap-0 overflow-hidden rounded-3xl shadow-2xl [&>button]:hidden">
          
          {/* Header with gradient */}
          <div className="relative px-8 pt-8 pb-6 bg-gradient-to-b from-gray-50 to-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#bfff00] to-[#9fdf00] flex items-center justify-center shadow-lg shadow-[#bfff00]/30">
                <Target className="h-7 w-7 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Nova Campanha</h2>
                <p className="text-sm text-gray-500">Passo {createStep} de 2</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#bfff00] transition-all duration-300"
                style={{ width: createStep === 1 ? "50%" : "100%" }}
              />
            </div>
          </div>

          <div className="px-8 pb-8 pt-4">
            {/* Step 1: Nome */}
            {createStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da campanha</label>
                  <input
                    type="text"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="Ex: Recuperar carrinhos abandonados"
                    className="w-full h-14 px-5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#bfff00] focus:bg-white transition-all text-base"
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-gray-500">Escolha um nome descritivo para identificar sua campanha</p>
                </div>

                <button
                  onClick={() => setCreateStep(2)}
                  disabled={!newCampaignName.trim()}
                  className="w-full h-14 rounded-2xl bg-gray-900 text-white text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  Continuar
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Step 2: Publico */}
            {createStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Selecione o publico-alvo</label>
                  
                  <div className="space-y-3">
                    {AUDIENCES.map((aud) => {
                      const Icon = aud.icon
                      const isSelected = newCampaignAudience === aud.id
                      
                      return (
                        <button
                          key={aud.id}
                          type="button"
                          onClick={() => setNewCampaignAudience(aud.id)}
                          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                            isSelected 
                              ? "border-[#bfff00] bg-[#bfff00]/5" 
                              : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div 
                              className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${aud.bgGradient}`}
                            >
                              <Icon className="h-6 w-6" style={{ color: aud.color }} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{aud.name}</p>
                              <p className="text-sm text-gray-500">{aud.description}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected ? "border-[#bfff00] bg-[#bfff00]" : "border-gray-300"
                            }`}>
                              {isSelected && (
                                <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCreateStep(1)}
                    className="flex-1 h-14 rounded-2xl bg-gray-100 text-gray-700 text-base font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleCreateCampaign}
                    disabled={!newCampaignAudience}
                    className="flex-1 h-14 rounded-2xl bg-[#bfff00] text-black text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#d4ff4d] transition-colors flex items-center justify-center gap-2"
                  >
                    Criar Campanha
                    <Sparkles className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
