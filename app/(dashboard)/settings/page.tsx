"use client"

import { useState, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import {
  Camera,
  Pencil,
  Save,
  Eye,
  EyeOff,
  Trophy,
  Lock,
  DollarSign,
  CalendarDays,
  Clock,
  Copy,
  Check,
  ChevronRight,
  MousePointer,
  BarChart3,
  Bell,
  Gift,
  Target,
  Sparkles,
  KeyRound,
} from "lucide-react"

const milestones = [
  { label: "R$ 1K", value: 1000, unlocked: false },
  { label: "R$ 5K", value: 5000, unlocked: false },
  { label: "R$ 10K", value: 10000, unlocked: false },
  { label: "R$ 25K", value: 25000, unlocked: false },
  { label: "R$ 50K", value: 50000, unlocked: false },
  { label: "R$ 100K", value: 100000, unlocked: false },
]

export default function SettingsPage() {
  const { session } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nome, setNome] = useState(session?.name || "")
  const [apelido, setApelido] = useState(session?.email?.split("@")[0] || "")

  const [cursorPersonalizado, setCursorPersonalizado] = useState(false)
  const [mostrarRanking, setMostrarRanking] = useState(false)
  const [notificacoesPush, setNotificacoesPush] = useState(false)

  const memberSince = session?.loggedInAt
    ? new Date(session.loggedInAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "fevereiro de 2026"

  const lastAccess = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
  const accountId = session?.userId?.slice(0, 12) || "000000000000"

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(session?.userId || accountId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const userInitial = session?.name
    ? session.name.charAt(0).toUpperCase()
    : session?.email
      ? session.email.charAt(0).toUpperCase()
      : "U"

  const faturamentoAtual = 0
  const proximaMeta = 10000
  const progressPercent = (faturamentoAtual / proximaMeta) * 100

  return (
    <>
      <DashboardHeader title="Meu Perfil" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl">

          {/* ── PROFILE HERO ── */}
          <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
            {/* Gradient accent stripe at top */}
            <div className="h-24 bg-gradient-to-r from-accent/20 via-accent/5 to-transparent" />

            <div className="px-6 pb-6 -mt-12">
              <div className="flex flex-col md:flex-row md:items-end gap-5">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <Avatar className="h-24 w-24 rounded-2xl ring-4 ring-card shadow-xl">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Avatar" className="rounded-2xl" />
                    ) : null}
                    <AvatarFallback className="bg-accent text-accent-foreground text-3xl font-bold rounded-2xl">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/70 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Trocar foto"
                  >
                    <Camera className="h-6 w-6 text-foreground" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                {/* Name + email */}
                <div className="flex-1 min-w-0 pb-1">
                  <h1 className="text-2xl font-bold text-foreground truncate">
                    {session?.name || "Usuario"}
                  </h1>
                  <p className="text-sm text-muted-foreground truncate">{session?.email}</p>
                </div>

                {/* Ranking badge */}
                <Badge className="self-start md:self-end rounded-lg bg-accent/10 text-accent border-accent/20 text-xs font-bold px-3 py-1.5 gap-1.5 hover:bg-accent/10">
                  <Trophy className="h-3.5 w-3.5" />
                  {"RANKING #836"}
                </Badge>
              </div>

              {/* Meta row */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-secondary/60 px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span className="text-[11px] uppercase tracking-wider font-medium">Membro desde</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{memberSince}</p>
                </div>
                <div className="rounded-xl bg-secondary/60 px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-[11px] uppercase tracking-wider font-medium">Ultimo acesso</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{lastAccess}</p>
                </div>
                <div className="rounded-xl bg-secondary/60 px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span className="text-[11px] uppercase tracking-wider font-medium">Taxa / transacao</span>
                  </div>
                  <p className="text-sm font-bold text-accent">R$ 0,50</p>
                </div>
                <div className="rounded-xl bg-secondary/60 px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <span className="text-[11px] uppercase tracking-wider font-medium">ID da conta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground font-mono truncate">{accountId}</p>
                    <button onClick={handleCopyId} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                      {copiedId ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── PERSONAL INFO ── */}
          <section className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Informacoes Pessoais</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? <Save className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                {editMode ? "Salvar" : "Editar"}
              </Button>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Nome */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 block">
                    Nome
                  </label>
                  {editMode ? (
                    <Input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="bg-secondary border-border rounded-xl h-11"
                    />
                  ) : (
                    <div className="flex items-center h-11 rounded-xl bg-secondary/40 px-4 text-sm text-foreground">
                      {session?.name || "Nao informado"}
                    </div>
                  )}
                </div>

                {/* Apelido */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 block">
                    Apelido
                  </label>
                  {editMode ? (
                    <Input
                      value={apelido}
                      onChange={(e) => setApelido(e.target.value)}
                      className="bg-secondary border-border rounded-xl h-11"
                      placeholder="@apelido"
                    />
                  ) : (
                    <div className="flex items-center h-11 rounded-xl bg-secondary/40 px-4 text-sm text-muted-foreground">
                      {"@"}{apelido || "nao-definido"}
                    </div>
                  )}
                </div>

                {/* Email - read only */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 block">
                    Email
                  </label>
                  <div className="flex items-center h-11 rounded-xl bg-secondary/40 px-4 text-sm text-foreground">
                    {session?.email || "Nao informado"}
                    <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                  </div>
                </div>

                {/* Telefone - read only */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 block">
                    Telefone
                  </label>
                  <div className="flex items-center h-11 rounded-xl bg-secondary/40 px-4 text-sm text-muted-foreground">
                    Nao informado
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECURITY + PASSWORD ── */}
          <section className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
              <KeyRound className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Seguranca</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Change password */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alterar senha</p>
                  <div className="relative">
                    <Input
                      type={showOldPass ? "text" : "password"}
                      placeholder="Senha atual"
                      className="bg-secondary border-border rounded-xl h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showNewPass ? "text" : "password"}
                      placeholder="Nova senha"
                      className="bg-secondary border-border rounded-xl h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-10">
                    Alterar senha
                  </Button>
                </div>

                {/* 2FA */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Autenticacao 2FA</p>
                  <div className="flex-1 rounded-xl border border-dashed border-border bg-secondary/30 p-5 flex flex-col items-center justify-center text-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Proteja sua conta</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Adicione uma camada extra de seguranca com autenticacao de dois fatores</p>
                    </div>
                    <Badge variant="outline" className="rounded-md text-[10px] px-2 py-0.5 text-muted-foreground border-border">
                      Inativo
                    </Badge>
                    <Button variant="outline" className="rounded-xl border-border mt-1 gap-2">
                      Ativar 2FA
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── PREFERENCES ── */}
          <section className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
              <MousePointer className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Preferencias</h2>
            </div>
            <div className="divide-y divide-border">
              {/* Cursor */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <MousePointer className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Cursor personalizado</p>
                    <p className="text-xs text-muted-foreground">Usar cursor customizado na plataforma</p>
                  </div>
                </div>
                <Switch checked={cursorPersonalizado} onCheckedChange={setCursorPersonalizado} />
              </div>

              {/* Ranking */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <BarChart3 className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Mostrar no ranking</p>
                    <p className="text-xs text-muted-foreground">Exibir seu faturamento no ranking publico</p>
                  </div>
                </div>
                <Switch checked={mostrarRanking} onCheckedChange={setMostrarRanking} />
              </div>

              {/* Notificacoes */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <Bell className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Notificacoes push</p>
                    <p className="text-xs text-muted-foreground">Receber alertas de vendas em tempo real</p>
                  </div>
                </div>
                <Switch checked={notificacoesPush} onCheckedChange={setNotificacoesPush} />
              </div>
            </div>
          </section>

          {/* ── REWARDS / PREMIACOES ── */}
          <section className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
              <Gift className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Premiacoes</h2>
            </div>
            <div className="p-6">
              {/* Milestones track */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4">
                {milestones.map((m, i) => (
                  <div key={m.label} className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                        m.unlocked
                          ? "border-accent bg-accent/10"
                          : "border-border bg-secondary/50"
                      }`}>
                        {m.unlocked ? (
                          <Trophy className="h-5 w-5 text-accent" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase ${
                        m.unlocked ? "text-accent" : "text-muted-foreground/60"
                      }`}>
                        {m.label}
                      </span>
                    </div>
                    {i < milestones.length - 1 && (
                      <div className="h-0.5 w-6 bg-border rounded-full shrink-0 mt-[-18px]" />
                    )}
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="rounded-xl bg-secondary/40 p-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">Progresso atual</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{progressPercent.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2 bg-secondary mb-3" />
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Faturamento: </span>
                    <span className="font-bold text-foreground">R$ {faturamentoAtual.toLocaleString("pt-BR")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Proxima meta: </span>
                    <span className="font-bold text-accent">R$ {proximaMeta.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </ScrollArea>
    </>
  )
}
