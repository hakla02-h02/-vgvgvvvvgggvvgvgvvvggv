"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { LinkIcon, Plus, ExternalLink, Eye, MousePointerClick, Copy } from "lucide-react"

const biolinks = [
  { id: "bl1", nome: "Pagina Principal", url: "bio.dragon.com/principal", visitas: 2480, cliques: 890, ativo: true },
  { id: "bl2", nome: "Loja de Cursos", url: "bio.dragon.com/cursos", visitas: 1340, cliques: 520, ativo: true },
  { id: "bl3", nome: "Contato VIP", url: "bio.dragon.com/vip", visitas: 680, cliques: 310, ativo: false },
]

export default function BioLinkPage() {
  const { selectedBot } = useBots()

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Bio Link" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Bio Link" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          <div className="grid gap-3 md:gap-4 grid-cols-3">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <LinkIcon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Paginas</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">3</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Eye className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Visitas</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">4.500</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <MousePointerClick className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Cliques</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">1.720</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Paginas de bio personalizadas</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Pagina
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Criar Bio Link</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Nome</Label>
                    <Input placeholder="Nome da pagina" className="bg-secondary border-border rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Slug</Label>
                    <Input placeholder="minha-pagina" className="bg-secondary border-border rounded-xl" />
                  </div>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">Criar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col gap-3">
            {biolinks.map((bl) => (
              <Card key={bl.id} className="bg-card border-border rounded-2xl">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{bl.nome}</h3>
                        <Badge
                          variant="outline"
                          className={`rounded-lg ${
                            bl.ativo
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-secondary text-muted-foreground border-border"
                          }`}
                        >
                          {bl.ativo ? "ativo" : "inativo"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{bl.url} - {bl.visitas} visitas, {bl.cliques} cliques</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
