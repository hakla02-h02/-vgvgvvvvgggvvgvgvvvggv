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
  ShoppingCart,
  Package,
  Type,
  Palette,
  Save,
  Check,
  Loader2,
  Eye,
  ExternalLink,
  Settings,
  Link2,
  Shield,
  CreditCard,
} from "lucide-react"
import { toast } from "sonner"

// Types
export type CheckoutPageData = {
  product_name: string
  product_description: string
  product_image: string
  price: string
  original_price: string
  cta_text: string
  payment_url: string
  guarantee_text: string
  urgency_text: string
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
  accent: "#3b82f6",
  button: "#3b82f6",
  buttonText: "#ffffff"
}

const colorPresets = [
  { bg: "#ffffff", text: "#111111", accent: "#3b82f6", btn: "#3b82f6", btnText: "#ffffff" },
  { bg: "#0f172a", text: "#ffffff", accent: "#3b82f6", btn: "#3b82f6", btnText: "#ffffff" },
  { bg: "#f0f9ff", text: "#0c4a6e", accent: "#0ea5e9", btn: "#0ea5e9", btnText: "#ffffff" },
  { bg: "#fefce8", text: "#713f12", accent: "#eab308", btn: "#eab308", btnText: "#ffffff" },
  { bg: "#fef2f2", text: "#7f1d1d", accent: "#ef4444", btn: "#ef4444", btnText: "#ffffff" },
  { bg: "#ecfdf5", text: "#064e3b", accent: "#10b981", btn: "#10b981", btnText: "#ffffff" },
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CheckoutEditorPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [site, setSite] = useState<any>(null)
  const [pageData, setPageData] = useState<CheckoutPageData>({
    product_name: "Nome do Produto",
    product_description: "Descricao breve do produto que voce esta vendendo",
    product_image: "",
    price: "97,00",
    original_price: "197,00",
    cta_text: "Finalizar Compra",
    payment_url: "https://",
    guarantee_text: "Compra 100% segura",
    urgency_text: "Oferta por tempo limitado!",
    colors: defaultColors,
  })
  const [activeTab, setActiveTab] = useState("content")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [siteName, setSiteName] = useState("")
  const [siteSlug, setSiteSlug] = useState("")

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

  const updatePageData = (updates: Partial<CheckoutPageData>) => {
    setPageData(prev => ({ ...prev, ...updates }))
    setSaved(false)
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">{site?.nome || "Checkout"}</h1>
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
            className="h-9 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 text-sm"
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
                  <Package className="w-3.5 h-3.5 mr-1.5" />
                  Produto
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
                  {/* Product Name */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Nome do Produto
                    </Label>
                    <Input
                      value={pageData.product_name}
                      onChange={(e) => updatePageData({ product_name: e.target.value })}
                      className="h-10 text-sm font-semibold"
                      placeholder="Nome do produto"
                    />
                  </div>

                  {/* Product Description */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Descricao
                    </Label>
                    <textarea
                      value={pageData.product_description}
                      onChange={(e) => updatePageData({ product_description: e.target.value })}
                      className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Descricao do produto"
                    />
                  </div>

                  {/* Product Image */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Imagem do Produto
                    </Label>
                    <Input
                      value={pageData.product_image}
                      onChange={(e) => updatePageData({ product_image: e.target.value })}
                      className="h-10 text-sm"
                      placeholder="URL da imagem"
                    />
                  </div>

                  {/* Prices */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                        Preco
                      </Label>
                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3">
                        <span className="text-sm text-gray-400">R$</span>
                        <Input
                          value={pageData.price}
                          onChange={(e) => updatePageData({ price: e.target.value })}
                          className="h-10 bg-transparent border-0 px-1 text-sm font-semibold"
                          placeholder="97,00"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                        Preco Original
                      </Label>
                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3">
                        <span className="text-sm text-gray-400">R$</span>
                        <Input
                          value={pageData.original_price}
                          onChange={(e) => updatePageData({ original_price: e.target.value })}
                          className="h-10 bg-transparent border-0 px-1 text-sm"
                          placeholder="197,00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Urgency */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Texto de Urgencia
                    </Label>
                    <Input
                      value={pageData.urgency_text}
                      onChange={(e) => updatePageData({ urgency_text: e.target.value })}
                      className="h-10 text-sm"
                      placeholder="Ex: Oferta por tempo limitado!"
                    />
                  </div>

                  {/* CTA */}
                  <div className="border-t border-gray-200 pt-5">
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                      Botao de Compra
                    </Label>
                    <div className="flex flex-col gap-3">
                      <Input
                        value={pageData.cta_text}
                        onChange={(e) => updatePageData({ cta_text: e.target.value })}
                        placeholder="Texto do botao"
                        className="h-10 text-sm"
                      />
                      <Input
                        value={pageData.payment_url}
                        onChange={(e) => updatePageData({ payment_url: e.target.value })}
                        placeholder="https://checkout..."
                        className="h-10 text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Guarantee */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Texto de Seguranca
                    </Label>
                    <Input
                      value={pageData.guarantee_text}
                      onChange={(e) => updatePageData({ guarantee_text: e.target.value })}
                      className="h-10 text-sm"
                      placeholder="Ex: Compra 100% segura"
                    />
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
                              ? "border-blue-500 ring-2 ring-blue-500/20"
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
                      placeholder="Ex: Checkout Produto X"
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
                        placeholder="meu-checkout"
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
            className="w-full max-w-md min-h-[600px] rounded-lg shadow-xl overflow-hidden"
            style={{ backgroundColor: pageData.colors.background }}
          >
            <div className="p-6">
              {/* Urgency Badge */}
              {pageData.urgency_text && (
                <div 
                  className="text-center text-sm font-medium py-2 px-4 rounded-full mb-6 inline-block w-full"
                  style={{ backgroundColor: pageData.colors.accent + "20", color: pageData.colors.accent }}
                >
                  {pageData.urgency_text}
                </div>
              )}

              {/* Product Image */}
              {pageData.product_image && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={pageData.product_image} 
                    alt={pageData.product_name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Product Info */}
              <h1 
                className="text-2xl font-bold mb-2"
                style={{ color: pageData.colors.text }}
              >
                {pageData.product_name}
              </h1>

              <p 
                className="text-sm mb-6 opacity-80"
                style={{ color: pageData.colors.text }}
              >
                {pageData.product_description}
              </p>

              {/* Prices */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span 
                    className="text-3xl font-bold"
                    style={{ color: pageData.colors.accent }}
                  >
                    R$ {pageData.price}
                  </span>
                  {pageData.original_price && (
                    <span 
                      className="text-lg line-through opacity-50"
                      style={{ color: pageData.colors.text }}
                    >
                      R$ {pageData.original_price}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <button 
                className="w-full py-4 rounded-lg text-lg font-bold transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: pageData.colors.button,
                  color: pageData.colors.buttonText
                }}
              >
                <CreditCard className="w-5 h-5" />
                {pageData.cta_text}
              </button>

              {/* Security Badge */}
              <div 
                className="flex items-center justify-center gap-2 mt-4 text-sm opacity-70"
                style={{ color: pageData.colors.text }}
              >
                <Shield className="w-4 h-4" />
                {pageData.guarantee_text}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
