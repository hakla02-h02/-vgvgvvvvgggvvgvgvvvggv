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

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!session?.userId) return
    try {
      const res = await fetch(`/api/profile?userId=${session.userId}`)
      const data = await res.json()
      console.log("[v0] Profile fetched:", res.status, data)
      if (res.ok) {
        setProfile(data)
        setNome(data.name || "")
      }
    } catch (err) {
      console.error("[v0] Profile fetch error:", err)
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

      console.log("[v0] Avatar upload response:", res.status, data)
      if (res.ok && data.url) {
        const newUrl = data.url + "?t=" + Date.now()
        console.log("[v0] Setting avatar_url to:", newUrl)
        setProfile((prev) => prev ? { ...prev, avatar_url: newUrl } : prev)
      } else {
        console.error("[v0] Avatar upload failed:", data.error)
      }
    } catch (err) {
      console.error("[v0] Avatar upload error:", err)
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
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">

          {/* ── PROFILE HERO ── */}
          <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
            <div className="h-24 bg-gradient-to-r from-accent/20 via-accent/5 to-transparent" />

            <div className="px-6 pb-6 -mt-12">
              <div className="flex flex-col md:flex-row md:items-end gap-5">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <Avatar className="h-24 w-24 rounded-2xl ring-4 ring-card shadow-xl">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Avatar" className="rounded-2xl object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-accent text-accent-foreground text-3xl font-bold rounded-2xl">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/70 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Trocar foto"
                  >
                    {avatarUploading ? (
                      <Loader2 className="h-6 w-6 text-foreground animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-foreground" />
                    )}
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
                    {profile?.name || session?.name || "Usuario"}
                  </h1>
                  <p className="text-sm text-muted-foreground truncate">{profile?.email || session?.email}</p>
                </div>
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
                <User className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Informacoes Pessoais</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl gap-2 text-muted-foreground hover:text-foreground"
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
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : editMode ? (
                  <Save className="h-3.5 w-3.5" />
                ) : (
                  <Pencil className="h-3.5 w-3.5" />
                )}
                {editMode ? "Salvar" : "Editar"}
              </Button>
            </div>
            <div className="p-6">
              {saveMsg && (
                <div className={`mb-4 rounded-xl px-4 py-2.5 text-sm ${
                  saveMsg.type === "success"
                    ? "bg-accent/10 text-accent"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {saveMsg.text}
                </div>
              )}
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
                    <div className="flex items-center gap-3 h-11 rounded-xl bg-secondary/40 px-4 text-sm text-foreground">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {profile?.name || "Nao informado"}
                    </div>
                  )}
                </div>

                {/* Email - read only */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 block">
                    Email
                  </label>
                  <div className="flex items-center gap-3 h-11 rounded-xl bg-secondary/40 px-4 text-sm text-foreground">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate flex-1">{profile?.email || session?.email || "Nao informado"}</span>
                    <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </div>
                </div>

                {/* Telefone - read only (from registration) */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 block">
                    Telefone
                  </label>
                  <div className="flex items-center gap-3 h-11 rounded-xl bg-secondary/40 px-4 text-sm text-foreground">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate flex-1">{profile?.phone || "Nao informado"}</span>
                    <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </div>
                </div>

                {/* Conta criada */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 block">
                    Conta criada em
                  </label>
                  <div className="flex items-center gap-3 h-11 rounded-xl bg-secondary/40 px-4 text-sm text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "---"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECURITY ── */}
          <section className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
              <KeyRound className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Alterar Senha</h2>
            </div>
            <div className="p-6">
              {passMsg && (
                <div className={`mb-4 rounded-xl px-4 py-2.5 text-sm ${
                  passMsg.type === "success"
                    ? "bg-accent/10 text-accent"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {passMsg.text}
                </div>
              )}
              <div className="flex flex-col gap-3 max-w-md">
                <div className="relative">
                  <Input
                    type={showOldPass ? "text" : "password"}
                    placeholder="Senha atual"
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
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
                    placeholder="Nova senha (min 6 caracteres)"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
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
                <Button
                  onClick={handleChangePassword}
                  disabled={passLoading || !oldPass || !newPass}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-10"
                >
                  {passLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Alterar senha
                </Button>
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
              {/* Milestones */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
                {milestones.map((m, i) => {
                  const unlocked = faturamentoAtual >= m.value
                  return (
                    <div key={m.label} className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors ${
                          unlocked
                            ? "border-accent bg-accent/10"
                            : "border-border bg-secondary/50"
                        }`}>
                          {unlocked ? (
                            <Trophy className="h-5 w-5 text-accent" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground/50" />
                          )}
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${
                          unlocked ? "text-accent" : "text-muted-foreground/60"
                        }`}>
                          {m.label}
                        </span>
                      </div>
                      {i < milestones.length - 1 && (
                        <div className="h-0.5 w-8 bg-border rounded-full shrink-0 mt-[-18px]" />
                      )}
                    </div>
                  )
                })}
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
                    <span className="font-bold text-accent">+R$ {proximaMeta.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── LOGOUT ── */}
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive h-12 gap-3 font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>

        </div>
      </ScrollArea>
    </>
  )
}
