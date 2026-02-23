"use client"

import { useState, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import {
  User,
  Mail,
  Phone,
  AtSign,
  CalendarDays,
  Clock,
  Hash,
  Camera,
  Pencil,
  Save,
  Lock,
  Eye,
  EyeOff,
  Shield,
  MousePointer,
  BarChart3,
  Bell,
  Trophy,
  Lock as LockIcon,
  DollarSign,
} from "lucide-react"

const metas = [
  { nome: "META 1", valor: 1000, icon: LockIcon },
  { nome: "META 2", valor: 5000, icon: LockIcon },
  { nome: "META 3", valor: 10000, icon: LockIcon },
  { nome: "META 4", valor: 25000, icon: LockIcon },
  { nome: "META 5", valor: 50000, icon: LockIcon },
]

export default function SettingsPage() {
  const { session } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nome, setNome] = useState(session?.name || "")
  const [apelido, setApelido] = useState(session?.email?.split("@")[0] || "")

  const [cursorPersonalizado, setCursorPersonalizado] = useState(false)
  const [mostrarRanking, setMostrarRanking] = useState(false)
  const [notificacoesPush, setNotificacoesPush] = useState(false)

  const memberSince = session?.loggedInAt
    ? new Date(session.loggedInAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : "fev. 2026"

  const lastAccess = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
  const accountId = session?.userId?.slice(0, 8) || "000000"

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const userInitial = session?.name
    ? session.name.charAt(0).toUpperCase()
    : session?.email
      ? session.email.charAt(0).toUpperCase()
      : "U"

  return (
    <>
      <DashboardHeader title="Meu Perfil" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          {/* Page description */}
          <div>
            <p className="text-sm text-muted-foreground border-l-2 border-accent pl-3">
              Gerencie suas informacoes pessoais e visualize seu progresso no sistema
            </p>
          </div>

          {/* Top row: Profile card + Transaction fee */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            {/* Profile card - takes 2 cols */}
            <Card className="bg-card border-border rounded-2xl lg:col-span-2">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-col gap-5">
                  {/* Avatar + info row */}
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="relative group">
                      <Avatar className="h-16 w-16 md:h-20 md:w-20 rounded-full ring-2 ring-accent ring-offset-2 ring-offset-card">
                        {avatarPreview ? (
                          <AvatarImage src={avatarPreview} alt="Avatar" />
                        ) : null}
                        <AvatarFallback className="bg-accent text-accent-foreground text-xl md:text-2xl font-bold rounded-full">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Trocar foto"
                      >
                        <Camera className="h-5 w-5 text-foreground" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg md:text-xl font-bold text-foreground">
                        {session?.name || "Usuario"}
                      </h2>
                      <p className="text-sm text-muted-foreground">{session?.email}</p>
                      <Badge className="w-fit mt-1 rounded-lg bg-warning/15 text-warning border-warning/30 text-xs font-semibold">
                        <Trophy className="h-3 w-3 mr-1" />
                        {"RANKING #836"}
                      </Badge>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border" />

                  {/* Metadata row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Membro desde</p>
                        <p className="text-sm font-semibold text-foreground">{memberSince}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Ultimo acesso</p>
                        <p className="text-sm font-semibold text-foreground">{lastAccess}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">ID da conta</p>
                        <p className="text-sm font-semibold text-foreground font-mono">{accountId}...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction fee card */}
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center h-full p-5 md:p-6 text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Taxa por transacao</p>
                  <p className="text-[10px] text-muted-foreground">Valor fixo</p>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-accent">R$ 0,50</p>
                <p className="text-xs text-muted-foreground">Taxa aplicada em cada transacao aprovada</p>
              </CardContent>
            </Card>
          </div>

          {/* Middle row: Seguranca + Preferencias + Premiacoes */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            {/* Seguranca */}
            <Card className="bg-card border-border rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                    <Shield className="h-4 w-4 text-accent" />
                  </div>
                  <CardTitle className="text-base font-semibold text-foreground">Seguranca</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {/* 2FA */}
                <div className="rounded-xl bg-secondary p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">Autenticacao 2FA</p>
                        <Badge variant="outline" className="rounded-md text-[10px] px-1.5 py-0 text-muted-foreground border-muted-foreground/30">
                          Inativo
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Protecao extra para sua conta</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-secondary text-foreground border border-border hover:bg-secondary/80 rounded-xl">
                  Ativar 2FA
                </Button>

                {/* Change password */}
                <div className="h-px bg-border my-1" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alterar senha</p>
                <div className="flex flex-col gap-2.5">
                  <div className="relative">
                    <Input
                      type={showOldPass ? "text" : "password"}
                      placeholder="Senha atual"
                      className="bg-secondary border-border rounded-xl pr-10"
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
                      className="bg-secondary border-border rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
                    Alterar senha
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preferencias */}
            <Card className="bg-card border-border rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                    <MousePointer className="h-4 w-4 text-accent" />
                  </div>
                  <CardTitle className="text-base font-semibold text-foreground">Preferencias</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {/* Cursor */}
                <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                      <MousePointer className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Cursor</p>
                      <p className="text-xs text-muted-foreground">Personalizado</p>
                    </div>
                  </div>
                  <Switch checked={cursorPersonalizado} onCheckedChange={setCursorPersonalizado} />
                </div>

                {/* Ranking */}
                <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                      <BarChart3 className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Ranking</p>
                      <p className="text-xs text-muted-foreground">Mostrar lucro</p>
                    </div>
                  </div>
                  <Switch checked={mostrarRanking} onCheckedChange={setMostrarRanking} />
                </div>

                {/* Notificacoes Push */}
                <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                      <Bell className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Notificacoes Push</p>
                      <p className="text-xs text-muted-foreground">Alertas de vendas</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={notificacoesPush ? "outline" : "default"}
                    className={notificacoesPush
                      ? "rounded-lg border-border"
                      : "rounded-lg bg-secondary text-foreground border border-border hover:bg-secondary/80"
                    }
                    onClick={() => setNotificacoesPush(!notificacoesPush)}
                  >
                    {notificacoesPush ? "Ativo" : "Ativar"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Premiacoes */}
            <Card className="bg-card border-border rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                    <Trophy className="h-4 w-4 text-accent" />
                  </div>
                  <CardTitle className="text-base font-semibold text-foreground">Premiacoes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Meta icons grid */}
                <div className="grid grid-cols-5 gap-2">
                  {metas.map((meta) => (
                    <div key={meta.nome} className="flex flex-col items-center gap-1.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary">
                        <meta.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-[10px] font-medium text-accent">{meta.nome.replace("META ", "META")}</span>
                    </div>
                  ))}
                </div>

                {/* Faturamento */}
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Faturamento Total</span>
                  <span className="text-sm font-bold text-foreground">R$ 0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Proxima meta</span>
                  <span className="text-sm font-bold text-accent">+R$ 10.000</span>
                </div>
                <Progress value={0} className="h-2 bg-secondary" />
              </CardContent>
            </Card>
          </div>

          {/* Bottom: Informacoes Pessoais */}
          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                  <CardTitle className="text-base font-semibold text-foreground">Informacoes Pessoais</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border gap-2"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? <Save className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                  {editMode ? "Salvar" : "Editar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 md:grid-cols-2">
                {/* Nome Completo */}
                <div className="flex flex-col gap-2">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Nome Completo
                  </Label>
                  <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    {editMode ? (
                      <Input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="bg-transparent border-0 p-0 h-auto text-sm text-foreground focus-visible:ring-0"
                      />
                    ) : (
                      <span className="text-sm text-foreground">{session?.name || "Nao informado"}</span>
                    )}
                  </div>
                </div>

                {/* Apelido */}
                <div className="flex flex-col gap-2">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Apelido
                  </Label>
                  <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                    <AtSign className="h-4 w-4 text-muted-foreground shrink-0" />
                    {editMode ? (
                      <Input
                        value={apelido}
                        onChange={(e) => setApelido(e.target.value)}
                        className="bg-transparent border-0 p-0 h-auto text-sm text-foreground focus-visible:ring-0"
                      />
                    ) : (
                      <span className="text-sm text-foreground">{apelido || "Nao informado"}</span>
                    )}
                  </div>
                </div>

                {/* Email (read only) */}
                <div className="flex flex-col gap-2">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Email
                  </Label>
                  <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground">{session?.email || "Nao informado"}</span>
                  </div>
                </div>

                {/* Telefone */}
                <div className="flex flex-col gap-2">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Telefone
                  </Label>
                  <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground">Nao informado</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  )
}
