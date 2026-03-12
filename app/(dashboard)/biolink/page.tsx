"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, ChevronLeft, Edit3, ExternalLink, Copy, MoreHorizontal, Trash2, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

type PageType = "presell" | "conversion" | "dragonbio" | "checkout" | null

// Templates para Dragon Bot
const dragonBotTemplates = [
  {
    id: "buttons",
    name: "Botoes",
    description: "Layout classico com botoes",
    preview: [
      { type: "button", label: "Botao 1" },
      { type: "button", label: "Botao 2" },
      { type: "button", label: "Botao 3" },
    ],
  },
  {
    id: "photo-buttons",
    name: "Foto + Botoes",
    description: "Destaque com imagem e botoes",
    preview: [
      { type: "photo", label: "Foto" },
      { type: "button", label: "Botao 1" },
      { type: "button", label: "Botao 2" },
    ],
  },
  {
    id: "mixed",
    name: "Misto",
    description: "Combinacao de botoes e fotos",
    preview: [
      { type: "button", label: "Botao 1" },
      { type: "photo", label: "Foto 1" },
      { type: "photo", label: "Foto 2" },
      { type: "button", label: "Botao 2" },
    ],
  },
]

const pageTypes = [
  {
    id: "presell" as const,
    name: "Presell",
    description: "Paginas de pre-venda para aquecer o lead",
    gradient: "from-orange-500 to-amber-400",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
  {
    id: "conversion" as const,
    name: "Conversao",
    description: "Paginas focadas em conversao direta",
    gradient: "from-emerald-500 to-green-400",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    id: "dragonbio" as const,
    name: "Dragon Bot",
    description: "Sua pagina de links na bio",
    gradient: "from-violet-500 to-purple-400",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    id: "checkout" as const,
    name: "Checkout",
    description: "Pagina de checkout para vendas",
    gradient: "from-blue-500 to-cyan-400",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
]

export type DragonBioSite = {
  id: string
  user_id: string
  nome: string
  slug: string
  template: string
  profile_name: string
  profile_bio: string
  profile_image: string | null
  colors: any
  published: boolean
  views: number
  created_at: string
  updated_at: string
  dragon_bio_links?: any[]
}

export default function BioLinkPage() {
  const { selectedBot } = useBots()
  const { session } = useAuth()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<PageType>(null)
  const [selectedTemplate, setSelectedTemplate] = useState("buttons")
  const [pageName, setPageName] = useState("")
  const [pageSlug, setPageSlug] = useState("")
  const [sites, setSites] = useState<DragonBioSite[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  // Carregar sites do banco
  useEffect(() => {
    if (session?.userId) {
      fetchSites()
    }
  }, [session?.userId])
  
  const fetchSites = async () => {
    if (!session?.userId) return
    
    try {
      setLoading(true)
      const res = await fetch(`/api/dragon-bio?userId=${session.userId}`)
      const data = await res.json()
      
      if (data.sites) {
        setSites(data.sites)
      }
    } catch (error) {
      console.error("Erro ao carregar sites:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectType = (type: PageType) => {
    setSelectedType(type)
  }

  const handleBack = () => {
    setSelectedType(null)
    setSelectedTemplate("buttons")
    setPageName("")
    setPageSlug("")
  }

  const handleCreate = async () => {
    if (!session?.userId || !pageName.trim() || !pageSlug.trim()) return

    if (selectedType === "dragonbio") {
      try {
        setCreating(true)
        const res = await fetch("/api/dragon-bio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.userId,
            userEmail: session.email,
            userName: session.name,
            nome: pageName,
            slug: pageSlug,
            template: selectedTemplate,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error || "Erro ao criar site")
          return
        }

        toast.success("Site criado com sucesso!")
        setSites([data.site, ...sites])
        setDialogOpen(false)
        setSelectedType(null)
        setSelectedTemplate("buttons")
        setPageName("")
        setPageSlug("")
      } catch (error) {
        console.error("Erro ao criar site:", error)
        toast.error("Erro ao criar site")
      } finally {
        setCreating(false)
      }
    } else {
      toast.info("Esse tipo de pagina ainda nao esta disponivel")
      setDialogOpen(false)
      setSelectedType(null)
      setPageName("")
      setPageSlug("")
    }
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedType(null)
      setPageName("")
      setPageSlug("")
    }
  }

  const handleEditPage = (site: DragonBioSite) => {
    router.push(`/biolink-editor/${site.id}`)
  }

  const handleCopyLink = (slug: string) => {
    const baseUrl = window.location.origin
    navigator.clipboard.writeText(`${baseUrl}/s/${slug}`)
    toast.success("Link copiado!")
  }

  const handleDeletePage = async (id: string) => {
    try {
      const res = await fetch(`/api/dragon-bio?siteId=${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        toast.error("Erro ao excluir site")
        return
      }

      toast.success("Site excluido com sucesso!")
      setSites(sites.filter(s => s.id !== id))
    } catch (error) {
      console.error("Erro ao excluir site:", error)
      toast.error("Erro ao excluir site")
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

  const dragonBioSites = sites
  const hasPages = dragonBioSites.length > 0
  const totalPages = dragonBioSites.length
  const totalVisitas = dragonBioSites.reduce((acc, s) => acc + (s.views || 0), 0)

  if (loading) {
    return (
      <>
        <DashboardHeader title="Dragon Sites" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Dragon Sites" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f4f5f7] min-h-full">
          <div className="max-w-5xl mx-auto">
            
            {!hasPages ? (
              /* Estado Vazio - Layout Inovador */
              <div className="flex flex-col gap-8">
                
                {/* Hero Module - Card Principal Escuro */}
                <div className="bg-foreground dark:bg-card rounded-[28px] p-8 md:p-10 relative overflow-hidden">
                  {/* Glows decorativos */}
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#a3e635] opacity-10 blur-[80px] rounded-full pointer-events-none"></div>
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500 opacity-5 blur-[60px] rounded-full pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Texto e CTA */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#a3e635] flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                          </svg>
                        </div>
                        <span className="text-[#a3e635] text-xs font-bold uppercase tracking-wider">Dragon Sites</span>
                      </div>
                      
                      <h1 className="text-2xl md:text-3xl font-bold text-background dark:text-foreground mb-3">
                        Crie paginas de alta conversao
                      </h1>
                      <p className="text-muted-foreground text-sm md:text-base max-w-md">
                        Construa presells, paginas de vendas, checkouts e links na bio em minutos. Tudo otimizado para converter.
                      </p>
                    </div>
                    
                    {/* Stats Preview - Mini Widgets */}
                    <div className="flex gap-3">
                      <div className="bg-[#1c1c1c] rounded-2xl p-4 border border-white/5 min-w-[100px]">
                        <div className="text-2xl font-bold text-background dark:text-foreground mb-1">0</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Paginas</div>
                      </div>
                      <div className="bg-[#1c1c1c] rounded-2xl p-4 border border-white/5 min-w-[100px]">
                        <div className="text-2xl font-bold text-background dark:text-foreground mb-1">0</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Visitas</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Escolha um tipo de pagina</h2>
                    <p className="text-sm text-muted-foreground">Selecione o modelo ideal para seu objetivo</p>
                  </div>
                </div>

                {/* Grid de Tipos - Cards Horizontais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pageTypes.map((type) => (
                    <Dialog key={type.id} open={dialogOpen && selectedType === type.id} onOpenChange={(open) => {
                      if (open) {
                        setSelectedType(type.id)
                        setDialogOpen(true)
                      } else {
                        handleDialogChange(false)
                      }
                    }}>
                      <DialogTrigger asChild>
                        <button 
                          className="group bg-card rounded-[20px] p-5 border border-border hover:border-gray-200 hover:shadow-lg transition-all duration-300 text-left flex items-center gap-4"
                        >
                          {/* Icon com gradiente */}
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                            {type.id === "presell" && (
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-background dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                              </svg>
                            )}
                            {type.id === "conversion" && (
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-background dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <circle cx="12" cy="12" r="6"/>
                                <circle cx="12" cy="12" r="2"/>
                              </svg>
                            )}
                            {type.id === "dragonbio" && (
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-background dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                              </svg>
                            )}
                            {type.id === "checkout" && (
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-background dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"/>
                                <circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                              </svg>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1 group-hover:text-[#111] transition-colors">
                              {type.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {type.description}
                            </p>
                          </div>
                          
                          {/* Arrow */}
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-foreground dark:bg-card transition-colors flex-shrink-0">
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-background dark:text-foreground transition-colors" />
                          </div>
                        </button>
                      </DialogTrigger>
                      
                      <DialogContent className="bg-card border-gray-200 sm:max-w-md rounded-[24px]">
                        <DialogHeader>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={handleBack}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center`}>
                              {type.id === "presell" && (
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-background dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                </svg>
                              )}
                              {type.id === "conversion" && (
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-background dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                </svg>
                              )}
                              {type.id === "dragonbio" && (
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-background dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                </svg>
                              )}
                              {type.id === "checkout" && (
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-background dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="9" cy="21" r="1"/>
                                </svg>
                              )}
                            </div>
                            <DialogTitle className="text-foreground">
                              {type.name}
                            </DialogTitle>
                          </div>
                        </DialogHeader>
                        <div className="flex flex-col gap-5 pt-4">
                          {/* Seleção de Templates - apenas para Dragon Bot */}
                          {type.id === "dragonbio" && (
                            <div className="flex flex-col gap-3">
                              <Label className="text-muted-foreground dark:text-muted-foreground text-xs uppercase tracking-wider">Escolha um modelo</Label>
                              <div className="grid grid-cols-3 gap-3">
                                {dragonBotTemplates.map((template) => (
                                  <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template.id)}
                                    className={`relative aspect-[3/4] rounded-2xl p-3 flex flex-col items-center justify-center transition-all ${
                                      selectedTemplate === template.id
                                        ? "bg-secondary ring-2 ring-accent"
                                        : "bg-secondary/60 hover:bg-secondary"
                                    }`}
                                  >
                                    {selectedTemplate === template.id && (
                                      <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-accent-foreground" fill="none" stroke="currentColor" strokeWidth="3">
                                          <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                      </div>
                                    )}
                                    {/* Preview do template */}
                                    <div className="flex flex-col items-center gap-1.5 w-full">
                                      {/* Avatar */}
                                      <div className="w-6 h-6 rounded-full bg-muted-foreground/30"></div>
                                      {/* Items do preview */}
                                      {template.preview.map((item, idx) => (
                                        <div
                                          key={idx}
                                          className={`w-full rounded-md ${
                                            item.type === "photo" ? "h-4 bg-muted-foreground/20" : "h-2.5 bg-muted-foreground/40"
                                          }`}
                                        ></div>
                                      ))}
                                    </div>
                                  </button>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground text-center">
                                {dragonBotTemplates.find(t => t.id === selectedTemplate)?.name} - {dragonBotTemplates.find(t => t.id === selectedTemplate)?.description}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-col gap-2">
                            <Label className="text-muted-foreground dark:text-muted-foreground text-sm">Nome da Pagina</Label>
                            <Input 
                              placeholder="Ex: Minha Pagina de Vendas" 
                              className="bg-muted border-border rounded-xl h-11"
                              value={pageName}
                              onChange={(e) => setPageName(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label className="text-muted-foreground dark:text-muted-foreground text-sm">Slug (URL)</Label>
                            <div className="flex items-center gap-2 bg-muted border border-border rounded-xl px-3">
                              <span className="text-sm text-muted-foreground whitespace-nowrap">/s/</span>
                              <Input 
                                placeholder="minha-pagina" 
                                className="bg-transparent border-0 rounded-none flex-1 h-11 px-0 focus-visible:ring-0"
                                value={pageSlug}
                                onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                              />
                            </div>
                          </div>
                          <Button 
                            className="bg-foreground dark:bg-accent text-background dark:text-accent-foreground hover:opacity-90 rounded-xl h-11 mt-2"
                            onClick={handleCreate}
                            disabled={!pageName.trim() || !pageSlug.trim() || creating}
                          >
                            {creating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Criando...
                              </>
                            ) : (
                              <>
                                Criar Site
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>

                {/* Tip Module - Footer */}
                <div className="flex items-start gap-3 text-muted-foreground mt-4">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                  </div>
                  <p className="text-sm">
                    <span className="text-gray-600 font-medium">Dica:</span> Comece com uma pagina de Presell para aquecer seus leads antes de enviar para a oferta principal.
                  </p>
                </div>
              </div>
            ) : (
              /* Estado Com Paginas */
              <div className="flex flex-col gap-6">
                
                {/* Hero Stats Module */}
                <div className="bg-foreground dark:bg-card rounded-[28px] p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#a3e635] opacity-10 blur-[80px] rounded-full pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#a3e635] flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-background dark:text-foreground font-semibold">Seus Dragon Sites</h2>
                          <p className="text-muted-foreground text-xs">Performance geral das suas paginas</p>
                        </div>
                      </div>
                      
                      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                        <DialogTrigger asChild>
                          <Button className="bg-[#a3e635] text-black hover:bg-[#b4f04a] rounded-xl h-10 px-5 font-semibold">
                            Criar Site
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-gray-200 sm:max-w-lg rounded-[24px]">
                          {!selectedType ? (
                            <>
                              <DialogHeader>
                                <DialogTitle className="text-foreground text-center">
                                  Escolha o tipo de pagina
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground text-center">
                                  Selecione o modelo ideal para seu objetivo
                                </p>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-3 pt-4">
                                {pageTypes.map((type) => (
                                  <button
                                    key={type.id}
                                    onClick={() => handleSelectType(type.id)}
                                    className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-muted/50 hover:bg-card hover:border-gray-200 hover:shadow-md transition-all text-center"
                                  >
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                                      {type.id === "presell" && (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-background dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                        </svg>
                                      )}
                                      {type.id === "conversion" && (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-background dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                                          <circle cx="12" cy="12" r="10"/>
                                          <circle cx="12" cy="12" r="2"/>
                                        </svg>
                                      )}
                                      {type.id === "dragonbio" && (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-background dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                        </svg>
                                      )}
                                      {type.id === "checkout" && (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-background dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                                          <circle cx="9" cy="21" r="1"/>
                                          <circle cx="20" cy="21" r="1"/>
                                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                        </svg>
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-semibold text-foreground mb-0.5">
                                        {type.name}
                                      </h3>
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {type.description}
                                      </p>
                                    </div>
                                  </button>
                                ))}
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
                              <div className="flex flex-col gap-5 pt-4">
                                {/* Seleção de Templates - apenas para Dragon Bot */}
                                {selectedType === "dragonbio" && (
                                  <div className="flex flex-col gap-3">
                                    <Label className="text-muted-foreground dark:text-muted-foreground text-xs uppercase tracking-wider">Escolha um modelo</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                      {dragonBotTemplates.map((template) => (
                                        <button
                                          key={template.id}
                                          onClick={() => setSelectedTemplate(template.id)}
                                          className={`relative aspect-[3/4] rounded-2xl p-3 flex flex-col items-center justify-center transition-all ${
                                            selectedTemplate === template.id
                                              ? "bg-secondary ring-2 ring-accent"
                                              : "bg-secondary/60 hover:bg-secondary"
                                          }`}
                                        >
                                          {selectedTemplate === template.id && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                                              <svg viewBox="0 0 24 24" className="w-3 h-3 text-accent-foreground" fill="none" stroke="currentColor" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12"/>
                                              </svg>
                                            </div>
                                          )}
                                          {/* Preview do template */}
                                          <div className="flex flex-col items-center gap-1.5 w-full">
                                            {/* Avatar */}
                                            <div className="w-6 h-6 rounded-full bg-muted-foreground/30"></div>
                                            {/* Items do preview */}
                                            {template.preview.map((item, idx) => (
                                              <div
                                                key={idx}
                                                className={`w-full rounded-md ${
                                                  item.type === "photo" ? "h-4 bg-muted-foreground/20" : "h-2.5 bg-muted-foreground/40"
                                                }`}
                                              ></div>
                                            ))}
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                      {dragonBotTemplates.find(t => t.id === selectedTemplate)?.name} - {dragonBotTemplates.find(t => t.id === selectedTemplate)?.description}
                                    </p>
                                  </div>
                                )}

                                <div className="flex flex-col gap-2">
                                  <Label className="text-muted-foreground dark:text-muted-foreground text-sm">Nome da Pagina</Label>
                                  <Input 
                                    placeholder="Ex: Minha Pagina de Vendas" 
                                    className="bg-muted border-border rounded-xl h-11"
                                    value={pageName}
                                    onChange={(e) => setPageName(e.target.value)}
                                  />
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Label className="text-muted-foreground dark:text-muted-foreground text-sm">Slug (URL)</Label>
                                  <div className="flex items-center gap-2 bg-muted border border-border rounded-xl px-3">
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">/s/</span>
                                    <Input 
                                      placeholder="minha-pagina" 
                                      className="bg-transparent border-0 rounded-none flex-1 h-11 px-0 focus-visible:ring-0"
                                      value={pageSlug}
                                      onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                                    />
                                  </div>
                                </div>
                                <Button 
                                  className="bg-foreground dark:bg-accent text-background dark:text-accent-foreground hover:opacity-90 rounded-xl h-11 mt-2"
                                  onClick={handleCreate}
                                  disabled={!pageName.trim() || !pageSlug.trim() || creating}
                                >
                                  {creating ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Criando...
                                    </>
                                  ) : (
                                    <>
                                      Criar Site
                                      <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#1c1c1c] rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                          <div className="w-2 h-2 rounded-full bg-[#a3e635]"></div>
                          Paginas Ativas
                        </div>
                        <div className="text-2xl font-bold text-background dark:text-foreground">{totalPages}</div>
                      </div>
                      <div className="bg-[#1c1c1c] rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          Visitas Totais
                        </div>
                        <div className="text-2xl font-bold text-background dark:text-foreground">{totalVisitas.toLocaleString('pt-BR')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pages List */}
                <div className="bg-card rounded-[24px] border border-border">
                  <div className="p-5 border-b border-border">
                    <h3 className="font-semibold text-foreground">Suas Paginas</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {dragonBioSites.map((site) => {
                      const typeInfo = pageTypes[2] // Dragon Bot
                      return (
                        <div key={site.id} className="p-5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${typeInfo.gradient} flex items-center justify-center shadow-sm`}>
                              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                              </svg>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-medium text-foreground">{site.nome}</h4>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${site.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-muted-foreground'}`}>
                                  {site.published ? 'Publicado' : 'Rascunho'}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">/s/{site.slug} • {site.views || 0} visitas</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPage(site)}
                              className="h-9 px-3 rounded-lg bg-muted text-gray-600 hover:bg-gray-100 hover:text-foreground"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-lg bg-muted text-muted-foreground hover:bg-gray-100 hover:text-gray-600"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleCopyLink(site.slug)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copiar Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.open(`/s/${site.slug}`, '_blank')}>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Abrir Pagina
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePage(site.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
