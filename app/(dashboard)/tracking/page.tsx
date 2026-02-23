"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { Crosshair, Plus, Target } from "lucide-react"

const pixels = [
  { nome: "Facebook Pixel", id: "FB-1234567890", tipo: "Facebook", ativo: true },
  { nome: "TikTok Pixel", id: "TT-9876543210", tipo: "TikTok", ativo: true },
  { nome: "Google Ads Tag", id: "AW-112233445566", tipo: "Google", ativo: true },
  { nome: "Kwai Ads", id: "KW-445566778899", tipo: "Kwai", ativo: false },
]

const utms = [
  { nome: "Campanha Verao", source: "facebook", medium: "cpc", campaign: "verao_2026" },
  { nome: "Lancamento Bot", source: "tiktok", medium: "social", campaign: "launch_v2" },
  { nome: "Brand Search", source: "google", medium: "cpc", campaign: "brand_search" },
]

export default function TrackingPage() {
  const { selectedBot } = useBots()

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Trackeamento" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Trackeamento" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pixels e UTM para rastreamento</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Pixel
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Adicionar Pixel</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Nome</Label>
                    <Input placeholder="Nome do pixel" className="bg-secondary border-border rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">ID do Pixel</Label>
                    <Input placeholder="Ex: FB-123456" className="bg-secondary border-border rounded-xl" />
                  </div>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Pixels Instalados</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {pixels.map((pixel) => (
                <div key={pixel.id} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background">
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{pixel.nome}</p>
                      <p className="text-xs text-muted-foreground font-mono">{pixel.id}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={pixel.ativo} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Templates UTM</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {utms.map((utm) => (
                <div key={utm.nome} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{utm.nome}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {"source=" + utm.source + "&medium=" + utm.medium + "&campaign=" + utm.campaign}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-lg bg-accent/10 text-accent border-accent/20">
                    {utm.source}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  )
}
