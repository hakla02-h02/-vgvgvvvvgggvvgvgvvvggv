"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/image-upload"
import { 
  ChevronLeft, 
  QrCode,
  Type,
  Palette,
  Save,
  Check,
  Loader2,
  Eye,
  Copy,
  Settings,
  Link2,
} from "lucide-react"
import { toast } from "sonner"

// Types para PIX Checkout
export type PixCheckoutData = {
  // Mercado Pago
  accessToken: string
  // Conteudo
  headline: string
  description: string
  price: string
  pixKey: string // Chave PIX para copia manual
  // Visual
  backgroundType: "color" | "image"
  backgroundColor: string
  backgroundImage: string
  textColor: string
  accentColor: string
  buttonColor: string
  buttonTextColor: string
}

const defaultData: PixCheckoutData = {
  accessToken: "",
  headline: "Pagamento via PIX",
  description: "Escaneie o QR Code ou copie o codigo PIX",
  price: "35,90",
  pixKey: "",
  backgroundType: "color",
  backgroundColor: "#0f172a",
  backgroundImage: "",
  textColor: "#ffffff",
  accentColor: "#22c55e",
  buttonColor: "#22c55e",
  buttonTextColor: "#ffffff",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CheckoutEditorPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [site, setSite] = useState<any>(null)
  const [pageData, setPageData] = useState<PixCheckoutData>(defaultData)
  const [activeTab, setActiveTab] = useState("config")
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
          setPageData({ ...defaultData, ...data.site.page_data })
        }
      }
    } catch (error) {
      console.error("Erro ao carregar site:", error)
      toast.error("Erro ao carregar site")
    } finally {
      setLoading(false)
    }
  }

  const updatePageData = (updates: Partial<PixCheckoutData>) => {
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
              <QrCode className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">{site?.nome || "Checkout PIX"}</h1>
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
            className="h-9 px-4 rounded-lg bg-green-500 text-white hover:bg-green-600 text-sm"
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
                <TabsTrigger value="config" className="flex-1 rounded-md text-xs data-[state=active]:bg-white">
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  Config
                </TabsTrigger>
                <TabsTrigger value="content" className="flex-1 rounded-md text-xs data-[state=active]:bg-white">
                  <Type className="w-3.5 h-3.5 mr-1.5" />
                  Conteudo
                </TabsTrigger>
                <TabsTrigger value="visual" className="flex-1 rounded-md text-xs data-[state=active]:bg-white">
                  <Palette className="w-3.5 h-3.5 mr-1.5" />
                  Visual
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 relative">
              {/* Config Tab - Mercado Pago */}
              <TabsContent value="config" className="absolute inset-0 p-4 m-0 overflow-y-auto data-[state=inactive]:hidden">
                <div className="flex flex-col gap-5">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-green-800 mb-2">Mercado Pago PIX</h3>
                    <p className="text-xs text-green-700 mb-3">
                      Cole seu Access Token do Mercado Pago para gerar QR Codes PIX automaticamente.
                    </p>
                    <a 
                      href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/additional-content/your-integrations/credentials" 
                      target="_blank"
                      className="text-xs text-green-600 underline"
                    >
                      Como obter o Access Token?
                    </a>
                  </div>

                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Access Token (Producao)
                    </Label>
                    <Input
                      type="password"
                      value={pageData.accessToken}
                      onChange={(e) => updatePageData({ accessToken: e.target.value })}
                      className="h-10 text-sm font-mono"
                      placeholder="APP_USR-xxxxx..."
                    />
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Chave PIX (Fallback)
                    </Label>
                    <Input
                      value={pageData.pixKey}
                      onChange={(e) => updatePageData({ pixKey: e.target.value })}
                      className="h-10 text-sm font-mono"
                      placeholder="email@exemplo.com ou CPF"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Usada caso o QR Code automatico falhe
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Valor (R$)
                    </Label>
                    <Input
                      value={pageData.price}
                      onChange={(e) => updatePageData({ price: e.target.value })}
                      className="h-10 text-sm font-semibold"
                      placeholder="35,90"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Nome da Pagina
                    </Label>
                    <Input
                      value={siteName}
                      onChange={(e) => { setSiteName(e.target.value); setSaved(false) }}
                      placeholder="Checkout PIX"
                      className="h-10 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Slug (URL)
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">/s/</span>
                      <Input
                        value={siteSlug}
                        onChange={(e) => { setSiteSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setSaved(false) }}
                        placeholder="checkout-pix"
                        className="h-10 text-sm flex-1"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="absolute inset-0 p-4 m-0 overflow-y-auto data-[state=inactive]:hidden">
                <div className="flex flex-col gap-5">
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Titulo / Headline
                    </Label>
                    <Input
                      value={pageData.headline}
                      onChange={(e) => updatePageData({ headline: e.target.value })}
                      className="h-10 text-sm font-semibold"
                      placeholder="Pagamento via PIX"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Descricao
                    </Label>
                    <textarea
                      value={pageData.description}
                      onChange={(e) => updatePageData({ description: e.target.value })}
                      className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      placeholder="Escaneie o QR Code..."
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Visual Tab */}
              <TabsContent value="visual" className="absolute inset-0 p-4 m-0 overflow-y-auto data-[state=inactive]:hidden">
                <div className="flex flex-col gap-5">
                  {/* Background Type */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Tipo de Fundo
                    </Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updatePageData({ backgroundType: "color" })}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${pageData.backgroundType === "color" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        Cor
                      </button>
                      <button
                        onClick={() => updatePageData({ backgroundType: "image" })}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${pageData.backgroundType === "image" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        Imagem
                      </button>
                    </div>
                  </div>

                  {pageData.backgroundType === "color" && (
                    <div>
                      <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                        Cor de Fundo
                      </Label>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                        <input
                          type="color"
                          value={pageData.backgroundColor}
                          onChange={(e) => updatePageData({ backgroundColor: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={pageData.backgroundColor}
                          onChange={(e) => updatePageData({ backgroundColor: e.target.value })}
                          className="flex-1 h-10 bg-transparent border-0 font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {pageData.backgroundType === "image" && (
                    <div>
                      <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                        Imagem de Fundo
                      </Label>
                      <ImageUpload
                        value={pageData.backgroundImage}
                        onChange={(url) => updatePageData({ backgroundImage: url })}
                        placeholder="Fazer upload do fundo"
                        previewClassName="w-full h-24 rounded-lg"
                      />
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Cores
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 mb-1 block">Texto</label>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                          <input
                            type="color"
                            value={pageData.textColor}
                            onChange={(e) => updatePageData({ textColor: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                          />
                          <span className="text-xs font-mono">{pageData.textColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 mb-1 block">Destaque</label>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                          <input
                            type="color"
                            value={pageData.accentColor}
                            onChange={(e) => updatePageData({ accentColor: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                          />
                          <span className="text-xs font-mono">{pageData.accentColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 mb-1 block">Botao</label>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                          <input
                            type="color"
                            value={pageData.buttonColor}
                            onChange={(e) => updatePageData({ buttonColor: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                          />
                          <span className="text-xs font-mono">{pageData.buttonColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 mb-1 block">Texto Botao</label>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                          <input
                            type="color"
                            value={pageData.buttonTextColor}
                            onChange={(e) => updatePageData({ buttonTextColor: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                          />
                          <span className="text-xs font-mono">{pageData.buttonTextColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-hidden">
          <div className="w-[375px] h-[700px] flex-shrink-0 bg-gray-800 rounded-[50px] p-3 shadow-2xl relative overflow-hidden">
            {/* Phone notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20" />
            
            {/* Screen */}
            <div 
              className="w-full h-full rounded-[40px] overflow-y-auto bg-cover bg-center"
              style={{ 
                backgroundColor: pageData.backgroundType === "color" ? pageData.backgroundColor : "#0f172a",
                backgroundImage: pageData.backgroundType === "image" && pageData.backgroundImage ? `url(${pageData.backgroundImage})` : undefined
              }}
            >
              <div className="min-h-full flex flex-col items-center justify-center p-6">
                {/* Headline */}
                <h1 
                  className="text-xl font-bold text-center mb-2"
                  style={{ color: pageData.textColor }}
                >
                  {pageData.headline || "Pagamento via PIX"}
                </h1>
                
                <p 
                  className="text-sm text-center mb-6 opacity-80"
                  style={{ color: pageData.textColor }}
                >
                  {pageData.description}
                </p>

                {/* Price */}
                <div 
                  className="text-3xl font-bold mb-6"
                  style={{ color: pageData.accentColor }}
                >
                  R$ {pageData.price || "0,00"}
                </div>

                {/* QR Code Placeholder */}
                <div className="bg-white rounded-2xl p-4 mb-6">
                  <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-gray-400" />
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: pageData.buttonColor,
                    color: pageData.buttonTextColor
                  }}
                >
                  <Copy className="w-4 h-4" />
                  Copiar codigo PIX
                </button>

                {/* Status */}
                <p 
                  className="text-xs text-center mt-4 opacity-60"
                  style={{ color: pageData.textColor }}
                >
                  Aguardando pagamento...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
