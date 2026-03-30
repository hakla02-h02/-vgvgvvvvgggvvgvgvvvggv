"use client"

import { useState, useRef, useEffect, useCallback } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
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
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f7]">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-8 bg-[#f5f5f7] min-h-[calc(100vh-60px)]">
        <div className="max-w-3xl mx-auto">

          {/* ── PROFILE CARD - Dragon Style ── */}
          <section className="relative rounded-[20px] bg-[#1c1c1e] overflow-hidden mb-6">
            {/* Glow Effects */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center bottom, rgba(190, 255, 0, 0.12) 0%, transparent 70%)" }}
            />
            <div 
              className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
              style={{ background: "radial-gradient(circle at top right, rgba(59, 130, 246, 0.08) 0%, transparent 60%)" }}
            />

            <div className="relative p-6 md:p-8">
              <div className="flex flex-col items-center gap-4">
                {/* Avatar with premium ring */}
                <div className="relative group">
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#bfff00]/30 to-[#22c55e]/10 blur-md" />
                  <Avatar className="relative h-24 w-24 rounded-full ring-2 ring-[#bfff00]/40 ring-offset-4 ring-offset-[#1c1c1e]">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Avatar" className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-[#bfff00]/10 text-[#bfff00] text-3xl font-bold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                    aria-label="Trocar foto"
                  >
                    {avatarUploading ? (
                      <Loader2 className="h-5 w-5 text-[#bfff00] animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-[#bfff00]" />
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
                  <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-[#22c55e] border-3 border-[#1c1c1e]" />
                </div>

                {/* Name & email centered */}
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white">
                    {profile?.name || session?.name || "Usuario"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">{profile?.email || session?.email}</p>
                </div>

                {/* ID badge */}
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2a2a2e] border border-[#3a3a3e] hover:border-[#bfff00]/30 transition-colors group/id"
                >
                  <span className="text-xs font-mono text-gray-400 tracking-wider">ID: {accountId}</span>
                  {copiedId ? (
                    <Check className="h-3.5 w-3.5 text-[#bfff00]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-gray-500 group-hover/id:text-[#bfff00] transition-colors" />
                  )}
                </button>
              </div>

              {/* Stats row - horizontal pills */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2a2a2e] border border-[#3a3a3e]">
                  <CalendarDays className="h-4 w-4 text-[#bfff00]" />
                  <span className="text-xs text-gray-500">Desde</span>
                  <span className="text-xs font-semibold text-white">{memberSince}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2a2a2e] border border-[#3a3a3e]">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-500">Acesso</span>
                  <span className="text-xs font-semibold text-white">{lastAccess}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#bfff00]/10 border border-[#bfff00]/20">
                  <DollarSign className="h-4 w-4 text-[#bfff00]" />
                  <span className="text-xs text-gray-500">Taxa</span>
                  <span className="text-xs font-bold text-[#bfff00]">R$ 0,50</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECTION NAVIGATION TABS - Dragon Style ── */}
          <div className="flex items-center gap-1 p-1.5 rounded-xl bg-[#1c1c1e] border border-[#2a2a2e] mb-6">
            {[
              { id: "perfil" as const, label: "Dados Pessoais", icon: User },
              { id: "seguranca" as const, label: "Seguranca", icon: Shield },
              { id: "premiacoes" as const, label: "Premiacoes", icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === tab.id
                    ? "bg-[#bfff00] text-black shadow-lg shadow-[#bfff00]/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── PERSONAL INFO SECTION ── */}
          {activeSection === "perfil" && (
            <section className="rounded-[20px] bg-[#1c1c1e] overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              {/* Header with inline edit toggle */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a2e]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#bfff00]/10">
                    <User className="h-5 w-5 text-[#bfff00]" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Informacoes Pessoais</h2>
                </div>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    editMode
                      ? "bg-[#bfff00] text-black hover:bg-[#d4ff4d]"
                      : "bg-[#2a2a2e] text-gray-400 hover:text-white hover:bg-[#3a3a3e]"
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
                </button>
              </div>

              <div className="p-5">
                {saveMsg && (
                  <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
                    saveMsg.type === "success"
                      ? "bg-[#bfff00]/10 text-[#bfff00] border border-[#bfff00]/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {saveMsg.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : null}
                    {saveMsg.text}
                  </div>
                )}

                {/* Stacked list layout */}
                <div className="flex flex-col divide-y divide-[#2a2a2e]">
                  {/* Nome */}
                  <div className="flex items-center gap-4 py-4 first:pt-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#2a2a2e] shrink-0">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-500 font-medium mb-1">Nome</p>
                      {editMode ? (
                        <Input
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="bg-[#2a2a2e] border-[#3a3a3e] rounded-lg h-10 text-sm text-white placeholder:text-gray-500 focus:border-[#bfff00]/50 focus:ring-[#bfff00]/20"
                        />
                      ) : (
                        <p className="text-sm font-medium text-white truncate">{profile?.name || "Nao informado"}</p>
                      )}
                    </div>
                    {!editMode && (
                      <ChevronRight className="h-4 w-4 text-gray-600 shrink-0" />
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-4 py-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#2a2a2e] shrink-0">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-500 font-medium mb-1">Email</p>
                      <p className="text-sm font-medium text-white truncate">{profile?.email || session?.email || "Nao informado"}</p>
                    </div>
                    <Lock className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                  </div>

                  {/* Telefone */}
                  <div className="flex items-center gap-4 py-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#2a2a2e] shrink-0">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-500 font-medium mb-1">Telefone</p>
                      <p className="text-sm font-medium text-white truncate">{profile?.phone || "Nao informado"}</p>
                    </div>
                    <Lock className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                  </div>

                  {/* Conta criada */}
                  <div className="flex items-center gap-4 py-4 last:pb-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#2a2a2e] shrink-0">
                      <CalendarDays className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-500 font-medium mb-1">Conta criada em</p>
                      <p className="text-sm font-medium text-white">
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
            <section className="rounded-[20px] bg-[#1c1c1e] overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-[#2a2a2e]">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#bfff00]/10">
                  <KeyRound className="h-5 w-5 text-[#bfff00]" />
                </div>
                <h2 className="text-base font-semibold text-white">Alterar Senha</h2>
              </div>
              <div className="p-6">
                {passMsg && (
                  <div className={`mb-5 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                    passMsg.type === "success"
                      ? "bg-[#bfff00]/10 text-[#bfff00] border border-[#bfff00]/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {passMsg.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : null}
                    {passMsg.text}
                  </div>
                )}

                <div className="flex flex-col gap-5 max-w-md">
                  {/* Current password */}
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-2 block">Senha atual</label>
                    <div className="relative">
                      <Input
                        type={showOldPass ? "text" : "password"}
                        placeholder="Digite sua senha atual"
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        className="bg-[#2a2a2e] border-[#3a3a3e] rounded-xl h-12 pr-12 text-sm text-white placeholder:text-gray-500 focus:border-[#bfff00]/50 focus:ring-[#bfff00]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-2 block">Nova senha</label>
                    <div className="relative">
                      <Input
                        type={showNewPass ? "text" : "password"}
                        placeholder="Minimo 6 caracteres"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="bg-[#2a2a2e] border-[#3a3a3e] rounded-xl h-12 pr-12 text-sm text-white placeholder:text-gray-500 focus:border-[#bfff00]/50 focus:ring-[#bfff00]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Password strength hint */}
                    {newPass.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              newPass.length >= i * 3
                                ? newPass.length >= 9
                                  ? "bg-[#bfff00]"
                                  : newPass.length >= 6
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                                : "bg-[#3a3a3e]"
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-gray-500 ml-2">
                          {newPass.length < 6 ? "Fraca" : newPass.length < 9 ? "Media" : "Forte"}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={passLoading || !oldPass || !newPass}
                    className="w-full flex items-center justify-center gap-2 bg-[#bfff00] text-black hover:bg-[#d4ff4d] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl h-12 text-sm font-semibold transition-colors"
                  >
                    {passLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    Alterar senha
                  </button>
                </div>
              </div>

              {/* Logout inside security */}
              <div className="border-t border-[#2a2a2e] px-6 py-5">
                <button
                  onClick={logout}
                  className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group"
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Sair da conta</p>
                    <p className="text-xs text-gray-500">Encerrar sua sessao atual</p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </button>
              </div>
            </section>
          )}

          {/* ── REWARDS / PREMIACOES ── */}
          {activeSection === "premiacoes" && (
            <section className="rounded-[20px] bg-[#1c1c1e] overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-[#2a2a2e]">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#bfff00]/10">
                  <Gift className="h-5 w-5 text-[#bfff00]" />
                </div>
                <h2 className="text-base font-semibold text-white">Premiacoes</h2>
              </div>
              <div className="p-6">
                {/* Milestone timeline - vertical */}
                <div className="flex flex-col gap-0">
                  {milestones.map((m, i) => {
                    const unlocked = faturamentoAtual >= m.value
                    const isNext = i === currentMilestoneIdx
                    return (
                      <div key={m.label} className="flex items-start gap-4">
                        {/* Vertical line + circle */}
                        <div className="flex flex-col items-center">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all ${
                            unlocked
                              ? "border-[#bfff00] bg-[#bfff00]/10 shadow-lg shadow-[#bfff00]/20"
                              : isNext
                                ? "border-[#bfff00]/40 bg-[#bfff00]/5"
                                : "border-[#3a3a3e] bg-[#2a2a2e]"
                          }`}>
                            {unlocked ? (
                              <Trophy className="h-5 w-5 text-[#bfff00]" />
                            ) : (
                              <Lock className={`h-4 w-4 ${isNext ? "text-[#bfff00]/50" : "text-gray-600"}`} />
                            )}
                          </div>
                          {i < milestones.length - 1 && (
                            <div className={`w-0.5 h-8 rounded-full my-1.5 ${
                              unlocked ? "bg-[#bfff00]/40" : "bg-[#3a3a3e]"
                            }`} />
                          )}
                        </div>

                        {/* Label */}
                        <div className="pt-3">
                          <p className={`text-base font-bold ${
                            unlocked ? "text-[#bfff00]" : isNext ? "text-white" : "text-gray-600"
                          }`}>
                            {m.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {unlocked ? "Desbloqueado" : isNext ? "Proxima meta" : "Bloqueado"}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Progress card */}
                <div className="relative rounded-xl bg-[#2a2a2e] border border-[#3a3a3e] p-5 mt-6 overflow-hidden">
                  {/* Glow */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at center bottom, rgba(190, 255, 0, 0.1) 0%, transparent 70%)" }}
                  />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-[#bfff00]" />
                        <span className="text-sm font-medium text-white">Progresso atual</span>
                      </div>
                      <span className="text-sm font-bold text-[#bfff00] bg-[#bfff00]/10 px-3 py-1 rounded-full">
                        {progressPercent.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2 bg-[#3a3a3e] mb-4 [&>div]:bg-[#bfff00]" />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Faturamento:</span>
                        <span className="font-bold text-white">R$ {faturamentoAtual.toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Meta:</span>
                        <span className="font-bold text-[#bfff00]">R$ {proximaMeta.toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </ScrollArea>
  )
}
