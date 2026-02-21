"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import {
  Settings, Shield, Bell, Key, Palette, User, Eye, EyeOff,
  Save, Forward, Download, Camera, Copy,
} from "lucide-react"

const segurancaOpcoes = [
  { id: "forwarding", label: "Bloquear encaminhamento", icon: Forward, ativo: true },
  { id: "download", label: "Bloquear downloads", icon: Download, ativo: true },
  { id: "screenshot", label: "Prevenir screenshots", icon: Camera, ativo: false },
  { id: "spy", label: "Filtrar bots e espiao", icon: Eye, ativo: true },
  { id: "clone", label: "Proteger funil", icon: Copy, ativo: true },
  { id: "ratelimit", label: "Limitar requisicoes", icon: Shield, ativo: true },
]

const notificacoesOpcoes = [
  { id: "sale", label: "Venda aprovada", ativo: true },
  { id: "pix_expired", label: "PIX expirado", ativo: true },
  { id: "bot_error", label: "Erros do bot", ativo: true },
  { id: "campaign", label: "Campanha finalizada", ativo: true },
  { id: "sub_expiring", label: "Assinatura expirando", ativo: true },
  { id: "new_user", label: "Novo usuario", ativo: false },
]

export default function SettingsPage() {
  const { selectedBot } = useBots()
  const [apiKeyVisible, setApiKeyVisible] = useState(false)

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Configuracoes" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Configuracoes" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          <Tabs defaultValue="geral">
            <TabsList className="bg-secondary rounded-xl">
              <TabsTrigger value="geral" className="rounded-lg">Geral</TabsTrigger>
              <TabsTrigger value="seguranca" className="rounded-lg">Seguranca</TabsTrigger>
              <TabsTrigger value="notificacoes" className="rounded-lg">Notificacoes</TabsTrigger>
            </TabsList>

            {/* Geral */}
            <TabsContent value="geral" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Perfil */}
                <Card className="bg-card border-border rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium text-foreground">Perfil</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Nome</Label>
                      <Input defaultValue="Dragon Admin" className="bg-secondary border-border rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Email</Label>
                      <Input defaultValue="admin@dragon.io" className="bg-secondary border-border rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Telegram</Label>
                      <Input defaultValue="@dragon_admin" className="bg-secondary border-border rounded-xl" />
                    </div>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-fit rounded-xl">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                  </CardContent>
                </Card>

                {/* API Keys */}
                <Card className="bg-card border-border rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium text-foreground">Chaves API</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">API Key</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type={apiKeyVisible ? "text" : "password"}
                          defaultValue="drg_live_sk_1234567890abcdef"
                          className="bg-secondary border-border font-mono text-sm rounded-xl"
                          readOnly
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 border-border text-muted-foreground hover:text-foreground rounded-xl"
                          onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        >
                          {apiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Webhook Secret</Label>
                      <Input
                        type="password"
                        defaultValue="whsec_abcdef1234567890"
                        className="bg-secondary border-border font-mono text-sm rounded-xl"
                        readOnly
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Aparencia */}
                <Card className="bg-card border-border rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium text-foreground">Aparencia</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Tema</Label>
                      <Select defaultValue="dark">
                        <SelectTrigger className="bg-secondary border-border rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Idioma</Label>
                      <Select defaultValue="pt-br">
                        <SelectTrigger className="bg-secondary border-border rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="pt-br">Portugues (BR)</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Fuso Horario</Label>
                      <Select defaultValue="america-sp">
                        <SelectTrigger className="bg-secondary border-border rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="america-sp">America/Sao_Paulo</SelectItem>
                          <SelectItem value="america-ny">America/New_York</SelectItem>
                          <SelectItem value="europe-lisbon">Europe/Lisbon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Config do Bot */}
                <Card className="bg-card border-border rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium text-foreground">Padrao do Bot</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                      <span className="text-sm text-foreground">Mensagem de boas-vindas</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                      <span className="text-sm text-foreground">Auto-adicionar ao grupo VIP</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      <Label className="text-foreground">Gateway Padrao</Label>
                      <Select defaultValue="mercadopago">
                        <SelectTrigger className="bg-secondary border-border rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="mercadopago">MercadoPago</SelectItem>
                          <SelectItem value="pagbank">PagBank</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Seguranca */}
            <TabsContent value="seguranca" className="mt-6">
              <Card className="bg-card border-border rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium text-foreground">Seguranca</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {segurancaOpcoes.map((opcao) => (
                      <div key={opcao.id} className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <opcao.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{opcao.label}</span>
                        </div>
                        <Switch defaultChecked={opcao.ativo} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notificacoes */}
            <TabsContent value="notificacoes" className="mt-6">
              <Card className="bg-card border-border rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium text-foreground">Notificacoes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {notificacoesOpcoes.map((opcao) => (
                      <div key={opcao.id} className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                        <span className="text-sm text-foreground">{opcao.label}</span>
                        <Switch defaultChecked={opcao.ativo} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Chat ID do Telegram</Label>
                      <Input defaultValue="-1001234567890" className="bg-secondary border-border font-mono text-sm rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Email para alertas</Label>
                      <Input defaultValue="alerts@dragon.io" className="bg-secondary border-border rounded-xl" />
                    </div>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-fit rounded-xl">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </>
  )
}
