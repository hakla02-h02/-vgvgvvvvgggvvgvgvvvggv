"use client"

import { useState } from "react"
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
import { ArrowRight, ChevronLeft, Edit3, ExternalLink, Copy, MoreHorizontal, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type PageType = "presell" | "conversion" | "dragonbio" | "checkout" | null

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
    name: "Dragon Bio",
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

export type DragonBioPage = {
  id: string
  nome: string
  slug: string
  tipo: string
  visitas: number
  cliques: number
  ativo: boolean
  template: string
  createdAt: Date
}

// Estado local para simular (depois vai ser banco de dados)
const initialPages: DragonBioPage[] = []

export default function BioLinkPage() {
  const { selectedBot } = useBots()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<PageType>(null)
  const [pageName, setPageName] = useState("")
  const [pageSlug, setPageSlug] = useState("")
  const [pages, setPages] = useState<DragonBioPage[]>(initialPages)

  const handleSelectType = (type: PageType) => {
    setSelectedType(type)
  }

  const handleBack = () => {
    setSelectedType(null)
    setPageName("")
    setPageSlug("")
  }

  const handleCreate = () => {
    if (selectedType === "dragonbio") {
      // Criar nova pagina e redirecionar para o editor
      const newPage: DragonBioPage = {
        id: Date.now().toString(),
        nome: pageName,
        slug: pageSlug,
        tipo: selectedType,
        visitas: 0,
        cliques: 0,
        ativo: true,
        template: "minimal",
        createdAt: new Date(),
      }
      
      setPages([...pages, newPage])
      setDialogOpen(false)
      setSelectedType(null)
      setPageName("")
      setPageSlug("")
      
      // Redirecionar para o editor
      router.push(`/biolink-editor/${newPage.id}?name=${encodeURIComponent(pageName)}&slug=${encodeURIComponent(pageSlug)}`)
    } else {
      console.log("Criando pagina:", { type: selectedType, name: pageName, slug: pageSlug })
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

  const handleEditPage = (page: DragonBioPage) => {
    router.push(`/biolink-editor/${page.id}?name=${encodeURIComponent(page.nome)}&slug=${encodeURIComponent(page.slug)}`)
  }

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(`dragon.bio/${slug}`)
  }

  const handleDeletePage = (id: string) => {
    setPages(pages.filter(p => p.id !== id))
  }

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Dragon Sites" />
        <NoBotSelected />
      </>
    )
  }

  const dragonBioPages = pages.filter(p => p.tipo === "dragonbio")
  const hasPages = dragonBioPages.length > 0
  const totalPages = dragonBioPages.length
  const totalVisitas = dragonBioPages.reduce((acc, bl) => acc + bl.visitas, 0)
  const totalCliques = dragonBioPages.reduce((acc, bl) => acc + bl.cliques, 0)

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
                <div className="bg-[#111] rounded-[28px] p-8 md:p-10 relative overflow-hidden">
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
                      
                      <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        Crie paginas de alta conversao
                      </h1>
                      <p className="text-gray-400 text-sm md:text-base max-w-md">
                        Construa presells, paginas de vendas, checkouts e links na bio em minutos. Tudo otimizado para converter.
                      </p>
                    </div>
                    
                    {/* Stats Preview - Mini Widgets */}
                    <div className="flex gap-3">
                      <div className="bg-[#1c1c1c] rounded-2xl p-4 border border-white/5 min-w-[100px]">
                        <div className="text-2xl font-bold text-white mb-1">0</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Paginas</div>
                      </div>
                      <div className="bg-[#1c1c1c] rounded-2xl p-4 border border-white/5 min-w-[100px]">
                        <div className="text-2xl font-bold text-white mb-1">0</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Visitas</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Escolha um tipo de pagina</h2>
                    <p className="text-sm text-gray-500">Selecione o modelo ideal para seu objetivo</p>
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
                          className="group bg-white rounded-[20px] p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 text-left flex items-center gap-4"
                        >
                          {/* Icon com gradiente */}
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                            {type.id === "presell" && (
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                              </svg>
                            )}
                            {type.id === "conversion" && (
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <circle cx="12" cy="12" r="6"/>
                                <circle cx="12" cy="12" r="2"/>
                              </svg>
                            )}
                            {type.id === "dragonbio" && (
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                              </svg>
                            )}
                            {type.id === "checkout" && (
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"/>
                                <circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                              </svg>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#111] transition-colors">
                              {type.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {type.description}
                            </p>
                          </div>
                          
                          {/* Arrow */}
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#111] transition-colors flex-shrink-0">
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        </button>
                      </DialogTrigger>
                      
                      <DialogContent className="bg-white border-gray-200 sm:max-w-md rounded-[24px]">
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
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                </svg>
                              )}
                              {type.id === "conversion" && (
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                </svg>
                              )}
                              {type.id === "dragonbio" && (
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                </svg>
                              )}
                              {type.id === "checkout" && (
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="9" cy="21" r="1"/>
                                </svg>
                              )}
                            </div>
                            <DialogTitle className="text-gray-900">
                              {type.name}
                            </DialogTitle>
                          </div>
                        </DialogHeader>
                        <div className="flex flex-col gap-5 pt-4">
                          <div className="flex flex-col gap-2">
                            <Label className="text-gray-700 text-sm">Nome da Pagina</Label>
                            <Input 
                              placeholder="Ex: Minha Pagina de Vendas" 
                              className="bg-gray-50 border-gray-200 rounded-xl h-11"
                              value={pageName}
                              onChange={(e) => setPageName(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label className="text-gray-700 text-sm">Slug (URL)</Label>
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3">
                              <span className="text-sm text-gray-400 whitespace-nowrap">dragon.bio/</span>
                              <Input 
                                placeholder="minha-pagina" 
                                className="bg-transparent border-0 rounded-none flex-1 h-11 px-0 focus-visible:ring-0"
                                value={pageSlug}
                                onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                              />
                            </div>
                          </div>
                          <Button 
                            className="bg-[#111] text-white hover:bg-[#222] rounded-xl h-11 mt-2"
                            onClick={handleCreate}
                            disabled={!pageName.trim() || !pageSlug.trim()}
                          >
                            Criar e Personalizar
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>

                {/* Tip Module - Footer */}
                <div className="flex items-start gap-3 text-gray-400 mt-4">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
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
                <div className="bg-[#111] rounded-[28px] p-6 md:p-8 relative overflow-hidden">
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
                          <h2 className="text-white font-semibold">Seus Dragon Sites</h2>
                          <p className="text-gray-500 text-xs">Performance geral das suas paginas</p>
                        </div>
                      </div>
                      
                      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                        <DialogTrigger asChild>
                          <Button className="bg-[#a3e635] text-black hover:bg-[#b4f04a] rounded-xl h-10 px-5 font-semibold">
                            Criar Site
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border-gray-200 sm:max-w-lg rounded-[24px]">
                          {!selectedType ? (
                            <>
                              <DialogHeader>
                                <DialogTitle className="text-gray-900 text-center">
                                  Escolha o tipo de pagina
                                </DialogTitle>
                                <p className="text-sm text-gray-500 text-center">
                                  Selecione o modelo ideal para seu objetivo
                                </p>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-3 pt-4">
                                {pageTypes.map((type) => (
                                  <button
                                    key={type.id}
                                    onClick={() => handleSelectType(type.id)}
                                    className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all text-center"
                                  >
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                                      {type.id === "presell" && (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                        </svg>
                                      )}
                                      {type.id === "conversion" && (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                          <circle cx="12" cy="12" r="10"/>
                                          <circle cx="12" cy="12" r="2"/>
                                        </svg>
                                      )}
                                      {type.id === "dragonbio" && (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                        </svg>
                                      )}
                                      {type.id === "checkout" && (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                          <circle cx="9" cy="21" r="1"/>
                                          <circle cx="20" cy="21" r="1"/>
                                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                        </svg>
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                                        {type.name}
                                      </h3>
                                      <p className="text-xs text-gray-500 line-clamp-2">
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
                                  <DialogTitle className="text-gray-900">
                                    {pageTypes.find(p => p.id === selectedType)?.name}
                                  </DialogTitle>
                                </div>
                              </DialogHeader>
                              <div className="flex flex-col gap-5 pt-4">
                                <div className="flex flex-col gap-2">
                                  <Label className="text-gray-700 text-sm">Nome da Pagina</Label>
                                  <Input 
                                    placeholder="Ex: Minha Pagina de Vendas" 
                                    className="bg-gray-50 border-gray-200 rounded-xl h-11"
                                    value={pageName}
                                    onChange={(e) => setPageName(e.target.value)}
                                  />
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Label className="text-gray-700 text-sm">Slug (URL)</Label>
                                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3">
                                    <span className="text-sm text-gray-400 whitespace-nowrap">dragon.bio/</span>
                                    <Input 
                                      placeholder="minha-pagina" 
                                      className="bg-transparent border-0 rounded-none flex-1 h-11 px-0 focus-visible:ring-0"
                                      value={pageSlug}
                                      onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                    />
                                  </div>
                                </div>
                                <Button 
                                  className="bg-[#111] text-white hover:bg-[#222] rounded-xl h-11 mt-2"
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
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#1c1c1c] rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                          <div className="w-2 h-2 rounded-full bg-[#a3e635]"></div>
                          Paginas Ativas
                        </div>
                        <div className="text-2xl font-bold text-white">{totalPages}</div>
                      </div>
                      <div className="bg-[#1c1c1c] rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          Visitas Totais
                        </div>
                        <div className="text-2xl font-bold text-white">{totalVisitas.toLocaleString('pt-BR')}</div>
                      </div>
                      <div className="bg-[#1c1c1c] rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                          Cliques
                        </div>
                        <div className="text-2xl font-bold text-white">{totalCliques.toLocaleString('pt-BR')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pages List */}
                <div className="bg-white rounded-[24px] border border-gray-100">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Suas Paginas</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {dragonBioPages.map((page) => {
                      const typeInfo = pageTypes.find(t => t.id === page.tipo) || pageTypes[2]
                      return (
                        <div key={page.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${typeInfo.gradient} flex items-center justify-center shadow-sm`}>
                              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                              </svg>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-medium text-gray-900">{page.nome}</h4>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${page.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                  {page.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">dragon.bio/{page.slug} • {page.visitas} visitas</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPage(page)}
                              className="h-9 px-3 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleCopyLink(page.slug)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copiar Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.open(`/b/${page.slug}`, '_blank')}>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Abrir Pagina
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePage(page.id)}
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
