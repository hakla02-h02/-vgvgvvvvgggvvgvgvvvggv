"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Type,
  FileText,
  Palette,
  Save,
  Check,
  Loader2,
  Eye,
  ExternalLink,
  Settings,
  Link2,
} from "lucide-react"
import { toast } from "sonner"

// Types
export type PresellSection = {
  id: string
  type: "headline" | "text" | "image" | "cta"
  content: string
  settings?: {
    buttonUrl?: string
    buttonText?: string
    imageUrl?: string
    align?: "left" | "center" | "right"
  }
}

export type PresellPageData = {
  headline: string
  subheadline: string
  sections: PresellSection[]
  cta_text: string
  cta_url: string
  colors: {
    background: string
    text: string
    accent: string
    button: string
    buttonText: string
  }
}

const defaultColors = {
  background: "#ffffff",
  text: "#111111",
  accent: "#f97316",
  button: "#f97316",
  buttonText: "#ffffff"
}

const colorPresets = [
  { bg: "#ffffff", text: "#111111", accent: "#f97316", btn: "#f97316", btnText: "#ffffff" },
  { bg: "#0f172a", text: "#ffffff", accent: "#f97316", btn: "#f97316", btnText: "#ffffff" },
  { bg: "#fef3c7", text: "#451a03", accent: "#d97706", btn: "#d97706", btnText: "#ffffff" },
  { bg: "#ecfdf5", text: "#064e3b", accent: "#10b981", btn: "#10b981", btnText: "#ffffff" },
  { bg: "#fef2f2", text: "#7f1d1d", accent: "#ef4444", btn: "#ef4444", btnText: "#ffffff" },
  { bg: "#f5f3ff", text: "#4c1d95", accent: "#8b5cf6", btn: "#8b5cf6", btnText: "#ffffff" },
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PresellEditorPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [site, setSite] = useState<any>(null)
  const [pageData, setPageData] = useState<PresellPageData>({
    headline: "Sua Headline Principal",
    subheadline: "Subheadline que complementa a headline",
    sections: [
      { id: "1", type: "text", content: "Comece a escrever seu conteudo aqui..." }
    ],
    cta_text: "Quero Saber Mais",
    cta_url: "https://",
    colors: defaultColors,
  })
  const [activeTab, setActiveTab] = useState("content")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [siteName, setSiteName] = useState("")
  const [siteSlug, setSiteSlug] = useState("")

  // Carregar dados do site
  useEffect(() => {
    fetchSite()
  }, [id])

  const fetchSite = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/dragon-bio/${id}`)
      const data = await res.json()

      if (data.site) {
        setSite(data.site)
        setSiteName(data.site.nome || "")
        setSiteSlug(data.site.slug || "")
        // Se houver dados salvos, carrega-los
        if (data.site.page_data) {
          setPageData(data.site.page_data)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar site:", error)
      toast.error("Erro ao carregar site")
    } finally {
      setLoading(false)
    }
  }

  const updatePageData = (updates: Partial<PresellPageData>) => {
    setPageData(prev => ({ ...prev, ...updates }))
    setSaved(false)
  }

  const addSection = (type: PresellSection["type"]) => {
    const newSection: PresellSection = {
      id: Date.now().toString(),
      type,
      content: type === "headline" ? "Nova Headline" : 
               type === "text" ? "Novo paragrafo de texto..." :
               type === "cta" ? "Clique Aqui" : "",
      settings: type === "cta" ? { buttonUrl: "https://", buttonText: "Clique Aqui" } :
                type === "image" ? { imageUrl: "" } : {}
    }
    updatePageData({ sections: [...pageData.sections, newSection] })
  }

  const updateSection = (sectionId: string, updates: Partial<PresellSection>) => {
    updatePageData({
      sections: pageData.sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    })
  }

  const removeSection = (sectionId: string) => {
    updatePageData({
      sections: pageData.sections.filter(section => section.id !== sectionId)
    })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const res = await fetch(`/api/dragon-bio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: siteName,
          slug: siteSlug,
          page_data: pageData,
        }),
      })

      if (!res.ok) {
        throw new Error("Erro ao salvar")
      }

      setSite((prev: any) => prev ? { ...prev, nome: siteName, slug: siteSlug } : prev)
      setSaved(true)
      toast.success("Alteracoes salvas!")
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Erro ao salvar:", error)
      toast.error("Erro ao salvar alteracoes")
    } finally {
      setIsSaving(false)
    }
  }

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    updatePageData({
      colors: {
        background: preset.bg,
        text: preset.text,
        accent: preset.accent,
        button: preset.btn,
        buttonText: preset.btnText,
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Header */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/biolink")}
            className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">{site?.nome || "Presell"}</h1>
              <p className="text-[11px] text-gray-500">/s/{site?.slug}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/s/${site?.slug}`, '_blank')}
            className="h-9 px-3 rounded-lg text-sm"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Preview
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-4 rounded-lg bg-orange-500 text-white hover:bg-orange-600 text-sm"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Salvando
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5" />
                Salvo
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-3.5 h-3.5" />
                Salvar
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content - Editor + Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className="w-[380px] border-r border-gray-200 flex flex-col bg-white flex-shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="w-full bg-gray-100 rounded-lg h-10 p-1">
                <TabsTrigger value="content" className="flex-1 rounded-md text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Type className="w-3.5 h-3.5 mr-1.5" />
                  Conteudo
                </TabsTrigger>
                <TabsTrigger value="visual" className="flex-1 rounded-md text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Palette className="w-3.5 h-3.5 mr-1.5" />
                  Visual
                </TabsTrigger>
                <TabsTrigger value="details" className="flex-1 rounded-md text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  Detalhes
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 relative">
              {/* Content Tab */}
              <TabsContent value="content" className="absolute inset-0 p-4 m-0 overflow-y-auto data-[state=inactive]:hidden">
                <div className="flex flex-col gap-5">
                  {/* Headline */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Headline Principal
                    </Label>
                    <Input
                      value={pageData.headline}
                      onChange={(e) => updatePageData({ headline: e.target.value })}
                      className="h-10 text-sm font-semibold"
                      placeholder="Sua headline aqui"
                    />
                  </div>

                  {/* Subheadline */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Subheadline
                    </Label>
                    <Input
                      value={pageData.subheadline}
                      onChange={(e) => updatePageData({ subheadline: e.target.value })}
                      className="h-10 text-sm"
                      placeholder="Subheadline complementar"
                    />
                  </div>

                  {/* Sections */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                        Secoes ({pageData.sections.length})
                      </Label>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button variant="outline" size="sm" onClick={() => addSection("text")} className="h-8 text-xs">
                        <Type className="w-3 h-3 mr-1" /> Texto
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addSection("image")} className="h-8 text-xs">
                        <ImageIcon className="w-3 h-3 mr-1" /> Imagem
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addSection("cta")} className="h-8 text-xs">
                        <ExternalLink className="w-3 h-3 mr-1" /> CTA
                      </Button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {pageData.sections.map((section) => (
                        <div key={section.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn(
                              "text-[10px] font-medium px-2 py-0.5 rounded",
                              section.type === "text" && "bg-blue-100 text-blue-700",
                              section.type === "image" && "bg-purple-100 text-purple-700",
                              section.type === "cta" && "bg-orange-100 text-orange-700"
                            )}>
                              {section.type === "text" ? "Texto" : section.type === "image" ? "Imagem" : "CTA"}
                            </span>
                            <button
                              onClick={() => removeSection(section.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {section.type === "text" && (
                            <textarea
                              value={section.content}
                              onChange={(e) => updateSection(section.id, { content: e.target.value })}
                              className="w-full h-24 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                              placeholder="Escreva seu texto..."
                            />
                          )}

                          {section.type === "image" && (
                            <Input
                              value={section.settings?.imageUrl || ""}
                              onChange={(e) => updateSection(section.id, { settings: { ...section.settings, imageUrl: e.target.value } })}
                              placeholder="URL da imagem"
                              className="h-9 text-xs"
                            />
                          )}

                          {section.type === "cta" && (
                            <div className="flex flex-col gap-2">
                              <Input
                                value={section.settings?.buttonText || ""}
                                onChange={(e) => updateSection(section.id, { settings: { ...section.settings, buttonText: e.target.value } })}
                                placeholder="Texto do botao"
                                className="h-9 text-xs"
                              />
                              <Input
                                value={section.settings?.buttonUrl || ""}
                                onChange={(e) => updateSection(section.id, { settings: { ...section.settings, buttonUrl: e.target.value } })}
                                placeholder="https://..."
                                className="h-9 text-xs font-mono"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main CTA */}
                  <div className="border-t border-gray-200 pt-5">
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                      CTA Principal (Rodape)
                    </Label>
                    <div className="flex flex-col gap-3">
                      <Input
                        value={pageData.cta_text}
                        onChange={(e) => updatePageData({ cta_text: e.target.value })}
                        placeholder="Texto do botao"
                        className="h-10 text-sm"
                      />
                      <Input
                        value={pageData.cta_url}
                        onChange={(e) => updatePageData({ cta_url: e.target.value })}
                        placeholder="https://..."
                        className="h-10 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Visual Tab */}
              <TabsContent value="visual" className="absolute inset-0 p-4 m-0 overflow-y-auto data-[state=inactive]:hidden">
                <div className="flex flex-col gap-5">
                  {/* Color Presets */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Paleta de Cores
                    </Label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {colorPresets.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => applyColorPreset(preset)}
                          className={cn(
                            "aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                            pageData.colors.background === preset.bg && pageData.colors.accent === preset.accent
                              ? "border-orange-500 ring-2 ring-orange-500/20"
                              : "border-gray-100"
                          )}
                          style={{ backgroundColor: preset.bg }}
                        >
                          <div className="w-full h-full flex items-end justify-center pb-1">
                            <div 
                              className="w-3/4 h-1 rounded-full"
                              style={{ backgroundColor: preset.btn }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Cores Personalizadas
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400">Fundo</label>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
                          <input
                            type="color"
                            value={pageData.colors.background}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, background: e.target.value } })}
                            className="w-6 h-6 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={pageData.colors.background}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, background: e.target.value } })}
                            className="flex-1 h-6 bg-transparent border-0 text-[10px] font-mono px-1"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400">Texto</label>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
                          <input
                            type="color"
                            value={pageData.colors.text}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, text: e.target.value } })}
                            className="w-6 h-6 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={pageData.colors.text}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, text: e.target.value } })}
                            className="flex-1 h-6 bg-transparent border-0 text-[10px] font-mono px-1"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400">Botao</label>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
                          <input
                            type="color"
                            value={pageData.colors.button}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, button: e.target.value } })}
                            className="w-6 h-6 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={pageData.colors.button}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, button: e.target.value } })}
                            className="flex-1 h-6 bg-transparent border-0 text-[10px] font-mono px-1"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400">Texto Botao</label>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
                          <input
                            type="color"
                            value={pageData.colors.buttonText}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, buttonText: e.target.value } })}
                            className="w-6 h-6 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={pageData.colors.buttonText}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, buttonText: e.target.value } })}
                            className="flex-1 h-6 bg-transparent border-0 text-[10px] font-mono px-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="absolute inset-0 p-4 m-0 overflow-y-auto data-[state=inactive]:hidden">
                <div className="flex flex-col gap-5">
                  {/* Page Name */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Nome da Pagina
                    </Label>
                    <Input
                      value={siteName}
                      onChange={(e) => {
                        setSiteName(e.target.value)
                        setSaved(false)
                      }}
                      placeholder="Ex: Presell Produto X"
                      className="h-10 text-sm"
                    />
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Nome para identificar sua pagina no painel
                    </p>
                  </div>

                  {/* Slug/URL */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      URL da Pagina (Slug)
                    </Label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3">
                      <span className="text-sm text-gray-400 whitespace-nowrap">/s/</span>
                      <Input
                        value={siteSlug}
                        onChange={(e) => {
                          setSiteSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                          setSaved(false)
                        }}
                        placeholder="minha-presell"
                        className="flex-1 h-10 bg-transparent border-0 px-0 focus-visible:ring-0 text-sm"
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t border-gray-100 pt-5 mt-2">
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                      Acoes Rapidas
                    </Label>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/s/${siteSlug}`, '_blank')}
                        className="justify-start h-10 text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Pagina
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = `${window.location.origin}/s/${siteSlug}`
                          navigator.clipboard.writeText(url)
                          toast.success("Link copiado!")
                        }}
                        className="justify-start h-10 text-sm"
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        Copiar Link
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-6 overflow-auto">
          <div 
            className="w-full max-w-2xl min-h-[600px] rounded-lg shadow-xl overflow-hidden"
            style={{ backgroundColor: pageData.colors.background }}
          >
            <div className="p-8">
              {/* Headline */}
              <h1 
                className="text-3xl font-bold mb-4 text-center"
                style={{ color: pageData.colors.text }}
              >
                {pageData.headline || "Sua Headline Principal"}
              </h1>

              {/* Subheadline */}
              <p 
                className="text-lg mb-8 text-center opacity-80"
                style={{ color: pageData.colors.text }}
              >
                {pageData.subheadline || "Subheadline complementar"}
              </p>

              {/* Sections */}
              <div className="flex flex-col gap-6">
                {pageData.sections.map((section) => (
                  <div key={section.id}>
                    {section.type === "text" && (
                      <p 
                        className="text-base leading-relaxed whitespace-pre-wrap"
                        style={{ color: pageData.colors.text }}
                      >
                        {section.content}
                      </p>
                    )}
                    {section.type === "image" && section.settings?.imageUrl && (
                      <img 
                        src={section.settings.imageUrl} 
                        alt="" 
                        className="w-full rounded-lg"
                      />
                    )}
                    {section.type === "cta" && (
                      <div className="text-center">
                        <button 
                          className="px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105"
                          style={{ 
                            backgroundColor: pageData.colors.button,
                            color: pageData.colors.buttonText
                          }}
                        >
                          {section.settings?.buttonText || "Clique Aqui"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Main CTA */}
              <div className="mt-12 text-center">
                <button 
                  className="px-10 py-5 rounded-lg text-xl font-bold transition-all hover:scale-105 shadow-lg"
                  style={{ 
                    backgroundColor: pageData.colors.button,
                    color: pageData.colors.buttonText
                  }}
                >
                  {pageData.cta_text || "Quero Saber Mais"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
