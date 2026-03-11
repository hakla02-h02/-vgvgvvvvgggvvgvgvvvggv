"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { useAuth } from "@/lib/auth-context"
import {
  Plus, Megaphone, Send, X, Loader2, Trash2,
  Clock, MessageSquare, Image as ImageIcon, Link2,
  ChevronRight, Zap, Play, Pause, ArrowLeft, Search,
  MoreHorizontal, Calendar, Target, Users, Sparkles,
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
  campaign_type: "basic" | "complete"
  created_at: string
  updated_at: string
  nodes: CampaignNode[]
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  rascunho: { bg: "bg-[#1a1a1a]", text: "text-zinc-400", dot: "bg-zinc-500", label: "Rascunho" },
  ativa: { bg: "bg-[#1a2a1a]", text: "text-[#a3e635]", dot: "bg-[#a3e635]", label: "Ativa" },
  pausada: { bg: "bg-[#2a2a1a]", text: "text-amber-400", dot: "bg-amber-400", label: "Pausada" },
  concluida: { bg: "bg-[#1a1a2a]", text: "text-blue-400", dot: "bg-blue-400", label: "Concluida" },
}

const DELAY_OPTIONS = [
  { value: "1h", label: "1 hora", ms: 3600000 },
  { value: "6h", label: "6 horas", ms: 21600000 },
  { value: "12h", label: "12 horas", ms: 43200000 },
  { value: "1d", label: "1 dia", ms: 86400000 },
  { value: "2d", label: "2 dias", ms: 172800000 },
  { value: "3d", label: "3 dias", ms: 259200000 },
  { value: "7d", label: "7 dias", ms: 604800000 },
]

// ==================== MAIN PAGE ====================
export default function CampaignsPage() {
  const { selectedBot } = useBots()
  const { session } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

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
      if (selectedCampaign?.id === id) setSelectedCampaign(null)
    } catch { /* ignore */ }
    setDeleting(null)
  }

  const [activating, setActivating] = useState<string | null>(null)

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
      if (selectedCampaign?.id === campaign.id) {
        setSelectedCampaign({ ...campaign, status: newStatus })
      }
    } catch { /* ignore */ }
    setActivating(null)
  }

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Remarketing" />
        <NoBotSelected />
      </>
    )
  }

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || c.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <>
      <DashboardHeader title="Remarketing" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-4 md:p-6">
          
          {/* Header com busca e filtros */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar campanhas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-zinc-200 dark:border-zinc-800 rounded-xl h-10 text-sm"
                />
              </div>
              
              {/* Filtros de status */}
              <div className="flex items-center gap-1 p-1 bg-card rounded-xl border border-zinc-200 dark:border-zinc-800">
                {["all", "ativa", "pausada", "rascunho"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterStatus === status
                        ? "bg-[#a3e635] text-black"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {status === "all" ? "Todas" : STATUS_CONFIG[status]?.label || status}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setShowWizard(true)}
              className="bg-[#a3e635] text-black hover:bg-[#bef264] rounded-xl gap-2 font-semibold h-10"
            >
              <Plus className="h-4 w-4" />
              Nova Campanha
            </Button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-2 border-zinc-800" />
                  <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-[#a3e635] border-t-transparent animate-spin" />
                </div>
                <p className="text-sm text-zinc-500">Carregando campanhas...</p>
              </div>
            </div>
          ) : campaigns.length === 0 ? (
            <EmptyState onCreateClick={() => setShowWizard(true)} />
          ) : filteredCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Search className="h-10 w-10 text-zinc-700 mb-3" />
              <p className="text-zinc-400 text-sm">Nenhuma campanha encontrada</p>
              <p className="text-zinc-600 text-xs mt-1">Tente ajustar sua busca ou filtros</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Lista de campanhas */}
              <div className="flex flex-col gap-3 lg:col-span-3">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    isSelected={selectedCampaign?.id === campaign.id}
                    isDeleting={deleting === campaign.id}
                    isActivating={activating === campaign.id}
                    onSelect={() => setSelectedCampaign(campaign)}
                    onDelete={() => handleDelete(campaign.id)}
                    onToggleStatus={() => handleToggleStatus(campaign)}
                  />
                ))}
              </div>

              {/* Painel de detalhes */}
              <div className="lg:col-span-2">
                {selectedCampaign ? (
                  <CampaignDetail campaign={selectedCampaign} />
                ) : (
                  <div className="h-full min-h-[400px] rounded-[28px] border border-zinc-200 dark:border-zinc-800 bg-card flex flex-col items-center justify-center p-6">
                    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Megaphone className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="text-foreground text-sm font-medium">Selecione uma campanha</p>
                    <p className="text-muted-foreground text-xs mt-1">Clique em uma campanha para ver detalhes</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Wizard overlay */}
      {showWizard && (
        <CampaignWizard
          botId={selectedBot.id}
          userId={session?.userId || ""}
          onClose={() => setShowWizard(false)}
          onCreated={(campaign) => {
            setCampaigns((prev) => [campaign, ...prev])
            setSelectedCampaign(campaign)
            setShowWizard(false)
          }}
        />
      )}
    </>
  )
}

// ==================== EMPTY STATE ====================
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icone */}
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-3xl bg-[#111] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
          <Target className="h-9 w-9 text-[#a3e635]" />
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-[#a3e635] flex items-center justify-center shadow-lg">
          <Sparkles className="h-3 w-3 text-black" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-2">Crie sua primeira campanha</h2>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6 text-center max-w-md">
        Campanhas de remarketing ajudam a reengajar usuarios que pararam no meio do funil. 
        Envie sequencias automaticas de mensagens.
      </p>

      <Button
        onClick={onCreateClick}
        className="bg-[#a3e635] text-black hover:bg-[#bef264] rounded-xl gap-2 font-semibold h-11 px-6"
      >
        <Plus className="h-4 w-4" />
        Criar Campanha
      </Button>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-sm">
        {[
          { icon: MessageSquare, label: "Mensagens" },
          { icon: Clock, label: "Delays" },
          { icon: Users, label: "Segmentacao" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== CAMPAIGN CARD ====================
function CampaignCard({
  campaign, isSelected, isDeleting, isActivating, onSelect, onDelete, onToggleStatus,
}: {
  campaign: Campaign
  isSelected: boolean
  isDeleting: boolean
  isActivating: boolean
  onSelect: () => void
  onDelete: () => void
  onToggleStatus: () => void
}) {
  const st = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.rascunho
  const msgCount = campaign.nodes.filter((n) => n.type === "message").length
  const delayCount = campaign.nodes.filter((n) => n.type === "delay").length

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-[20px] border transition-all cursor-pointer overflow-hidden ${
        isSelected 
          ? "border-[#a3e635]/40 bg-card shadow-lg" 
          : "border-zinc-200 dark:border-zinc-800 bg-card hover:border-[#a3e635]/30 hover:shadow-md"
      }`}
    >
      {/* Accent bar quando selecionado */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#a3e635]" />
      )}

      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            {/* Icone com status */}
            <div className={`relative shrink-0 h-12 w-12 rounded-2xl ${st.bg} flex items-center justify-center`}>
              <Megaphone className={`h-5 w-5 ${st.text}`} />
              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${st.dot} border-2 border-card`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-sm font-semibold text-white truncate">{campaign.name}</h3>
                <Badge className={`${st.bg} ${st.text} border-0 text-[10px] px-2 py-0 h-5 rounded-md font-medium`}>
                  {st.label}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {msgCount} {msgCount === 1 ? "msg" : "msgs"}
                </span>
                {delayCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {delayCount} {delayCount === 1 ? "delay" : "delays"}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(campaign.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            {campaign.status !== "concluida" && (
              <button
                onClick={onToggleStatus}
                disabled={isActivating}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  campaign.status === "ativa"
                    ? "bg-amber-500/10 hover:bg-amber-500/20"
                    : "bg-[#a3e635]/10 hover:bg-[#a3e635]/20"
                }`}
                title={campaign.status === "ativa" ? "Pausar" : "Ativar"}
              >
                {isActivating ? (
                  <Loader2 className="h-4 w-4 text-[#a3e635] animate-spin" />
                ) : campaign.status === "ativa" ? (
                  <Pause className="h-4 w-4 text-amber-400" />
                ) : (
                  <Play className="h-4 w-4 text-[#a3e635]" />
                )}
              </button>
            )}
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
              ) : (
                <Trash2 className="h-4 w-4 text-red-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== CAMPAIGN DETAIL ====================
function CampaignDetail({ campaign }: { campaign: Campaign }) {
  const st = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.rascunho

  return (
    <div className="rounded-[28px] border border-zinc-800 bg-[#0a0a0a] overflow-hidden">
      {/* Header com gradiente */}
      <div className="p-5 bg-gradient-to-b from-zinc-900/50 to-transparent border-b border-zinc-800/50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">{campaign.name}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Criada em {new Date(campaign.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <Badge className={`${st.bg} ${st.text} border-0 text-[10px] px-2.5 py-0.5 rounded-lg font-medium`}>
            {st.label}
          </Badge>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#111] border border-zinc-800/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Send className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Enviadas</span>
            </div>
            <p className="text-lg font-bold text-white">0</p>
          </div>
          <div className="rounded-2xl bg-[#111] border border-zinc-800/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Alcance</span>
            </div>
            <p className="text-lg font-bold text-white">0%</p>
          </div>
        </div>
      </div>

      {/* Timeline dos nodes */}
      <div className="p-5">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">Sequencia</p>
        
        {campaign.nodes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-zinc-600">Nenhuma etapa configurada</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {campaign.nodes.map((node, i) => {
              const isMsg = node.type === "message"
              const text = (node.config?.text as string) || ""
              const hasMedia = !!(node.config?.media_url as string)
              const delayLabel = (node.config?.delay_label as string) || ""

              return (
                <div key={node.id || i} className="flex gap-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isMsg ? "bg-[#a3e635]/10" : "bg-blue-500/10"
                    }`}>
                      {isMsg ? (
                        <MessageSquare className="h-4 w-4 text-[#a3e635]" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-400" />
                      )}
                    </div>
                    {i < campaign.nodes.length - 1 && (
                      <div className="w-px flex-1 bg-zinc-800 my-1.5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-4 min-w-0 flex-1">
                    <p className="text-xs font-medium text-white">
                      {isMsg ? (node.label || "Mensagem") : `Aguardar ${delayLabel}`}
                    </p>
                    {isMsg && text && (
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{text}</p>
                    )}
                    {isMsg && hasMedia && (
                      <span className="text-[10px] text-zinc-600 flex items-center gap-1 mt-0.5">
                        <ImageIcon className="h-3 w-3" /> Midia anexada
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== WIZARD ====================
type WizardStep = "name" | "type" | "basic" | "complete"

function CampaignWizard({
  botId, userId, onClose, onCreated,
}: {
  botId: string
  userId: string
  onClose: () => void
  onCreated: (campaign: Campaign) => void
}) {
  const [step, setStep] = useState<WizardStep>("name")
  const [campaignName, setCampaignName] = useState("")
  const [campaignType, setCampaignType] = useState<"basic" | "complete">("basic")
  const [isSaving, setIsSaving] = useState(false)

  // Basic mode state
  const [basicText, setBasicText] = useState("")
  const [basicMediaUrl, setBasicMediaUrl] = useState("")
  const [basicMediaType, setBasicMediaType] = useState<"photo" | "video">("photo")
  const [basicButtons, setBasicButtons] = useState<{ text: string; url: string }[]>([])
  const [basicHasButtons, setBasicHasButtons] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Complete mode state
  const [completeNodes, setCompleteNodes] = useState<CampaignNode[]>([
    { type: "message", label: "Mensagem 1", config: { text: "" }, position: 0 },
  ])
  const [editingNodeIndex, setEditingNodeIndex] = useState<number | null>(null)

  const stepNumber = step === "name" ? 1 : step === "type" ? 2 : 3
  const totalSteps = 3

  // ---- Upload handler ----
  const handleMediaUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mediaType", file.type.startsWith("video") ? "video" : "photo")
      const res = await fetch("/api/upload-media", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        return { url: data.url, type: file.type.startsWith("video") ? "video" as const : "photo" as const }
      }
    } catch { /* ignore */ }
    setIsUploading(false)
    return null
  }

  // ---- Save campaign ----
  const handleSave = async () => {
    if (!campaignName.trim()) return
    setIsSaving(true)

    let nodes: CampaignNode[] = []

    if (campaignType === "basic") {
      nodes = [{
        type: "message",
        label: "Mensagem",
        config: {
          text: basicText,
          media_url: basicMediaUrl || "",
          media_type: basicMediaType || "",
          buttons: basicHasButtons && basicButtons.length > 0 ? JSON.stringify(basicButtons) : "",
        },
        position: 0,
      }]
    } else {
      nodes = completeNodes.map((n, i) => ({ ...n, position: i }))
    }

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_id: botId,
          user_id: userId,
          name: campaignName,
          campaign_type: campaignType,
          nodes,
        }),
      })
      const data = await res.json()
      if (data.campaign) {
        const refetch = await fetch(`/api/campaigns?bot_id=${botId}`)
        const refetchData = await refetch.json()
        const created = (refetchData.campaigns || []).find((c: Campaign) => c.id === data.campaign.id)
        onCreated(created || { ...data.campaign, nodes })
      }
    } catch { /* ignore */ }
    setIsSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-[#0a0a0a] border border-zinc-800 rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i < stepNumber ? "w-6 bg-[#a3e635]" : "w-2 bg-zinc-800"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500 ml-2">Passo {stepNumber} de {totalSteps}</span>
          </div>
          <button 
            onClick={onClose} 
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === "name" && (
            <StepName
              value={campaignName}
              onChange={setCampaignName}
              onNext={() => setStep("type")}
            />
          )}
          {step === "type" && (
            <StepType
              selected={campaignType}
              onSelect={(type) => {
                setCampaignType(type)
                setStep(type)
              }}
              onBack={() => setStep("name")}
            />
          )}
          {step === "basic" && (
            <StepBasic
              text={basicText}
              setText={setBasicText}
              mediaUrl={basicMediaUrl}
              mediaType={basicMediaType}
              hasButtons={basicHasButtons}
              setHasButtons={setBasicHasButtons}
              buttons={basicButtons}
              setButtons={setBasicButtons}
              isUploading={isUploading}
              onUpload={async (file) => {
                const result = await handleMediaUpload(file)
                if (result) {
                  setBasicMediaUrl(result.url)
                  setBasicMediaType(result.type)
                }
                setIsUploading(false)
              }}
              onRemoveMedia={() => { setBasicMediaUrl(""); setBasicMediaType("photo") }}
              onBack={() => setStep("type")}
            />
          )}
          {step === "complete" && (
            <StepComplete
              nodes={completeNodes}
              setNodes={setCompleteNodes}
              editingIndex={editingNodeIndex}
              setEditingIndex={setEditingNodeIndex}
              onUpload={handleMediaUpload}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onBack={() => setStep("type")}
            />
          )}
        </div>

        {/* Footer */}
        {(step === "basic" || step === "complete") && (
          <div className="flex items-center justify-between p-5 border-t border-zinc-800/50">
            <button
              onClick={() => setStep("type")}
              className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !campaignName.trim() || (step === "basic" && !basicText.trim())}
              className="bg-[#a3e635] text-black hover:bg-[#bef264] rounded-xl gap-2 font-semibold h-10 px-5"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Criar Campanha
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== WIZARD STEPS ====================

function StepName({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <h2 className="text-xl font-bold text-white">Nome da Campanha</h2>
        <p className="text-sm text-zinc-500 mt-1">Escolha um nome para identificar sua campanha</p>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: Remarketing Black Friday"
        className="bg-[#111] border-zinc-800 rounded-xl h-12 text-white placeholder:text-zinc-600"
        autoFocus
        onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) onNext() }}
      />
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!value.trim()}
          className="bg-[#a3e635] text-black hover:bg-[#bef264] rounded-xl gap-2 font-semibold"
        >
          Proximo
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function StepType({ selected, onSelect, onBack }: {
  selected: "basic" | "complete"
  onSelect: (type: "basic" | "complete") => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <h2 className="text-xl font-bold text-white">Tipo de Campanha</h2>
        <p className="text-sm text-zinc-500 mt-1">Escolha como quer construir sua campanha</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Basic */}
        <button
          onClick={() => onSelect("basic")}
          className="group flex flex-col items-start gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#111] hover:border-[#a3e635]/40 hover:bg-[#a3e635]/[0.03] transition-all text-left"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a3e635]/10 group-hover:bg-[#a3e635]/20 transition-colors">
            <Zap className="h-6 w-6 text-[#a3e635]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Mensagem Rapida</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Uma unica mensagem com imagem, texto e botoes. Pronta em segundos.
            </p>
          </div>
        </button>

        {/* Complete */}
        <button
          onClick={() => onSelect("complete")}
          className="group flex flex-col items-start gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#111] hover:border-blue-500/40 hover:bg-blue-500/[0.03] transition-all text-left"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
            <MessageSquare className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Sequencia Completa</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Varias mensagens com delays entre elas. Remarketing ate converter.
            </p>
          </div>
        </button>
      </div>

      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>
    </div>
  )
}

// ==================== STEP BASIC ====================
function StepBasic({
  text, setText, mediaUrl, mediaType, hasButtons, setHasButtons, buttons, setButtons,
  isUploading, onUpload, onRemoveMedia, onBack,
}: {
  text: string; setText: (v: string) => void
  mediaUrl: string; mediaType: "photo" | "video"
  hasButtons: boolean; setHasButtons: (v: boolean) => void
  buttons: { text: string; url: string }[]; setButtons: (v: { text: string; url: string }[]) => void
  isUploading: boolean; onUpload: (file: File) => void; onRemoveMedia: () => void
  onBack: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col lg:flex-row gap-6 pt-4">
      {/* Left - form */}
      <div className="flex-1 flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold text-white">Mensagem da Campanha</h2>
          <p className="text-sm text-zinc-500 mt-1">Configure o conteudo que sera enviado</p>
        </div>

        {/* Media upload */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Midia (opcional)</p>
          {mediaUrl ? (
            <div className="relative rounded-2xl overflow-hidden bg-[#111] border border-zinc-800 h-32 flex items-center justify-center">
              {mediaType === "video" ? (
                <video src={mediaUrl} className="max-h-full max-w-full object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
              )}
              <button
                onClick={onRemoveMedia}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full h-28 rounded-2xl border-2 border-dashed border-zinc-800 bg-[#111] hover:border-[#a3e635]/40 hover:bg-[#a3e635]/[0.02] transition-all flex flex-col items-center justify-center gap-2"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 text-zinc-600" />
                  <span className="text-xs text-zinc-500">Clique para enviar foto ou video</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpload(file)
              e.target.value = ""
            }}
          />
        </div>

        {/* Text */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Mensagem</p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva sua mensagem de remarketing..."
            className="bg-[#111] border-zinc-800 rounded-xl text-white min-h-[120px] placeholder:text-zinc-600"
          />
        </div>

        {/* Buttons toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#111] border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a3e635]/10">
              <Link2 className="h-4 w-4 text-[#a3e635]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Adicionar botoes</p>
              <p className="text-[11px] text-zinc-500">Links clicaveis na mensagem</p>
            </div>
          </div>
          <Switch checked={hasButtons} onCheckedChange={setHasButtons} />
        </div>

        {/* Buttons list */}
        {hasButtons && (
          <div className="flex flex-col gap-3">
            {buttons.map((btn, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={btn.text}
                  onChange={(e) => {
                    const next = [...buttons]
                    next[i] = { ...next[i], text: e.target.value }
                    setButtons(next)
                  }}
                  placeholder="Texto do botao"
                  className="bg-[#111] border-zinc-800 rounded-xl text-white flex-1"
                />
                <Input
                  value={btn.url}
                  onChange={(e) => {
                    const next = [...buttons]
                    next[i] = { ...next[i], url: e.target.value }
                    setButtons(next)
                  }}
                  placeholder="https://..."
                  className="bg-[#111] border-zinc-800 rounded-xl text-white flex-1"
                />
                <button
                  onClick={() => setButtons(buttons.filter((_, j) => j !== i))}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <X className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setButtons([...buttons, { text: "", url: "" }])}
              className="flex items-center gap-2 text-xs font-medium text-[#a3e635] hover:text-[#bef264] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Adicionar botao
            </button>
          </div>
        )}
      </div>

      {/* Right - preview */}
      <div className="w-full lg:w-72 shrink-0">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 text-center">Preview</p>
        <TelegramPreview text={text} mediaUrl={mediaUrl} mediaType={mediaType} buttons={hasButtons ? buttons : []} />
      </div>
    </div>
  )
}

// ==================== STEP COMPLETE ====================
function StepComplete({
  nodes, setNodes, editingIndex, setEditingIndex, onUpload, isUploading, setIsUploading, onBack,
}: {
  nodes: CampaignNode[]
  setNodes: (nodes: CampaignNode[]) => void
  editingIndex: number | null
  setEditingIndex: (i: number | null) => void
  onUpload: (file: File) => Promise<{ url: string; type: "photo" | "video" } | null>
  isUploading: boolean
  setIsUploading: (v: boolean) => void
  onBack: () => void
}) {
  const addNode = (type: "message" | "delay", afterIndex: number) => {
    const newNode: CampaignNode = type === "message"
      ? { type: "message", label: `Mensagem ${nodes.filter((n) => n.type === "message").length + 1}`, config: { text: "" }, position: 0 }
      : { type: "delay", label: "Delay", config: { delay_value: "1d", delay_label: "1 dia" }, position: 0 }

    const next = [...nodes]
    next.splice(afterIndex + 1, 0, newNode)
    setNodes(next.map((n, i) => ({ ...n, position: i })))
  }

  const removeNode = (index: number) => {
    if (nodes.length <= 1) return
    const next = nodes.filter((_, i) => i !== index)
    setNodes(next.map((n, i) => ({ ...n, position: i })))
    if (editingIndex === index) setEditingIndex(null)
  }

  const updateNodeConfig = (index: number, config: Record<string, unknown>) => {
    const next = [...nodes]
    next[index] = { ...next[index], config: { ...next[index].config, ...config } }
    setNodes(next)
  }

  const updateNodeLabel = (index: number, label: string) => {
    const next = [...nodes]
    next[index] = { ...next[index], label }
    setNodes(next)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 pt-4">
      {/* Left - builder */}
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Sequencia de Remarketing</h2>
          <p className="text-sm text-zinc-500 mt-1">Monte sua sequencia de mensagens e delays</p>
        </div>

        <div className="flex flex-col">
          {nodes.map((node, i) => (
            <div key={i} className="flex flex-col">
              {/* Node card */}
              <div
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                  editingIndex === i
                    ? "border-[#a3e635]/40 bg-[#a3e635]/[0.03]"
                    : "border-zinc-800 bg-[#111] hover:bg-[#151515]"
                }`}
                onClick={() => setEditingIndex(editingIndex === i ? null : i)}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  node.type === "message" ? "bg-[#a3e635]/10" : "bg-blue-500/10"
                }`}>
                  {node.type === "message" ? (
                    <MessageSquare className="h-4 w-4 text-[#a3e635]" />
                  ) : (
                    <Clock className="h-4 w-4 text-blue-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {node.type === "message" ? (node.label || "Mensagem") : `Aguardar ${(node.config?.delay_label as string) || "1 dia"}`}
                  </p>
                  {node.type === "message" && (node.config?.text as string) && (
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{node.config.text as string}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {nodes.length > 1 && (
                    <button
                      onClick={() => removeNode(i)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Editing panel */}
              {editingIndex === i && (
                <NodeEditor
                  node={node}
                  onUpdateConfig={(config) => updateNodeConfig(i, config)}
                  onUpdateLabel={(label) => updateNodeLabel(i, label)}
                  onUpload={onUpload}
                  isUploading={isUploading}
                  setIsUploading={setIsUploading}
                />
              )}

              {/* Add button between nodes */}
              <div className="flex items-center justify-center py-2">
                <div className="w-px h-4 bg-zinc-800" />
              </div>
              <div className="flex items-center justify-center gap-2 pb-2">
                <button
                  onClick={() => addNode("message", i)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-zinc-500 bg-zinc-900 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <MessageSquare className="h-3 w-3" /> Mensagem
                </button>
                <button
                  onClick={() => addNode("delay", i)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-zinc-500 bg-zinc-900 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <Clock className="h-3 w-3" /> Delay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - preview timeline */}
      <div className="w-full lg:w-72 shrink-0">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 text-center">Preview da Sequencia</p>
        <div className="rounded-2xl bg-[#111] border border-zinc-800 p-4">
          <div className="flex flex-col">
            {nodes.map((node, i) => {
              const isMsg = node.type === "message"
              return (
                <div key={i} className="flex gap-2.5">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isMsg ? "bg-[#a3e635]/15" : "bg-blue-500/15"
                    }`}>
                      {isMsg ? (
                        <MessageSquare className="h-3.5 w-3.5 text-[#a3e635]" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-blue-400" />
                      )}
                    </div>
                    {i < nodes.length - 1 && <div className="w-px flex-1 bg-zinc-800 my-1" />}
                  </div>
                  <div className="pb-3 min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-white">
                      {isMsg ? (node.label || "Mensagem") : `Aguardar ${(node.config?.delay_label as string) || ""}`}
                    </p>
                    {isMsg && (node.config?.text as string) && (
                      <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{node.config.text as string}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== NODE EDITOR ====================
function NodeEditor({
  node, onUpdateConfig, onUpdateLabel, onUpload, isUploading, setIsUploading,
}: {
  node: CampaignNode
  onUpdateConfig: (config: Record<string, unknown>) => void
  onUpdateLabel: (label: string) => void
  onUpload: (file: File) => Promise<{ url: string; type: "photo" | "video" } | null>
  isUploading: boolean
  setIsUploading: (v: boolean) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localButtons, setLocalButtons] = useState<{ text: string; url: string }[]>(() => {
    try {
      const str = node.config?.buttons as string
      return str ? JSON.parse(str) : []
    } catch { return [] }
  })
  const [hasButtons, setHasButtons] = useState(localButtons.length > 0)

  // Sync buttons to config
  useEffect(() => {
    if (hasButtons && localButtons.length > 0) {
      onUpdateConfig({ buttons: JSON.stringify(localButtons) })
    } else {
      onUpdateConfig({ buttons: "" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localButtons, hasButtons])

  if (node.type === "delay") {
    const currentValue = (node.config?.delay_value as string) || "1d"
    return (
      <div className="mt-3 mb-2 p-4 rounded-2xl bg-[#0f0f0f] border border-zinc-800">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Tempo de espera</p>
        <div className="flex flex-wrap gap-2">
          {DELAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdateConfig({ delay_value: opt.value, delay_label: opt.label })}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                currentValue === opt.value
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-blue-500/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Message node editor
  const mediaUrl = (node.config?.media_url as string) || ""
  const mediaType = (node.config?.media_type as string) || "photo"

  return (
    <div className="mt-3 mb-2 p-4 rounded-2xl bg-[#0f0f0f] border border-zinc-800 flex flex-col gap-4">
      {/* Label */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Nome da etapa</p>
        <Input
          value={node.label}
          onChange={(e) => onUpdateLabel(e.target.value)}
          placeholder="Nome da mensagem"
          className="bg-[#111] border-zinc-800 rounded-xl h-10 text-white text-sm"
        />
      </div>

      {/* Media */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Midia (opcional)</p>
        {mediaUrl ? (
          <div className="relative rounded-xl overflow-hidden bg-zinc-900 h-24 flex items-center justify-center">
            {mediaType === "video" ? (
              <video src={mediaUrl} className="max-h-full max-w-full object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
            )}
            <button
              onClick={() => onUpdateConfig({ media_url: "", media_type: "" })}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-20 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 hover:border-[#a3e635]/40 transition-all flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
            ) : (
              <>
                <ImageIcon className="h-4 w-4 text-zinc-600" />
                <span className="text-[11px] text-zinc-500">Enviar midia</span>
              </>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) {
              setIsUploading(true)
              const result = await onUpload(file)
              if (result) {
                onUpdateConfig({ media_url: result.url, media_type: result.type })
              }
              setIsUploading(false)
            }
            e.target.value = ""
          }}
        />
      </div>

      {/* Text */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Mensagem</p>
        <Textarea
          value={(node.config?.text as string) || ""}
          onChange={(e) => onUpdateConfig({ text: e.target.value })}
          placeholder="Escreva a mensagem..."
          className="bg-[#111] border-zinc-800 rounded-xl text-white text-sm min-h-[80px]"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[#a3e635]" />
          <span className="text-xs text-white">Botoes</span>
        </div>
        <Switch checked={hasButtons} onCheckedChange={setHasButtons} />
      </div>

      {hasButtons && (
        <div className="flex flex-col gap-2">
          {localButtons.map((btn, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={btn.text}
                onChange={(e) => {
                  const next = [...localButtons]
                  next[i] = { ...next[i], text: e.target.value }
                  setLocalButtons(next)
                }}
                placeholder="Texto"
                className="bg-[#111] border-zinc-800 rounded-lg h-9 text-white text-xs flex-1"
              />
              <Input
                value={btn.url}
                onChange={(e) => {
                  const next = [...localButtons]
                  next[i] = { ...next[i], url: e.target.value }
                  setLocalButtons(next)
                }}
                placeholder="https://..."
                className="bg-[#111] border-zinc-800 rounded-lg h-9 text-white text-xs flex-1"
              />
              <button
                onClick={() => setLocalButtons(localButtons.filter((_, j) => j !== i))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20"
              >
                <X className="h-3.5 w-3.5 text-red-400" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setLocalButtons([...localButtons, { text: "", url: "" }])}
            className="flex items-center gap-1 text-[11px] font-medium text-[#a3e635] hover:text-[#bef264] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar botao
          </button>
        </div>
      )}
    </div>
  )
}

// ==================== TELEGRAM PREVIEW ====================
function TelegramPreview({
  text, mediaUrl, mediaType, buttons,
}: {
  text: string; mediaUrl: string; mediaType: string
  buttons: { text: string; url: string }[]
}) {
  return (
    <div className="rounded-2xl bg-[#0f1419] p-4 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a3e635]/20">
          <Zap className="h-4 w-4 text-[#a3e635]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">Seu Bot</p>
          <p className="text-[10px] text-zinc-500">online</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Media */}
        {mediaUrl && (
          <div className="rounded-xl overflow-hidden bg-[#1a2332] flex items-center justify-center h-28">
            {mediaType === "video" ? (
              <video src={mediaUrl} className="max-h-full max-w-full object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
            )}
          </div>
        )}

        {/* Text bubble */}
        {text && (
          <div className="rounded-xl bg-[#1a2332] px-3 py-2.5">
            <p className="text-xs text-white whitespace-pre-wrap break-words leading-relaxed">{text}</p>
          </div>
        )}

        {/* Buttons */}
        {buttons.filter((b) => b.text.trim()).map((btn, i) => (
          <div key={i} className="rounded-xl bg-[#2a4054] px-3 py-2.5 text-center">
            <p className="text-xs font-medium text-blue-400">{btn.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
