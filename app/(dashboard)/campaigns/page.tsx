"use client"

import { useState, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { useAuth } from "@/lib/auth-context"
import {
  Plus, Search, Target, Play, Pause, MoreVertical, X, Send,
  UserX, ShoppingCart, CheckCircle2, Clock, Trash2, RefreshCw,
  Megaphone, MessageSquare, Users, Sparkles, Calendar, Loader2, ArrowLeft
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
    description: "Usuarios que deram /start mas nao avancaram no fluxo",
    icon: UserX,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    glowColor: "rgba(249, 115, 22, 0.15)"
  },
  {
    id: "not_paid",
    name: "Nao pagou",
    description: "Usuarios que chegaram ate o pagamento mas nao finalizaram",
    icon: ShoppingCart,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    glowColor: "rgba(239, 68, 68, 0.15)"
  },
  {
    id: "paid",
    name: "Pagou",
    description: "Usuarios que ja realizaram pelo menos uma compra",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    glowColor: "rgba(34, 197, 94, 0.15)"
  }
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; dotColor: string }> = {
  rascunho: { label: "Rascunho", color: "text-gray-400", bgColor: "bg-gray-500/10", dotColor: "bg-gray-400" },
  ativa: { label: "Ativa", color: "text-emerald-400", bgColor: "bg-emerald-500/10", dotColor: "bg-emerald-400" },
  pausada: { label: "Pausada", color: "text-yellow-400", bgColor: "bg-yellow-500/10", dotColor: "bg-yellow-400" },
  concluida: { label: "Concluida", color: "text-blue-400", bgColor: "bg-blue-500/10", dotColor: "bg-blue-400" },
}

// ==================== MAIN PAGE ====================
export default function CampaignsPage() {
  const { selectedBot } = useBots()
  const { session } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
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

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || c.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === "ativa").length,
    totalSent: campaigns.reduce((acc, c) => acc + (c.sent_count || 0), 0),
  }

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f5f5f7] min-h-[calc(100vh-60px)]">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Remarketing</h1>
                <p className="text-gray-500">Crie campanhas para reconquistar seus leads</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#bfff00] text-black text-sm font-bold hover:bg-[#a8e600] transition-colors shadow-lg shadow-[#bfff00]/20"
              >
                <Plus className="h-4 w-4" />
                Nova Campanha
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {/* Total Campanhas */}
              <div className="relative rounded-[20px] p-5 overflow-hidden bg-[#1c1c1e]">
                <div 
                  className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center bottom, rgba(190, 255, 0, 0.15) 0%, transparent 70%)" }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Campanhas</span>
                    <div className="w-9 h-9 rounded-xl bg-[#bfff00]/20 flex items-center justify-center">
                      <Target className="h-4 w-4 text-[#bfff00]" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-white">{stats.total}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">campanhas criadas</p>
                </div>
              </div>

              {/* Ativas */}
              <div className="relative rounded-[20px] p-5 overflow-hidden bg-[#1c1c1e]">
                <div 
                  className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center bottom, rgba(34, 197, 94, 0.15) 0%, transparent 70%)" }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Ativas</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Play className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-emerald-400">{stats.active}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">em execucao</p>
                </div>
              </div>

              {/* Total Enviados */}
              <div className="relative rounded-[20px] p-5 overflow-hidden bg-[#1c1c1e]">
                <div 
                  className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center bottom, rgba(59, 130, 246, 0.15) 0%, transparent 70%)" }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Mensagens</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Send className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-white">{stats.totalSent.toLocaleString("pt-BR")}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">enviadas no total</p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar campanha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#bfff00]/30 focus:border-[#bfff00]/50 transition-all"
                />
              </div>
              
              {/* Status Filters */}
              <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-gray-200">
                {["all", "ativa", "pausada", "rascunho"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filterStatus === status
                        ? "bg-[#bfff00] text-black"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {status === "all" ? "Todas" : STATUS_CONFIG[status]?.label || status}
                  </button>
                ))}
              </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="grid grid-cols-[1fr_160px_120px_100px_80px] gap-4 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Campanha</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Publico</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Enviados</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Acoes</span>
              </div>

              {/* Body */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <EmptyState onCreateClick={() => setShowCreateModal(true)} />
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredCampaigns.map((campaign) => {
                    const audience = getAudienceInfo(campaign.audience || "not_paid")
                    const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.rascunho
                    const AudienceIcon = audience?.icon || Users
                    const msgCount = campaign.nodes?.filter((n) => n.type === "message").length || 0
                    
                    return (
                      <div
                        key={campaign.id}
                        className="grid grid-cols-[1fr_160px_120px_100px_80px] gap-4 items-center px-5 py-4 hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Campanha */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-[#1c1c1e] flex items-center justify-center shrink-0">
                            <Megaphone className="h-5 w-5 text-[#bfff00]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{campaign.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {msgCount} msgs
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(campaign.created_at).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Publico */}
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${audience?.bgColor} flex items-center justify-center`}>
                            <AudienceIcon className={`h-4 w-4 ${audience?.color}`} />
                          </div>
                          <span className="text-xs font-medium text-gray-700 truncate">{audience?.name || "Nao definido"}</span>
                        </div>

                        {/* Enviados */}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{(campaign.sent_count || 0).toLocaleString("pt-BR")}</p>
                          <p className="text-xs text-gray-500">{campaign.open_rate || 0}% abriram</p>
                        </div>

                        {/* Status */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.bgColor} ${status.color}`}>
                          {campaign.status === "ativa" && <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} animate-pulse`} />}
                          {status.label}
                        </span>

                        {/* Acoes */}
                        <div className="flex items-center justify-end gap-1">
                          {campaign.status !== "concluida" && (
                            <button 
                              onClick={() => handleToggleStatus(campaign)}
                              disabled={activating === campaign.id}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                campaign.status === "ativa"
                                  ? "hover:bg-yellow-50 text-yellow-500"
                                  : "hover:bg-emerald-50 text-emerald-500"
                              }`}
                            >
                              {activating === campaign.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : campaign.status === "ativa" ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(campaign.id)}
                            disabled={deleting === campaign.id}
                            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500 transition-colors"
                          >
                            {deleting === campaign.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </ScrollArea>

      {/* Create Campaign Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => !open && resetCreateModal()}>
        <DialogContent className="sm:max-w-[480px] bg-[#1c1c1e] border-[#2a2a2e] p-0 gap-0 overflow-hidden rounded-2xl [&>button]:hidden">
          <div className="p-6">
            {/* Close */}
            <button
              onClick={resetCreateModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#2a2a2e] flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Step 1: Nome */}
            {createStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Nova Campanha</h3>
                  <p className="text-sm text-gray-500">De um nome para sua campanha de remarketing</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Nome da Campanha</label>
                  <input
                    type="text"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="Ex: Recuperacao de Carrinho"
                    className="w-full h-12 px-4 bg-[#2a2a2e] border border-[#3a3a3e] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#bfff00]/50 transition-colors"
                    autoFocus
                  />
                </div>

                <button
                  onClick={() => newCampaignName.trim() && setCreateStep(2)}
                  disabled={!newCampaignName.trim()}
                  className="w-full h-12 rounded-xl bg-[#bfff00] text-black font-bold hover:bg-[#a8e600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar
                </button>
              </div>
            )}

            {/* Step 2: Publico */}
            {createStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCreateStep(1)}
                    className="w-8 h-8 rounded-xl bg-[#2a2a2e] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h3 className="text-lg font-bold text-white">Selecione o Publico</h3>
                    <p className="text-sm text-gray-500">Escolha quem vai receber sua campanha</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {AUDIENCES.map((audience) => {
                    const Icon = audience.icon
                    const isSelected = newCampaignAudience === audience.id
                    
                    return (
                      <button
                        key={audience.id}
                        onClick={() => setNewCampaignAudience(audience.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? `${audience.bgColor} ${audience.borderColor}`
                            : "bg-[#2a2a2e] border-[#3a3a3e] hover:border-[#4a4a4e]"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl ${audience.bgColor} flex items-center justify-center shrink-0`}>
                          <Icon className={`h-6 w-6 ${audience.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold ${isSelected ? audience.color : "text-white"}`}>{audience.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{audience.description}</p>
                        </div>
                        {isSelected && (
                          <div className={`w-6 h-6 rounded-full ${audience.bgColor} flex items-center justify-center`}>
                            <CheckCircle2 className={`h-4 w-4 ${audience.color}`} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={handleCreateCampaign}
                  disabled={!newCampaignAudience}
                  className="w-full h-12 rounded-xl bg-[#bfff00] text-black font-bold hover:bg-[#a8e600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Criar Campanha
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ==================== EMPTY STATE ====================
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icone */}
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl bg-[#1c1c1e] flex items-center justify-center shadow-lg">
          <Target className="h-9 w-9 text-[#bfff00]" />
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-[#bfff00] flex items-center justify-center shadow-lg">
          <Sparkles className="h-3 w-3 text-black" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">Crie sua primeira campanha</h2>
      <p className="text-gray-500 text-sm leading-relaxed mb-6 text-center max-w-md">
        Campanhas de remarketing ajudam a reengajar usuarios que pararam no meio do funil. 
        Envie sequencias automaticas de mensagens.
      </p>

      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#bfff00] text-black text-sm font-bold hover:bg-[#a8e600] transition-colors shadow-lg shadow-[#bfff00]/20"
      >
        <Plus className="h-4 w-4" />
        Criar Campanha
      </button>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-sm">
        {[
          { icon: MessageSquare, label: "Mensagens" },
          { icon: Clock, label: "Delays" },
          { icon: Users, label: "Segmentacao" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <Icon className="h-5 w-5 text-[#bfff00]" />
            <span className="text-xs text-gray-600 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
