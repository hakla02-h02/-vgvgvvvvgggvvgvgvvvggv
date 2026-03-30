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
  Award,
  Zap,
  Crown,
  Star,
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
  { label: "R$ 10K", value: 10000, icon: Award, color: "#bfff00" },
  { label: "R$ 100K", value: 100000, icon: Zap, color: "#3b82f6" },
  { label: "R$ 500K", value: 500000, icon: Crown, color: "#f59e0b" },
  { label: "R$ 1M", value: 1000000, icon: Star, color: "#ec4899" },
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
        <Loader2 className="h-6 w-6 animate-spin text-[#bfff00]" />
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="min-h-[calc(100vh-60px)] bg-[#f5f5f7]">
        <div className="max-w-4xl mx-auto p-4 md:p-8">

          {/* ══════════════════════════════════════════════════════════════════
              PROFILE HEADER CARD - Premium Design
          ══════════════════════════════════════════════════════════════════ */}
          <section className="relative rounded-[24px] bg-gradient-to-b from-[#1a1a1c] to-[#141416] border border-[#2a2a2e] overflow-hidden mb-8">
            {/* Glow Effects */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center top, rgba(190, 255, 0, 0.08) 0%, transparent 70%)" }}
            />
            <div 
              className="absolute bottom-0 right-0 w-[300px] h-[200px] pointer-events-none"
              style={{ background: "radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.06) 0%, transparent 60%)" }}
            />

            <div className="relative p-8 md:p-10">
              <div className="flex flex-col items-center gap-5">
                {/* Avatar with animated ring */}
                <div className="relative group">
                  <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-[#bfff00]/20 via-[#22c55e]/10 to-[#3b82f6]/10 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#bfff00] via-[#22c55e] to-[#bfff00] opacity-20" />
                  <Avatar className="relative h-28 w-28 rounded-full ring-[3px] ring-[#bfff00]/50 ring-offset-4 ring-offset-[#141416]">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Avatar" className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-[#bfff00]/20 to-[#22c55e]/10 text-[#bfff00] text-4xl font-bold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                    aria-label="Trocar foto"
                  >
                    {avatarUploading ? (
                      <Loader2 className="h-6 w-6 text-[#bfff00] animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-[#bfff00]" />
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
                  <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-[#22c55e] border-[3px] border-[#141416] shadow-lg shadow-[#22c55e]/30" />
                </div>

                {/* Name & email */}
                <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {profile?.name || session?.name || "Usuario"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1.5">{profile?.email || session?.email}</p>
                </div>

                {/* ID badge - Premium style */}
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#1a1a1c] border border-[#2a2a2e] hover:border-[#bfff00]/40 hover:bg-[#1f1f21] transition-all duration-200 group/id"
                >
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">ID</span>
                  <span className="text-xs font-mono text-gray-300 tracking-wider">{accountId}</span>
                  {copiedId ? (
                    <Check className="h-3.5 w-3.5 text-[#bfff00]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-gray-600 group-hover/id:text-[#bfff00] transition-colors" />
                  )}
                </button>
              </div>

              {/* Stats row - Premium badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#22c55e]/20">
                    <CalendarDays className="h-4 w-4 text-[#22c55e]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Desde</span>
                    <span className="text-sm font-bold text-white">{memberSince}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/30">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#3b82f6]/20">
                    <Clock className="h-4 w-4 text-[#3b82f6]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Acesso</span>
                    <span className="text-sm font-bold text-white">{lastAccess}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-[#bfff00]/15 border border-[#bfff00]/40">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#bfff00]/25">
                    <DollarSign className="h-4 w-4 text-[#bfff00]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Taxa</span>
                    <span className="text-sm font-extrabold text-[#bfff00]">R$ 0,50</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              NAVIGATION TABS
          ══════════════════════════════════════════════════════════════════ */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#141416] border border-[#2a2a2e] mb-6">
            {[
              { id: "perfil" as const, label: "Dados Pessoais", icon: User },
              { id: "seguranca" as const, label: "Seguranca", icon: Shield },
              { id: "premiacoes" as const, label: "Premiacoes", icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeSection === tab.id
                    ? "bg-[#bfff00] text-black shadow-lg shadow-[#bfff00]/25"
                    : "text-gray-500 hover:text-white hover:bg-[#1a1a1c]"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              PERSONAL INFO SECTION
          ══════════════════════════════════════════════════════════════════ */}
          {activeSection === "perfil" && (
            <section className="rounded-[24px] bg-white border border-gray-200 shadow-sm overflow-hidden animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Informacoes Pessoais</h2>
                <button
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    editMode
                      ? "bg-[#bfff00] text-black hover:bg-[#d4ff4d] shadow-lg shadow-[#bfff00]/20"
                      : "bg-gray-100 text-gray-700 hover:text-gray-900 hover:bg-gray-200 border border-gray-200"
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
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : editMode ? (
                    <Save className="h-3.5 w-3.5" />
                  ) : (
                    <Pencil className="h-3.5 w-3.5" />
                  )}
                  {editMode ? "Salvar" : "Editar"}
                </button>
              </div>

              <div className="p-6">
                {saveMsg && (
                  <div className={`mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                    saveMsg.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    {saveMsg.type === "success" && <Check className="h-4 w-4 shrink-0" />}
                    {saveMsg.text}
                  </div>
                )}

                {/* Info list - clean and simple */}
                <div className="divide-y divide-gray-100">
                  {/* Nome */}
                  <div className="py-4 first:pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Nome</p>
                        {editMode ? (
                          <Input
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="bg-gray-50 border-gray-200 rounded-lg h-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#bfff00] focus:ring-[#bfff00]/20 max-w-sm"
                          />
                        ) : (
                          <p className="text-sm font-medium text-gray-900">{profile?.name || "Nao informado"}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-medium text-gray-900">{profile?.email || session?.email || "Nao informado"}</p>
                      </div>
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Telefone</p>
                        <p className="text-sm font-medium text-gray-900">{profile?.phone || "Nao informado"}</p>
                      </div>
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Conta criada */}
                  <div className="py-4 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Conta criada em</p>
                        <p className="text-sm font-medium text-gray-900">
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
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECURITY SECTION
          ══════════════════════════════════════════════════════════════════ */}
          {activeSection === "seguranca" && (
            <section className="rounded-[24px] bg-white border border-gray-200 shadow-sm overflow-hidden animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Alterar Senha</h2>
              </div>

              <div className="p-6">
                {passMsg && (
                  <div className={`mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                    passMsg.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    {passMsg.type === "success" && <Check className="h-4 w-4 shrink-0" />}
                    {passMsg.text}
                  </div>
                )}

                <div className="space-y-5">
                  {/* Current password */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Senha atual</label>
                    <div className="relative">
                      <Input
                        type={showOldPass ? "text" : "password"}
                        placeholder="Digite sua senha atual"
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        className="bg-gray-50 border-gray-200 rounded-xl h-14 pr-14 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#bfff00] focus:ring-[#bfff00]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                      >
                        {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nova senha</label>
                    <div className="relative">
                      <Input
                        type={showNewPass ? "text" : "password"}
                        placeholder="Minimo 6 caracteres"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="bg-gray-50 border-gray-200 rounded-xl h-14 pr-14 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#bfff00] focus:ring-[#bfff00]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                      >
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Password strength */}
                    {newPass.length > 0 && (
                      <div className="flex items-center gap-2 pt-2">
                        <div className="flex-1 flex gap-1.5">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                newPass.length >= i * 3
                                  ? newPass.length >= 9
                                    ? "bg-[#22c55e]"
                                    : newPass.length >= 6
                                      ? "bg-amber-400"
                                      : "bg-red-400"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                          newPass.length >= 9 ? "text-[#22c55e]" : newPass.length >= 6 ? "text-amber-500" : "text-red-500"
                        }`}>
                          {newPass.length < 6 ? "Fraca" : newPass.length < 9 ? "Media" : "Forte"}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={passLoading || !oldPass || !newPass || newPass.length < 6}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#bfff00] text-black hover:bg-[#d4ff4d] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl h-14 text-sm font-bold transition-all duration-200 shadow-lg shadow-[#bfff00]/20 disabled:shadow-none"
                  >
                    {passLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    Alterar senha
                  </button>
                </div>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 p-6">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Sair da conta</span>
                </button>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              REWARDS / PREMIACOES SECTION
          ══════════════════════════════════════════════════════════════════ */}
          {activeSection === "premiacoes" && (
            <section className="rounded-[24px] bg-white border border-gray-200 shadow-sm overflow-hidden animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Premiacoes</h2>
              </div>

              <div className="p-6">
                {/* Timeline vertical - clean */}
                <div className="space-y-4 mb-8">
                  {milestones.map((m, i) => {
                    const unlocked = faturamentoAtual >= m.value
                    const isNext = i === currentMilestoneIdx
                    
                    return (
                      <div key={m.label} className="flex items-center gap-4">
                        <div className={`flex items-center justify-center h-10 w-10 rounded-xl border-2 ${
                          unlocked 
                            ? "border-[#22c55e] bg-[#22c55e]/10" 
                            : isNext
                              ? "border-[#bfff00]/50 bg-[#bfff00]/5"
                              : "border-gray-200 bg-gray-50"
                        }`}>
                          {unlocked ? (
                            <Trophy className="h-4 w-4 text-[#22c55e]" />
                          ) : (
                            <Lock className={`h-4 w-4 ${isNext ? "text-gray-400" : "text-gray-300"}`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${
                            unlocked ? "text-[#22c55e]" : isNext ? "text-gray-900" : "text-gray-400"
                          }`}>
                            {m.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {unlocked ? "Conquistado" : isNext ? "Proxima meta" : "Bloqueado"}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Progress bar */}
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-900 font-medium">Progresso atual</span>
                    <span className="text-sm font-bold text-[#22c55e]">{progressPercent.toFixed(0)}%</span>
                  </div>
                  
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#22c55e] rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Faturamento: <span className="text-gray-900 font-medium">R$ {faturamentoAtual.toLocaleString("pt-BR")}</span>
                    </span>
                    <span className="text-gray-500">
                      Meta: <span className="text-[#22c55e] font-bold">R$ {proximaMeta.toLocaleString("pt-BR")}</span>
                    </span>
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
