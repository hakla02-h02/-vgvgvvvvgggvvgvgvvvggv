"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Gift,
  Target,
  KeyRound,
  Loader2,
  User,
  Mail,
  Phone,
  LogOut,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar_url: string | null
  created_at: string
}

const milestones = [
  { label: "R$ 10K", value: 10000 },
  { label: "R$ 100K", value: 100000 },
  { label: "R$ 500K", value: 500000 },
  { label: "R$ 1M", value: 1000000 },
]

export default function SettingsPage() {
  const { session, logout } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nome, setNome] = useState("")
  const [copiedId, setCopiedId] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password state
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [oldPass, setOldPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Save message
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Active section for mobile tab-like navigation
  const [activeSection, setActiveSection] = useState<"perfil" | "seguranca" | "premiacoes">("perfil")

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!session?.userId) return
    try {
      const res = await fetch(`/api/profile?userId=${session.userId}`)
      const data = await res.json()
      if (res.ok) {
        setProfile(data)
        setNome(data.name || "")
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [session?.userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session?.userId) return

    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", session.userId)

      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData })
      const data = await res.json()

      if (res.ok && data.url) {
        const newUrl = data.url + "?t=" + Date.now()
        setProfile((prev) => prev ? { ...prev, avatar_url: newUrl } : prev)
      }
    } catch {
      // silent
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!session?.userId) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.userId, name: nome }),
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setEditMode(false)
        setSaveMsg({ type: "success", text: "Perfil atualizado" })
        setTimeout(() => setSaveMsg(null), 3000)
      } else {
        const err = await res.json()
        setSaveMsg({ type: "error", text: err.error || "Erro ao salvar" })
      }
    } catch {
      setSaveMsg({ type: "error", text: "Erro ao salvar" })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!session?.email) return
    setPassLoading(true)
    setPassMsg(null)
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.email,
          currentPassword: oldPass,
          newPassword: newPass,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setPassMsg({ type: "success", text: "Senha alterada com sucesso" })
        setOldPass("")
        setNewPass("")
      } else {
        setPassMsg({ type: "error", text: data.error || "Erro ao alterar" })
      }
    } catch {
      setPassMsg({ type: "error", text: "Erro ao alterar senha" })
    } finally {
      setPassLoading(false)
      setTimeout(() => setPassMsg(null), 4000)
    }
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(session?.userId || "")
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const userInitial = profile?.name
    ? profile.name.charAt(0).toUpperCase()
    : session?.email
      ? session.email.charAt(0).toUpperCase()
      : "U"

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "---"

  const lastAccess = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
  const accountId = session?.userId?.slice(0, 12) || "000000000000"

  // Rewards
  const faturamentoAtual = 0
  const currentMilestoneIdx = milestones.findIndex((m) => faturamentoAtual < m.value)
  const proximaMeta = currentMilestoneIdx >= 0 ? milestones[currentMilestoneIdx].value : milestones[milestones.length - 1].value
  const progressPercent = Math.min(100, (faturamentoAtual / proximaMeta) * 100)

  if (loading) {
    return (
      <>
        <DashboardHeader title="Meu Perfil" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Meu Perfil" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-5 p-4 md:p-6 max-w-5xl mx-auto w-full">

          {/* ── PROFILE CARD - Left aligned avatar with floating stats ── */}
          <section className="relative rounded-2xl border border-border bg-card overflow-hidden">
            {/* Subtle geometric pattern background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--accent)) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }} />

            <div className="relative p-6">
              <div className="flex flex-col items-center gap-4">
                {/* Avatar with status ring */}
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-accent/40 to-accent/10 blur-sm" />
                  <Avatar className="relative h-20 w-20 rounded-full ring-2 ring-accent/20 ring-offset-2 ring-offset-card">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Avatar" className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-accent/10 text-accent text-2xl font-bold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                    aria-label="Trocar foto"
                  >
                    {avatarUploading ? (
                      <Loader2 className="h-5 w-5 text-accent animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-accent" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent border-2 border-card" />
                </div>

                {/* Name & email centered */}
                <div className="text-center">
                  <h1 className="text-xl font-bold text-foreground">
                    {profile?.name || session?.name || "Usuario"}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">{profile?.email || session?.email}</p>
                </div>

                {/* ID badge */}
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/50 hover:border-accent/30 transition-colors group/id"
                >
                  <span className="text-[10px] font-mono text-muted-foreground tracking-wider">ID: {accountId}</span>
                  {copiedId ? (
                    <Check className="h-3 w-3 text-accent" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground group-hover/id:text-accent transition-colors" />
                  )}
                </button>
              </div>

              {/* Stats row - horizontal pills */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/40">
                  <CalendarDays className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs text-muted-foreground">Desde</span>
                  <span className="text-xs font-semibold text-foreground">{memberSince}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/40">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs text-muted-foreground">Acesso</span>
                  <span className="text-xs font-semibold text-foreground">{lastAccess}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                  <DollarSign className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs text-muted-foreground">Taxa</span>
                  <span className="text-xs font-bold text-accent">R$ 0,50</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECTION NAVIGATION TABS ── */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/40 border border-border/50">
            {[
              { id: "perfil" as const, label: "Dados Pessoais", icon: User },
              { id: "seguranca" as const, label: "Seguranca", icon: Shield },
              { id: "premiacoes" as const, label: "Premiacoes", icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeSection === tab.id
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── PERSONAL INFO SECTION ── */}
          {activeSection === "perfil" && (
            <section className="rounded-2xl border border-border bg-card overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              {/* Header with inline edit toggle */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-accent/10">
                    <User className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">Informacoes Pessoais</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-lg gap-2 text-xs h-8 px-3 transition-all ${
                    editMode
                      ? "bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => {
                    if (editMode) {
                      handleSaveProfile()
                    } else {
                      setEditMode(true)
                    }
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : editMode ? (
                    <Save className="h-3 w-3" />
                  ) : (
                    <Pencil className="h-3 w-3" />
                  )}
                  {editMode ? "Salvar" : "Editar"}
                </Button>
              </div>

              <div className="p-5">
                {saveMsg && (
                  <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
                    saveMsg.type === "success"
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}>
                    {saveMsg.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : null}
                    {saveMsg.text}
                  </div>
                )}

                {/* Stacked list layout */}
                <div className="flex flex-col divide-y divide-border/40">
                  {/* Nome */}
                  <div className="flex items-center gap-4 py-3.5 first:pt-0">
                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-secondary/60 shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Nome</p>
                      {editMode ? (
                        <Input
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="bg-secondary/60 border-border/50 rounded-lg h-9 text-sm"
                        />
                      ) : (
                        <p className="text-sm font-medium text-foreground truncate">{profile?.name || "Nao informado"}</p>
                      )}
                    </div>
                    {!editMode && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-4 py-3.5">
                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-secondary/60 shrink-0">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Email</p>
                      <p className="text-sm font-medium text-foreground truncate">{profile?.email || session?.email || "Nao informado"}</p>
                    </div>
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                  </div>

                  {/* Telefone */}
                  <div className="flex items-center gap-4 py-3.5">
                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-secondary/60 shrink-0">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Telefone</p>
                      <p className="text-sm font-medium text-foreground truncate">{profile?.phone || "Nao informado"}</p>
                    </div>
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                  </div>

                  {/* Conta criada */}
                  <div className="flex items-center gap-4 py-3.5 last:pb-0">
                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-secondary/60 shrink-0">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Conta criada em</p>
                      <p className="text-sm font-medium text-foreground">
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "---"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── SECURITY SECTION ── */}
          {activeSection === "seguranca" && (
            <section className="rounded-2xl border border-border bg-card overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/50">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-accent/10">
                  <KeyRound className="h-3.5 w-3.5 text-accent" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">Alterar Senha</h2>
              </div>
              <div className="p-5">
                {passMsg && (
                  <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
                    passMsg.type === "success"
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}>
                    {passMsg.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : null}
                    {passMsg.text}
                  </div>
                )}

                <div className="flex flex-col gap-4 max-w-md">
                  {/* Current password */}
                  <div>
                    <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Senha atual</label>
                    <div className="relative">
                      <Input
                        type={showOldPass ? "text" : "password"}
                        placeholder="Digite sua senha atual"
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        className="bg-secondary/60 border-border/50 rounded-lg h-10 pr-10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div>
                    <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Nova senha</label>
                    <div className="relative">
                      <Input
                        type={showNewPass ? "text" : "password"}
                        placeholder="Minimo 6 caracteres"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="bg-secondary/60 border-border/50 rounded-lg h-10 pr-10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Password strength hint */}
                    {newPass.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              newPass.length >= i * 3
                                ? newPass.length >= 9
                                  ? "bg-accent"
                                  : newPass.length >= 6
                                    ? "bg-warning"
                                    : "bg-destructive"
                                : "bg-secondary"
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-1">
                          {newPass.length < 6 ? "Fraca" : newPass.length < 9 ? "Media" : "Forte"}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={passLoading || !oldPass || !newPass}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg h-10 text-sm font-medium"
                  >
                    {passLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
                    Alterar senha
                  </Button>
                </div>
              </div>

              {/* Logout inside security */}
              <div className="border-t border-border/50 px-5 py-4">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-destructive/80 hover:text-destructive hover:bg-destructive/5 transition-all group"
                >
                  <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-destructive/10 group-hover:bg-destructive/15 transition-colors">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Sair da conta</p>
                    <p className="text-[11px] text-muted-foreground">Encerrar sua sessao atual</p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </button>
              </div>
            </section>
          )}

          {/* ── REWARDS / PREMIACOES ── */}
          {activeSection === "premiacoes" && (
            <section className="rounded-2xl border border-border bg-card overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/50">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-accent/10">
                  <Gift className="h-3.5 w-3.5 text-accent" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">Premiacoes</h2>
              </div>
              <div className="p-5">
                {/* Milestone timeline - vertical */}
                <div className="flex flex-col gap-0">
                  {milestones.map((m, i) => {
                    const unlocked = faturamentoAtual >= m.value
                    const isNext = i === currentMilestoneIdx
                    return (
                      <div key={m.label} className="flex items-start gap-3.5">
                        {/* Vertical line + circle */}
                        <div className="flex flex-col items-center">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                            unlocked
                              ? "border-accent bg-accent/10 shadow-sm shadow-accent/10"
                              : isNext
                                ? "border-accent/30 bg-accent/5"
                                : "border-border bg-secondary/30"
                          }`}>
                            {unlocked ? (
                              <Trophy className="h-4 w-4 text-accent" />
                            ) : (
                              <Lock className={`h-3.5 w-3.5 ${isNext ? "text-accent/50" : "text-muted-foreground/40"}`} />
                            )}
                          </div>
                          {i < milestones.length - 1 && (
                            <div className={`w-0.5 h-6 rounded-full my-1 ${
                              unlocked ? "bg-accent/30" : "bg-border"
                            }`} />
                          )}
                        </div>

                        {/* Label */}
                        <div className="pt-2">
                          <p className={`text-sm font-bold ${
                            unlocked ? "text-accent" : isNext ? "text-foreground" : "text-muted-foreground/60"
                          }`}>
                            {m.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {unlocked ? "Desbloqueado" : isNext ? "Proxima meta" : "Bloqueado"}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Progress card */}
                <div className="rounded-xl bg-secondary/30 border border-border/40 p-4 mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">Progresso atual</span>
                    </div>
                    <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                      {progressPercent.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-1.5 bg-secondary mb-3" />
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Faturamento:</span>
                      <span className="font-bold text-foreground">R$ {faturamentoAtual.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Meta:</span>
                      <span className="font-bold text-accent">R$ {proximaMeta.toLocaleString("pt-BR")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </ScrollArea>
    </>
  )
}
