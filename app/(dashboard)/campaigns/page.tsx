"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { Plus, Megaphone, Send, Clock, Users, Eye } from "lucide-react"

const campanhas = [
  {
    id: "c1", nome: "Promo Weekend", status: "ativa",
    audiencia: 3240, enviadas: 3240, abertas: 2810,
    data: "14 Fev 2026",
  },
  {
    id: "c2", nome: "Lancamento", status: "ativa",
    audiencia: 1890, enviadas: 1890, abertas: 1560,
    data: "12 Fev 2026",
  },
  {
    id: "c3", nome: "Remarketing", status: "agendada",
    audiencia: 980, enviadas: 0, abertas: 0,
    data: "17 Fev 2026",
  },
  {
    id: "c4", nome: "Win-back", status: "rascunho",
    audiencia: 2100, enviadas: 0, abertas: 0,
    data: "-",
  },
]

const statusStyles: Record<string, string> = {
  ativa: "bg-success/10 text-success border-success/20",
  agendada: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  rascunho: "bg-secondary text-muted-foreground border-border",
}

export default function CampaignsPage() {
  const { selectedBot } = useBots()
  const [selecionada, setSelecionada] = useState(campanhas[0])

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Campanhas" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Campanhas" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          {/* Stats simples */}
          <div className="grid gap-3 md:gap-4 grid-cols-3">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Megaphone className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{campanhas.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Send className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Enviadas</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">5.130</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Eye className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Abertura</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">84,6%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Gerencie suas campanhas de mensagens</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Criar Campanha</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Nome</Label>
                    <Input placeholder="Minha campanha" className="bg-secondary border-border rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Mensagem</Label>
                    <Textarea placeholder="Escreva sua mensagem..." className="bg-secondary border-border rounded-xl" rows={4} />
                  </div>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
                    <Send className="mr-2 h-4 w-4" />
                    Criar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de campanhas */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-5">
            <div className="flex flex-col gap-3 lg:col-span-3">
              {campanhas.map((campanha) => (
                <Card
                  key={campanha.id}
                  className={`cursor-pointer bg-card border-border rounded-2xl transition-colors hover:bg-secondary/50 ${
                    selecionada.id === campanha.id ? "ring-1 ring-accent" : ""
                  }`}
                  onClick={() => setSelecionada(campanha)}
                >
                  <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                          <Megaphone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{campanha.nome}</h3>
                            <Badge variant="outline" className={`rounded-lg ${statusStyles[campanha.status]}`}>
                              {campanha.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            <Users className="mr-1 inline h-3 w-3" />
                            {campanha.audiencia.toLocaleString("pt-BR")} usuarios
                          </p>
                        </div>
                      </div>
                    </div>
                    {campanha.enviadas > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progresso</span>
                          <span>{Math.round((campanha.enviadas / campanha.audiencia) * 100)}%</span>
                        </div>
                        <Progress value={(campanha.enviadas / campanha.audiencia) * 100} className="mt-1.5 h-1.5 bg-secondary" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detalhe da campanha */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border rounded-2xl">
                <CardContent className="p-5">
                  <h2 className="text-base font-semibold text-foreground">{selecionada.nome}</h2>
                  <p className="text-xs text-muted-foreground">{selecionada.data}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Enviadas</p>
                      <p className="text-lg font-bold text-foreground">{selecionada.enviadas.toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Abertas</p>
                      <p className="text-lg font-bold text-foreground">{selecionada.abertas.toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
