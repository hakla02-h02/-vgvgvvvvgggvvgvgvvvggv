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
  Plus, Megaphone, Send, Eye, X, Loader2, Trash2,
  Clock, MessageSquare, Image as ImageIcon, Link2,
  ChevronRight, Zap, Play, Pause, ArrowLeft,
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

const STATUS_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
  rascunho: { badge: "bg-secondary text-muted-foreground border-border", dot: "bg-muted-foreground", label: "Rascunho" },
  ativa: { badge: "bg-accent/10 text-accent border-accent/20", dot: "bg-accent", label: "Ativa" },
  pausada: { badge: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500", label: "Pausada" },
  concluida: { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-400", label: "Concluida" },
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

  const handleToggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === "ativa" ? "pausada" : "ativa"
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
  }

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Remarketing" />
        <NoBotSelected />
      </>
    )
  }

  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter((c) => c.status === "ativa").length

  return (
    <>
      <DashboardHeader title="Remarketing" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          {/* Stats */}
          <div className="grid gap-3 md:gap-4 grid-cols-3">
            <StatCard icon={Megaphone} label="Total" value={totalCampaigns} />
            <StatCard icon={Send} label="Enviadas" value={0} />
            <StatCard icon={Eye} label="Abertura" value="0%" />
          </div>

          {/* Header + Create button */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Crie campanhas de remarketing para reengajar seus usuarios</p>
            </div>
            <Button
              onClick={() => setShowWizard(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Campanha
            </Button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <EmptyState onCreateClick={() => setShowWizard(true)} />
          ) : (
            <div className="grid gap-4 md:gap-6 lg:grid-cols-5">
              {/* Campaign list */}
              <div className="flex flex-col gap-3 lg:col-span-3">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    isSelected={selectedCampaign?.id === campaign.id}
                    isDeleting={deleting === campaign.id}
                    onSelect={() => setSelectedCampaign(campaign)}
                    onDelete={() => handleDelete(campaign.id)}
                    onToggleStatus={() => handleToggleStatus(campaign)}
                  />
                ))}
              </div>

              {/* Detail panel */}
              <div className="lg:col-span-2">
                {selectedCampaign ? (
                  <CampaignDetail campaign={selectedCampaign} />
                ) : (
                  <Card className="bg-card border-border rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary mb-3">
                        <Megaphone className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Selecione uma campanha para ver os detalhes
                      </p>
                    </CardContent>
                  </Card>
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

// ==================== STAT CARD ====================
function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | string }) {
  return (
    <Card className="bg-card border-border rounded-2xl">
      <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
        <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
          <Icon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
          <p className="text-lg md:text-2xl font-bold text-foreground">{typeof value === "number" ? value.toLocaleString("pt-BR") : value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== EMPTY STATE ====================
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card className="bg-card border-border rounded-2xl">
      <CardContent className="flex flex-col items-center justify-center py-20 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 mb-4">
          <Megaphone className="h-7 w-7 text-accent" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Nenhuma campanha ainda</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
          Crie sua primeira campanha de remarketing para reengajar usuarios que pararam no meio do funil
        </p>
        <Button
          onClick={onCreateClick}
          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl gap-2"
        >
          <Plus className="h-4 w-4" />
          Criar Campanha
        </Button>
      </CardContent>
    </Card>
  )
}

// ==================== CAMPAIGN CARD ====================
function CampaignCard({
  campaign, isSelected, isDeleting, onSelect, onDelete, onToggleStatus,
}: {
  campaign: Campaign
  isSelected: boolean
  isDeleting: boolean
  onSelect: () => void
  onDelete: () => void
  onToggleStatus: () => void
}) {
  const st = STATUS_STYLES[campaign.status] || STATUS_STYLES.rascunho
  const msgCount = campaign.nodes.filter((n) => n.type === "message").length
  const delayCount = campaign.nodes.filter((n) => n.type === "delay").length

  return (
    <Card
      className={`cursor-pointer bg-card border-border rounded-2xl transition-all hover:bg-secondary/30 ${
        isSelected ? "ring-1 ring-accent/60" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Status dot */}
            <div className="mt-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${st.dot}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-foreground truncate">{campaign.name}</h3>
                <Badge variant="outline" className={`rounded-lg text-[10px] px-2 py-0.5 ${st.badge}`}>
                  {st.label}
                </Badge>
                <Badge variant="outline" className="rounded-lg text-[10px] px-2 py-0.5 border-border text-muted-foreground">
                  {campaign.campaign_type === "basic" ? "Basica" : "Completa"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {msgCount} {msgCount === 1 ? "mensagem" : "mensagens"}
                </span>
                {delayCount > 0 && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {delayCount} {delayCount === 1 ? "delay" : "delays"}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground">
                  {new Date(campaign.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {campaign.status !== "concluida" && (
              <button
                onClick={onToggleStatus}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                title={campaign.status === "ativa" ? "Pausar" : "Ativar"}
              >
                {campaign.status === "ativa" ? (
                  <Pause className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-accent" />
                )}
              </button>
            )}
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== CAMPAIGN DETAIL ====================
function CampaignDetail({ campaign }: { campaign: Campaign }) {
  const st = STATUS_STYLES[campaign.status] || STATUS_STYLES.rascunho

  return (
    <Card className="bg-card border-border rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">{campaign.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Criada em {new Date(campaign.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <Badge variant="outline" className={`rounded-lg text-[10px] px-2 py-0.5 ${st.badge}`}>
            {st.label}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Enviadas</p>
            <p className="text-lg font-bold text-foreground mt-0.5">0</p>
          </div>
          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Abertura</p>
            <p className="text-lg font-bold text-foreground mt-0.5">0%</p>
          </div>
        </div>

        {/* Timeline dos nodes */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Sequencia da Campanha</p>
          {campaign.nodes.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 text-center py-4">Nenhuma etapa configurada</p>
          ) : (
            <div className="flex flex-col">
              {campaign.nodes.map((node, i) => {
                const isMsg = node.type === "message"
                const text = (node.config?.text as string) || ""
                const hasMedia = !!(node.config?.media_url as string)
                const delayLabel = (node.config?.delay_label as string) || ""

                return (
                  <div key={node.id || i} className="flex gap-3">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isMsg ? "bg-accent/10" : "bg-blue-500/10"
                      }`}>
                        {isMsg ? (
                          <MessageSquare className="h-3.5 w-3.5 text-accent" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                        )}
                      </div>
                      {i < campaign.nodes.length - 1 && (
                        <div className="w-px flex-1 bg-border/50 my-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-4 min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground">
                        {isMsg ? (node.label || "Mensagem") : `Aguardar ${delayLabel}`}
                      </p>
                      {isMsg && text && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{text}</p>
                      )}
                      {isMsg && hasMedia && (
                        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
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
      </CardContent>
    </Card>
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
        // Refetch to get the complete campaign with nodes
        const refetch = await fetch(`/api/campaigns?bot_id=${botId}`)
        const refetchData = await refetch.json()
        const created = (refetchData.campaigns || []).find((c: Campaign) => c.id === data.campaign.id)
        onCreated(created || { ...data.campaign, nodes })
      }
    } catch { /* ignore */ }
    setIsSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <span className="text-accent font-bold text-lg">{stepNumber}</span>
            <span className="text-xs text-muted-foreground">/ {totalSteps}</span>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 px-5 pt-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < stepNumber ? "bg-accent" : "bg-secondary"
              }`}
            />
          ))}
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
          <div className="flex items-center justify-between p-5 pt-3 border-t border-border">
            <button
              onClick={() => setStep("type")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Voltar
            </button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !campaignName.trim() || (step === "basic" && !basicText.trim())}
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl gap-2"
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
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Nome da Campanha</h2>
        <p className="text-sm text-muted-foreground mt-1">Escolha um nome para identificar sua campanha</p>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: Remarketing Black Friday"
        className="bg-secondary border-border rounded-xl h-12 text-foreground"
        autoFocus
        onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) onNext() }}
      />
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!value.trim()}
          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl gap-2"
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
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Tipo de Campanha</h2>
        <p className="text-sm text-muted-foreground mt-1">Escolha como quer construir sua campanha</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Basic */}
        <button
          onClick={() => onSelect("basic")}
          className="flex flex-col items-start gap-3 p-5 rounded-2xl border-2 border-border bg-secondary/30 hover:border-accent/50 hover:bg-accent/[0.03] transition-all text-left group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 group-hover:bg-accent/15 transition-colors">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Mensagem Rapida</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Uma unica mensagem com imagem, texto e botoes. Pronta em segundos.
            </p>
          </div>
        </button>

        {/* Complete */}
        <button
          onClick={() => onSelect("complete")}
          className="flex flex-col items-start gap-3 p-5 rounded-2xl border-2 border-border bg-secondary/30 hover:border-accent/50 hover:bg-accent/[0.03] transition-all text-left group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 group-hover:bg-blue-500/15 transition-colors">
            <MessageSquare className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Sequencia Completa</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Varias mensagens com delays entre elas. Remarketing ate o usuario converter.
            </p>
          </div>
        </button>
      </div>

      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
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
    <div className="flex flex-col lg:flex-row gap-6 pt-2">
      {/* Left - form */}
      <div className="flex-1 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Mensagem da Campanha</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure o conteudo que sera enviado</p>
        </div>

        {/* Media upload */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Midia (opcional)</p>
          {mediaUrl ? (
            <div className="relative rounded-xl overflow-hidden bg-secondary/50 h-32 flex items-center justify-center">
              {mediaType === "video" ? (
                <video src={mediaUrl} className="max-h-full max-w-full object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
              )}
              <button
                onClick={onRemoveMedia}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-background/80 hover:bg-background transition-colors"
              >
                <X className="h-3.5 w-3.5 text-foreground" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full h-24 rounded-xl border-2 border-dashed border-border bg-secondary/20 hover:border-accent/40 hover:bg-accent/[0.02] transition-all flex flex-col items-center justify-center gap-1"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Clique para enviar foto ou video</span>
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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Mensagem</p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva sua mensagem de remarketing..."
            className="bg-secondary border-border rounded-xl text-foreground min-h-[100px]"
          />
        </div>

        {/* Buttons toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <Link2 className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Adicionar botoes</p>
              <p className="text-[11px] text-muted-foreground">Opcional</p>
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
                  className="bg-secondary border-border rounded-xl text-foreground flex-1"
                />
                <Input
                  value={btn.url}
                  onChange={(e) => {
                    const next = [...buttons]
                    next[i] = { ...next[i], url: e.target.value }
                    setButtons(next)
                  }}
                  placeholder="https://..."
                  className="bg-secondary border-border rounded-xl text-foreground flex-1"
                />
                <button
                  onClick={() => setButtons(buttons.filter((_, j) => j !== i))}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-destructive/70" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setButtons([...buttons, { text: "", url: "" }])}
              className="flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar botao
            </button>
          </div>
        )}
      </div>

      {/* Right - preview */}
      <div className="w-full lg:w-72 shrink-0">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">Preview no Telegram</p>
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
    <div className="flex flex-col lg:flex-row gap-6 pt-2">
      {/* Left - builder */}
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Sequencia de Remarketing</h2>
          <p className="text-sm text-muted-foreground mt-1">Monte sua sequencia de mensagens e delays</p>
        </div>

        <div className="flex flex-col">
          {nodes.map((node, i) => (
            <div key={i} className="flex flex-col">
              {/* Node card */}
              <div
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  editingIndex === i
                    ? "border-accent/40 bg-accent/[0.03]"
                    : "border-border bg-secondary/20 hover:bg-secondary/40"
                }`}
                onClick={() => setEditingIndex(editingIndex === i ? null : i)}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  node.type === "message" ? "bg-accent/10" : "bg-blue-500/10"
                }`}>
                  {node.type === "message" ? (
                    <MessageSquare className="h-4 w-4 text-accent" />
                  ) : (
                    <Clock className="h-4 w-4 text-blue-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {node.type === "message" ? (node.label || "Mensagem") : `Aguardar ${(node.config?.delay_label as string) || "1 dia"}`}
                  </p>
                  {node.type === "message" && (node.config?.text as string) && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{node.config.text as string}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {nodes.length > 1 && (
                    <button
                      onClick={() => removeNode(i)}
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3 text-destructive/70" />
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
              <div className="flex items-center justify-center py-1.5">
                <div className="w-px h-4 bg-border/40" />
              </div>
              <div className="flex items-center justify-center gap-2 pb-1.5">
                <button
                  onClick={() => addNode("message", i)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-muted-foreground bg-secondary/50 hover:bg-secondary hover:text-foreground transition-all"
                >
                  <MessageSquare className="h-3 w-3" /> Mensagem
                </button>
                <button
                  onClick={() => addNode("delay", i)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-muted-foreground bg-secondary/50 hover:bg-secondary hover:text-foreground transition-all"
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
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">Preview da Sequencia</p>
        <Card className="bg-secondary/30 border-border rounded-xl">
          <CardContent className="p-4">
            <div className="flex flex-col">
              {nodes.map((node, i) => {
                const isMsg = node.type === "message"
                return (
                  <div key={i} className="flex gap-2.5">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-md ${
                        isMsg ? "bg-accent/15" : "bg-blue-500/15"
                      }`}>
                        {isMsg ? (
                          <MessageSquare className="h-3 w-3 text-accent" />
                        ) : (
                          <Clock className="h-3 w-3 text-blue-400" />
                        )}
                      </div>
                      {i < nodes.length - 1 && <div className="w-px flex-1 bg-border/40 my-1" />}
                    </div>
                    <div className="pb-3 min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-foreground">
                        {isMsg ? (node.label || "Mensagem") : `Aguardar ${(node.config?.delay_label as string) || ""}`}
                      </p>
                      {isMsg && (node.config?.text as string) && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{node.config.text as string}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
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
      <div className="mt-2 mb-1 p-3 rounded-xl bg-secondary/30 border border-border">
        <p className="text-xs font-medium text-muted-foreground mb-2">Tempo de espera</p>
        <div className="flex flex-wrap gap-2">
          {DELAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdateConfig({ delay_value: opt.value, delay_label: opt.label })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentValue === opt.value
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                  : "bg-secondary text-muted-foreground border border-border hover:border-blue-500/30"
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
    <div className="mt-2 mb-1 p-3 rounded-xl bg-secondary/30 border border-border flex flex-col gap-3">
      {/* Label */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Nome da etapa</p>
        <Input
          value={node.label}
          onChange={(e) => onUpdateLabel(e.target.value)}
          placeholder="Nome da mensagem"
          className="bg-secondary border-border rounded-lg h-8 text-foreground text-xs"
        />
      </div>

      {/* Media */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Midia (opcional)</p>
        {mediaUrl ? (
          <div className="relative rounded-lg overflow-hidden bg-secondary h-20 flex items-center justify-center">
            {mediaType === "video" ? (
              <video src={mediaUrl} className="max-h-full max-w-full object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
            )}
            <button
              onClick={() => onUpdateConfig({ media_url: "", media_type: "" })}
              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-md bg-background/80 hover:bg-background"
            >
              <X className="h-3 w-3 text-foreground" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-16 rounded-lg border border-dashed border-border bg-secondary/20 hover:border-accent/40 transition-all flex items-center justify-center gap-1.5"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Enviar midia</span>
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
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Mensagem</p>
        <Textarea
          value={(node.config?.text as string) || ""}
          onChange={(e) => onUpdateConfig({ text: e.target.value })}
          placeholder="Escreva a mensagem..."
          className="bg-secondary border-border rounded-lg text-foreground text-xs min-h-[70px]"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
        <div className="flex items-center gap-2">
          <Link2 className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs text-foreground">Botoes</span>
        </div>
        <Switch checked={hasButtons} onCheckedChange={setHasButtons} />
      </div>

      {hasButtons && (
        <div className="flex flex-col gap-2">
          {localButtons.map((btn, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Input
                value={btn.text}
                onChange={(e) => {
                  const next = [...localButtons]
                  next[i] = { ...next[i], text: e.target.value }
                  setLocalButtons(next)
                }}
                placeholder="Texto"
                className="bg-secondary border-border rounded-lg h-7 text-foreground text-[11px] flex-1"
              />
              <Input
                value={btn.url}
                onChange={(e) => {
                  const next = [...localButtons]
                  next[i] = { ...next[i], url: e.target.value }
                  setLocalButtons(next)
                }}
                placeholder="https://..."
                className="bg-secondary border-border rounded-lg h-7 text-foreground text-[11px] flex-1"
              />
              <button
                onClick={() => setLocalButtons(localButtons.filter((_, j) => j !== i))}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-destructive/10"
              >
                <X className="h-3 w-3 text-destructive/70" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setLocalButtons([...localButtons, { text: "", url: "" }])}
            className="flex items-center gap-1 text-[10px] text-accent hover:text-accent/80 transition-colors"
          >
            <Plus className="h-3 w-3" /> Adicionar botao
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
    <div className="rounded-xl bg-[#1a2332] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
          <Zap className="h-3.5 w-3.5 text-accent" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">Seu Bot</p>
          <p className="text-[10px] text-muted-foreground">online</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Media */}
        {mediaUrl && (
          <div className="rounded-lg overflow-hidden bg-[#1e2c3d] flex items-center justify-center h-28">
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
          <div className="rounded-lg bg-[#1e2c3d] px-3 py-2">
            <p className="text-xs text-foreground whitespace-pre-wrap break-words">{text}</p>
          </div>
        )}

        {/* Buttons */}
        {buttons.filter((b) => b.text.trim()).map((btn, i) => (
          <div key={i} className="rounded-lg bg-[#2a4054] px-3 py-2 text-center">
            <p className="text-xs font-medium text-blue-400">{btn.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
