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
  ArrowDown,
} from "lucide-react"
import NextImage from "next/image"
import { Switch } from "@/components/ui/switch"

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

type NodeType = "trigger" | "message" | "delay" | "condition" | "payment" | "action" | "redirect"

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
    description: "O primeiro contato do usuario com o bot. Configure a experiencia de boas-vindas e vincule fluxos secundarios.",
    fields: [
      { key: "welcome_message", label: "Mensagem de boas-vindas", type: "textarea", placeholder: "Ola! Bem-vindo ao nosso bot...", icon: MessageCircle, description: "Mensagem exibida ao iniciar" },
      { key: "auto_start", label: "Iniciar automaticamente", type: "toggle", icon: Zap, description: "Dispara ao primeiro contato" },
      { key: "collect_name", label: "Coletar nome do usuario", type: "toggle", icon: UserPlus, description: "Pedir nome antes de prosseguir" },
      { key: "collect_email", label: "Coletar e-mail", type: "toggle", icon: Mail, description: "Pedir e-mail antes de prosseguir" },
      { key: "main_menu_enabled", label: "Exibir menu principal", type: "toggle", icon: GitBranch, description: "Mostra opcoes apos boas-vindas" },
      { key: "fallback_message", label: "Mensagem de fallback", type: "textarea", placeholder: "Desculpe, nao entendi. Tente novamente.", icon: AlertCircle, description: "Quando o bot nao entende o usuario" },
      { key: "inactivity_timeout_min", label: "Timeout de inatividade (min)", type: "number", placeholder: "10", icon: Clock, description: "Minutos sem resposta para encerrar" },
      { key: "inactivity_message", label: "Mensagem de inatividade", type: "textarea", placeholder: "Parece que voce saiu. Se precisar, e so me chamar!", icon: Timer, description: "Enviada ao expirar o timeout" },
      { key: "show_typing", label: "Simular digitando", type: "toggle", icon: MessageCircle, description: "Exibir 'digitando...' antes das respostas" },
      { key: "typing_delay_sec", label: "Delay de digitacao (seg)", type: "number", placeholder: "2", icon: Clock, description: "Tempo do indicador de digitacao" },
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
    description: "Enviar mensagem simples de texto",
    configFields: [],
    subVariant: "text",
  },
  {
    type: "message",
    label: "Mensagem com Midia",
    description: "Enviar foto ou video com texto",
    configFields: [],
    subVariant: "media",
  },
  {
    type: "message",
    label: "Mensagem com Botoes",
    description: "Mensagem com botoes de link clicaveis",
    configFields: [],
    subVariant: "buttons",
  },
  {
    type: "delay",
    label: "Aguardar Tempo",
    description: "Esperar antes da proxima etapa",
    configFields: [
      { key: "seconds", label: "Tempo em segundos", placeholder: "300", inputType: "number" },
    ],
  },
  {
    type: "condition",
    label: "Condicao",
    description: "Seguir caminho diferente conforme regra",
    configFields: [
      { key: "condition", label: "Condicao", placeholder: "Ex: Usuario respondeu?", inputType: "text" },
    ],
  },
  {
    type: "condition",
    label: "Verificar Pagamento",
    description: "Checar se usuario ja pagou",
    configFields: [
      { key: "condition", label: "Condicao", placeholder: "Pagamento confirmado?", inputType: "text" },
    ],
    subVariant: "check_payment",
  },
  {
    type: "condition",
    label: "Verificar Tag",
    description: "Checar se usuario possui uma tag",
    configFields: [
      { key: "condition", label: "Tag", placeholder: "Ex: lead-quente", inputType: "text" },
    ],
    subVariant: "check_tag",
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
    type: "payment",
    label: "Aguardar Pagamento",
    description: "Pausar fluxo ate pagamento ser confirmado",
    configFields: [
      { key: "seconds", label: "Timeout (segundos)", placeholder: "1800", inputType: "number" },
    ],
    subVariant: "wait_payment",
  },
  {
    type: "action",
    label: "Adicionar Tag",
    description: "Marcar usuario com uma tag de segmentacao",
    configFields: [
      { key: "action_name", label: "Nome da tag", placeholder: "Ex: lead-quente", inputType: "text" },
    ],
    subVariant: "add_tag",
  },
  {
    type: "action",
    label: "Remover Tag",
    description: "Remover tag do usuario",
    configFields: [
      { key: "action_name", label: "Nome da tag", placeholder: "Ex: inativo", inputType: "text" },
    ],
    subVariant: "remove_tag",
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
    label: "Webhook Externo",
    description: "Executar acao em sistema externo",
    configFields: [
      { key: "action_name", label: "URL do webhook", placeholder: "https://api.exemplo.com/hook", inputType: "text" },
    ],
    subVariant: "webhook",
  },
  {
    type: "redirect",
    label: "Ir para Outro Fluxo",
    description: "Redirecionar para fluxo secundario",
    configFields: [
      { key: "target_flow_id", label: "Fluxo de destino", placeholder: "Selecione o fluxo...", inputType: "text" },
    ],
    subVariant: "goto_flow",
  },
  {
    type: "redirect",
    label: "Recomecar Fluxo",
    description: "Voltar ao inicio deste fluxo",
    configFields: [],
    subVariant: "restart",
  },
  {
    type: "redirect",
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
    description: "Mensagens, midias e botoes",
    icon: MessageSquare,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderAccent: "border-blue-500/30",
    types: ["message"],
    subVariants: ["text", "media", "buttons"],
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
    subVariants: undefined, // show all
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
    subVariants: ["charge", "wait_payment"],
  },
  {
    id: "navegacao",
    label: "Navegacao",
    description: "Redirecionar, recomecar ou encerrar",
    icon: ExternalLink,
    iconColor: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderAccent: "border-orange-500/30",
    types: ["redirect"],
    subVariants: ["goto_flow", "restart", "end"],
  },
  {
    id: "automacao",
    label: "Automacao",
    description: "Tags, grupos e webhooks",
    icon: Zap,
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderAccent: "border-cyan-500/30",
    types: ["action"],
    subVariants: ["add_tag", "remove_tag", "add_group", "webhook"],
  },
]

// SubVariant-specific icons for the dialog
const subVariantIcons: Record<string, React.ElementType> = {
  text: MessageSquare,
  media: Image,
  buttons: MousePointerClick,
  check_payment: CreditCard,
  check_tag: Hash,
  charge: CreditCard,
  wait_payment: Clock,
  add_tag: Tag,
  remove_tag: Unlink,
  add_group: UsersRound,
  webhook: Globe,
  goto_flow: ExternalLink,
  restart: RefreshCw,
  end: CircleStop,
}

// ---- Component ----

export default function FlowsPage() {
  const { selectedBot } = useBots()
  const { session } = useAuth()

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
      if (secs >= 60) {
        label = `Esperar ${Math.floor(secs / 60)} minuto${Math.floor(secs / 60) > 1 ? "s" : ""}`
      } else {
        label = `Esperar ${secs} segundo${secs > 1 ? "s" : ""}`
      }
    } else if (selectedTemplate.type === "condition" && nodeConfigValues.condition) {
      label = nodeConfigValues.condition
    } else if (selectedTemplate.type === "payment" && nodeConfigValues.description) {
      label = nodeConfigValues.description
    } else if (selectedTemplate.type === "action" && nodeConfigValues.action_name) {
      label = nodeConfigValues.action_name
    } else if (selectedTemplate.subVariant === "goto_flow" && nodeConfigValues.target_flow_name) {
      label = `Ir para: ${nodeConfigValues.target_flow_name}`
      config = {
        target_flow_id: nodeConfigValues.target_flow_id,
        target_flow_name: nodeConfigValues.target_flow_name,
        subVariant: "goto_flow",
      }
    } else if (selectedTemplate.subVariant === "restart") {
      label = "Recomecar Fluxo"
      config = { subVariant: "restart" }
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
      const validButtons = msgButtons.filter((b) => b.text.trim() && b.url.trim())
      finalConfig = {
        text: msgText,
        media_url: msgMediaType !== "none" ? msgMediaUrl : "",
        media_type: msgMediaType !== "none" ? msgMediaType : "",
        buttons: validButtons.length > 0 ? JSON.stringify(validButtons) : "",
      }
      finalLabel = msgText ? (msgText.length > 40 ? msgText.slice(0, 40) + "..." : msgText) : "Mensagem"
    } else if (editingNode.type === "redirect") {
      finalConfig = {
        target_flow_id: editNodeConfig.target_flow_id,
        target_flow_name: editNodeConfig.target_flow_name,
      }
      finalLabel = editNodeConfig.target_flow_name ? `Ir para: ${editNodeConfig.target_flow_name}` : "Redirecionar"
    }

    const { error } = await supabase
      .from("flow_nodes")
      .update({
        label: finalLabel,
        config: finalConfig,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingNode.id)

    if (error) {
      console.error("Error updating node:", error)
      setIsSavingNode(false)
      return
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Construa jornadas de conversao para o seu bot</p>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
              onClick={() => {
                setNewFlowCategory(flows.length === 0 ? "inicial" : "personalizado")
                setNewFlowMode(null)
                resetBasicFlow()
                setShowNewFlowDialog(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Fluxo
            </Button>
          </div>

          {isLoadingFlows ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : flows.length === 0 ? (
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-foreground">Crie seu Fluxo Inicial</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    O primeiro fluxo sera o ponto de entrada do seu bot. E ele que seus usuarios vao ver quando interagirem pela primeira vez.
                  </p>
                </div>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
                  onClick={() => {
                    setNewFlowCategory("inicial")
                    setNewFlowMode(null)
                    resetBasicFlow()
                    setShowNewFlowDialog(true)
                  }}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Criar Fluxo Inicial
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              {/* ====== FLUXO PRINCIPAL (HERO CARD) ====== */}
              {primaryFlow && (
                <Card
                  className={`relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
                    activeFlow?.id === primaryFlow.id
                      ? "border-accent bg-accent/5 shadow-lg shadow-accent/5"
                      : "border-accent/30 bg-card hover:border-accent/60"
                  }`}
                  onClick={() => setActiveFlow(primaryFlow)}
                >
                  {/* Accent glow stripe */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />

                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 border border-accent/30">
                          <Crown className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-base font-bold text-foreground">{primaryFlow.name}</h3>
                            <Badge className="bg-accent/15 text-accent border-accent/30 rounded-md text-[10px] font-semibold px-1.5 py-0">
                              PRINCIPAL
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Jornada inicial do usuario — primeiro contato com o bot
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={`rounded-lg cursor-pointer text-xs ${statusStyles[primaryFlow.status]}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFlowStatus(primaryFlow)
                          }}
                        >
                          {primaryFlow.status === "ativo" ? "Ativo" : "Pausado"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveFlow(primaryFlow)
                            openEditFlow(primaryFlow)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ====== FLUXOS SECUNDARIOS ====== */}
              {(secondaryFlows.length > 0 || primaryFlow) && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-accent/60" />
                      <h2 className="text-sm font-semibold text-foreground">
                        Fluxos Secundarios
                      </h2>
                      <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                        {secondaryFlows.length}
                      </span>
                    </div>
                  </div>

                  {secondaryFlows.length === 0 ? (
                    <Card className="bg-card border-border border-dashed rounded-2xl">
                      <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 border border-border/50">
                          <GitBranch className="h-4 w-4 text-muted-foreground/60" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center max-w-sm">
                          Crie fluxos secundarios: remarketing, follow-up, pos-venda e mais.
                        </p>
                        <Button
                          variant="outline"
                          className="rounded-xl border-border text-foreground hover:border-accent hover:text-accent"
                          onClick={() => {
                            setNewFlowCategory("personalizado")
                            setNewFlowMode(null)
                            resetBasicFlow()
                            setShowNewFlowDialog(true)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Criar Fluxo Secundario
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {secondaryFlows.map((fluxo) => {
                        const catConfig = getCategoryConfig(fluxo.category)
                        const CatIcon = catConfig.icon
                        const isActive = activeFlow?.id === fluxo.id

                        return (
                          <Card
                            key={fluxo.id}
                            className={`cursor-pointer rounded-2xl transition-all ${
                              isActive
                                ? `ring-1 ring-accent bg-secondary/50`
                                : "bg-card border-border hover:bg-secondary/30"
                            }`}
                            onClick={() => setActiveFlow(fluxo)}
                          >
                            <CardContent className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 ${catConfig.color}`}>
                                  <CatIcon className={`h-4 w-4 ${catConfig.iconColor}`} />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-sm font-semibold text-foreground truncate">{fluxo.name}</h3>
                                  <p className="text-[11px] text-muted-foreground">{catConfig.label}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge
                                  variant="outline"
                                  className={`rounded-lg cursor-pointer text-[10px] ${statusStyles[fluxo.status]}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleFlowStatus(fluxo)
                                  }}
                                >
                                  {fluxo.status}
                                </Badge>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ====== VISUAL BUILDER DO FLUXO ATIVO ====== */}
              {activeFlow && (
                <Card className="bg-card border-border rounded-2xl overflow-hidden">
                  {/* Top accent bar matching category */}
                  <div className={`h-1 ${activeFlow.is_primary ? "bg-accent" : (() => {
                    const g = actionGroups.find((_g) => {
                      const catConfig = getCategoryConfig(activeFlow.category)
                      return catConfig.iconColor.includes("blue") ? _g.id === "comunicacao" : catConfig.iconColor.includes("orange") ? _g.id === "navegacao" : catConfig.iconColor.includes("purple") ? _g.id === "logica" : false
                    })
                    return g ? "bg-current" : "bg-border"
                  })()}`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const catConfig = getCategoryConfig(activeFlow.category)
                          const CatIcon = catConfig.icon
                          return (
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${catConfig.color}`}>
                              <CatIcon className={`h-5 w-5 ${catConfig.iconColor}`} />
                            </div>
                          )
                        })()}
                        <div>
                          <CardTitle className="text-sm font-semibold text-foreground">
                            {activeFlow.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[11px] text-muted-foreground">
                              {getCategoryConfig(activeFlow.category).label}
                            </p>
                            {activeFlow.is_primary && (
                              <Badge className="bg-accent/15 text-accent border-accent/30 rounded-md text-[9px] font-bold px-1.5 py-0">
                                PRINCIPAL
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {nodes.filter((n) => n.type !== "trigger").length} etapas
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`rounded-lg ${statusStyles[activeFlow.status]}`}>
                          {activeFlow.status}
                        </Badge>
                        {!activeFlow.is_primary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-accent"
                            onClick={() => handleSetPrimary(activeFlow)}
                          >
                            <Star className="h-3.5 w-3.5 mr-1" />
                            Tornar principal
                          </Button>
                        )}
                        <Button
                          variant={showCategoryConfig ? "default" : "ghost"}
                          size="sm"
                          className={`h-8 text-xs ${showCategoryConfig ? "bg-accent text-accent-foreground hover:bg-accent/90" : "text-muted-foreground hover:text-foreground"}`}
                          onClick={() => setShowCategoryConfig(!showCategoryConfig)}
                        >
                          <Settings2 className="h-3.5 w-3.5 mr-1" />
                          Config
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditFlow(activeFlow)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setShowDeleteFlowDialog(true)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

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
                                    ({nodes.filter((n) => n.type === "redirect").length} conectados)
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mb-2.5">
                                  Fluxos secundarios que o usuario pode ser redirecionado a partir deste fluxo. Adicione um bloco "Redirecionar para Fluxo" no builder abaixo.
                                </p>
                                <div className="flex flex-col gap-1.5">
                                  {secondaryFlows.map((sf) => {
                                    const sfCat = getCategoryConfig(sf.category)
                                    const SFIcon = sfCat.icon
                                    const isLinked = nodes.some((n) => n.type === "redirect" && n.config?.target_flow_id === sf.id)
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

                  <CardContent>
                    {/* Mini-Mapa do Fluxo */}
                    {!isLoadingNodes && nodes.filter((n) => n.type !== "trigger").length > 2 && (
                      <div className="mb-4 rounded-xl border border-border/50 bg-secondary/20 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Workflow className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Mini-mapa</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{nodes.filter((n) => n.type !== "trigger").length} etapas</span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          {/* Trigger dot */}
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="h-5 w-5 rounded-md bg-accent/20 border border-accent/40 flex items-center justify-center" title="Gatilho Inicial">
                              <Zap className="h-2.5 w-2.5 text-accent" />
                            </div>
                          </div>
                          {nodes.filter((n) => n.type !== "trigger").map((node, idx) => {
                            const group = actionGroups.find((g) => g.types.includes(node.type))
                            const MiniIcon = nodeIcons[node.type]
                            return (
                              <div key={node.id} className="flex items-center gap-1.5 shrink-0">
                                <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/30" />
                                <div
                                  className={`h-5 w-5 rounded-md flex items-center justify-center border ${group ? `${group.bgColor} ${group.borderAccent}` : "bg-secondary border-border"}`}
                                  title={node.label}
                                >
                                  <MiniIcon className={`h-2.5 w-2.5 ${group?.iconColor || "text-muted-foreground"}`} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {isLoadingNodes ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {nodes.filter((n) => n.type !== "trigger").length === 0 && (
                          <div className="text-center py-6 mb-2">
                            <div className="flex justify-center mb-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/60 border border-border/50">
                                <Workflow className="h-5 w-5 text-muted-foreground/60" />
                              </div>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Monte a jornada do usuario
                            </p>
                            <p className="text-xs text-muted-foreground/70 max-w-[260px] mx-auto">
                              Adicione etapas ao fluxo: mensagens, logica, pagamentos e mais.
                            </p>
                          </div>
                        )}

                        {/* Fixed trigger block */}
                        <div className="flex flex-col">
                          <div className="relative flex items-center gap-4 rounded-2xl border-2 border-accent/40 bg-gradient-to-r from-accent/8 to-accent/3 px-4 py-4">
                            {/* Left accent bar */}
                            <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-accent/60" />
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 border border-accent/30 ml-1">
                              <DragonTriggerIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-foreground">Inicio do Fluxo</p>
                                <Badge className="bg-accent/15 text-accent border-accent/30 rounded-md text-[9px] font-bold px-1.5 py-0 uppercase tracking-wider">
                                  Gatilho
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">Usuario inicia o bot — ponto de entrada</p>
                            </div>
                          </div>
                          {nodes.filter((n) => n.type !== "trigger").length > 0 && (
                            <div className="flex flex-col items-center py-1.5">
                              <div className="w-px h-3 bg-border" />
                              <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>

                        {nodes.filter((n) => n.type !== "trigger").map((node, i, arr) => {
                          const Icon = nodeIcons[node.type]
                          const group = actionGroups.find((g) => g.types.includes(node.type))
                          return (
                            <div key={node.id}>
                              <div
                                className={`group relative flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all hover:shadow-sm ${nodeColors[node.type]}`}
                              >
                                {/* Left color bar */}
                                {group && (
                                  <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${group.iconColor === "text-blue-400" ? "bg-blue-400/60" : group.iconColor === "text-purple-400" ? "bg-purple-400/60" : group.iconColor === "text-success" ? "bg-emerald-400/60" : group.iconColor === "text-orange-400" ? "bg-orange-400/60" : "bg-cyan-400/60"}`} />
                                )}
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${group ? `${group.bgColor} border ${group.borderAccent}` : "bg-background/50"}`}>
                                  <Icon className={`h-4 w-4 ${nodeIconColors[node.type]}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium text-foreground truncate">{node.label}</p>
                                    {group && (
                                      <span className={`text-[9px] font-semibold px-1.5 py-0 rounded-full border ${group.bgColor} ${group.borderAccent} ${group.iconColor}`}>
                                        {group.label}
                                      </span>
                                    )}
                                  </div>
                                  {node.type === "message" && (
                                    <div className="flex items-center gap-2.5 mt-1">
                                      {node.config?.media_type && node.config.media_type !== "" && (
                                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary/60 rounded-md px-1.5 py-0.5">
                                          {node.config.media_type === "photo" ? <Image className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                                          {node.config.media_type === "photo" ? "Foto" : "Video"}
                                        </span>
                                      )}
                                      {node.config?.buttons && node.config.buttons !== "" && (
                                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary/60 rounded-md px-1.5 py-0.5">
                                          <MousePointerClick className="h-3 w-3" />
                                          {(() => { try { return JSON.parse(node.config.buttons as string).length } catch { return 0 } })()}{" "}
                                          {"botao(es)"}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {node.type === "redirect" && node.config?.target_flow_name && (
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <ExternalLink className="h-3 w-3 text-orange-400" />
                                      <span className="text-xs text-orange-400 font-medium">
                                        {node.config.target_flow_name as string}
                                      </span>
                                      {(() => {
                                        const targetFlow = flows.find((f) => f.id === node.config?.target_flow_id)
                                        if (targetFlow) {
                                          const tCat = getCategoryConfig(targetFlow.category)
                                          return (
                                            <Badge variant="outline" className={`text-[9px] px-1 py-0 rounded ${tCat.color}`}>
                                              {tCat.label}
                                            </Badge>
                                          )
                                        }
                                        return null
                                      })()}
                                    </div>
                                  )}
                                  {node.type === "delay" && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> Pausa no fluxo
                                    </p>
                                  )}
                                  {node.type === "condition" && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                      <Split className="h-3 w-3" /> Verificacao logica
                                    </p>
                                  )}
                                  {node.type === "action" && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                      <Zap className="h-3 w-3" /> Automacao
                                    </p>
                                  )}
                                  {node.type === "payment" && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                      <CreditCard className="h-3 w-3" /> Monetizacao
                                    </p>
                                  )}
                                  {node.type === "redirect" && !node.config?.target_flow_name && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                      {node.config?.subVariant === "restart" ? (
                                        <><RefreshCw className="h-3 w-3" /> Volta ao inicio</>
                                      ) : node.config?.subVariant === "end" ? (
                                        <><CircleStop className="h-3 w-3" /> Finaliza interacao</>
                                      ) : (
                                        <><ExternalLink className="h-3 w-3" /> Navegacao</>
                                      )}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={() => openEditNode(node)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      setDeletingNode(node)
                                      setShowDeleteNodeDialog(true)
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                              </div>
                              {i < arr.length - 1 && (
                                <div className="flex flex-col items-center py-1">
                                  <div className="w-px h-2 bg-border/60" />
                                  <ArrowDown className="h-3 w-3 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {nodes.filter((n) => n.type !== "trigger").length > 0 && (
                          <div className="flex flex-col items-center py-1">
                            <div className="w-px h-2 bg-border/60" />
                            <ArrowDown className="h-3 w-3 text-muted-foreground/30" />
                          </div>
                        )}
                        <button
                          className="group w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 hover:border-accent/50 bg-transparent hover:bg-accent/5 py-4 transition-all"
                          onClick={() => {
                            setSelectedTemplate(null)
                            setNodeConfigValues({})
                            setShowAddNodeDialog(true)
                          }}
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/60 group-hover:bg-accent/15 transition-colors">
                            <Plus className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground group-hover:text-accent transition-colors">
                            Adicionar Etapa
                          </span>
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
        <DialogContent className="bg-card border-border rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto p-0">

          {/* ===== STEP 1: Choose mode ===== */}
          {newFlowMode === null && (
            <div className="flex flex-col">
              <div className="px-6 pt-6 pb-4 border-b border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground text-base">
                    {flows.length === 0 ? "Criar Fluxo Inicial" : "Novo Fluxo"}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground mt-1">Como voce quer montar esse fluxo?</p>
              </div>

              <div className="flex flex-col gap-3 p-5">
                {/* Basic Flow Option */}
                <button
                  className="group flex flex-col gap-3 rounded-2xl border-2 border-success/30 bg-success/5 p-5 text-left transition-all hover:border-success/60 hover:bg-success/10 hover:shadow-sm"
                  onClick={() => setNewFlowMode("basico")}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/15 border border-success/30">
                      <Zap className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">Fluxo Basico</p>
                        <Badge className="bg-success/15 text-success border-success/30 rounded-md text-[9px] font-bold px-1.5 py-0">
                          RAPIDO
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Pronto em segundos</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-success transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5 pl-14">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-success/60" />
                      <span>Mensagem de boas-vindas com foto/video</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-success/60" />
                      <span>Preco e cobranca gerada automaticamente</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-success/60" />
                      <span>So preencher os campos e esta pronto</span>
                    </div>
                  </div>
                  {/* Mini preview of what it generates */}
                  <div className="flex items-center gap-1.5 pl-14 mt-1">
                    <div className="flex items-center gap-1 text-[9px] text-success/70 bg-success/10 rounded-full px-2 py-0.5 border border-success/20">
                      <Zap className="h-2.5 w-2.5" /> Gatilho
                    </div>
                    <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/30" />
                    <div className="flex items-center gap-1 text-[9px] text-blue-400/70 bg-blue-500/10 rounded-full px-2 py-0.5 border border-blue-500/20">
                      <MessageSquare className="h-2.5 w-2.5" /> Mensagem
                    </div>
                    <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/30" />
                    <div className="flex items-center gap-1 text-[9px] text-success/70 bg-success/10 rounded-full px-2 py-0.5 border border-success/20">
                      <CreditCard className="h-2.5 w-2.5" /> Pagamento
                    </div>
                  </div>
                </button>

                {/* Complete Flow Option */}
                <button
                  className="group flex flex-col gap-3 rounded-2xl border-2 border-accent/30 bg-accent/5 p-5 text-left transition-all hover:border-accent/60 hover:bg-accent/10 hover:shadow-sm"
                  onClick={() => setNewFlowMode("completo")}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 border border-accent/30">
                      <Workflow className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">Fluxo Completo</p>
                        <Badge className="bg-accent/15 text-accent border-accent/30 rounded-md text-[9px] font-bold px-1.5 py-0">
                          AVANCADO
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Controle total sobre cada etapa</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5 pl-14">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-accent/60" />
                      <span>Monte o fluxo etapa por etapa</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-accent/60" />
                      <span>Mensagens, logica, pagamentos, automacoes</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-accent/60" />
                      <span>Para jornadas mais elaboradas</span>
                    </div>
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
        <DialogContent className="bg-card border-border rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Fluxo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Nome do fluxo</Label>
              <Input
                value={editFlowName}
                onChange={(e) => setEditFlowName(e.target.value)}
                className="bg-secondary border-border rounded-xl text-foreground"
              />
            </div>
            {!activeFlow?.is_primary && (
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Tipo de fluxo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {flowCategories.filter((c) => c.value !== "inicial").map((cat) => {
                    const CatIcon = cat.icon
                    const isSelected = editFlowCategory === cat.value
                    return (
                      <button
                        key={cat.value}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                          isSelected
                            ? `${cat.color} ring-1 ring-accent`
                            : "border-border bg-secondary/30 hover:bg-secondary/60"
                        }`}
                        onClick={() => setEditFlowCategory(cat.value)}
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
              </div>
            )}
            {activeFlow?.is_primary && (
              <div className="flex items-start gap-3 rounded-xl bg-accent/5 border border-accent/20 p-3">
                <Crown className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Este e o fluxo principal. Voce pode trocar o principal clicando em {"'Tornar principal'"} em outro fluxo.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl border-border text-foreground"
              onClick={() => setShowEditFlowDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
              disabled={!editFlowName.trim() || isSavingFlow}
              onClick={handleSaveFlow}
            >
              {isSavingFlow && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Add Node Dialog ---- */}
      <Dialog open={showAddNodeDialog} onOpenChange={setShowAddNodeDialog}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-lg max-h-[85vh] overflow-y-auto p-0">
          {!selectedTemplate ? (
            <div className="flex flex-col">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-card border-b border-border px-6 pt-6 pb-4 rounded-t-2xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground text-base">Adicionar Etapa</DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground mt-1">O que voce quer fazer nesta etapa do fluxo?</p>
              </div>

              {/* Groups */}
              <div className="flex flex-col gap-1 px-4 py-4">
                {actionGroups.map((group) => {
                  const GroupIcon = group.icon
                  const groupTemplates = actionTemplates.filter((tpl) => {
                    if (!group.types.includes(tpl.type)) return false
                    if (group.subVariants && tpl.subVariant) return group.subVariants.includes(tpl.subVariant)
                    if (group.subVariants && !tpl.subVariant) return false
                    return tpl.type !== "trigger"
                  })
                  if (groupTemplates.length === 0) return null

                  return (
                    <div key={group.id} className="flex flex-col">
                      {/* Group Header - clickable accordion style */}
                      <div className={`flex items-center gap-3 px-3 py-3 rounded-xl ${group.bgColor} border ${group.borderAccent} mb-2`}>
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/60`}>
                          <GroupIcon className={`h-5 w-5 ${group.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{group.label}</p>
                          <p className="text-[11px] text-muted-foreground">{group.description}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground bg-background/50 rounded-full px-2 py-0.5 border border-border/50">
                          {groupTemplates.length}
                        </span>
                      </div>

                      {/* Group Items */}
                      <div className="grid grid-cols-1 gap-1.5 pl-3 pr-1 pb-3">
                        {groupTemplates.map((tpl, tplIdx) => {
                          const SubIcon = tpl.subVariant ? (subVariantIcons[tpl.subVariant] || nodeIcons[tpl.type]) : nodeIcons[tpl.type]
                          return (
                            <button
                              key={`${tpl.type}-${tpl.subVariant || tplIdx}`}
                              className="flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/20 px-3 py-2.5 text-left transition-all hover:bg-secondary/60 hover:border-border group"
                              onClick={() => {
                                setSelectedTemplate(tpl)
                                setNodeConfigValues({})
                                resetMessageConfig()
                                // Pre-configure based on subVariant
                                if (tpl.subVariant === "media") {
                                  setMsgMediaType("photo")
                                }
                                if (tpl.subVariant === "buttons") {
                                  setMsgHasButtons(true)
                                  setMsgButtons([{ text: "", url: "" }])
                                }
                              }}
                            >
                              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${group.bgColor} border ${group.borderAccent}`}>
                                <SubIcon className={`h-3.5 w-3.5 ${group.iconColor}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground">{tpl.label}</p>
                                <p className="text-[10px] text-muted-foreground leading-tight">{tpl.description}</p>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 px-6 py-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const group = actionGroups.find((g) => g.types.includes(selectedTemplate.type))
                  const SubIcon = selectedTemplate.subVariant ? (subVariantIcons[selectedTemplate.subVariant] || nodeIcons[selectedTemplate.type]) : nodeIcons[selectedTemplate.type]
                  return (
                    <>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${group ? `${group.bgColor} ${group.borderAccent}` : nodeColors[selectedTemplate.type]}`}>
                        <SubIcon className={`h-5 w-5 ${group?.iconColor || nodeIconColors[selectedTemplate.type]}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{selectedTemplate.label}</p>
                        <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                        {group && (
                          <span className={`inline-block text-[9px] font-semibold mt-0.5 px-1.5 py-0 rounded-full border ${group.bgColor} ${group.borderAccent} ${group.iconColor}`}>
                            {group.label}
                          </span>
                        )}
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
              ) : selectedTemplate.type === "redirect" && selectedTemplate.subVariant === "goto_flow" ? (
                <div className="flex flex-col gap-3">
                  <Label className="text-foreground">Selecione o fluxo de destino</Label>
                  <p className="text-xs text-muted-foreground -mt-1">
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
              ) : selectedTemplate.configFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Este bloco nao precisa de configuracao.
                </p>
              ) : (
                selectedTemplate.configFields.map((field) => (
                  <div key={field.key} className="flex flex-col gap-2">
                    <Label className="text-foreground">{field.label}</Label>
                    {field.inputType === "textarea" ? (
                      <Textarea
                        value={nodeConfigValues[field.key] || ""}
                        onChange={(e) =>
                          setNodeConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className="bg-secondary border-border rounded-xl text-foreground min-h-[80px]"
                      />
                    ) : (
                      <Input
                        type={field.inputType}
                        value={nodeConfigValues[field.key] || ""}
                        onChange={(e) =>
                          setNodeConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className="bg-secondary border-border rounded-xl text-foreground"
                      />
                    )}
                  </div>
                ))
              )}

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-border text-foreground"
                  onClick={() => {
                    setSelectedTemplate(null)
                    resetMessageConfig()
                  }}
                >
                  Voltar
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
                  disabled={isAddingNode || (selectedTemplate.type === "message" && !msgText.trim()) || (selectedTemplate.subVariant === "goto_flow" && !nodeConfigValues.target_flow_id)}
                  onClick={handleAddNode}
                >
                  {isAddingNode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Adicionar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---- Edit Node Dialog ---- */}
      <Dialog open={showEditNodeDialog} onOpenChange={setShowEditNodeDialog}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Etapa</DialogTitle>
          </DialogHeader>
          {editingNode && (
            <div className="flex flex-col gap-4 py-2">
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
              ) : editingNode.type === "redirect" ? (
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
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Label</Label>
                    <Input
                      value={editNodeLabel}
                      onChange={(e) => setEditNodeLabel(e.target.value)}
                      className="bg-secondary border-border rounded-xl text-foreground"
                    />
                  </div>

                  {(() => {
                    const tpl = actionTemplates.find((t) => t.type === editingNode.type)
                    if (!tpl || tpl.configFields.length === 0) return null
                    return tpl.configFields.map((field) => (
                      <div key={field.key} className="flex flex-col gap-2">
                        <Label className="text-foreground">{field.label}</Label>
                        {field.inputType === "textarea" ? (
                          <Textarea
                            value={editNodeConfig[field.key] || ""}
                            onChange={(e) =>
                              setEditNodeConfig((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            placeholder={field.placeholder}
                            className="bg-secondary border-border rounded-xl text-foreground min-h-[80px]"
                          />
                        ) : (
                          <Input
                            type={field.inputType}
                            value={editNodeConfig[field.key] || ""}
                            onChange={(e) =>
                              setEditNodeConfig((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            placeholder={field.placeholder}
                            className="bg-secondary border-border rounded-xl text-foreground"
                          />
                        )}
                      </div>
                    ))
                  })()}
                </>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-xl border-border text-foreground"
                  onClick={() => {
                    resetMessageConfig()
                    setShowEditNodeDialog(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
                  disabled={isSavingNode || (editingNode.type === "message" ? !msgText.trim() : !editNodeLabel.trim())}
                  onClick={handleSaveNode}
                >
                  {isSavingNode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---- Delete Node Dialog ---- */}
      <Dialog open={showDeleteNodeDialog} onOpenChange={setShowDeleteNodeDialog}>
        <DialogContent className="bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Apagar Etapa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja apagar a etapa{" "}
            <span className="font-medium text-foreground">{deletingNode?.label}</span>?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl border-border text-foreground"
              onClick={() => setShowDeleteNodeDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={isDeletingNode}
              onClick={handleDeleteNode}
            >
              {isDeletingNode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apagar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Delete Flow Dialog ---- */}
      <Dialog open={showDeleteFlowDialog} onOpenChange={setShowDeleteFlowDialog}>
        <DialogContent className="bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Apagar Fluxo</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja apagar o fluxo{" "}
            <span className="font-medium text-foreground">{activeFlow?.name}</span>? Todas as etapas serao removidas.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl border-border text-foreground"
              onClick={() => setShowDeleteFlowDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={isDeletingFlow}
              onClick={handleDeleteFlow}
            >
              {isDeletingFlow && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apagar
            </Button>
          </DialogFooter>
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

  return (
    <div className="flex flex-col gap-4">
      {/* Texto da mensagem */}
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Texto da mensagem</Label>
        <Textarea
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          placeholder="Digite a mensagem que o bot vai enviar..."
          className="bg-secondary border-border rounded-xl text-foreground min-h-[80px]"
        />
      </div>

      {/* Midia */}
      <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
        <div className="flex items-center justify-between">
          <Label className="text-foreground text-sm">Midia (opcional)</Label>
          <Select
            value={msgMediaType}
            onValueChange={(v) => {
              setMsgMediaType(v as "photo" | "video" | "none")
              if (v === "none") {
                setMsgMediaUrl("")
                setFileName("")
                setUploadError("")
              }
            }}
          >
            <SelectTrigger className="w-[140px] h-8 bg-secondary border-border rounded-lg text-foreground text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="photo">
                <span className="flex items-center gap-1.5"><Image className="h-3 w-3" /> Foto</span>
              </SelectItem>
              <SelectItem value="video">
                <span className="flex items-center gap-1.5"><Video className="h-3 w-3" /> Video</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {msgMediaType !== "none" && (
          <div className="flex flex-col gap-2">
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
              <div className="flex flex-col gap-2">
                {msgMediaType === "photo" ? (
                  <div className="relative rounded-lg overflow-hidden border border-border bg-secondary">
                    <img src={msgMediaUrl} alt="Preview" className="w-full max-h-[160px] object-cover" />
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-border bg-secondary">
                    <video src={msgMediaUrl} className="w-full max-h-[160px] object-cover" controls />
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {fileName || "Arquivo enviado"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => {
                      setMsgMediaUrl("")
                      setFileName("")
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors ${
                  uploading
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-secondary/50"
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    <span className="text-xs text-muted-foreground">Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center">
                      Clique ou arraste {msgMediaType === "photo" ? "uma foto" : "um video"} aqui
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {msgMediaType === "photo" ? "JPG, PNG, GIF, WEBP" : "MP4, WEBM, MOV"} - Max 50MB
                    </span>
                  </>
                )}
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-destructive">{uploadError}</p>
            )}
          </div>
        )}
      </div>

      {/* Botoes Inline */}
      <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <Label className="text-foreground text-sm">Botoes com link</Label>
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
          <div className="flex flex-col gap-2">
            {msgButtons.map((btn, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border/50 bg-secondary/30 p-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Input
                    value={btn.text}
                    onChange={(e) => updateMsgButton(i, "text", e.target.value)}
                    placeholder="Titulo do botao"
                    className="bg-secondary border-border rounded-lg text-foreground text-sm h-8"
                  />
                  <Input
                    value={btn.url}
                    onChange={(e) => updateMsgButton(i, "url", e.target.value)}
                    placeholder="https://link-do-botao.com"
                    className="bg-secondary border-border rounded-lg text-foreground text-sm h-8"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeMsgButton(i)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {msgButtons.length < 6 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-lg border-dashed border-border text-muted-foreground text-xs"
                onClick={addMsgButton}
              >
                <Plus className="mr-1.5 h-3 w-3" />
                Adicionar botao
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Maximo de 6 botoes. Cada botao aparece abaixo da mensagem no Telegram.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
