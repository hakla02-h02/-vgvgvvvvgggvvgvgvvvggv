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
  Target,
  Palette,
  Save,
  Check,
  Loader2,
  Eye,
  ExternalLink,
  Settings,
  Link2,
  CheckCircle,
} from "lucide-react"
import { toast } from "sonner"

// Types
export type ConversionPageData = {
  headline: string
  subheadline: string
  benefits: string[]
  cta_text: string
  cta_url: string
  guarantee_text: string
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
  accent: "#10b981",
  button: "#10b981",
  buttonText: "#ffffff"
}

const colorPresets = [
  { bg: "#ffffff", text: "#111111", accent: "#10b981", btn: "#10b981", btnText: "#ffffff" },
  { bg: "#0f172a", text: "#ffffff", accent: "#10b981", btn: "#10b981", btnText: "#ffffff" },
  { bg: "#ecfdf5", text: "#064e3b", accent: "#059669", btn: "#059669", btnText: "#ffffff" },
  { bg: "#f0fdf4", text: "#14532d", accent: "#22c55e", btn: "#22c55e", btnText: "#ffffff" },
  { bg: "#fef3c7", text: "#451a03", accent: "#f59e0b", btn: "#f59e0b", btnText: "#ffffff" },
  { bg: "#f5f3ff", text: "#4c1d95", accent: "#8b5cf6", btn: "#8b5cf6", btnText: "#ffffff" },
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ConversionEditorPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [site, setSite] = useState<any>(null)
  const [pageData, setPageData] = useState<ConversionPageData>({
    headline: "Transforme Sua Vida Agora",
    subheadline: "Descubra o metodo comprovado que ja ajudou milhares de pessoas",
    benefits: [
      "Beneficio incrivel numero 1",
      "Beneficio incrivel numero 2",
      "Beneficio incrivel numero 3",
    ],
    cta_text: "Quero Comecar Agora",
    cta_url: "https://",
    guarantee_text: "Garantia de 7 dias ou seu dinheiro de volta",
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

  const updatePageData = (updates: Partial<ConversionPageData>) => {
    setPageData(prev => ({ ...prev, ...updates }))
    setSaved(false)
  }

  const addBenefit = () => {
    updatePageData({ benefits: [...pageData.benefits, "Novo beneficio"] })
  }

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...pageData.benefits]
    newBenefits[index] = value
    updatePageData({ benefits: newBenefits })
  }

  const removeBenefit = (index: number) => {
    updatePageData({ benefits: pageData.benefits.filter((_, i) => i !== index) })
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">{site?.nome || "Conversao"}</h1>
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
            className="h-9 px-4 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 text-sm"
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

                  {/* Benefits */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                        Beneficios ({pageData.benefits.length})
                      </Label>
                      <Button variant="outline" size="sm" onClick={addBenefit} className="h-7 text-xs">
                        <Plus className="w-3 h-3 mr-1" /> Adicionar
                      </Button>
                    </div>

                    <div className="flex flex-col gap-2">
                      {pageData.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <Input
                            value={benefit}
                            onChange={(e) => updateBenefit(index, e.target.value)}
                            className="h-9 text-sm flex-1"
                            placeholder="Beneficio..."
                          />
                          <button
                            onClick={() => removeBenefit(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Guarantee */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Texto de Garantia
                    </Label>
                    <Input
                      value={pageData.guarantee_text}
                      onChange={(e) => updatePageData({ guarantee_text: e.target.value })}
                      className="h-10 text-sm"
                      placeholder="Ex: Garantia de 7 dias"
                    />
                  </div>

                  {/* Main CTA */}
                  <div className="border-t border-gray-200 pt-5">
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                      Botao de Acao
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
                              ? "border-emerald-500 ring-2 ring-emerald-500/20"
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
                      placeholder="Ex: Pagina Conversao"
                      className="h-10 text-sm"
                    />
                  </div>

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
                        placeholder="minha-conversao"
                        className="flex-1 h-10 bg-transparent border-0 px-0 focus-visible:ring-0 text-sm"
                      />
                    </div>
                  </div>

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
                {pageData.headline}
              </h1>

              {/* Subheadline */}
              <p 
                className="text-lg mb-8 text-center opacity-80"
                style={{ color: pageData.colors.text }}
              >
                {pageData.subheadline}
              </p>

              {/* Benefits */}
              <div className="mb-8 max-w-md mx-auto">
                {pageData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 mb-3">
                    <CheckCircle 
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: pageData.colors.accent }}
                    />
                    <span style={{ color: pageData.colors.text }}>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Main CTA */}
              <div className="text-center mb-6">
                <button 
                  className="px-10 py-5 rounded-lg text-xl font-bold transition-all hover:scale-105 shadow-lg"
                  style={{ 
                    backgroundColor: pageData.colors.button,
                    color: pageData.colors.buttonText
                  }}
                >
                  {pageData.cta_text}
                </button>
              </div>

              {/* Guarantee */}
              <p 
                className="text-center text-sm opacity-70"
                style={{ color: pageData.colors.text }}
              >
                {pageData.guarantee_text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
