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
} from "lucide-react"
import NextImage from "next/image"
import { Switch } from "@/components/ui/switch"

// ---- Types ----

type FlowCategory = "inicial" | "remarketing" | "followup" | "pos-venda" | "captacao" | "notificacao" | "seo" | "personalizado"

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
  { value: "seo", label: "SEO", description: "Otimizacao e conteudo para buscadores", icon: Search, color: "border-emerald-500/30 bg-emerald-500/10", iconColor: "text-emerald-400" },
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
    description: "O primeiro contato do usuario com o bot. Configure a experiencia de boas-vindas.",
    fields: [
      { key: "welcome_message", label: "Mensagem de boas-vindas", type: "textarea", placeholder: "Ola! Bem-vindo ao nosso bot...", icon: MessageCircle, description: "Mensagem exibida ao iniciar" },
      { key: "auto_start", label: "Iniciar automaticamente", type: "toggle", icon: Zap, description: "Dispara ao primeiro contato" },
      { key: "collect_name", label: "Coletar nome do usuario", type: "toggle", icon: UserPlus, description: "Pedir nome antes de prosseguir" },
      { key: "main_menu_enabled", label: "Exibir menu principal", type: "toggle", icon: GitBranch, description: "Mostra opcoes apos boas-vindas" },
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
    category: "seo",
    title: "Configuracoes de SEO",
    description: "Otimize conteudo e fluxos para buscadores.",
    fields: [
      { key: "target_keywords", label: "Palavras-chave alvo", type: "textarea", placeholder: "chatbot, automacao, vendas online", icon: Search, description: "Keywords separadas por virgula" },
      { key: "meta_title", label: "Meta titulo", type: "text", placeholder: "Melhor chatbot para vendas", icon: FileText, description: "Titulo para motores de busca" },
      { key: "meta_description", label: "Meta descricao", type: "textarea", placeholder: "Descricao otimizada para SEO...", icon: FileText, description: "Descricao de ate 160 caracteres" },
      { key: "content_type", label: "Tipo de conteudo", type: "select", icon: Globe, options: [
        { value: "landing", label: "Landing Page" },
        { value: "blog", label: "Blog Post" },
        { value: "produto", label: "Pagina de Produto" },
        { value: "faq", label: "FAQ / Perguntas" },
      ], description: "Formato do conteudo gerado" },
      { key: "auto_links", label: "Links internos automaticos", type: "toggle", icon: Link, description: "Gerar links internos nos textos" },
      { key: "canonical_url", label: "URL canonica", type: "text", placeholder: "https://seusite.com/pagina", icon: Globe, description: "URL principal para indexacao" },
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
}

const nodeColors: Record<NodeType, string> = {
  trigger: "border-accent bg-accent/5",
  message: "border-blue-500/30 bg-blue-500/5",
  delay: "border-warning/30 bg-warning/5",
  condition: "border-purple-500/30 bg-purple-500/5",
  payment: "border-success/30 bg-success/5",
  action: "border-cyan-500/30 bg-cyan-500/5",
}

const nodeIconColors: Record<NodeType, string> = {
  trigger: "text-accent", message: "text-blue-400", delay: "text-warning",
  condition: "text-purple-400", payment: "text-success", action: "text-cyan-400",
}

const statusStyles: Record<string, string> = {
  ativo: "bg-success/10 text-success border-success/20",
  pausado: "bg-warning/10 text-warning border-warning/20",
}

// Available action templates
const actionTemplates: { type: NodeType; label: string; description: string; configFields: { key: string; label: string; placeholder: string; inputType: "text" | "textarea" | "number" }[] }[] = [
  {
    type: "trigger",
    label: "Usuario inicia bot",
    description: "Gatilho inicial quando o usuario inicia o bot",
    configFields: [],
  },
  {
    type: "message",
    label: "Mensagem",
    description: "Enviar mensagem com midia e botoes",
    configFields: [],
  },
  {
    type: "delay",
    label: "Delay",
    description: "Aguardar um tempo antes da proxima acao",
    configFields: [
      { key: "seconds", label: "Tempo em segundos", placeholder: "300", inputType: "number" },
    ],
  },
  {
    type: "condition",
    label: "Condicao",
    description: "Verificar uma condicao do usuario",
    configFields: [
      { key: "condition", label: "Condicao", placeholder: "Ex: Usuario respondeu?", inputType: "text" },
    ],
  },
  {
    type: "payment",
    label: "Pagamento",
    description: "Gerar cobranca ou PIX",
    configFields: [
      { key: "amount", label: "Valor (R$)", placeholder: "49.90", inputType: "text" },
      { key: "description", label: "Descricao", placeholder: "Pagamento do produto X", inputType: "text" },
    ],
  },
  {
    type: "action",
    label: "Acao",
    description: "Executar uma acao automatica",
    configFields: [
      { key: "action_name", label: "Nome da acao", placeholder: "Ex: Adicionar ao grupo VIP", inputType: "text" },
    ],
  },
]

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
    let config: Record<string, unknown> = { ...nodeConfigValues }

    if (selectedTemplate.type === "message") {
      label = msgText ? (msgText.length > 40 ? msgText.slice(0, 40) + "..." : msgText) : "Mensagem"
      const validButtons = msgButtons.filter((b) => b.text.trim() && b.url.trim())
      config = {
        text: msgText,
        media_url: msgMediaType !== "none" ? msgMediaUrl : "",
        media_type: msgMediaType !== "none" ? msgMediaType : "",
        buttons: validButtons.length > 0 ? JSON.stringify(validButtons) : "",
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
            <p className="text-sm text-muted-foreground">Crie e gerencie fluxos de automacao</p>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
              onClick={() => {
                setNewFlowCategory(flows.length === 0 ? "inicial" : "personalizado")
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
                            Fluxo inicial do bot — primeiro contato dos usuarios
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
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      <h2 className="text-sm font-semibold text-foreground">
                        Fluxos Secundarios
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        ({secondaryFlows.length})
                      </span>
                    </div>
                  </div>

                  {secondaryFlows.length === 0 ? (
                    <Card className="bg-card border-border border-dashed rounded-2xl">
                      <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
                        <p className="text-sm text-muted-foreground text-center max-w-sm">
                          Crie fluxos secundarios como remarketing, follow-up, pos-venda e mais.
                        </p>
                        <Button
                          variant="outline"
                          className="rounded-xl border-border text-foreground hover:border-accent hover:text-accent"
                          onClick={() => {
                            setNewFlowCategory("personalizado")
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
                <Card className="bg-card border-border rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const catConfig = getCategoryConfig(activeFlow.category)
                          const CatIcon = catConfig.icon
                          return (
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${catConfig.color}`}>
                              <CatIcon className={`h-4 w-4 ${catConfig.iconColor}`} />
                            </div>
                          )
                        })()}
                        <div>
                          <CardTitle className="text-sm font-medium text-foreground">
                            {activeFlow.name}
                          </CardTitle>
                          <p className="text-[11px] text-muted-foreground">
                            {getCategoryConfig(activeFlow.category).label}
                            {activeFlow.is_primary && " — Fluxo Principal"}
                          </p>
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
                    {isLoadingNodes ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {nodes.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground mb-3">
                              Nenhuma acao adicionada. Comece adicionando blocos ao fluxo.
                            </p>
                          </div>
                        )}

                        {nodes.map((node, i) => {
                          const Icon = nodeIcons[node.type]
                          return (
                            <div key={node.id}>
                              <div
                                className={`group flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors hover:bg-secondary/50 ${nodeColors[node.type]}`}
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/50">
                                  <Icon className={`h-4 w-4 ${nodeIconColors[node.type]}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{node.label}</p>
                                  {node.type === "message" && (
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {node.config?.media_type && node.config.media_type !== "" && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                          {node.config.media_type === "photo" ? <Image className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                                          {node.config.media_type === "photo" ? "Foto" : "Video"}
                                        </span>
                                      )}
                                      {node.config?.buttons && node.config.buttons !== "" && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Link className="h-3 w-3" />
                                          {(() => { try { return JSON.parse(node.config.buttons as string).length } catch { return 0 } })()}{" "}
                                          {"botao(es)"}
                                        </span>
                                      )}
                                    </div>
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
                                <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                              </div>
                              {i < nodes.length - 1 && (
                                <div className="flex justify-center py-1">
                                  <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {nodes.length > 0 && (
                          <div className="flex justify-center py-1">
                            <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground/50" />
                          </div>
                        )}
                        <Button
                          variant="outline"
                          className="w-full rounded-xl border-dashed border-border hover:border-accent hover:bg-accent/5 text-muted-foreground hover:text-accent transition-colors"
                          onClick={() => {
                            setSelectedTemplate(null)
                            setNodeConfigValues({})
                            setShowAddNodeDialog(true)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar acao
                        </Button>
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
      <Dialog open={showNewFlowDialog} onOpenChange={setShowNewFlowDialog}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {flows.length === 0 ? "Criar Fluxo Inicial" : "Novo Fluxo"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="flow-name" className="text-foreground">Nome do fluxo</Label>
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
                <Label className="text-foreground">Tipo de fluxo</Label>
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
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl border-border text-foreground"
              onClick={() => setShowNewFlowDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
              disabled={!newFlowName.trim() || isCreatingFlow}
              onClick={handleCreateFlow}
            >
              {isCreatingFlow && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
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
        <DialogContent className="bg-card border-border rounded-2xl max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Adicionar Acao</DialogTitle>
          </DialogHeader>

          {!selectedTemplate ? (
            <div className="flex flex-col gap-2 py-2">
              <p className="text-sm text-muted-foreground mb-2">Escolha o tipo de acao:</p>
              {actionTemplates.map((tpl) => {
                const Icon = nodeIcons[tpl.type]
                return (
                  <button
                    key={tpl.type}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:bg-secondary/50 ${nodeColors[tpl.type]}`}
                    onClick={() => {
                      setSelectedTemplate(tpl)
                      setNodeConfigValues({})
                      resetMessageConfig()
                    }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/50">
                      <Icon className={`h-4 w-4 ${nodeIconColors[tpl.type]}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tpl.label}</p>
                      <p className="text-xs text-muted-foreground">{tpl.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = nodeIcons[selectedTemplate.type]
                  return (
                    <>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/50 border ${nodeColors[selectedTemplate.type]}`}>
                        <Icon className={`h-4 w-4 ${nodeIconColors[selectedTemplate.type]}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{selectedTemplate.label}</p>
                        <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
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
                  disabled={isAddingNode || (selectedTemplate.type === "message" && !msgText.trim())}
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
            <DialogTitle className="text-foreground">Editar Bloco</DialogTitle>
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
            <DialogTitle className="text-foreground">Apagar Bloco</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja apagar o bloco{" "}
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
            <span className="font-medium text-foreground">{activeFlow?.name}</span>? Todos os blocos serao removidos.
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
