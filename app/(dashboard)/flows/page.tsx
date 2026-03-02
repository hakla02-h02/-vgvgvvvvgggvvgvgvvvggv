"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import {
  Plus, GitBranch, MessageSquare, Timer, Split,
  ArrowRight, GripVertical, ChevronRight, Users, CreditCard,
  Pencil, Trash2, Loader2, Image, Video, Link, X, Upload, FileCheck,
  Star, Zap, RotateCcw, ShoppingBag, UserPlus, Mail, Target, Sparkles, Crown,
  Search, Settings2, Clock, Bell, Tag, Percent, Globe, FileText, Heart,
  Send, CalendarDays, Repeat, Filter, MessageCircle, AlertCircle,
  ExternalLink, Workflow, CheckCircle2, Hash, Unlink, UsersRound, Webhook,
  CircleStop, RefreshCw, MousePointerClick,
  ArrowDown, TrendingUp, TrendingDown,
} from "lucide-react"
import NextImage from "next/image"
import { Switch } from "@/components/ui/switch"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// ---- Types ----

type FlowCategory = "inicial" | "remarketing" | "followup" | "pos-venda" | "captacao" | "notificacao" | "personalizado"

interface Flow {
  id: string
  bot_id: string
  user_id: string
  name: string
  status: "ativo" | "pausado"
  category: FlowCategory
  is_primary: boolean
  created_at: string
  updated_at: string
}

type NodeType = "trigger" | "message" | "delay" | "condition" | "payment" | "action"

interface InlineButton {
  text: string
  url: string
}

interface FlowNode {
  id: string
  flow_id: string
  type: NodeType
  label: string
  config: Record<string, unknown>
  position: number
  created_at: string
  updated_at: string
}

// ---- Dragon Icon ----
function DragonTriggerIcon({ className }: { className?: string }) {
  return (
    <NextImage
      src="/images/dragon-icon.png"
      alt=""
      width={20}
      height={20}
      className={className}
    />
  )
}

// ---- Flow Category Config ----

const flowCategories: { value: FlowCategory; label: string; description: string; icon: React.ElementType; color: string; iconColor: string }[] = [
  { value: "inicial", label: "Fluxo Inicial", description: "Primeiro contato do usuario com o bot", icon: Crown, color: "border-accent bg-accent/10", iconColor: "text-accent" },
  { value: "remarketing", label: "Remarketing", description: "Reengajar usuarios que nao converteram", icon: Target, color: "border-orange-500/30 bg-orange-500/10", iconColor: "text-orange-400" },
  { value: "followup", label: "Follow-up", description: "Acompanhamento apos interacao", icon: RotateCcw, color: "border-blue-500/30 bg-blue-500/10", iconColor: "text-blue-400" },
  { value: "pos-venda", label: "Pos-venda", description: "Fluxo para quem ja comprou", icon: ShoppingBag, color: "border-purple-500/30 bg-purple-500/10", iconColor: "text-purple-400" },
  { value: "captacao", label: "Captacao", description: "Captar novos leads e contatos", icon: UserPlus, color: "border-cyan-500/30 bg-cyan-500/10", iconColor: "text-cyan-400" },
  { value: "notificacao", label: "Notificacao", description: "Enviar avisos e alertas", icon: Mail, color: "border-yellow-500/30 bg-yellow-500/10", iconColor: "text-yellow-400" },
  { value: "personalizado", label: "Personalizado", description: "Crie seu proprio tipo de fluxo", icon: Sparkles, color: "border-pink-500/30 bg-pink-500/10", iconColor: "text-pink-400" },
]

const getCategoryConfig = (cat: FlowCategory) => flowCategories.find((c) => c.value === cat) || flowCategories[flowCategories.length - 1]

// ---- Category-specific configuration fields ----

interface CategoryField {
  key: string
  label: string
  type: "text" | "number" | "select" | "toggle" | "textarea"
  placeholder?: string
  options?: { value: string; label: string }[]
  description?: string
  icon: React.ElementType
}

interface CategoryConfigDef {
  category: FlowCategory
  title: string
  description: string
  fields: CategoryField[]
}

const categoryConfigs: CategoryConfigDef[] = [
  {
    category: "inicial",
    title: "Configuracoes do Fluxo Inicial",
    description: "O primeiro contato do usuario com o bot. Configure o comportamento padrao do fluxo.",
    fields: [
      { key: "default_delay_sec", label: "Delay padrao entre mensagens (seg)", type: "number", placeholder: "2", icon: Clock, description: "Tempo de espera padrao entre cada mensagem enviada" },
      { key: "fallback_message", label: "Mensagem de fallback", type: "textarea", placeholder: "Desculpe, nao entendi. Tente novamente.", icon: AlertCircle, description: "Quando o bot nao entende o usuario" },
    ],
  },
  {
    category: "remarketing",
    title: "Configuracoes de Remarketing",
    description: "Reengaje usuarios inativos ou que nao converteram.",
    fields: [
      { key: "trigger_after_days", label: "Disparar apos (dias)", type: "number", placeholder: "3", icon: Clock, description: "Dias sem interacao para disparar" },
      { key: "target_audience", label: "Publico-alvo", type: "select", icon: Users, options: [
        { value: "inativos", label: "Usuarios inativos" },
        { value: "carrinho", label: "Abandonaram carrinho" },
        { value: "visitantes", label: "Visitaram mas nao compraram" },
        { value: "todos", label: "Todos os contatos" },
      ], description: "Quem vai receber" },
      { key: "offer_type", label: "Tipo de oferta", type: "select", icon: Tag, options: [
        { value: "desconto", label: "Desconto %" },
        { value: "cupom", label: "Cupom fixo" },
        { value: "frete", label: "Frete gratis" },
        { value: "nenhum", label: "Sem oferta" },
      ], description: "Incentivo para reengajar" },
      { key: "discount_value", label: "Valor do desconto", type: "text", placeholder: "10% ou R$20", icon: Percent, description: "Valor do incentivo" },
      { key: "max_sends", label: "Maximo de envios", type: "number", placeholder: "3", icon: Repeat, description: "Limite de mensagens por usuario" },
      { key: "urgency_enabled", label: "Urgencia (tempo limitado)", type: "toggle", icon: AlertCircle, description: "Adicionar countdown na oferta" },
    ],
  },
  {
    category: "followup",
    title: "Configuracoes de Follow-up",
    description: "Acompanhe usuarios apos uma interacao.",
    fields: [
      { key: "followup_delay_hours", label: "Delay apos interacao (horas)", type: "number", placeholder: "24", icon: Clock, description: "Tempo para enviar follow-up" },
      { key: "trigger_event", label: "Evento gatilho", type: "select", icon: Zap, options: [
        { value: "mensagem", label: "Enviou mensagem" },
        { value: "visualizou", label: "Visualizou conteudo" },
        { value: "clicou", label: "Clicou em link" },
        { value: "respondeu", label: "Respondeu pesquisa" },
      ], description: "O que ativa este follow-up" },
      { key: "max_followups", label: "Maximo de follow-ups", type: "number", placeholder: "3", icon: Repeat, description: "Quantas vezes insistir" },
      { key: "stop_on_reply", label: "Parar se responder", type: "toggle", icon: MessageCircle, description: "Cancela sequencia se usuario responder" },
      { key: "personalize", label: "Personalizar com nome", type: "toggle", icon: Heart, description: "Usar nome do usuario na mensagem" },
    ],
  },
  {
    category: "pos-venda",
    title: "Configuracoes de Pos-venda",
    description: "Fluxo para quem ja comprou. Fidelizacao e upsell.",
    fields: [
      { key: "trigger_after_purchase_hours", label: "Enviar apos compra (horas)", type: "number", placeholder: "2", icon: Clock, description: "Delay apos confirmacao de compra" },
      { key: "satisfaction_survey", label: "Pesquisa de satisfacao", type: "toggle", icon: Star, description: "Enviar pesquisa NPS/CSAT" },
      { key: "review_request", label: "Pedir avaliacao", type: "toggle", icon: Heart, description: "Solicitar review do produto" },
      { key: "upsell_enabled", label: "Oferecer upsell", type: "toggle", icon: ShoppingBag, description: "Sugerir produtos complementares" },
      { key: "upsell_discount", label: "Desconto no upsell (%)", type: "number", placeholder: "15", icon: Percent, description: "Desconto para produtos sugeridos" },
      { key: "support_shortcut", label: "Atalho para suporte", type: "toggle", icon: MessageCircle, description: "Botao rapido para falar com suporte" },
    ],
  },
  {
    category: "captacao",
    title: "Configuracoes de Captacao",
    description: "Capture leads e novos contatos para sua base.",
    fields: [
      { key: "collect_email", label: "Coletar e-mail", type: "toggle", icon: Mail, description: "Pedir e-mail do lead" },
      { key: "collect_phone", label: "Coletar telefone", type: "toggle", icon: Send, description: "Pedir telefone do lead" },
      { key: "lead_magnet", label: "Isca digital", type: "select", icon: Tag, options: [
        { value: "ebook", label: "E-book" },
        { value: "desconto", label: "Cupom de desconto" },
        { value: "webinar", label: "Webinar/Aula" },
        { value: "checklist", label: "Checklist" },
        { value: "nenhum", label: "Nenhuma" },
      ], description: "O que oferecer em troca dos dados" },
      { key: "qualification_question", label: "Pergunta de qualificacao", type: "textarea", placeholder: "Qual seu maior desafio hoje?", icon: Filter, description: "Segmentar o lead com perguntas" },
      { key: "redirect_after", label: "Redirecionar apos captura", type: "text", placeholder: "https://seusite.com/obrigado", icon: Globe, description: "URL de destino pos-captura" },
      { key: "tag_lead", label: "Tag do lead", type: "text", placeholder: "lead-quente", icon: Tag, description: "Tag para identificar esses leads" },
    ],
  },
  {
    category: "notificacao",
    title: "Configuracoes de Notificacao",
    description: "Envie avisos, alertas e comunicados.",
    fields: [
      { key: "notification_type", label: "Tipo de notificacao", type: "select", icon: Bell, options: [
        { value: "aviso", label: "Aviso geral" },
        { value: "promocao", label: "Promocao" },
        { value: "lembrete", label: "Lembrete" },
        { value: "atualizacao", label: "Atualizacao" },
      ], description: "Categoria da notificacao" },
      { key: "schedule_enabled", label: "Agendar envio", type: "toggle", icon: CalendarDays, description: "Programar data/hora de envio" },
      { key: "schedule_datetime", label: "Data e hora", type: "text", placeholder: "2025-12-25 09:00", icon: Clock, description: "Quando enviar (se agendado)" },
      { key: "frequency_limit", label: "Limite de frequencia (horas)", type: "number", placeholder: "24", icon: Repeat, description: "Intervalo minimo entre envios" },
      { key: "priority", label: "Prioridade", type: "select", icon: AlertCircle, options: [
        { value: "alta", label: "Alta" },
        { value: "media", label: "Media" },
        { value: "baixa", label: "Baixa" },
      ], description: "Nivel de urgencia" },
    ],
  },
  {
    category: "personalizado",
    title: "Configuracoes Personalizadas",
    description: "Defina suas proprias configuracoes para este fluxo.",
    fields: [
      { key: "custom_label", label: "Label personalizado", type: "text", placeholder: "Ex: Fluxo VIP", icon: Tag, description: "Nome interno para organizacao" },
      { key: "custom_description", label: "Descricao", type: "textarea", placeholder: "Descreva o objetivo deste fluxo...", icon: FileText, description: "Anotacao sobre o fluxo" },
      { key: "custom_trigger", label: "Gatilho personalizado", type: "text", placeholder: "Ex: Quando usuario digita /vip", icon: Zap, description: "Condicao para ativar este fluxo" },
      { key: "custom_tag", label: "Tag", type: "text", placeholder: "Ex: vip, especial", icon: Tag, description: "Tags para segmentacao" },
    ],
  },
]

const getCategoryConfigDef = (cat: FlowCategory) => categoryConfigs.find((c) => c.category === cat) || categoryConfigs[categoryConfigs.length - 1]

// ---- Constants ----

const nodeIcons: Record<NodeType, React.ElementType> = {
  trigger: DragonTriggerIcon, message: MessageSquare, delay: Timer,
  condition: Split, payment: CreditCard, action: Users,
  redirect: ExternalLink,
}

const nodeColors: Record<NodeType, string> = {
  trigger: "border-accent bg-accent/5",
  message: "border-blue-500/30 bg-blue-500/5",
  delay: "border-warning/30 bg-warning/5",
  condition: "border-purple-500/30 bg-purple-500/5",
  payment: "border-success/30 bg-success/5",
  action: "border-cyan-500/30 bg-cyan-500/5",
  redirect: "border-orange-500/30 bg-orange-500/5",
}

const nodeIconColors: Record<NodeType, string> = {
  trigger: "text-accent", message: "text-blue-400", delay: "text-warning",
  condition: "text-purple-400", payment: "text-success", action: "text-cyan-400",
  redirect: "text-orange-400",
}

const statusStyles: Record<string, string> = {
  ativo: "bg-success/10 text-success border-success/20",
  pausado: "bg-warning/10 text-warning border-warning/20",
}

// Available action templates
const actionTemplates: { type: NodeType; label: string; description: string; configFields: { key: string; label: string; placeholder: string; inputType: "text" | "textarea" | "number" }[]; subVariant?: string }[] = [
  {
    type: "trigger",
    label: "Usuario inicia bot",
    description: "Gatilho inicial quando o usuario inicia o bot",
    configFields: [],
  },
  {
    type: "message",
    label: "Mensagem de Texto",
    description: "Enviar mensagem com texto, midia e botoes",
    configFields: [],
    subVariant: "text",
  },
  {
    type: "delay",
    label: "Aguardar Tempo",
    description: "Esperar antes da proxima etapa",
    configFields: [
      { key: "seconds", label: "Tempo em segundos", placeholder: "300", inputType: "number" },
    ],
    subVariant: "wait_time",
  },
  {
  type: "condition",
  label: "Condição",
  description: "Ramificar fluxo com base na resposta do usuario",
  configFields: [],
  subVariant: "response_condition",
  },
  {
    type: "payment",
    label: "Gerar Cobranca",
    description: "Criar cobranca PIX ou link de pagamento",
    configFields: [
      { key: "amount", label: "Valor (R$)", placeholder: "49.90", inputType: "text" },
      { key: "description", label: "Descricao", placeholder: "Pagamento do produto X", inputType: "text" },
    ],
    subVariant: "charge",
  },

  {
    type: "action",
    label: "Adicionar ao Grupo",
    description: "Enviar usuario para um grupo ou canal",
    configFields: [
      { key: "action_name", label: "Link do grupo", placeholder: "https://t.me/grupo", inputType: "text" },
    ],
    subVariant: "add_group",
  },
  {
    type: "action",
    label: "Ir para Outro Fluxo",
    description: "Redirecionar para fluxo secundario",
    configFields: [
      { key: "target_flow_id", label: "Fluxo de destino", placeholder: "Selecione o fluxo...", inputType: "text" },
    ],
    subVariant: "goto_flow",
  },
  {
    type: "action",
    label: "Recomecar Fluxo",
    description: "Voltar ao inicio deste fluxo",
    configFields: [
      { key: "max_restarts", label: "Limite de reinicios", placeholder: "Ex: 3 (0 = ilimitado)", inputType: "number" },
    ],
    subVariant: "restart",
  },
  {
    type: "action",
    label: "Encerrar Conversa",
    description: "Finalizar interacao com o usuario",
    configFields: [],
    subVariant: "end",
  },
]

// Business function groups for the "Add Step" dialog
interface ActionGroup {
  id: string
  label: string
  description: string
  icon: React.ElementType
  iconColor: string
  bgColor: string
  borderAccent: string
  types: NodeType[]
  subVariants?: string[]
}

const actionGroups: ActionGroup[] = [
  {
    id: "comunicacao",
    label: "Comunicacao",
    description: "Enviar mensagens de texto",
    icon: MessageSquare,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderAccent: "border-blue-500/30",
    types: ["message"],
    subVariants: ["text"],
  },
  {
    id: "logica",
    label: "Logica",
    description: "Condicoes, delays e verificacoes",
    icon: Split,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderAccent: "border-purple-500/30",
    types: ["delay", "condition"],
    subVariants: ["wait_time", "response_condition"],
  },
  {
    id: "monetizacao",
    label: "Monetizacao",
    description: "Cobrancas, pagamentos e PIX",
    icon: CreditCard,
    iconColor: "text-success",
    bgColor: "bg-success/10",
    borderAccent: "border-success/30",
    types: ["payment"],
    subVariants: ["charge"],
  },
  {
    id: "navegacao",
    label: "Navegacao",
    description: "Redirecionar, recomecar ou encerrar",
    icon: ExternalLink,
    iconColor: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderAccent: "border-orange-500/30",
    types: ["action"],
    subVariants: ["goto_flow", "restart", "end"],
  },
  {
    id: "automacao",
    label: "Automacao",
    description: "Adicionar usuarios a grupos",
    icon: Zap,
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderAccent: "border-cyan-500/30",
    types: ["action"],
    subVariants: ["add_group"],
  },
]

// SubVariant-specific icons for the dialog
const subVariantIcons: Record<string, React.ElementType> = {
  text: MessageSquare,
  media: Image,
  buttons: MousePointerClick,

  wait_time: Timer,
  response_condition: Split,

  charge: CreditCard,

  add_group: UsersRound,
  goto_flow: ExternalLink,
  restart: RefreshCw,
  end: CircleStop,
}

// ---- Sortable Node Card ----

function SortableNodeCard({
  node,
  isLast,
  flows: flowsList,
  onEdit,
  onDelete,
}: {
  node: FlowNode
  isLast: boolean
  flows: Flow[]
  onEdit: (node: FlowNode) => void
  onDelete: (node: FlowNode) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: "relative" as const,
  }

  const Icon = nodeIcons[node.type]
  const group = actionGroups.find((g) => g.types.includes(node.type))

  // Helper to get subtitle
  const getSubtitle = () => {
    if (node.type === "message") {
      const parts: string[] = []
      if (node.config?.media_type && node.config.media_type !== "") parts.push(node.config.media_type === "photo" ? "Foto" : "Video")
      if (node.config?.buttons && node.config.buttons !== "") {
        try { parts.push(`${JSON.parse(node.config.buttons as string).length} botao(es)`) } catch { /* noop */ }
      }
      return parts.length > 0 ? parts.join(" · ") : "Mensagem"
    }
    if (node.type === "delay" && node.config?.seconds) {
      const s = parseInt(node.config.seconds as string)
      if (s >= 3600) return `${Math.floor(s / 3600)}h${Math.floor((s % 3600) / 60) > 0 ? ` ${Math.floor((s % 3600) / 60)}min` : ""}`
      if (s >= 60) return `${Math.floor(s / 60)} min`
      return `${s}s`
    }
    if (node.type === "condition") {
      return "Condicao de resposta"
    }
    if (node.type === "payment") {
      return "Cobranca"
    }
    if (node.type === "action") {
      const sv = node.config?.subVariant as string
      if (sv === "goto_flow") {
        if (node.config?.target_flow_name) return node.config.target_flow_name as string
        return "Ir para outro fluxo"
      }
      if (sv === "restart") return "Volta ao inicio"
      if (sv === "end") return "Encerrar"
      return sv === "add_group" ? "Adicionar ao grupo" : "Automacao"
    }
    return ""
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`group flex items-center gap-4 rounded-2xl border px-4 py-4 transition-all ${
          isDragging 
            ? "opacity-50 ring-2 ring-accent/30 bg-secondary/40 border-border" 
            : "border-border/60 bg-card hover:bg-secondary/30 hover:border-border"
        }`}
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          group ? `${group.bgColor} border ${group.borderAccent}` : "bg-secondary/50 border border-border/40"
        }`}>
          <Icon className={`h-5 w-5 ${nodeIconColors[node.type]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate leading-tight">{node.label}</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">{getSubtitle()}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-secondary/60 transition-colors"
              onClick={() => onEdit(node)}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => onDelete(node)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Arrastar para reordenar"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/30" />
          </button>
        </div>
      </div>
      {!isLast && (
        <div className="flex justify-center py-1">
          <div className="w-px h-5 bg-border/40" />
        </div>
      )}
    </div>
  )
}

// ---- Component ----

export default function FlowsPage() {
  const { selectedBot } = useBots()
  const { session } = useAuth()

  // Bot plans (from bot config)
  interface BotPlan {
    id: string
    bot_id: string
    name: string
    price: number
    duration_days: number
    description: string | null
    active: boolean
  }
  const [botPlans, setBotPlans] = useState<BotPlan[]>([])

  // Fetch bot plans when selectedBot changes
  useEffect(() => {
    if (!selectedBot) { setBotPlans([]); return }
    supabase
      .from("bot_plans")
      .select("*")
      .eq("bot_id", selectedBot.id)
      .eq("active", true)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setBotPlans((data as BotPlan[]) || [])
      })
  }, [selectedBot])

  // Flows state
  const [flows, setFlows] = useState<Flow[]>([])
  const [activeFlow, setActiveFlow] = useState<Flow | null>(null)
  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [isLoadingFlows, setIsLoadingFlows] = useState(true)
  const [isLoadingNodes, setIsLoadingNodes] = useState(false)

  // New flow dialog
  const [showNewFlowDialog, setShowNewFlowDialog] = useState(false)
  const [newFlowName, setNewFlowName] = useState("")
  const [newFlowCategory, setNewFlowCategory] = useState<FlowCategory>("personalizado")
  const [isCreatingFlow, setIsCreatingFlow] = useState(false)

  // Flow creation mode: null = choosing, "basico" | "completo"
  const [newFlowMode, setNewFlowMode] = useState<"basico" | "completo" | null>(null)

  // Basic flow wizard fields
  const [basicWelcomeMsg, setBasicWelcomeMsg] = useState("")
  const [basicProductName, setBasicProductName] = useState("")
  const [basicProductDesc, setBasicProductDesc] = useState("")
  const [basicProductPrice, setBasicProductPrice] = useState("")
  const [basicMediaUrl, setBasicMediaUrl] = useState("")
  const [basicMediaType, setBasicMediaType] = useState<"photo" | "video" | "none">("none")
  const [basicButtonText, setBasicButtonText] = useState("")
  const [basicButtonUrl, setBasicButtonUrl] = useState("")

  const resetBasicFlow = () => {
    setBasicWelcomeMsg("")
    setBasicProductName("")
    setBasicProductDesc("")
    setBasicProductPrice("")
    setBasicMediaUrl("")
    setBasicMediaType("none")
    setBasicButtonText("")
    setBasicButtonUrl("")
  }

  // Add node dialog
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof actionTemplates[0] | null>(null)
  const [nodeConfigValues, setNodeConfigValues] = useState<Record<string, string>>({})
  const [isAddingNode, setIsAddingNode] = useState(false)

  // Message node config
  const [msgText, setMsgText] = useState("")
  const [msgMediaUrl, setMsgMediaUrl] = useState("")
  const [msgMediaType, setMsgMediaType] = useState<"photo" | "video" | "none">("none")
  const [msgHasButtons, setMsgHasButtons] = useState(false)
  const [msgButtons, setMsgButtons] = useState<InlineButton[]>([])

  const resetMessageConfig = () => {
    setMsgText("")
    setMsgMediaUrl("")
    setMsgMediaType("none")
    setMsgHasButtons(false)
    setMsgButtons([])
  }

  const addMsgButton = () => {
    setMsgButtons((prev) => [...prev, { text: "", url: "" }])
  }

  const updateMsgButton = (index: number, field: "text" | "url", value: string) => {
    setMsgButtons((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)))
  }

  const removeMsgButton = (index: number) => {
    setMsgButtons((prev) => prev.filter((_, i) => i !== index))
  }

  // Edit node dialog
  const [showEditNodeDialog, setShowEditNodeDialog] = useState(false)
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null)
  const [editNodeLabel, setEditNodeLabel] = useState("")
  const [editNodeConfig, setEditNodeConfig] = useState<Record<string, string>>({})
  const [isSavingNode, setIsSavingNode] = useState(false)

  // Delete confirmation
  const [showDeleteNodeDialog, setShowDeleteNodeDialog] = useState(false)
  const [deletingNode, setDeletingNode] = useState<FlowNode | null>(null)
  const [isDeletingNode, setIsDeletingNode] = useState(false)

  // Delete flow
  const [showDeleteFlowDialog, setShowDeleteFlowDialog] = useState(false)
  const [isDeletingFlow, setIsDeletingFlow] = useState(false)

  // Edit flow category
  const [showEditFlowDialog, setShowEditFlowDialog] = useState(false)
  const [editFlowCategory, setEditFlowCategory] = useState<FlowCategory>("personalizado")
  const [editFlowName, setEditFlowName] = useState("")
  const [isSavingFlow, setIsSavingFlow] = useState(false)

  // Category-specific config
  const [flowCategoryConfig, setFlowCategoryConfig] = useState<Record<string, string | boolean>>({})
  const [isSavingCategoryConfig, setIsSavingCategoryConfig] = useState(false)
  const [showCategoryConfig, setShowCategoryConfig] = useState(false)

  // Drag and drop
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveNodeId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveNodeId(null)

    if (!over || active.id === over.id) return

    const nonTriggerNodes = nodes.filter((n) => n.type !== "trigger")
    const triggerNodes = nodes.filter((n) => n.type === "trigger")

    const oldIndex = nonTriggerNodes.findIndex((n) => n.id === active.id)
    const newIndex = nonTriggerNodes.findIndex((n) => n.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reorderedNonTrigger = arrayMove(nonTriggerNodes, oldIndex, newIndex)
    const allReordered = [...triggerNodes, ...reorderedNonTrigger].map((n, i) => ({
      ...n,
      position: i,
    }))

    // Optimistic update
    setNodes(allReordered)

    // Persist to DB
    for (const node of allReordered) {
      await supabase
        .from("flow_nodes")
        .update({ position: node.position })
        .eq("id", node.id)
    }
  }

  // Derived: primary flow and secondary flows
  const primaryFlow = flows.find((f) => f.is_primary)
  const secondaryFlows = flows.filter((f) => !f.is_primary)

  // ---- Fetch flows for selected bot ----
  const fetchFlows = useCallback(async () => {
    if (!selectedBot || !session) {
      setFlows([])
      setActiveFlow(null)
      setNodes([])
      setIsLoadingFlows(false)
      return
    }

    setIsLoadingFlows(true)
    const { data, error } = await supabase
      .from("flows")
      .select("*")
      .eq("bot_id", selectedBot.id)
      .eq("user_id", session.userId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching flows:", error)
      setIsLoadingFlows(false)
      return
    }

    const fetched = (data || []) as Flow[]
    // Backwards compat: if no flow has is_primary, mark the first one
    const hasPrimary = fetched.some((f) => f.is_primary)
    const normalized = fetched.map((f, i) => ({
      ...f,
      is_primary: hasPrimary ? !!f.is_primary : i === 0 && fetched.length > 0,
      category: (f.category || (i === 0 && !hasPrimary ? "inicial" : "personalizado")) as FlowCategory,
    }))

    setFlows(normalized)

    if (normalized.length > 0) {
      const primary = normalized.find((f) => f.is_primary) || normalized[0]
      setActiveFlow(primary)
    } else {
      setActiveFlow(null)
      setNodes([])
    }
    setIsLoadingFlows(false)
  }, [selectedBot, session])

  useEffect(() => {
    fetchFlows()
  }, [fetchFlows])

  // ---- Fetch nodes for active flow ----
  const fetchNodes = useCallback(async () => {
    if (!activeFlow) {
      setNodes([])
      return
    }

    setIsLoadingNodes(true)
    const { data, error } = await supabase
      .from("flow_nodes")
      .select("*")
      .eq("flow_id", activeFlow.id)
      .order("position", { ascending: true })

    if (error) {
      console.error("Error fetching nodes:", error)
      setIsLoadingNodes(false)
      return
    }

    setNodes((data || []) as FlowNode[])
    setIsLoadingNodes(false)
  }, [activeFlow])

  useEffect(() => {
    fetchNodes()
  }, [fetchNodes])

  // ---- Create new flow ----
  const handleCreateFlow = async () => {
    if (!selectedBot || !session || !newFlowName.trim()) return

    setIsCreatingFlow(true)

    // If this is the first flow, it becomes the primary
    const isFirst = flows.length === 0
    const category = isFirst ? "inicial" : newFlowCategory

    // Try with category/is_primary columns first, fallback without them
    let insertPayload: Record<string, unknown> = {
      bot_id: selectedBot.id,
      user_id: session.userId,
      name: newFlowName.trim(),
      status: "ativo",
      category,
      is_primary: isFirst,
    }

    let { data, error } = await supabase
      .from("flows")
      .insert(insertPayload)
      .select()
      .single()

    // If columns don't exist yet, retry without them
    if (error && (error.message?.includes("category") || error.message?.includes("is_primary") || error.code === "42703")) {
      insertPayload = {
        bot_id: selectedBot.id,
        user_id: session.userId,
        name: newFlowName.trim(),
        status: "ativo",
      }
      const retry = await supabase
        .from("flows")
        .insert(insertPayload)
        .select()
        .single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error("Error creating flow:", error)
      setIsCreatingFlow(false)
      return
    }

    const newFlow = { ...data, category, is_primary: isFirst } as Flow
    setFlows((prev) => [...prev, newFlow])
    setActiveFlow(newFlow)
    setNewFlowName("")
    setNewFlowCategory("personalizado")
    setShowNewFlowDialog(false)
    setIsCreatingFlow(false)
  }

  // ---- Create BASIC flow (auto-generates nodes) ----
  const handleCreateBasicFlow = async () => {
    if (!selectedBot || !session || !basicProductName.trim()) return

    setIsCreatingFlow(true)

    const isFirst = flows.length === 0
    const flowName = basicProductName.trim()

    let insertPayload: Record<string, unknown> = {
      bot_id: selectedBot.id,
      user_id: session.userId,
      name: flowName,
      status: "ativo",
      category: isFirst ? "inicial" : "personalizado",
      is_primary: isFirst,
    }

    let { data, error } = await supabase
      .from("flows")
      .insert(insertPayload)
      .select()
      .single()

    if (error && (error.message?.includes("category") || error.message?.includes("is_primary") || error.code === "42703")) {
      insertPayload = {
        bot_id: selectedBot.id,
        user_id: session.userId,
        name: flowName,
        status: "ativo",
      }
      const retry = await supabase
        .from("flows")
        .insert(insertPayload)
        .select()
        .single()
      data = retry.data
      error = retry.error
    }

    if (error || !data) {
      console.error("Error creating basic flow:", error)
      setIsCreatingFlow(false)
      return
    }

    const newFlow = { ...data, category: (isFirst ? "inicial" : "personalizado") as FlowCategory, is_primary: isFirst } as Flow

    // Save flow_mode = "basico" in localStorage
    localStorage.setItem(`flow_mode_${newFlow.id}`, "basico")

    // Auto-generate nodes for basic flow
    const autoNodes: { type: NodeType; label: string; config: Record<string, unknown>; position: number }[] = []

    // 1) Trigger
    autoNodes.push({
      type: "trigger",
      label: "Usuario inicia bot",
      config: {},
      position: 0,
    })

    // 2) Welcome message with media + buttons
    const welcomeText = basicWelcomeMsg.trim() || `Ola! Confira nosso produto: ${basicProductName.trim()}`
    const fullText = basicProductDesc.trim()
      ? `${welcomeText}\n\n${basicProductDesc.trim()}\n\nValor: R$ ${basicProductPrice.trim()}`
      : `${welcomeText}\n\nValor: R$ ${basicProductPrice.trim()}`
    
    const buttons: InlineButton[] = []
    if (basicButtonText.trim() && basicButtonUrl.trim()) {
      buttons.push({ text: basicButtonText.trim(), url: basicButtonUrl.trim() })
    }

    autoNodes.push({
      type: "message",
      label: fullText.length > 40 ? fullText.slice(0, 40) + "..." : fullText,
      config: {
        text: fullText,
        media_url: basicMediaType !== "none" ? basicMediaUrl : "",
        media_type: basicMediaType !== "none" ? basicMediaType : "",
        buttons: buttons.length > 0 ? JSON.stringify(buttons) : "",
        subVariant: basicMediaType !== "none" ? "media" : "text",
      },
      position: 1,
    })

    // 3) Payment node if price is set
    if (basicProductPrice.trim()) {
      autoNodes.push({
        type: "payment",
        label: `Pagamento: ${basicProductName.trim()}`,
        config: {
          amount: basicProductPrice.trim(),
          description: basicProductName.trim(),
          subVariant: "charge",
        },
        position: 2,
      })
    }

    // Insert all nodes
    for (const node of autoNodes) {
      await supabase
        .from("flow_nodes")
        .insert({ flow_id: newFlow.id, ...node })
    }

    setFlows((prev) => [...prev, newFlow])
    setActiveFlow(newFlow)
    resetBasicFlow()
    setNewFlowName("")
    setNewFlowMode(null)
    setShowNewFlowDialog(false)
    setIsCreatingFlow(false)
  }

  // ---- Delete flow ----
  const handleDeleteFlow = async () => {
    if (!activeFlow) return

    setIsDeletingFlow(true)
    const { error } = await supabase
      .from("flows")
      .delete()
      .eq("id", activeFlow.id)

    if (error) {
      console.error("Error deleting flow:", error)
      setIsDeletingFlow(false)
      return
    }

    setFlows((prev) => {
      const updated = prev.filter((f) => f.id !== activeFlow.id)
      // If we deleted the primary, promote the first remaining
      if (activeFlow.is_primary && updated.length > 0) {
        updated[0] = { ...updated[0], is_primary: true, category: "inicial" }
        // Update in DB (try with new cols, ignore if they don't exist)
        supabase
          .from("flows")
          .update({ is_primary: true, category: "inicial" })
          .eq("id", updated[0].id)
          .then(() => {})
          .catch(() => {})
      }
      if (updated.length > 0) {
        setActiveFlow(updated[0])
      } else {
        setActiveFlow(null)
        setNodes([])
      }
      return updated
    })
    setShowDeleteFlowDialog(false)
    setIsDeletingFlow(false)
  }

  // ---- Set as primary flow ----
  const handleSetPrimary = async (flow: Flow) => {
    // Remove primary from current
    const oldPrimary = flows.find((f) => f.is_primary)
    if (oldPrimary) {
      // Try updating new columns, ignore errors if they don't exist
      await supabase
        .from("flows")
        .update({ is_primary: false })
        .eq("id", oldPrimary.id)
        .then(() => {})
        .catch(() => {})
    }
    // Set new primary (try with new columns)
    await supabase
      .from("flows")
      .update({ is_primary: true, category: "inicial" })
      .eq("id", flow.id)
      .then(() => {})
      .catch(() => {})

    setFlows((prev) =>
      prev.map((f) => ({
        ...f,
        is_primary: f.id === flow.id,
        category: f.id === flow.id ? "inicial" : (f.id === oldPrimary?.id ? "personalizado" : f.category),
      }))
    )
    setActiveFlow({ ...flow, is_primary: true, category: "inicial" })
  }

  // ---- Edit flow (name + category) ----
  const openEditFlow = (flow: Flow) => {
    setEditFlowName(flow.name)
    setEditFlowCategory(flow.category)
    setShowEditFlowDialog(true)
  }

  const handleSaveFlow = async () => {
    if (!activeFlow) return
    setIsSavingFlow(true)

    let { error } = await supabase
      .from("flows")
      .update({
        name: editFlowName.trim(),
        category: activeFlow.is_primary ? "inicial" : editFlowCategory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeFlow.id)

    // Fallback without category column
    if (error && (error.message?.includes("category") || error.code === "42703")) {
      const retry = await supabase
        .from("flows")
        .update({
          name: editFlowName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeFlow.id)
      error = retry.error
    }

    if (error) {
      console.error("Error updating flow:", error)
      setIsSavingFlow(false)
      return
    }

    const updatedCategory = activeFlow.is_primary ? "inicial" : editFlowCategory
    setFlows((prev) =>
      prev.map((f) =>
        f.id === activeFlow.id ? { ...f, name: editFlowName.trim(), category: updatedCategory } : f
      )
    )
    setActiveFlow((prev) => prev ? { ...prev, name: editFlowName.trim(), category: updatedCategory } : prev)
    setShowEditFlowDialog(false)
    setIsSavingFlow(false)
  }

  // ---- Add node ----
  const handleAddNode = async () => {
    if (!activeFlow || !selectedTemplate) return

    setIsAddingNode(true)

    let label = selectedTemplate.label
    let config: Record<string, unknown> = { ...nodeConfigValues, subVariant: selectedTemplate.subVariant || "" }

    if (selectedTemplate.type === "message") {
      label = msgText ? (msgText.length > 40 ? msgText.slice(0, 40) + "..." : msgText) : "Mensagem"
      const validButtons = msgButtons.filter((b) => b.text.trim() && b.url.trim())
      config = {
        text: msgText,
        media_url: msgMediaType !== "none" ? msgMediaUrl : "",
        media_type: msgMediaType !== "none" ? msgMediaType : "",
        buttons: validButtons.length > 0 ? JSON.stringify(validButtons) : "",
        subVariant: selectedTemplate.subVariant || "",
      }
    } else if (selectedTemplate.type === "delay" && nodeConfigValues.seconds) {
      const secs = parseInt(nodeConfigValues.seconds)
      if (secs >= 3600) {
        const hours = Math.floor(secs / 3600)
        label = `Esperar ${hours} hora${hours > 1 ? "s" : ""}`
      } else if (secs >= 60) {
        label = `Esperar ${Math.floor(secs / 60)} minuto${Math.floor(secs / 60) > 1 ? "s" : ""}`
      } else {
        label = `Esperar ${secs} segundo${secs > 1 ? "s" : ""}`
      }
    } else if (selectedTemplate.type === "condition") {
      const msg = nodeConfigValues.condition_message || "Condicao"
      label = msg.length > 35 ? msg.slice(0, 35) + "..." : msg
      config = {
        condition_message: nodeConfigValues.condition_message || "",
        condition_branches: nodeConfigValues.condition_branches || "[]",
        subVariant: "response_condition",
      }
    } else if (selectedTemplate.type === "payment") {
      if (selectedTemplate.subVariant === "charge" && nodeConfigValues.amount) {
        label = nodeConfigValues.description ? `R$${nodeConfigValues.amount} - ${nodeConfigValues.description}` : `Cobrar R$${nodeConfigValues.amount}`
    }
    } else if (selectedTemplate.type === "action" && nodeConfigValues.action_name) {
      const actionVal = nodeConfigValues.action_name
      if (selectedTemplate.subVariant === "add_group") {
        label = `Grupo: ${actionVal.replace(/https?:\/\//, "").slice(0, 30)}`
      } else {
        label = actionVal
      }
    } else if (selectedTemplate.subVariant === "goto_flow" && nodeConfigValues.target_flow_name) {
      label = `Ir para: ${nodeConfigValues.target_flow_name}`
      config = {
        target_flow_id: nodeConfigValues.target_flow_id,
        target_flow_name: nodeConfigValues.target_flow_name,
        subVariant: "goto_flow",
      }
} else if (selectedTemplate.subVariant === "restart") {
  const maxRestarts = parseInt(nodeConfigValues.max_restarts || "0") || 0
  label = maxRestarts > 0 ? `Recomecar Fluxo (max ${maxRestarts}x)` : "Recomecar Fluxo"
  config = { subVariant: "restart", max_restarts: maxRestarts }
    } else if (selectedTemplate.subVariant === "end") {
      label = "Encerrar Conversa"
      config = { subVariant: "end" }
    }

    const newPosition = nodes.length

    const { data, error } = await supabase
      .from("flow_nodes")
      .insert({
        flow_id: activeFlow.id,
        type: selectedTemplate.type,
        label,
        config,
        position: newPosition,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding node:", error)
      setIsAddingNode(false)
      return
    }

    setNodes((prev) => [...prev, data as FlowNode])
    setSelectedTemplate(null)
    setNodeConfigValues({})
    resetMessageConfig()
    setShowAddNodeDialog(false)
    setIsAddingNode(false)
  }

  // ---- Edit node ----
  const openEditNode = (node: FlowNode) => {
    setEditingNode(node)
    setEditNodeLabel(node.label)
    const cfg = node.config || {}
    setEditNodeConfig(cfg as Record<string, string>)

    if (node.type === "message") {
      setMsgText((cfg.text as string) || "")
      setMsgMediaUrl((cfg.media_url as string) || "")
      const mType = (cfg.media_type as string) || ""
      setMsgMediaType(mType === "photo" || mType === "video" ? mType : "none")
      const btnStr = (cfg.buttons as string) || ""
      if (btnStr) {
        try {
          const parsed = JSON.parse(btnStr) as InlineButton[]
          setMsgButtons(parsed)
          setMsgHasButtons(parsed.length > 0)
        } catch {
          setMsgButtons([])
          setMsgHasButtons(false)
        }
      } else {
        setMsgButtons([])
        setMsgHasButtons(false)
      }
    } else {
      resetMessageConfig()
    }

    setShowEditNodeDialog(true)
  }

  const handleSaveNode = async () => {
    if (!editingNode) return

    setIsSavingNode(true)

    let finalConfig: Record<string, unknown> = { ...editNodeConfig }
    let finalLabel = editNodeLabel

    if (editingNode.type === "message") {
      // Only include buttons if the switch is ON and there are valid buttons
      const validButtons = msgHasButtons ? msgButtons.filter((b) => b.text.trim() && b.url.trim()) : []
      finalConfig = {
        text: msgText,
        media_url: msgMediaType !== "none" ? msgMediaUrl : "",
        media_type: msgMediaType !== "none" ? msgMediaType : "",
        buttons: validButtons.length > 0 ? JSON.stringify(validButtons) : "",
        subVariant: editingNode.config?.subVariant || "",
      }
      finalLabel = msgText ? (msgText.length > 40 ? msgText.slice(0, 40) + "..." : msgText) : "Mensagem"
    } else if (editingNode.type === "delay") {
      const secs = parseInt(editNodeConfig.seconds || "0")
      finalConfig = { seconds: editNodeConfig.seconds || "0", subVariant: editingNode.config?.subVariant || "" }
      if (secs >= 3600) {
        const hours = Math.floor(secs / 3600)
        finalLabel = `Esperar ${hours} hora${hours > 1 ? "s" : ""}`
      } else if (secs >= 60) {
        const mins = Math.floor(secs / 60)
        finalLabel = `Esperar ${mins} minuto${mins > 1 ? "s" : ""}`
      } else {
        finalLabel = `Esperar ${secs} segundo${secs > 1 ? "s" : ""}`
      }
    } else if (editingNode.type === "condition") {
      const msg = editNodeConfig.condition_message || "Condicao"
      finalLabel = msg.length > 35 ? msg.slice(0, 35) + "..." : msg
      finalConfig = {
        condition_message: editNodeConfig.condition_message || "",
        condition_branches: editNodeConfig.condition_branches || "[]",
        subVariant: "response_condition",
      }
    } else if (editingNode.type === "payment") {
      const sv = editingNode.config?.subVariant || ""
      finalConfig = { ...editNodeConfig, subVariant: sv }
      if (sv === "charge" && editNodeConfig.amount) {
        finalLabel = editNodeConfig.description ? `R$${editNodeConfig.amount} - ${editNodeConfig.description}` : `Cobrar R$${editNodeConfig.amount}`
    }
    } else if (editingNode.type === "action") {
      const sv = editingNode.config?.subVariant || ""
if (sv === "restart") {
  const maxRestarts = parseInt(editNodeConfig.max_restarts || "0") || 0
  finalConfig = { subVariant: "restart", max_restarts: maxRestarts }
  finalLabel = maxRestarts > 0 ? `Recomecar Fluxo (max ${maxRestarts}x)` : "Recomecar Fluxo"
      } else if (sv === "end") {
        finalConfig = { subVariant: "end" }
        finalLabel = "Encerrar Conversa"
      } else if (sv === "goto_flow") {
        finalConfig = {
          target_flow_id: editNodeConfig.target_flow_id,
          target_flow_name: editNodeConfig.target_flow_name,
          subVariant: "goto_flow",
        }
        finalLabel = editNodeConfig.target_flow_name ? `Ir para: ${editNodeConfig.target_flow_name}` : "Redirecionar"
      } else {
        // add_group ou outros
        finalConfig = { ...editNodeConfig, subVariant: sv }
        const actionVal = editNodeConfig.action_name || ""
        if (sv === "add_group" && actionVal) {
          finalLabel = `Grupo: ${actionVal.replace(/https?:\/\//, "").slice(0, 30)}`
        } else {
          finalLabel = actionVal || editNodeLabel
        }
      }
    }

    const { error, data } = await supabase
      .from("flow_nodes")
      .update({
        label: finalLabel,
        config: finalConfig,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingNode.id)
      .select()

    if (error) {
      console.error("Error updating node:", error)
      setIsSavingNode(false)
      return
    }

    // Check if the update actually affected a row
    if (!data || data.length === 0) {
      
      const { error: deleteError } = await supabase
        .from("flow_nodes")
        .delete()
        .eq("id", editingNode.id)
      
      if (deleteError) {
        console.error("Delete also failed:", deleteError)
        setIsSavingNode(false)
        return
      }

      const { data: insertData, error: insertError } = await supabase
        .from("flow_nodes")
        .insert({
          id: editingNode.id,
          flow_id: editingNode.flow_id,
          type: editingNode.type,
          label: finalLabel,
          config: finalConfig,
          position: editingNode.position,
        })
        .select()
        .single()
      
      if (insertError) {
        console.error("Re-insert also failed:", insertError)
        setIsSavingNode(false)
        return
      }
      
      // Delete + insert fallback succeeded
    }

    setNodes((prev) =>
      prev.map((n) =>
        n.id === editingNode.id
          ? { ...n, label: finalLabel, config: finalConfig }
          : n
      )
    )
    resetMessageConfig()
    setShowEditNodeDialog(false)
    setEditingNode(null)
    setIsSavingNode(false)
  }

  // ---- Delete node ----
  const handleDeleteNode = async () => {
    if (!deletingNode) return

    setIsDeletingNode(true)
    const { error } = await supabase
      .from("flow_nodes")
      .delete()
      .eq("id", deletingNode.id)

    if (error) {
      console.error("Error deleting node:", error)
      setIsDeletingNode(false)
      return
    }

    const remaining = nodes.filter((n) => n.id !== deletingNode.id)
    const reordered = remaining.map((n, i) => ({ ...n, position: i }))

    for (const node of reordered) {
      await supabase
        .from("flow_nodes")
        .update({ position: node.position })
        .eq("id", node.id)
    }

    setNodes(reordered)
    setShowDeleteNodeDialog(false)
    setDeletingNode(null)
    setIsDeletingNode(false)
  }

  // ---- Load category config when active flow changes ----
  useEffect(() => {
    if (!activeFlow) {
      setFlowCategoryConfig({})
      setShowCategoryConfig(false)
      return
    }
    // Load from local state per flow (in real app, this would come from DB)
    const stored = localStorage.getItem(`flow_config_${activeFlow.id}`)
    if (stored) {
      try {
        setFlowCategoryConfig(JSON.parse(stored))
      } catch {
        setFlowCategoryConfig({})
      }
    } else {
      setFlowCategoryConfig({})
    }
  }, [activeFlow?.id])

  const handleSaveCategoryConfig = async () => {
    if (!activeFlow) return
    setIsSavingCategoryConfig(true)
    // Save to localStorage as fallback (would be DB in production)
    localStorage.setItem(`flow_config_${activeFlow.id}`, JSON.stringify(flowCategoryConfig))
    // Attempt to save to supabase (if config column exists)
    await supabase
      .from("flows")
      .update({ config: flowCategoryConfig, updated_at: new Date().toISOString() })
      .eq("id", activeFlow.id)
      .then(() => {})
      .catch(() => {})
    setIsSavingCategoryConfig(false)
  }

  // ---- Toggle flow status ----
  const toggleFlowStatus = async (flow: Flow) => {
    const newStatus = flow.status === "ativo" ? "pausado" : "ativo"
    const { error } = await supabase
      .from("flows")
      .update({ status: newStatus })
      .eq("id", flow.id)

    if (error) {
      console.error("Error updating flow status:", error)
      return
    }

    setFlows((prev) =>
      prev.map((f) => (f.id === flow.id ? { ...f, status: newStatus } : f))
    )
    if (activeFlow?.id === flow.id) {
      setActiveFlow((prev) => (prev ? { ...prev, status: newStatus } : prev))
    }
  }

  // ---- Render ----

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Fluxos" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Fluxos" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground/50">Monte jornadas de conversao</p>
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg text-xs h-8"
              onClick={() => {
                setNewFlowCategory(flows.length === 0 ? "inicial" : "personalizado")
                setNewFlowMode(null)
                resetBasicFlow()
                setShowNewFlowDialog(true)
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Novo fluxo
            </Button>
          </div>

          {isLoadingFlows ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/30" />
            </div>
          ) : flows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/40">
                <Zap className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-foreground">Comece aqui</h3>
                <p className="text-xs text-muted-foreground/50 mt-1 max-w-[280px]">
                  Crie seu primeiro fluxo. Ele sera o ponto de entrada do seu bot.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg text-xs h-8"
                onClick={() => {
                  setNewFlowCategory("inicial")
                  setNewFlowMode(null)
                  resetBasicFlow()
                  setShowNewFlowDialog(true)
                }}
              >
                Criar fluxo inicial
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* ====== FLUXO PRINCIPAL ====== */}
              {primaryFlow && (
                <button
                  className={`group relative w-full text-left rounded-2xl border transition-all ${
                    activeFlow?.id === primaryFlow.id
                      ? "border-accent/40 bg-accent/[0.04]"
                      : "border-border bg-card hover:border-border/80 hover:bg-card/80"
                  }`}
                  onClick={() => setActiveFlow(primaryFlow)}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      activeFlow?.id === primaryFlow.id ? "bg-accent/10" : "bg-secondary/60"
                    }`}>
                      <Crown className={`h-4.5 w-4.5 ${activeFlow?.id === primaryFlow.id ? "text-accent" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">{primaryFlow.name}</h3>
                        <span className="text-[10px] font-medium text-accent/70 bg-accent/[0.08] rounded px-1.5 py-px">
                          Principal
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Jornada inicial do usuario
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium cursor-pointer transition-colors ${
                          primaryFlow.status === "ativo" 
                            ? "text-success/80 hover:text-success" 
                            : "text-warning/80 hover:text-warning"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFlowStatus(primaryFlow)
                        }}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${primaryFlow.status === "ativo" ? "bg-success" : "bg-warning"}`} />
                        {primaryFlow.status === "ativo" ? "Ativo" : "Pausado"}
                      </div>
                      <div
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-secondary/60 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveFlow(primaryFlow)
                          openEditFlow(primaryFlow)
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {/* ====== FLUXOS SECUNDARIOS ====== */}
              {(secondaryFlows.length > 0 || primaryFlow) && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Sub Fluxos
                    </p>
                    {secondaryFlows.length > 0 && (
                      <span className="text-[11px] text-muted-foreground/60">
                        {secondaryFlows.length} fluxo{secondaryFlows.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {secondaryFlows.length === 0 ? (
                    <button
                      className="flex items-center gap-3 rounded-2xl border border-dashed border-border/60 hover:border-border bg-transparent hover:bg-secondary/20 p-4 transition-all text-left"
                      onClick={() => {
                        setNewFlowCategory("personalizado")
                        setNewFlowMode(null)
                        resetBasicFlow()
                        setShowNewFlowDialog(true)
                      }}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/40">
                        <Plus className="h-4 w-4 text-muted-foreground/60" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Criar sub fluxo</p>
                        <p className="text-xs text-muted-foreground/60">Remarketing, follow-up, pos-venda</p>
                      </div>
                    </button>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {secondaryFlows.map((fluxo) => {
                        const catConfig = getCategoryConfig(fluxo.category)
                        const CatIcon = catConfig.icon
                        const isActive = activeFlow?.id === fluxo.id

                        return (
                          <button
                            key={fluxo.id}
                            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-left w-full ${
                              isActive
                                ? "bg-secondary/60 border border-border/80"
                                : "bg-transparent border border-transparent hover:bg-secondary/30"
                            }`}
                            onClick={() => setActiveFlow(fluxo)}
                          >
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isActive ? "bg-accent/10" : "bg-secondary/50"
                            }`}>
                              <CatIcon className={`h-3.5 w-3.5 ${isActive ? catConfig.iconColor : "text-muted-foreground"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isActive ? "text-foreground" : "text-foreground/80"}`}>{fluxo.name}</p>
                              <p className="text-[11px] text-muted-foreground/60">{catConfig.label}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div
                                className={`flex items-center gap-1 text-[10px] font-medium cursor-pointer ${
                                  fluxo.status === "ativo" ? "text-success/60" : "text-warning/60"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFlowStatus(fluxo)
                                }}
                              >
                                <div className={`h-1.5 w-1.5 rounded-full ${fluxo.status === "ativo" ? "bg-success/60" : "bg-warning/60"}`} />
                                {fluxo.status}
                              </div>
                              <ChevronRight className={`h-3.5 w-3.5 transition-colors ${isActive ? "text-muted-foreground/40" : "text-muted-foreground/20 group-hover:text-muted-foreground/40"}`} />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ====== VISUAL BUILDER DO FLUXO ATIVO ====== */}
              {activeFlow && (
                <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6">
                  {/* Builder Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-base font-bold text-foreground">{activeFlow.name}</h2>
                          {activeFlow.is_primary && (
                            <span className="text-xs font-semibold text-accent/70 bg-accent/[0.08] rounded-lg px-2 py-0.5">
                              Principal
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground/60">
                            {getCategoryConfig(activeFlow.category).label}
                          </span>
                          <span className="text-xs text-muted-foreground/40">
                            {nodes.filter((n) => n.type !== "trigger").length} etapa{nodes.filter((n) => n.type !== "trigger").length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!activeFlow.is_primary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-muted-foreground/60 hover:text-accent"
                          onClick={() => handleSetPrimary(activeFlow)}
                        >
                          <Star className="h-3.5 w-3.5 mr-1.5" />
                          Tornar principal
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${showCategoryConfig ? "text-accent bg-accent/10" : "text-muted-foreground/50 hover:text-foreground"}`}
                        onClick={() => setShowCategoryConfig(!showCategoryConfig)}
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground/50 hover:text-foreground"
                        onClick={() => openEditFlow(activeFlow)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground/50 hover:text-destructive"
                        onClick={() => setShowDeleteFlowDialog(true)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  {/* ====== PAINEL DE CONFIGURACOES DO TIPO ====== */}
                  {showCategoryConfig && (
                    <div className="mx-6 mb-4">
                      {(() => {
                        const configDef = getCategoryConfigDef(activeFlow.category)
                        const catStyle = getCategoryConfig(activeFlow.category)
                        return (
                          <div className={`rounded-xl border p-4 ${catStyle.color}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Settings2 className={`h-4 w-4 ${catStyle.iconColor}`} />
                                <h3 className="text-sm font-semibold text-foreground">{configDef.title}</h3>
                              </div>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg"
                                disabled={isSavingCategoryConfig}
                                onClick={handleSaveCategoryConfig}
                              >
                                {isSavingCategoryConfig && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                                Salvar
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-4">{configDef.description}</p>

                            {/* ---- FLUXOS VINCULADOS (only for primary flow) ---- */}
                            {activeFlow.is_primary && secondaryFlows.length > 0 && (
                              <div className="mb-4 rounded-xl border border-border/50 bg-background/30 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Workflow className="h-4 w-4 text-orange-400" />
                                  <h4 className="text-xs font-semibold text-foreground">Fluxos Vinculados</h4>
                                  <span className="text-[10px] text-muted-foreground">
                                    ({nodes.filter((n) => n.type === "action" && n.config?.subVariant === "goto_flow").length} conectados)
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mb-2.5">
                                  Fluxos secundarios que o usuario pode ser redirecionado a partir deste fluxo. Adicione um bloco "Ir para Outro Fluxo" no builder abaixo.
                                </p>
                                <div className="flex flex-col gap-1.5">
                                  {secondaryFlows.map((sf) => {
                                    const sfCat = getCategoryConfig(sf.category)
                                    const SFIcon = sfCat.icon
                                    const isLinked = nodes.some((n) => n.type === "action" && n.config?.subVariant === "goto_flow" && n.config?.target_flow_id === sf.id)
                                    return (
                                      <div
                                        key={sf.id}
                                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
                                          isLinked ? "bg-orange-500/5 border border-orange-500/20" : "bg-secondary/30 border border-transparent"
                                        }`}
                                      >
                                        <div className={`flex h-7 w-7 items-center justify-center rounded-md border shrink-0 ${sfCat.color}`}>
                                          <SFIcon className={`h-3.5 w-3.5 ${sfCat.iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-foreground truncate">{sf.name}</p>
                                          <p className="text-[10px] text-muted-foreground">{sfCat.label}</p>
                                        </div>
                                        {isLinked ? (
                                          <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 rounded-md text-[9px] px-1.5 py-0 shrink-0">
                                            Conectado
                                          </Badge>
                                        ) : (
                                          <span className="text-[10px] text-muted-foreground shrink-0">Nao vinculado</span>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {activeFlow.is_primary && secondaryFlows.length === 0 && (
                              <div className="mb-4 rounded-xl border border-dashed border-border p-4 flex flex-col items-center gap-2">
                                <Workflow className="h-5 w-5 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground text-center">
                                  Crie fluxos secundarios (remarketing, follow-up, etc.) para poder vincular ao fluxo principal.
                                </p>
                              </div>
                            )}

                            <div className="flex flex-col gap-3">
                              {configDef.fields.map((field) => {
                                const FieldIcon = field.icon
                                return (
                                  <div key={field.key} className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                      <FieldIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                      <Label className="text-xs font-medium text-foreground">{field.label}</Label>
                                    </div>
                                    {field.description && (
                                      <p className="text-[10px] text-muted-foreground ml-5">{field.description}</p>
                                    )}
                                    {field.type === "toggle" ? (
                                      <div className="ml-5">
                                        <Switch
                                          checked={!!flowCategoryConfig[field.key]}
                                          onCheckedChange={(checked) =>
                                            setFlowCategoryConfig((prev) => ({ ...prev, [field.key]: checked }))
                                          }
                                        />
                                      </div>
                                    ) : field.type === "select" ? (
                                      <div className="ml-5">
                                        <Select
                                          value={(flowCategoryConfig[field.key] as string) || ""}
                                          onValueChange={(v) =>
                                            setFlowCategoryConfig((prev) => ({ ...prev, [field.key]: v }))
                                          }
                                        >
                                          <SelectTrigger className="h-8 bg-background/60 border-border/50 rounded-lg text-foreground text-xs">
                                            <SelectValue placeholder="Selecione..." />
                                          </SelectTrigger>
                                          <SelectContent className="bg-card border-border">
                                            {field.options?.map((opt) => (
                                              <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    ) : field.type === "textarea" ? (
                                      <div className="ml-5">
                                        <Textarea
                                          value={(flowCategoryConfig[field.key] as string) || ""}
                                          onChange={(e) =>
                                            setFlowCategoryConfig((prev) => ({ ...prev, [field.key]: e.target.value }))
                                          }
                                          placeholder={field.placeholder}
                                          className="bg-background/60 border-border/50 rounded-lg text-foreground text-xs min-h-[60px]"
                                        />
                                      </div>
                                    ) : (
                                      <div className="ml-5">
                                        <Input
                                          type={field.type === "number" ? "number" : "text"}
                                          value={(flowCategoryConfig[field.key] as string) || ""}
                                          onChange={(e) =>
                                            setFlowCategoryConfig((prev) => ({ ...prev, [field.key]: e.target.value }))
                                          }
                                          placeholder={field.placeholder}
                                          className="h-8 bg-background/60 border-border/50 rounded-lg text-foreground text-xs"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  <div>
                    {/* Mini-mapa */}
                    {!isLoadingNodes && nodes.filter((n) => n.type !== "trigger").length > 2 && (
                      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 px-1">
                        <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0" title="Gatilho">
                          <Zap className="h-3.5 w-3.5 text-accent/60" />
                        </div>
                        {nodes.filter((n) => n.type !== "trigger").map((node) => {
                          const MiniIcon = nodeIcons[node.type]
                          return (
                            <div key={node.id} className="flex items-center gap-2 shrink-0">
                              <div className="w-4 h-px bg-border/40" />
                              <div
                                className="h-7 w-7 rounded-lg bg-secondary/40 flex items-center justify-center"
                                title={node.label}
                              >
                                <MiniIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {isLoadingNodes ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {nodes.filter((n) => n.type !== "trigger").length === 0 && (
                          <div className="text-center py-8 mb-2">
                            <p className="text-sm text-muted-foreground/60">
                              Adicione etapas ao fluxo
                            </p>
                          </div>
                        )}

                        {/* Trigger block */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent/[0.04] px-5 py-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
                              <DragonTriggerIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground">Inicio do Fluxo</p>
                              <p className="text-xs text-muted-foreground/50 mt-0.5">Quando o usuario inicia a conversa</p>
                            </div>
                            <span className="text-[10px] font-semibold text-accent/60 uppercase tracking-wider bg-accent/[0.08] px-2.5 py-1 rounded-lg">Gatilho</span>
                          </div>
                          {nodes.filter((n) => n.type !== "trigger").length > 0 && (
                            <div className="flex justify-center py-1.5">
                              <div className="w-px h-6 bg-border/40" />
                            </div>
                          )}
                        </div>

                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={nodes.filter((n) => n.type !== "trigger").map((n) => n.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {nodes.filter((n) => n.type !== "trigger").map((node, i, arr) => (
                              <SortableNodeCard
                                key={node.id}
                                node={node}
                                isLast={i === arr.length - 1}
                                flows={flows}
                                onEdit={openEditNode}
                                onDelete={(n) => {
                                  setDeletingNode(n)
                                  setShowDeleteNodeDialog(true)
                                }}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>

                        {nodes.filter((n) => n.type !== "trigger").length > 0 && (
                          <div className="flex justify-center py-1.5">
                            <div className="w-px h-5 bg-border/30" />
                          </div>
                        )}
                        <button
                          className="group w-full flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-border/40 hover:border-accent/40 bg-transparent hover:bg-accent/[0.04] py-5 transition-all"
                          onClick={() => {
                            setSelectedTemplate(null)
                            setNodeConfigValues({})
                            setShowAddNodeDialog(true)
                          }}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/40 group-hover:bg-accent/10 transition-colors">
                            <Plus className="h-4 w-4 text-muted-foreground/40 group-hover:text-accent/70 transition-colors" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground/40 group-hover:text-accent/70 transition-colors">
                            Adicionar etapa
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ---- New Flow Dialog ---- */}
      <Dialog open={showNewFlowDialog} onOpenChange={(open) => {
        setShowNewFlowDialog(open)
        if (!open) {
          setNewFlowMode(null)
          resetBasicFlow()
          setNewFlowName("")
        }
      }}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-[540px] max-h-[90vh] overflow-y-auto p-0">

          {/* ===== STEP 1: Choose mode ===== */}
          {newFlowMode === null && (
            <div className="flex flex-col p-5 gap-4">
              <div>
                <DialogHeader>
                  <DialogTitle className="text-foreground text-sm font-semibold">
                    {flows.length === 0 ? "Criar fluxo inicial" : "Novo fluxo"}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground/50 mt-1">Escolha como montar seu fluxo.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Basic Flow Option */}
                <button
                  className="group flex flex-col rounded-xl border border-border/60 bg-transparent p-4 text-left transition-all hover:bg-secondary/20 hover:border-border"
                  onClick={() => setNewFlowMode("basico")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 mb-3">
                    <Zap className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">Basico</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5 mb-3">Pronto em segundos</p>
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <p className="text-[10px] text-muted-foreground/40">Boas-vindas + midia</p>
                    <p className="text-[10px] text-muted-foreground/40">Cobranca automatica</p>
                    <p className="text-[10px] text-muted-foreground/40">Preencha e pronto</p>
                  </div>
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent/40" />
                    <div className="w-3 h-px bg-border/40" />
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400/40" />
                    <div className="w-3 h-px bg-border/40" />
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/40" />
                  </div>
                </button>

                {/* Complete Flow Option */}
                <button
                  className="group flex flex-col rounded-xl border border-border/60 bg-transparent p-4 text-left transition-all hover:bg-secondary/20 hover:border-border"
                  onClick={() => setNewFlowMode("completo")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 mb-3">
                    <Workflow className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">Completo</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5 mb-3">Controle total</p>
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <p className="text-[10px] text-muted-foreground/40">Etapa por etapa</p>
                    <p className="text-[10px] text-muted-foreground/40">Logica e automacoes</p>
                    <p className="text-[10px] text-muted-foreground/40">Jornadas elaboradas</p>
                  </div>
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent/40" />
                    <div className="w-3 h-px bg-border/40" />
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-400/40" />
                    <div className="w-3 h-px bg-border/40" />
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-400/40" />
                    <div className="w-3 h-px bg-border/40" />
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/40" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 2A: Basic Flow Wizard ===== */}
          {newFlowMode === "basico" && (
            <div className="flex flex-col">
              <div className="sticky top-0 z-10 bg-card border-b border-border px-6 pt-6 pb-4 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary/60 transition-colors"
                    onClick={() => setNewFlowMode(null)}
                  >
                    <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
                  </button>
                  <div>
                    <DialogHeader>
                      <DialogTitle className="text-foreground text-base">Fluxo Basico</DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-muted-foreground mt-0.5">Preencha e seu bot estara pronto para vender</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 p-5">
                {/* Product info section */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 border border-accent/20">
                      <ShoppingBag className="h-3 w-3 text-accent" />
                    </div>
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Seu Produto</span>
                  </div>
                  
                  <div className="flex flex-col gap-3 pl-8">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-foreground text-xs">Nome do produto</Label>
                      <Input
                        value={basicProductName}
                        onChange={(e) => setBasicProductName(e.target.value)}
                        placeholder="Ex: Curso de Marketing Digital"
                        className="bg-secondary border-border rounded-xl text-foreground"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-foreground text-xs">Descricao curta <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                      <Textarea
                        value={basicProductDesc}
                        onChange={(e) => setBasicProductDesc(e.target.value)}
                        placeholder="Ex: Aprenda do zero ao avancado em 30 dias"
                        className="bg-secondary border-border rounded-xl text-foreground min-h-[60px] resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-foreground text-xs">Preco (R$)</Label>
                      <Input
                        value={basicProductPrice}
                        onChange={(e) => setBasicProductPrice(e.target.value)}
                        placeholder="49.90"
                        className="bg-secondary border-border rounded-xl text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Message section */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/20">
                      <MessageSquare className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Mensagem</span>
                  </div>

                  <div className="flex flex-col gap-3 pl-8">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-foreground text-xs">Texto de boas-vindas <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                      <Textarea
                        value={basicWelcomeMsg}
                        onChange={(e) => setBasicWelcomeMsg(e.target.value)}
                        placeholder="Ex: Opa! Que bom ter voce aqui. Olha so essa oportunidade:"
                        className="bg-secondary border-border rounded-xl text-foreground min-h-[70px] resize-none"
                        rows={3}
                      />
                      <p className="text-[10px] text-muted-foreground">Se vazio, usaremos uma mensagem padrao</p>
                    </div>

                    {/* Media toggle */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground text-xs">Midia <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                      <div className="flex gap-2">
                        {(["none", "photo", "video"] as const).map((mt) => (
                          <button
                            key={mt}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                              basicMediaType === mt
                                ? "border-accent bg-accent/10 text-accent font-medium"
                                : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                            }`}
                            onClick={() => setBasicMediaType(mt)}
                          >
                            {mt === "none" && <X className="h-3 w-3" />}
                            {mt === "photo" && <Image className="h-3 w-3" />}
                            {mt === "video" && <Video className="h-3 w-3" />}
                            {mt === "none" ? "Sem midia" : mt === "photo" ? "Foto" : "Video"}
                          </button>
                        ))}
                      </div>
                      {basicMediaType !== "none" && (
                        <Input
                          value={basicMediaUrl}
                          onChange={(e) => setBasicMediaUrl(e.target.value)}
                          placeholder={basicMediaType === "photo" ? "URL da foto do produto" : "URL do video"}
                          className="bg-secondary border-border rounded-xl text-foreground"
                        />
                      )}
                    </div>

                    {/* Optional button */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground text-xs">Botao de link <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                      <div className="flex gap-2">
                        <Input
                          value={basicButtonText}
                          onChange={(e) => setBasicButtonText(e.target.value)}
                          placeholder="Texto do botao"
                          className="bg-secondary border-border rounded-xl text-foreground flex-1"
                        />
                        <Input
                          value={basicButtonUrl}
                          onChange={(e) => setBasicButtonUrl(e.target.value)}
                          placeholder="https://..."
                          className="bg-secondary border-border rounded-xl text-foreground flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview of what will be generated */}
                <div className="rounded-xl border border-border/50 bg-secondary/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Preview do fluxo gerado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-accent bg-accent/10 rounded-lg px-2 py-1 border border-accent/20">
                      <Zap className="h-3 w-3" /> Inicio
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
                    <div className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 rounded-lg px-2 py-1 border border-blue-500/20">
                      <MessageSquare className="h-3 w-3" />
                      {basicProductName.trim() || "Mensagem"}
                      {basicMediaType !== "none" && (
                        <span className="text-[8px] bg-blue-500/20 rounded px-1">
                          {basicMediaType === "photo" ? "foto" : "video"}
                        </span>
                      )}
                    </div>
                    {basicProductPrice.trim() && (
                      <>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
                        <div className="flex items-center gap-1 text-[10px] text-success bg-success/10 rounded-lg px-2 py-1 border border-success/20">
                          <CreditCard className="h-3 w-3" /> R$ {basicProductPrice}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex justify-between items-center rounded-b-2xl">
                <Button
                  variant="ghost"
                  className="rounded-xl text-muted-foreground"
                  onClick={() => setNewFlowMode(null)}
                >
                  Voltar
                </Button>
                <Button
                  className="bg-success text-success-foreground hover:bg-success/90 rounded-xl"
                  disabled={!basicProductName.trim() || !basicProductPrice.trim() || isCreatingFlow}
                  onClick={handleCreateBasicFlow}
                >
                  {isCreatingFlow ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                  Criar Fluxo
                </Button>
              </div>
            </div>
          )}

          {/* ===== STEP 2B: Complete Flow (existing form) ===== */}
          {newFlowMode === "completo" && (
            <div className="flex flex-col">
              <div className="sticky top-0 z-10 bg-card border-b border-border px-6 pt-6 pb-4 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary/60 transition-colors"
                    onClick={() => setNewFlowMode(null)}
                  >
                    <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
                  </button>
                  <div>
                    <DialogHeader>
                      <DialogTitle className="text-foreground text-base">Fluxo Completo</DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-muted-foreground mt-0.5">Monte etapa por etapa com controle total</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 p-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="flow-name" className="text-foreground text-xs">Nome do fluxo</Label>
                  <Input
                    id="flow-name"
                    value={newFlowName}
                    onChange={(e) => setNewFlowName(e.target.value)}
                    placeholder={flows.length === 0 ? "Ex: Boas-vindas" : "Ex: Remarketing VIP"}
                    className="bg-secondary border-border rounded-xl text-foreground"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateFlow()
                    }}
                  />
                </div>

                {/* Category selection - only for secondary flows */}
                {flows.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground text-xs">Tipo de fluxo</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {flowCategories.filter((c) => c.value !== "inicial").map((cat) => {
                        const CatIcon = cat.icon
                        const isSelected = newFlowCategory === cat.value
                        return (
                          <button
                            key={cat.value}
                            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                              isSelected
                                ? `${cat.color} ring-1 ring-accent`
                                : "border-border bg-secondary/30 hover:bg-secondary/60"
                            }`}
                            onClick={() => setNewFlowCategory(cat.value)}
                          >
                            <CatIcon className={`h-4 w-4 shrink-0 ${isSelected ? cat.iconColor : "text-muted-foreground"}`} />
                            <div className="min-w-0">
                              <p className={`text-xs font-medium truncate ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                {cat.label}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {getCategoryConfig(newFlowCategory).description}
                    </p>
                  </div>
                )}

                {flows.length === 0 && (
                  <div className="flex items-start gap-3 rounded-xl bg-accent/5 border border-accent/20 p-3">
                    <Zap className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Este sera o fluxo principal do seu bot. E o primeiro que seus usuarios vao ver ao interagir.
                    </p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex justify-between items-center rounded-b-2xl">
                <Button
                  variant="ghost"
                  className="rounded-xl text-muted-foreground"
                  onClick={() => setNewFlowMode(null)}
                >
                  Voltar
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
                  disabled={!newFlowName.trim() || isCreatingFlow}
                  onClick={handleCreateFlow}
                >
                  {isCreatingFlow && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar
                </Button>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* ---- Edit Flow Dialog ---- */}
      <Dialog open={showEditFlowDialog} onOpenChange={setShowEditFlowDialog}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-sm p-5">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm font-semibold">Editar fluxo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-1">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <Input
                value={editFlowName}
                onChange={(e) => setEditFlowName(e.target.value)}
                className="bg-secondary/40 border-border/60 rounded-lg text-foreground text-sm h-9"
              />
            </div>
            {!activeFlow?.is_primary && (
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Tipo</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {flowCategories.filter((c) => c.value !== "inicial").map((cat) => {
                    const CatIcon = cat.icon
                    const isSelected = editFlowCategory === cat.value
                    return (
                      <button
                        key={cat.value}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all ${
                          isSelected
                            ? "bg-secondary/60 border border-border"
                            : "bg-transparent border border-transparent hover:bg-secondary/30"
                        }`}
                        onClick={() => setEditFlowCategory(cat.value)}
                      >
                        <CatIcon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? cat.iconColor : "text-muted-foreground/50"}`} />
                        <p className={`text-xs truncate ${isSelected ? "text-foreground font-medium" : "text-muted-foreground/70"}`}>
                          {cat.label}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            {activeFlow?.is_primary && (
              <p className="text-[11px] text-muted-foreground/50">
                Fluxo principal. Use {"'Tornar principal'"} em outro fluxo para trocar.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg text-xs text-muted-foreground"
              onClick={() => setShowEditFlowDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg text-xs"
              disabled={!editFlowName.trim() || isSavingFlow}
              onClick={handleSaveFlow}
            >
              {isSavingFlow && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---- Add Node Dialog ---- */}
      <Dialog open={showAddNodeDialog} onOpenChange={setShowAddNodeDialog}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          {!selectedTemplate ? (
            <>
              {/* Header */}
              <div className="shrink-0 px-6 pt-6 pb-4">
                <DialogHeader>
                  <DialogTitle className="text-foreground text-base font-bold">Adicionar etapa</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground/60 mt-1">Escolha o tipo de acao para esta etapa.</p>
              </div>

              <div className="h-px bg-border/40 mx-6" />

              {/* Groups */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="flex flex-col gap-5 px-6 py-5">
                  {actionGroups.map((group) => {
                    const GroupIcon = group.icon
                    const groupTemplates = actionTemplates.filter((tpl) => {
                      if (!group.types.includes(tpl.type)) return false
                      if (group.subVariants && tpl.subVariant) return group.subVariants.includes(tpl.subVariant)
                      if (group.subVariants && !tpl.subVariant) return false
                      return tpl.type !== "trigger"
                    })
                    console.log("[v0] Group filter:", group.id, "templates:", groupTemplates.map(t => t.label))
                    if (groupTemplates.length === 0) return null

                    return (
                      <div key={group.id} className="flex flex-col gap-2">
                        {/* Group label */}
                        <div className="flex items-center gap-2.5 px-1">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-md ${group.bgColor}`}>
                            <GroupIcon className={`h-3.5 w-3.5 ${group.iconColor}`} />
                          </div>
                          <p className="text-xs font-bold text-foreground/80 uppercase tracking-wider">{group.label}</p>
                        </div>

                        {/* Group Items */}
                        <div className="flex flex-col gap-1">
                          {groupTemplates.map((tpl, tplIdx) => {
                            const SubIcon = tpl.subVariant ? (subVariantIcons[tpl.subVariant] || nodeIcons[tpl.type]) : nodeIcons[tpl.type]
                            return (
                              <button
                                key={`${tpl.type}-${tpl.subVariant || tplIdx}`}
                                className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-all hover:bg-secondary/40 group"
                                onClick={async () => {
                                  // Para "end" adiciona direto sem configuracao
                                  if (tpl.subVariant === "end") {
                                    if (!activeFlow) return
                                    setIsAddingNode(true)
                                    const label = "Encerrar Conversa"
                                    const config = { subVariant: tpl.subVariant }
                                    const newPosition = nodes.length
                                    const { data, error } = await supabase
                                      .from("flow_nodes")
                                      .insert({
                                        flow_id: activeFlow.id,
                                        type: tpl.type,
                                        label,
                                        config,
                                        position: newPosition,
                                      })
                                      .select()
                                      .single()
                                    if (!error && data) {
                                      setNodes((prev) => [...prev, data as FlowNode])
                                    }
                                    setShowAddNodeDialog(false)
                                    setIsAddingNode(false)
                                    return
                                  }
                                  // Para restart e outros, abre modal de configuracao
                                  setSelectedTemplate(tpl)
                                  setNodeConfigValues({})
                                  resetMessageConfig()
                                }}
                              >
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${group.bgColor} border ${group.borderAccent}`}>
                                  <SubIcon className={`h-5 w-5 ${group.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground">{tpl.label}</p>
                                  <p className="text-xs text-muted-foreground/50 mt-0.5 leading-snug">{tpl.description}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors shrink-0" />
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-5 px-6 py-5 overflow-y-auto min-h-0">
              <div className="flex items-center gap-4">
                {(() => {
                  const group = actionGroups.find((g) => g.types.includes(selectedTemplate.type))
                  const SubIcon = selectedTemplate.subVariant ? (subVariantIcons[selectedTemplate.subVariant] || nodeIcons[selectedTemplate.type]) : nodeIcons[selectedTemplate.type]
                  return (
                    <>
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${group?.bgColor || "bg-secondary/50"} border ${group?.borderAccent || "border-border/40"}`}>
                        <SubIcon className={`h-5 w-5 ${group?.iconColor || nodeIconColors[selectedTemplate.type]}`} />
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground">{selectedTemplate.label}</p>
                        <p className="text-sm text-muted-foreground/50">{selectedTemplate.description}</p>
                      </div>
                    </>
                  )
                })()}
              </div>

              {selectedTemplate.type === "message" ? (
                <MessageConfigForm
                  msgText={msgText}
                  setMsgText={setMsgText}
                  msgMediaType={msgMediaType}
                  setMsgMediaType={setMsgMediaType}
                  msgMediaUrl={msgMediaUrl}
                  setMsgMediaUrl={setMsgMediaUrl}
                  msgHasButtons={msgHasButtons}
                  setMsgHasButtons={setMsgHasButtons}
                  msgButtons={msgButtons}
                  addMsgButton={addMsgButton}
                  updateMsgButton={updateMsgButton}
                  removeMsgButton={removeMsgButton}
                />
              ) : selectedTemplate.type === "action" && selectedTemplate.subVariant === "goto_flow" ? (
                <div className="flex flex-col gap-3">
                  <Label className="text-foreground text-sm font-semibold">Selecione o fluxo de destino</Label>
                  <p className="text-sm text-muted-foreground -mt-1">
                    O usuario sera redirecionado para este fluxo ao chegar nesta etapa.
                  </p>
                  {flows.filter((f) => f.id !== activeFlow?.id).length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-6">
                      <Workflow className="h-6 w-6 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground text-center">
                        Nenhum outro fluxo disponivel. Crie fluxos secundarios primeiro.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
                      {flows.filter((f) => f.id !== activeFlow?.id).map((f) => {
                        const fCat = getCategoryConfig(f.category)
                        const FCatIcon = fCat.icon
                        const isSelected = nodeConfigValues.target_flow_id === f.id
                        return (
                          <button
                            key={f.id}
                            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                              isSelected
                                ? `${fCat.color} ring-1 ring-accent`
                                : "border-border bg-secondary/30 hover:bg-secondary/60"
                            }`}
                            onClick={() => setNodeConfigValues((prev) => ({ ...prev, target_flow_id: f.id, target_flow_name: f.name }))}
                          >
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg border shrink-0 ${fCat.color}`}>
                              <FCatIcon className={`h-4 w-4 ${fCat.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                              <p className="text-[11px] text-muted-foreground">{fCat.label}{f.is_primary ? " — Principal" : ""}</p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : selectedTemplate.type === "delay" ? (
                <div className="flex flex-col gap-3">
                  <Label className="text-foreground text-sm font-semibold">Tempo em segundos</Label>
                  <p className="text-sm text-muted-foreground -mt-1">
                    Defina quanto tempo o fluxo deve aguardar antes de continuar.
                  </p>
                  <Input
                    type="number"
                    value={nodeConfigValues.seconds || ""}
                    onChange={(e) =>
                      setNodeConfigValues((prev) => ({ ...prev, seconds: e.target.value }))
                    }
                    placeholder="300"
                    className="bg-secondary border-border rounded-xl text-foreground h-11 text-sm"
                  />
                  {nodeConfigValues.seconds && parseInt(nodeConfigValues.seconds) > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const s = parseInt(nodeConfigValues.seconds)
                        if (s >= 3600) return `= ${Math.floor(s / 3600)} hora${Math.floor(s / 3600) > 1 ? "s" : ""} e ${Math.floor((s % 3600) / 60)} min`
                        if (s >= 60) return `= ${Math.floor(s / 60)} minuto${Math.floor(s / 60) > 1 ? "s" : ""}`
                        return `= ${s} segundo${s > 1 ? "s" : ""}`
                      })()}
                    </p>
                  )}
                </div>
              ) : selectedTemplate.type === "condition" ? (
                <div className="flex flex-col gap-4">
                      {/* 1. Mensagem/Pergunta */}
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Mensagem / Pergunta</Label>
                        <Textarea
                          value={nodeConfigValues.condition_message || ""}
                          onChange={(e) =>
                            setNodeConfigValues((prev) => ({ ...prev, condition_message: e.target.value }))
                          }
                          placeholder="Ex: Voce gostaria de continuar?"
                          className="bg-secondary/50 border-border/60 rounded-xl text-foreground min-h-[70px] text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                        />
                      </div>

                      {/* 2. Botoes - simples: texto + sub-fluxo */}
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Botoes (ate 3)</Label>
                        <div className="flex flex-col gap-2">
                          {(() => {
                            const branchesRaw = nodeConfigValues.condition_branches
                            let branches: { label: string; target_flow_id: string }[] = []
                            try { branches = branchesRaw ? JSON.parse(branchesRaw) : [] } catch { branches = [] }
                            if (branches.length === 0) {
                              branches = [{ label: "", target_flow_id: "" }]
                              setTimeout(() => {
                                setNodeConfigValues((prev) => ({ ...prev, condition_branches: JSON.stringify(branches) }))
                              }, 0)
                            }

                            const updateBranch = (idx: number, field: string, value: string) => {
                              const updated = [...branches]
                              ;(updated[idx] as Record<string, unknown>)[field] = value
                              setNodeConfigValues((prev) => ({ ...prev, condition_branches: JSON.stringify(updated) }))
                            }
                            const removeBranch = (idx: number) => {
                              const updated = branches.filter((_, i) => i !== idx)
                              setNodeConfigValues((prev) => ({ ...prev, condition_branches: JSON.stringify(updated) }))
                            }
                            const addBranch = () => {
                              if (branches.length >= 3) return
                              const updated = [...branches, { label: "", target_flow_id: "" }]
                              setNodeConfigValues((prev) => ({ ...prev, condition_branches: JSON.stringify(updated) }))
                            }

                            const colors = [
                              { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
                              { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", dot: "bg-rose-400" },
                              { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400" },
                            ]

                            // Fluxos disponiveis (exceto o atual)
                            const availableFlows = flows.filter((f) => f.id !== activeFlow?.id)

                            return (
                              <>
                                {branches.map((branch, idx) => {
                                  const color = colors[idx % colors.length]
                                  return (
                                    <div key={idx} className={`flex flex-col gap-3 rounded-xl border ${color.border} ${color.bg} p-3`}>
                                      {/* Texto do botao */}
                                      <div className="flex items-center gap-2">
                                        <div className={`h-2.5 w-2.5 rounded-full ${color.dot} shrink-0`} />
                                        <Input
                                          value={branch.label}
                                          onChange={(e) => updateBranch(idx, "label", e.target.value)}
                                          placeholder={`Texto do botao ${idx + 1}`}
                                          className="bg-transparent border-0 p-0 h-auto text-sm font-medium text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                                        />
                                        {branches.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => removeBranch(idx)}
                                            className="text-muted-foreground/50 hover:text-destructive transition-colors"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        )}
                                      </div>

                                      {/* Sub-fluxo (select dos fluxos ja criados) */}
                                      <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wide">Sub-fluxo</span>
                                        <Select
                                          value={branch.target_flow_id || ""}
                                          onValueChange={(val) => updateBranch(idx, "target_flow_id", val)}
                                        >
                                          <SelectTrigger className="bg-background/50 border-border/40 rounded-lg h-9 text-sm">
                                            <SelectValue placeholder="Selecione um fluxo..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableFlows.length === 0 ? (
                                              <div className="px-3 py-2 text-xs text-muted-foreground">
                                                Nenhum outro fluxo disponivel
                                              </div>
                                            ) : (
                                              availableFlows.map((f) => {
                                                const catCfg = getCategoryConfig(f.category)
                                                return (
                                                  <SelectItem key={f.id} value={f.id}>
                                                    <div className="flex items-center gap-2">
                                                      <catCfg.icon className={`h-3 w-3 ${catCfg.iconColor}`} />
                                                      <span>{f.name}</span>
                                                    </div>
                                                  </SelectItem>
                                                )
                                              })
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  )
                                })}

                                {branches.length < 3 && (
                                  <button
                                    type="button"
                                    onClick={addBranch}
                                    className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-dashed border-border/50 text-muted-foreground text-xs py-2.5 hover:bg-secondary/30 transition-colors"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Adicionar botao
                                  </button>
                                )}

                                <p className="text-[10px] text-muted-foreground/60">
                                  Maximo de 3 botoes por condicao
                                </p>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                </div>
              ) : selectedTemplate.type === "action" ? (
                <div className="flex flex-col gap-3">
                  <Label className="text-foreground text-sm font-semibold">
                    {selectedTemplate.subVariant === "add_group" ? "Link do grupo" : "Valor"}
                  </Label>
                  <p className="text-sm text-muted-foreground -mt-1">
              {selectedTemplate.subVariant === "add_group"
                          ? "Envie o usuario para um grupo ou canal do Telegram."
                          : "Configure a acao automatica."}
                  </p>
                  <Input
                    type="text"
                    value={nodeConfigValues.action_name || ""}
                    onChange={(e) =>
                      setNodeConfigValues((prev) => ({ ...prev, action_name: e.target.value }))
                    }
                    placeholder={
                      selectedTemplate.subVariant === "add_group" ? "https://t.me/meugrupo" : "Valor"
                    }
                    className="bg-secondary border-border rounded-xl text-foreground h-11 text-sm"
                  />
                </div>
              ) : selectedTemplate.type === "payment" ? (
                <div className="flex flex-col gap-4">
                      {/* Selecionar plano do bot */}
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Plano do bot</Label>
                        {botPlans.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            {botPlans.map((plan) => {
                              const isSelected = nodeConfigValues.plan_id === plan.id
                              return (
                                <button
                                  key={plan.id}
                                  type="button"
                                  onClick={() =>
                                    setNodeConfigValues((prev) => ({
                                      ...prev,
                                      plan_id: plan.id,
                                      description: plan.name,
                                      amount: plan.price.toFixed(2).replace(".", ","),
                                    }))
                                  }
                                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                                    isSelected
                                      ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                                      : "border-border/50 bg-secondary/20 hover:border-border hover:bg-secondary/40"
                                  }`}
                                >
                                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                                    isSelected ? "bg-primary/15" : "bg-green-500/10"
                                  }`}>
                                    <CreditCard className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-green-400"}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-sm font-medium block truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                                      {plan.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {plan.duration_days} dias{plan.description ? ` - ${plan.description}` : ""}
                                    </span>
                                  </div>
                                  <span className={`text-sm font-semibold shrink-0 ${isSelected ? "text-primary" : "text-green-400"}`}>
                                    R$ {plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/50 px-4 py-5">
                            <CreditCard className="h-5 w-5 text-muted-foreground/40" />
                            <p className="text-xs text-muted-foreground text-center">
                              Nenhum plano configurado no bot. Adicione planos na aba de Bots.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Valores editaveis (pre-preenchidos pelo plano) */}
                      {nodeConfigValues.plan_id && (
                        <div className="flex flex-col gap-2">
                          <Label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Personalizar</Label>
                          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/20 px-3.5 py-2.5">
                            <div className="flex-1 min-w-0">
                              <Input
                                type="text"
                                value={nodeConfigValues.description || ""}
                                onChange={(e) =>
                                  setNodeConfigValues((prev) => ({ ...prev, description: e.target.value }))
                                }
                                placeholder="Nome do produto"
                                className="bg-transparent border-0 p-0 h-auto text-sm font-medium text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-xs text-muted-foreground">R$</span>
                              <Input
                                type="text"
                                value={nodeConfigValues.amount || ""}
                                onChange={(e) =>
                                  setNodeConfigValues((prev) => ({ ...prev, amount: e.target.value }))
                                }
                                placeholder="0,00"
                                className="bg-transparent border-0 p-0 h-auto w-[70px] text-sm font-semibold text-foreground text-right focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Texto do botao */}
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Texto do botao</Label>
                        <Input
                          type="text"
                          value={nodeConfigValues.button_text || ""}
                          onChange={(e) =>
                            setNodeConfigValues((prev) => ({ ...prev, button_text: e.target.value }))
                          }
                          placeholder="Pagar agora"
                          className="bg-secondary/50 border-border/60 rounded-xl text-foreground h-9 text-sm"
                        />
                      </div>

                      {/* Switches compactos para upsell/downsell/order bump */}
                      <div className="flex flex-col gap-0 rounded-xl border border-border/60 overflow-hidden">
                        {/* Order Bump */}
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between px-3.5 py-2.5 bg-secondary/20">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                                <Plus className="h-3.5 w-3.5 text-amber-400" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-foreground">Order Bump</span>
                                <p className="text-[10px] text-muted-foreground/70 leading-tight">Oferta adicional no checkout</p>
                              </div>
                            </div>
                            <Switch
                              checked={nodeConfigValues.has_order_bump === "true"}
                              onCheckedChange={(checked) =>
                                setNodeConfigValues((prev) => ({ ...prev, has_order_bump: checked ? "true" : "false" }))
                              }
                            />
                          </div>
                          {nodeConfigValues.has_order_bump === "true" && (
                            <div className="flex flex-col gap-2 px-3.5 pb-3 pt-1">
                              <Input
                                type="text"
                                value={nodeConfigValues.order_bump_desc || ""}
                                onChange={(e) =>
                                  setNodeConfigValues((prev) => ({ ...prev, order_bump_desc: e.target.value }))
                                }
                                placeholder="Nome do produto extra"
                                className="bg-secondary/50 border-border/50 rounded-lg text-xs h-8"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">R$</span>
                                <Input
                                  type="text"
                                  value={nodeConfigValues.order_bump_amount || ""}
                                  onChange={(e) =>
                                    setNodeConfigValues((prev) => ({ ...prev, order_bump_amount: e.target.value }))
                                  }
                                  placeholder="0,00"
                                  className="bg-secondary/50 border-border/50 rounded-lg text-xs h-8 w-[90px]"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="h-px bg-border/40" />

                        {/* Upsell */}
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between px-3.5 py-2.5 bg-secondary/20">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                                <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-foreground">Upsell</span>
                                <p className="text-[10px] text-muted-foreground/70 leading-tight">Oferta de upgrade apos pagamento</p>
                              </div>
                            </div>
                            <Switch
                              checked={nodeConfigValues.has_upsell === "true"}
                              onCheckedChange={(checked) =>
                                setNodeConfigValues((prev) => ({ ...prev, has_upsell: checked ? "true" : "false" }))
                              }
                            />
                          </div>
                          {nodeConfigValues.has_upsell === "true" && (
                            <div className="flex flex-col gap-2 px-3.5 pb-3 pt-1">
                              <Input
                                type="text"
                                value={nodeConfigValues.upsell_desc || ""}
                                onChange={(e) =>
                                  setNodeConfigValues((prev) => ({ ...prev, upsell_desc: e.target.value }))
                                }
                                placeholder="Nome do upsell"
                                className="bg-secondary/50 border-border/50 rounded-lg text-xs h-8"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">R$</span>
                                <Input
                                  type="text"
                                  value={nodeConfigValues.upsell_amount || ""}
                                  onChange={(e) =>
                                    setNodeConfigValues((prev) => ({ ...prev, upsell_amount: e.target.value }))
                                  }
                                  placeholder="0,00"
                                  className="bg-secondary/50 border-border/50 rounded-lg text-xs h-8 w-[90px]"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="h-px bg-border/40" />

                        {/* Downsell */}
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between px-3.5 py-2.5 bg-secondary/20">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10">
                                <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-foreground">Downsell</span>
                                <p className="text-[10px] text-muted-foreground/70 leading-tight">Oferta menor se recusar upsell</p>
                              </div>
                            </div>
                            <Switch
                              checked={nodeConfigValues.has_downsell === "true"}
                              onCheckedChange={(checked) =>
                                setNodeConfigValues((prev) => ({ ...prev, has_downsell: checked ? "true" : "false" }))
                              }
                            />
                          </div>
                          {nodeConfigValues.has_downsell === "true" && (
                            <div className="flex flex-col gap-2 px-3.5 pb-3 pt-1">
                              <Input
                                type="text"
                                value={nodeConfigValues.downsell_desc || ""}
                                onChange={(e) =>
                                  setNodeConfigValues((prev) => ({ ...prev, downsell_desc: e.target.value }))
                                }
                                placeholder="Nome do downsell"
                                className="bg-secondary/50 border-border/50 rounded-lg text-xs h-8"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">R$</span>
                                <Input
                                  type="text"
                                  value={nodeConfigValues.downsell_amount || ""}
                                  onChange={(e) =>
                                    setNodeConfigValues((prev) => ({ ...prev, downsell_amount: e.target.value }))
                                  }
                                  placeholder="0,00"
                                  className="bg-secondary/50 border-border/50 rounded-lg text-xs h-8 w-[90px]"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                </div>
              ) : selectedTemplate.configFields.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/40">
                    <CheckCircle2 className="h-6 w-6 text-success/60" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Este bloco nao precisa de configuracao.
                  </p>
                </div>
              ) : (
                selectedTemplate.configFields.map((field) => (
                  <div key={field.key} className="flex flex-col gap-2.5">
                    <Label className="text-foreground text-sm font-semibold">{field.label}</Label>
                    {field.inputType === "textarea" ? (
                      <Textarea
                        value={nodeConfigValues[field.key] || ""}
                        onChange={(e) =>
                          setNodeConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className="bg-secondary border-border rounded-xl text-foreground min-h-[100px] text-sm"
                      />
                    ) : (
                      <Input
                        type={field.inputType}
                        value={nodeConfigValues[field.key] || ""}
                        onChange={(e) =>
                          setNodeConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className="bg-secondary border-border rounded-xl text-foreground h-11 text-sm"
                      />
                    )}
                  </div>
                ))
              )}

              <div className="h-px bg-border/40 mt-2" />
              <div className="flex justify-between gap-3 pt-4">
                <Button
                  variant="ghost"
                  className="rounded-xl text-sm text-muted-foreground h-10 px-4"
                  onClick={() => {
                    setSelectedTemplate(null)
                    resetMessageConfig()
                  }}
                >
                  <ChevronRight className="h-4 w-4 mr-1.5 rotate-180" />
                  Voltar
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl text-sm h-10 px-6 font-semibold"
                  disabled={isAddingNode ||
                    (selectedTemplate.type === "message" && !msgText.trim()) ||
                    (selectedTemplate.subVariant === "goto_flow" && !nodeConfigValues.target_flow_id) ||
                    (selectedTemplate.type === "delay" && (!nodeConfigValues.seconds || parseInt(nodeConfigValues.seconds) <= 0)) ||
                    (selectedTemplate.type === "condition" && !nodeConfigValues.condition_message?.trim()) ||
                    (selectedTemplate.type === "action" && selectedTemplate.subVariant === "add_group" && !nodeConfigValues.action_name?.trim()) ||
                    (selectedTemplate.type === "payment" && selectedTemplate.subVariant === "charge" && !nodeConfigValues.amount?.trim())
                  }
                  onClick={handleAddNode}
                >
                  {isAddingNode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Adicionar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---- Edit Node Dialog ---- */}
      <Dialog open={showEditNodeDialog} onOpenChange={setShowEditNodeDialog}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <DialogHeader>
              <DialogTitle className="text-foreground text-sm font-semibold">Editar etapa</DialogTitle>
            </DialogHeader>
            {editingNode && (
              <p className="text-[11px] text-muted-foreground/50 mt-1">{editingNode.label}</p>
            )}
          </div>
          <div className="h-px bg-border/40 mx-5" />
          {editingNode && (
            <div className="flex flex-col gap-4 px-5 py-4 overflow-y-auto min-h-0">
              {editingNode.type === "message" ? (
                <MessageConfigForm
                  msgText={msgText}
                  setMsgText={setMsgText}
                  msgMediaType={msgMediaType}
                  setMsgMediaType={setMsgMediaType}
                  msgMediaUrl={msgMediaUrl}
                  setMsgMediaUrl={setMsgMediaUrl}
                  msgHasButtons={msgHasButtons}
                  setMsgHasButtons={setMsgHasButtons}
                  msgButtons={msgButtons}
                  addMsgButton={addMsgButton}
                  updateMsgButton={updateMsgButton}
                  removeMsgButton={removeMsgButton}
                />
              ) : editingNode.type === "action" && editingNode.config?.subVariant === "goto_flow" ? (
                <div className="flex flex-col gap-3">
                  <Label className="text-foreground">Selecione o fluxo de destino</Label>
                  {flows.filter((f) => f.id !== activeFlow?.id).length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-6">
                      <Workflow className="h-6 w-6 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground text-center">
                        Nenhum outro fluxo disponivel.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
                      {flows.filter((f) => f.id !== activeFlow?.id).map((f) => {
                        const fCat = getCategoryConfig(f.category)
                        const FCatIcon = fCat.icon
                        const isSelected = editNodeConfig.target_flow_id === f.id
                        return (
                          <button
                            key={f.id}
                            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                              isSelected
                                ? `${fCat.color} ring-1 ring-accent`
                                : "border-border bg-secondary/30 hover:bg-secondary/60"
                            }`}
                            onClick={() => {
                              setEditNodeConfig((prev) => ({ ...prev, target_flow_id: f.id, target_flow_name: f.name }))
                              setEditNodeLabel(`Ir para: ${f.name}`)
                            }}
                          >
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg border shrink-0 ${fCat.color}`}>
                              <FCatIcon className={`h-4 w-4 ${fCat.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                              <p className="text-[11px] text-muted-foreground">{fCat.label}{f.is_primary ? " — Principal" : ""}</p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : editingNode.type === "delay" ? (
                <div className="flex flex-col gap-3">
                  <Label className="text-foreground">Tempo em segundos</Label>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Defina quanto tempo o fluxo deve aguardar antes de continuar.
                  </p>
                  <Input
                    type="number"
                    value={editNodeConfig.seconds || ""}
                    onChange={(e) =>
                      setEditNodeConfig((prev) => ({ ...prev, seconds: e.target.value }))
                    }
                    placeholder="300"
                    className="bg-secondary border-border rounded-xl text-foreground"
                  />
                  {editNodeConfig.seconds && parseInt(editNodeConfig.seconds) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        const s = parseInt(editNodeConfig.seconds)
                        if (s >= 3600) return `= ${Math.floor(s / 3600)} hora${Math.floor(s / 3600) > 1 ? "s" : ""} e ${Math.floor((s % 3600) / 60)} min`
                        if (s >= 60) return `= ${Math.floor(s / 60)} minuto${Math.floor(s / 60) > 1 ? "s" : ""}`
                        return `= ${s} segundo${s > 1 ? "s" : ""}`
                      })()}
                    </p>
                  )}
                </div>
              ) : editingNode.type === "condition" ? (
                <div className="flex flex-col gap-4">
                      {/* 1. Mensagem */}
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Mensagem / Pergunta</Label>
                        <Textarea
                          value={editNodeConfig.condition_message || ""}
                          onChange={(e) =>
                            setEditNodeConfig((prev) => ({ ...prev, condition_message: e.target.value }))
                          }
                          placeholder="Ex: Voce gostaria de continuar?"
                          className="bg-secondary/50 border-border/60 rounded-xl text-foreground min-h-[70px] text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                        />
                      </div>

                      {/* 2. Botoes - simples: texto + sub-fluxo */}
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Botoes (ate 3)</Label>
                        <div className="flex flex-col gap-2">
                          {(() => {
                            const branchesRaw = editNodeConfig.condition_branches
                            let branches: { label: string; target_flow_id: string }[] = []
                            try { branches = branchesRaw ? JSON.parse(branchesRaw) : [] } catch { branches = [] }
                            if (branches.length === 0) {
                              branches = [{ label: "", target_flow_id: "" }]
                              setTimeout(() => {
                                setEditNodeConfig((prev) => ({ ...prev, condition_branches: JSON.stringify(branches) }))
                              }, 0)
                            }

                            const updateBranch = (idx: number, field: string, value: string) => {
                              const updated = [...branches]
                              ;(updated[idx] as Record<string, unknown>)[field] = value
                              setEditNodeConfig((prev) => ({ ...prev, condition_branches: JSON.stringify(updated) }))
                            }
                            const removeBranch = (idx: number) => {
                              const updated = branches.filter((_, i) => i !== idx)
                              setEditNodeConfig((prev) => ({ ...prev, condition_branches: JSON.stringify(updated) }))
                            }
                            const addBranch = () => {
                              if (branches.length >= 3) return
                              const updated = [...branches, { label: "", target_flow_id: "" }]
                              setEditNodeConfig((prev) => ({ ...prev, condition_branches: JSON.stringify(updated) }))
                            }

                            const colors = [
                              { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
                              { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", dot: "bg-rose-400" },
                              { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400" },
                            ]

                            // Fluxos disponiveis (exceto o atual)
                            const availableFlows = flows.filter((f) => f.id !== activeFlow?.id)

                            return (
                              <>
                                {branches.map((branch, idx) => {
                                  const color = colors[idx % colors.length]
                                  return (
                                    <div key={idx} className={`flex flex-col gap-3 rounded-xl border ${color.border} ${color.bg} p-3`}>
                                      {/* Texto do botao */}
                                      <div className="flex items-center gap-2">
                                        <div className={`h-2.5 w-2.5 rounded-full ${color.dot} shrink-0`} />
                                        <Input
                                          value={branch.label}
                                          onChange={(e) => updateBranch(idx, "label", e.target.value)}
                                          placeholder={`Texto do botao ${idx + 1}`}
                                          className="bg-transparent border-0 p-0 h-auto text-sm font-medium text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                                        />
                                        {branches.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => removeBranch(idx)}
                                            className="text-muted-foreground/50 hover:text-destructive transition-colors"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        )}
                                      </div>

                                      {/* Sub-fluxo (select dos fluxos ja criados) */}
                                      <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wide">Sub-fluxo</span>
                                        <Select
                                          value={branch.target_flow_id || ""}
                                          onValueChange={(val) => updateBranch(idx, "target_flow_id", val)}
                                        >
                                          <SelectTrigger className="bg-background/50 border-border/40 rounded-lg h-9 text-sm">
                                            <SelectValue placeholder="Selecione um fluxo..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableFlows.length === 0 ? (
                                              <div className="px-3 py-2 text-xs text-muted-foreground">
                                                Nenhum outro fluxo disponivel
                                              </div>
                                            ) : (
                                              availableFlows.map((f) => {
                                                const catCfg = getCategoryConfig(f.category)
                                                return (
                                                  <SelectItem key={f.id} value={f.id}>
                                                    <div className="flex items-center gap-2">
                                                      <catCfg.icon className={`h-3 w-3 ${catCfg.iconColor}`} />
                                                      <span>{f.name}</span>
                                                    </div>
                                                  </SelectItem>
                                                )
                                              })
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  )
                                })}

                                {branches.length < 3 && (
                                  <button
                                    type="button"
                                    onClick={addBranch}
                                    className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-dashed border-border/50 text-muted-foreground text-xs py-2.5 hover:bg-secondary/30 transition-colors"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Adicionar botao
                                  </button>
                                )}

                                <p className="text-[10px] text-muted-foreground/60">
                                  Maximo de 3 botoes por condicao
                                </p>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                </div>
              ) : editingNode.type === "payment" ? (
                <div className="flex flex-col gap-4">
                      {/* Selecionar plano do bot */}
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Plano do bot</Label>
                        {botPlans.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            {botPlans.map((plan) => {
                              const isSelected = editNodeConfig.plan_id === plan.id
                              return (
                                <button
                                  key={plan.id}
                                  type="button"
                                  onClick={() =>
                                    setEditNodeConfig((prev) => ({
                                      ...prev,
                                      plan_id: plan.id,
                                      description: plan.name,
                                      amount: plan.price.toFixed(2).replace(".", ","),
                                    }))
                                  }
                                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                                    isSelected
                                      ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                                      : "border-border/50 bg-secondary/20 hover:border-border hover:bg-secondary/40"
                                  }`}
                                >
                                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                                    isSelected ? "bg-primary/15" : "bg-green-500/10"
                                  }`}>
                                    <CreditCard className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-green-400"}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-sm font-medium block truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                                      {plan.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {plan.duration_days} dias{plan.description ? ` - ${plan.description}` : ""}
                                    </span>
                                  </div>
                                  <span className={`text-sm font-semibold shrink-0 ${isSelected ? "text-primary" : "text-green-400"}`}>
                                    R$ {plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/50 px-4 py-5">
                            <CreditCard className="h-5 w-5 text-muted-foreground/40" />
                            <p className="text-xs text-muted-foreground text-center">
                              Nenhum plano configurado no bot. Adicione planos na aba de Bots.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Valores editaveis */}
                      {(editNodeConfig.plan_id || editNodeConfig.description) && (
                        <div className="flex flex-col gap-2">
                          <Label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Personalizar</Label>
                          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/20 px-3.5 py-2.5">
                            <div className="flex-1 min-w-0">
                              <Input
                                type="text"
                                value={editNodeConfig.description || ""}
                                onChange={(e) =>
                                  setEditNodeConfig((prev) => ({ ...prev, description: e.target.value }))
                                }
                                placeholder="Nome do produto"
                                className="bg-transparent border-0 p-0 h-auto text-sm font-medium text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-xs text-muted-foreground">R$</span>
                              <Input
                                type="text"
                                value={editNodeConfig.amount || ""}
                                onChange={(e) =>
                                  setEditNodeConfig((prev) => ({ ...prev, amount: e.target.value }))
                                }
                                placeholder="0,00"
                                className="bg-transparent border-0 p-0 h-auto w-[70px] text-sm font-semibold text-foreground text-right focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Texto do botao */}
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Texto do botao</Label>
                        <Input
                          type="text"
                          value={editNodeConfig.button_text || ""}
                          onChange={(e) =>
                            setEditNodeConfig((prev) => ({ ...prev, button_text: e.target.value }))
                          }
                          placeholder="Pagar agora"
                          className="bg-secondary/50 border-border/60 rounded-xl text-foreground h-9 text-sm"
                        />
                      </div>

                      {/* Switches */}
                      <div className="flex flex-col gap-0 rounded-xl border border-border/60 overflow-hidden">
                        {/* Order Bump */}
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between px-3.5 py-2.5 bg-secondary/20">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                                <Plus className="h-3.5 w-3.5 text-amber-400" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-foreground">Order Bump</span>
                                <p className="text-[10px] text-muted-foreground/70 leading-tight">Oferta adicional no checkout</p>
                              </div>
                            </div>
                            <Switch
                              checked={editNodeConfig.has_order_bump === "true"}
                              onCheckedChange={(checked) =>
                                setEditNodeConfig((prev) => ({ ...prev, has_order_bump: checked ? "true" : "false" }))
                              }
                            />
                          </div>
                          {editNodeConfig.has_order_bump === "true" && (
                            <div className="flex flex-col gap-2 px-3.5 pb-3 pt-1">
                              <Input
                                type="text"
                                value={editNodeConfig.order_bump_desc || ""}
                                onChange={(e) =>
                                  setEditNodeConfig((prev) => ({ ...prev, order_bump_desc: e.target.value }))
                                }
                                placeholder="Nome do produto extra"
                                className="bg-secondary/50 border-border/50 rounded-lg text-xs h-8"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">R$</span>
                                <Input
                                  type="text"
                                  value={editNodeConfig.order_bump_amount || ""}
                                  onChange={(e) =>
                                    setEditNodeConfig((prev) => ({ ...prev, order_bump_amount: e.target.value }))
                                  }
                                  placeholder="0,00"
                                  className="bg-secondary/50 border-border/50 rounded-lg text-xs h-8 w-[90px]"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="h-px bg-border/40" />

                        {/* Upsell */}
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between px-3.5 py-2.5 bg-secondary/20">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                                <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-foreground">Upsell</span>
                                <p className="text-[10px] text-muted-foreground/70 leading-tight">Oferta de upgrade apos pagamento</p>
                              </div>
                            </div>
                            <Switch
                              checked={editNodeConfig.has_upsell === "true"}
                              onCheckedChange={(checked) =>
                                setEditNodeConfig((prev) => ({ ...prev, has_upsell: checked ? "true" : "false" }))
                              }
                            />
                          </div>
                          {editNodeConfig.has_upsell === "true" && (
                            <div className="flex flex-col gap-2 px-3.5 pb-3 pt-1">
                              <Input
                                type="text"
                                value={editNodeConfig.upsell_desc || ""}
                                onChange={(e) =>
                                  setEditNodeConfig((prev) => ({ ...prev, upsell_desc: e.target.value }))
                                }
                                placeholder="Nome do upsell"
                                className="bg-secondary/50 border-border/50 rounded-lg text-xs h-8"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">R$</span>
                                <Input
                                  type="text"
                                  value={editNodeConfig.upsell_amount || ""}
                                  onChange={(e) =>
                                    setEditNodeConfig((prev) => ({ ...prev, upsell_amount: e.target.value }))
                                  }
                                  placeholder="0,00"
                                  className="bg-secondary/50 border-border/50 rounded-lg text-xs h-8 w-[90px]"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="h-px bg-border/40" />

                        {/* Downsell */}
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between px-3.5 py-2.5 bg-secondary/20">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10">
                                <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-foreground">Downsell</span>
                                <p className="text-[10px] text-muted-foreground/70 leading-tight">Oferta menor se recusar upsell</p>
                              </div>
                            </div>
                            <Switch
                              checked={editNodeConfig.has_downsell === "true"}
                              onCheckedChange={(checked) =>
                                setEditNodeConfig((prev) => ({ ...prev, has_downsell: checked ? "true" : "false" }))
                              }
                            />
                          </div>
                          {editNodeConfig.has_downsell === "true" && (
                            <div className="flex flex-col gap-2 px-3.5 pb-3 pt-1">
                              <Input
                                type="text"
                                value={editNodeConfig.downsell_desc || ""}
                                onChange={(e) =>
                                  setEditNodeConfig((prev) => ({ ...prev, downsell_desc: e.target.value }))
                                }
                                placeholder="Nome do downsell"
                                className="bg-secondary/50 border-border/50 rounded-lg text-xs h-8"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">R$</span>
                                <Input
                                  type="text"
                                  value={editNodeConfig.downsell_amount || ""}
                                  onChange={(e) =>
                                    setEditNodeConfig((prev) => ({ ...prev, downsell_amount: e.target.value }))
                                  }
                                  placeholder="0,00"
                                  className="bg-secondary/50 border-border/50 rounded-lg text-xs h-8 w-[90px]"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                </div>
              ) : editingNode.type === "action" ? (
                <div className="flex flex-col gap-3">
                  <Label className="text-foreground">
                    {(editingNode.config?.subVariant as string) === "add_group" ? "Link do grupo" : "Valor"}
                  </Label>
                  <Input
                    type="text"
                    value={editNodeConfig.action_name || ""}
                    onChange={(e) =>
                      setEditNodeConfig((prev) => ({ ...prev, action_name: e.target.value }))
                    }
                    placeholder={
                      (editingNode.config?.subVariant as string) === "add_group" ? "https://t.me/grupo" : "Valor"
                    }
                    className="bg-secondary border-border rounded-xl text-foreground"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Label</Label>
                  <Input
                    value={editNodeLabel}
                    onChange={(e) => setEditNodeLabel(e.target.value)}
                    className="bg-secondary border-border rounded-xl text-foreground"
                  />
                </div>
              )}

              <div className="h-px bg-border/40" />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-xs text-muted-foreground"
                  onClick={() => {
                    resetMessageConfig()
                    setShowEditNodeDialog(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg text-xs"
                  disabled={isSavingNode || (
                    editingNode.type === "message" ? !msgText.trim() :
                    editingNode.type === "delay" ? !editNodeConfig.seconds || parseInt(editNodeConfig.seconds) <= 0 :
                    editingNode.type === "condition" ? !editNodeConfig.condition_message?.trim() :
                    editingNode.type === "action" && (editingNode.config?.subVariant === "restart" || editingNode.config?.subVariant === "end") ? false :
                    editingNode.type === "action" && editingNode.config?.subVariant === "goto_flow" ? !editNodeConfig.target_flow_id :
                    editingNode.type === "action" && editingNode.config?.subVariant === "add_group" ? !editNodeConfig.action_name?.trim() :
                    editingNode.type === "payment" && (editingNode.config?.subVariant as string) === "charge" ? !editNodeConfig.amount?.trim() :
                    false
                  )}
                  onClick={handleSaveNode}
                >
                  {isSavingNode && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---- Delete Node Dialog ---- */}
      <Dialog open={showDeleteNodeDialog} onOpenChange={setShowDeleteNodeDialog}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm font-semibold">Apagar etapa</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Apagar <span className="font-medium text-foreground">{deletingNode?.label}</span>? Essa acao nao pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg text-xs text-muted-foreground"
              onClick={() => setShowDeleteNodeDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-lg text-xs"
              disabled={isDeletingNode}
              onClick={handleDeleteNode}
            >
              {isDeletingNode && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              Apagar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---- Delete Flow Dialog ---- */}
      <Dialog open={showDeleteFlowDialog} onOpenChange={setShowDeleteFlowDialog}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm font-semibold">Apagar fluxo</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Apagar <span className="font-medium text-foreground">{activeFlow?.name}</span> e todas as suas etapas? Essa acao nao pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg text-xs text-muted-foreground"
              onClick={() => setShowDeleteFlowDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-lg text-xs"
              disabled={isDeletingFlow}
              onClick={handleDeleteFlow}
            >
              {isDeletingFlow && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              Apagar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ---- Message Config Form ----

function MessageConfigForm({
  msgText,
  setMsgText,
  msgMediaType,
  setMsgMediaType,
  msgMediaUrl,
  setMsgMediaUrl,
  msgHasButtons,
  setMsgHasButtons,
  msgButtons,
  addMsgButton,
  updateMsgButton,
  removeMsgButton,
}: {
  msgText: string
  setMsgText: (v: string) => void
  msgMediaType: "photo" | "video" | "none"
  setMsgMediaType: (v: "photo" | "video" | "none") => void
  msgMediaUrl: string
  setMsgMediaUrl: (v: string) => void
  msgHasButtons: boolean
  setMsgHasButtons: (v: boolean) => void
  msgButtons: InlineButton[]
  addMsgButton: () => void
  updateMsgButton: (index: number, field: "text" | "url", value: string) => void
  removeMsgButton: (index: number) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [fileName, setFileName] = useState("")

  async function handleFileUpload(file: File) {
    setUploading(true)
    setUploadError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mediaType", msgMediaType)

      const res = await fetch("/api/upload-media", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setUploadError(data.error || "Erro ao fazer upload")
        return
      }

      setMsgMediaUrl(data.url)
      setFileName(file.name)
    } catch {
      setUploadError("Erro de conexao ao fazer upload")
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const mediaEnabled = msgMediaType !== "none"

  return (
    <div className="flex flex-col gap-4">
      {/* Texto da mensagem */}
      <div className="flex flex-col gap-2">
        <Label className="text-foreground text-xs font-medium tracking-wide uppercase text-muted-foreground">Mensagem</Label>
        <Textarea
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          placeholder="Digite a mensagem que o bot vai enviar..."
          className="bg-secondary/50 border-border/60 rounded-xl text-foreground min-h-[90px] text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
        />
      </div>

      {/* Switches compactos */}
      <div className="flex flex-col gap-0 rounded-xl border border-border/60 overflow-hidden">
        {/* Switch Midia */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-secondary/20">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                <Image className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">Midia</span>
                <p className="text-[10px] text-muted-foreground/70 leading-tight">Anexar foto ou video</p>
              </div>
            </div>
            <Switch
              checked={mediaEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  setMsgMediaType("photo")
                } else {
                  setMsgMediaType("none")
                  setMsgMediaUrl("")
                  setFileName("")
                  setUploadError("")
                }
              }}
            />
          </div>

          {mediaEnabled && (
            <div className="flex flex-col gap-2.5 px-3.5 pb-3 pt-1">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setMsgMediaType("photo")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    msgMediaType === "photo"
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-secondary/50 text-muted-foreground border border-border/40 hover:bg-secondary"
                  }`}
                >
                  <Image className="h-3 w-3" /> Foto
                </button>
                <button
                  onClick={() => setMsgMediaType("video")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    msgMediaType === "video"
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-secondary/50 text-muted-foreground border border-border/40 hover:bg-secondary"
                  }`}
                >
                  <Video className="h-3 w-3" /> Video
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={msgMediaType === "photo" ? "image/jpeg,image/png,image/gif,image/webp" : "video/mp4,video/webm,video/quicktime"}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                  e.target.value = ""
                }}
              />

              {msgMediaUrl ? (
                <div className="flex flex-col gap-1.5">
                  {msgMediaType === "photo" ? (
                    <div className="relative rounded-lg overflow-hidden border border-border/50 bg-secondary/30">
                      <img src={msgMediaUrl} alt="Preview" className="w-full max-h-[120px] object-cover" />
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border border-border/50 bg-secondary/30">
                      <video src={msgMediaUrl} className="w-full max-h-[120px] object-cover" controls />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileCheck className="h-3 w-3 text-green-500 shrink-0" />
                      <span className="text-[11px] text-muted-foreground truncate">{fileName || "Arquivo enviado"}</span>
                    </div>
                    <button
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => {
                        setMsgMediaUrl("")
                        setFileName("")
                      }}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-5 cursor-pointer transition-all ${
                    uploading
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      <span className="text-xs text-muted-foreground">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground/60" />
                      <span className="text-xs text-muted-foreground text-center">
                        Clique ou arraste {msgMediaType === "photo" ? "uma foto" : "um video"}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">
                        {msgMediaType === "photo" ? "JPG, PNG, GIF, WEBP" : "MP4, WEBM, MOV"} - Max 50MB
                      </span>
                    </>
                  )}
                </div>
              )}

              {uploadError && (
                <p className="text-[11px] text-destructive">{uploadError}</p>
              )}
            </div>
          )}
        </div>

        {/* Divisor */}
        <div className="h-px bg-border/40" />

        {/* Switch Botoes */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-secondary/20">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10">
                <Link className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">Botoes</span>
                <p className="text-[10px] text-muted-foreground/70 leading-tight">Adicionar botoes com link</p>
              </div>
            </div>
            <Switch
              checked={msgHasButtons}
              onCheckedChange={(checked) => {
                setMsgHasButtons(checked)
                if (checked && msgButtons.length === 0) {
                  addMsgButton()
                }
              }}
            />
          </div>

          {msgHasButtons && (
            <div className="flex flex-col gap-2.5 px-3.5 pb-3 pt-1">
              {msgButtons.map((btn, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-border/40 bg-secondary/20 p-2.5">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Input
                      value={btn.text}
                      onChange={(e) => updateMsgButton(i, "text", e.target.value)}
                      placeholder="Titulo do botao"
                      className="bg-secondary/50 border-border/50 rounded-lg text-foreground text-xs h-8"
                    />
                    <Input
                      value={btn.url}
                      onChange={(e) => updateMsgButton(i, "url", e.target.value)}
                      placeholder="https://link-do-botao.com"
                      className="bg-secondary/50 border-border/50 rounded-lg text-foreground text-xs h-8"
                    />
                  </div>
                  <button
                    className="mt-1 text-muted-foreground/60 hover:text-destructive transition-colors"
                    onClick={() => removeMsgButton(i)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {msgButtons.length < 6 && (
                <button
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-dashed border-border/40 text-muted-foreground text-xs py-2 hover:bg-secondary/30 transition-colors"
                  onClick={addMsgButton}
                >
                  <Plus className="h-3 w-3" />
                  Adicionar botao
                </button>
              )}
              <p className="text-[10px] text-muted-foreground/60">
                Max. 6 botoes por mensagem
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
