"use client"

import { useState } from "react"
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
import { 
  LinkIcon, Plus, ExternalLink, Eye, MousePointerClick, Copy, 
  FileText, Target, Link2, ShoppingCart, ArrowRight, ChevronLeft
} from "lucide-react"

type PageType = "presell" | "conversion" | "dragonbio" | "checkout" | null

const pageTypes = [
  {
    id: "presell" as const,
    name: "Presell / Obrigado",
    description: "Paginas de pre-venda ou agradecimento para aquecer o lead",
    icon: FileText,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  {
    id: "conversion" as const,
    name: "Conversao Direta",
    description: "Paginas focadas em conversao imediata com CTA direto",
    icon: Target,
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  {
    id: "dragonbio" as const,
    name: "Dragon Bio",
    description: "Sua pagina de links na bio estilo Linktree",
    icon: Link2,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  {
    id: "checkout" as const,
    name: "Checkout",
    description: "Pagina de checkout para finalizar vendas",
    icon: ShoppingCart,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
]

const biolinks = [
  { id: "bl1", nome: "Pagina Principal", url: "bio.dragon.com/principal", visitas: 2480, cliques: 890, ativo: true, tipo: "dragonbio" },
  { id: "bl2", nome: "Loja de Cursos", url: "bio.dragon.com/cursos", visitas: 1340, cliques: 520, ativo: true, tipo: "presell" },
  { id: "bl3", nome: "Contato VIP", url: "bio.dragon.com/vip", visitas: 680, cliques: 310, ativo: false, tipo: "conversion" },
]

function getTypeInfo(tipo: string) {
  return pageTypes.find(p => p.id === tipo) || pageTypes[0]
}

export default function BioLinkPage() {
  const { selectedBot } = useBots()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<PageType>(null)
  const [pageName, setPageName] = useState("")
  const [pageSlug, setPageSlug] = useState("")

  const handleSelectType = (type: PageType) => {
    setSelectedType(type)
  }

  const handleBack = () => {
    setSelectedType(null)
    setPageName("")
    setPageSlug("")
  }

  const handleCreate = () => {
    // TODO: Implementar criacao da pagina
    console.log("Criando pagina:", { type: selectedType, name: pageName, slug: pageSlug })
    setDialogOpen(false)
    setSelectedType(null)
    setPageName("")
    setPageSlug("")
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedType(null)
      setPageName("")
      setPageSlug("")
    }
  }

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Dragon Sites" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Dragon Sites" />
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
            <p className="text-sm text-muted-foreground">Crie paginas de alta conversao</p>
            <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Site
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-lg">
                {!selectedType ? (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-foreground text-center">
                        Vamos criar seu site
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground text-center">
                        Escolha o tipo de pagina que deseja criar
                      </p>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      {pageTypes.map((type) => {
                        const Icon = type.icon
                        return (
                          <button
                            key={type.id}
                            onClick={() => handleSelectType(type.id)}
                            className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary hover:border-accent/50 transition-all text-left group"
                          >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${type.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                                {type.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {type.description}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors ml-auto" />
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={handleBack}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <DialogTitle className="text-foreground">
                          {pageTypes.find(p => p.id === selectedType)?.name}
                        </DialogTitle>
                      </div>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 pt-4">
                      <div className="flex flex-col gap-2">
                        <Label className="text-foreground">Nome da Pagina</Label>
                        <Input 
                          placeholder="Ex: Minha Pagina de Vendas" 
                          className="bg-secondary border-border rounded-xl"
                          value={pageName}
                          onChange={(e) => setPageName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-foreground">Slug (URL)</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">dragon.bio/</span>
                          <Input 
                            placeholder="minha-pagina" 
                            className="bg-secondary border-border rounded-xl flex-1"
                            value={pageSlug}
                            onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                          />
                        </div>
                      </div>
                      <Button 
                        className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl mt-2"
                        onClick={handleCreate}
                        disabled={!pageName.trim() || !pageSlug.trim()}
                      >
                        Criar e Personalizar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col gap-3">
            {biolinks.map((bl) => {
              const typeInfo = getTypeInfo(bl.tipo)
              const Icon = typeInfo.icon
              return (
                <Card key={bl.id} className="bg-card border-border rounded-2xl">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${typeInfo.color}`}>
                        <Icon className="h-4 w-4" />
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
                          <Badge variant="outline" className="rounded-lg bg-secondary text-muted-foreground border-border text-xs">
                            {typeInfo.name}
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
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
