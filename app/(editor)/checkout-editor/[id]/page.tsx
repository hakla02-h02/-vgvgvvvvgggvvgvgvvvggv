"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
  Zap,
  FileText,
  Shield,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"

// Types para Checkout
export type CheckoutType = "direct" | "form"

export type CheckoutFormFields = {
  showName: boolean
  showEmail: boolean
  showEmailConfirm: boolean
  showCpf: boolean
  showPhone: boolean
}

export type CheckoutData = {
  // Tipo de checkout
  checkoutType: CheckoutType
  // Mercado Pago
  accessToken: string
  // Conteudo
  headline: string
  description: string
  price: string
  pixKey: string
  // Campos do formulario (para tipo "form")
  formFields: CheckoutFormFields
  formButtonText: string
  // Visual
  backgroundType: "color" | "image" | "gradient"
  backgroundColor: string
  backgroundGradient: string
  backgroundImage: string
  cardColor: string
  textColor: string
  accentColor: string
  buttonColor: string
  buttonTextColor: string
}

const defaultData: CheckoutData = {
  checkoutType: "direct",
  accessToken: "",
  headline: "Finalizar Pagamento",
  description: "Escaneie o QR Code ou copie o codigo PIX",
  price: "35,90",
  pixKey: "",
  formFields: {
    showName: true,
    showEmail: true,
    showEmailConfirm: false,
    showCpf: true,
    showPhone: false,
  },
  formButtonText: "Gerar PIX",
  backgroundType: "gradient",
  backgroundColor: "#0f172a",
  backgroundGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
  backgroundImage: "",
  cardColor: "#ffffff",
  textColor: "#1e293b",
  accentColor: "#10b981",
  buttonColor: "#10b981",
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
  const [pageData, setPageData] = useState<CheckoutData>(defaultData)
  const [activeTab, setActiveTab] = useState("tipo")
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

  const updatePageData = (updates: Partial<CheckoutData>) => {
    setPageData(prev => ({ ...prev, ...updates }))
    setSaved(false)
  }

  const updateFormFields = (updates: Partial<CheckoutFormFields>) => {
    setPageData(prev => ({ 
      ...prev, 
      formFields: { ...prev.formFields, ...updates } 
    }))
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

      if (!res.ok) throw new Error("Erro ao salvar")

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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center">
              <QrCode className="h-4 w-4 text-white" />
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className="w-[380px] border-r border-gray-200 flex flex-col bg-white flex-shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="w-full bg-gray-100 rounded-lg h-10 p-1">
                <TabsTrigger value="tipo" className="flex-1 rounded-md text-[10px] data-[state=active]:bg-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Tipo
                </TabsTrigger>
                <TabsTrigger value="config" className="flex-1 rounded-md text-[10px] data-[state=active]:bg-white">
                  <Settings className="w-3 h-3 mr-1" />
                  Config
                </TabsTrigger>
                <TabsTrigger value="content" className="flex-1 rounded-md text-[10px] data-[state=active]:bg-white">
                  <Type className="w-3 h-3 mr-1" />
                  Texto
                </TabsTrigger>
                <TabsTrigger value="visual" className="flex-1 rounded-md text-[10px] data-[state=active]:bg-white">
                  <Palette className="w-3 h-3 mr-1" />
                  Visual
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 relative">
              {/* Tipo Tab */}
              <TabsContent value="tipo" className="absolute inset-0 p-4 m-0 overflow-y-auto data-[state=inactive]:hidden">
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-gray-500">Escolha o tipo de checkout:</p>

                  {/* Checkout Direto */}
                  <button
                    onClick={() => updatePageData({ checkoutType: "direct" })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      pageData.checkoutType === "direct"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        pageData.checkoutType === "direct" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">Checkout Direto</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Mostra o QR Code PIX diretamente. Sem formulario, pagamento rapido.
                        </p>
                      </div>
                      {pageData.checkoutType === "direct" && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Checkout com Formulario */}
                  <button
                    onClick={() => updatePageData({ checkoutType: "form" })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      pageData.checkoutType === "form"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        pageData.checkoutType === "form" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">Checkout com Dados</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Cliente preenche dados (nome, email, CPF) antes de ver o PIX.
                        </p>
                      </div>
                      {pageData.checkoutType === "form" && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Form Fields Options */}
                  {pageData.checkoutType === "form" && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Campos do Formulario
                      </h4>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pageData.formFields.showName}
                            onChange={(e) => updateFormFields({ showName: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">Nome completo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pageData.formFields.showEmail}
                            onChange={(e) => updateFormFields({ showEmail: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">E-mail</span>
                        </label>
                        {pageData.formFields.showEmail && (
                          <label className="flex items-center gap-2 cursor-pointer ml-6">
                            <input
                              type="checkbox"
                              checked={pageData.formFields.showEmailConfirm}
                              onChange={(e) => updateFormFields({ showEmailConfirm: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-500">Confirmar e-mail</span>
                          </label>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pageData.formFields.showCpf}
                            onChange={(e) => updateFormFields({ showCpf: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">CPF</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pageData.formFields.showPhone}
                            onChange={(e) => updateFormFields({ showPhone: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">Telefone</span>
                        </label>
                      </div>

                      <div className="mt-4">
                        <Label className="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5 block">
                          Texto do Botao
                        </Label>
                        <Input
                          value={pageData.formButtonText}
                          onChange={(e) => updatePageData({ formButtonText: e.target.value })}
                          className="h-9 text-sm"
                          placeholder="Gerar PIX"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Config Tab */}
              <TabsContent value="config" className="absolute inset-0 p-4 m-0 overflow-y-auto data-[state=inactive]:hidden">
                <div className="flex flex-col gap-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-semibold text-emerald-800">Mercado Pago</h3>
                        <p className="text-xs text-emerald-700 mt-1">
                          Conecte sua conta para gerar PIX automaticamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Access Token
                    </Label>
                    <Input
                      type="password"
                      value={pageData.accessToken}
                      onChange={(e) => updatePageData({ accessToken: e.target.value })}
                      className="h-10 text-sm font-mono"
                      placeholder="APP_USR-xxxxx..."
                    />
                    <a 
                      href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/additional-content/your-integrations/credentials" 
                      target="_blank"
                      className="text-[10px] text-emerald-600 hover:underline mt-1.5 inline-block"
                    >
                      Como obter o Access Token?
                    </a>
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
                      Usada se o QR Code automatico falhar
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Valor (R$)
                    </Label>
                    <Input
                      value={pageData.price}
                      onChange={(e) => updatePageData({ price: e.target.value })}
                      className="h-10 text-sm font-semibold text-lg"
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
                      placeholder="Checkout"
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
                        placeholder="checkout"
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
                      Titulo
                    </Label>
                    <Input
                      value={pageData.headline}
                      onChange={(e) => updatePageData({ headline: e.target.value })}
                      className="h-10 text-sm font-semibold"
                      placeholder="Finalizar Pagamento"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Descricao
                    </Label>
                    <textarea
                      value={pageData.description}
                      onChange={(e) => updatePageData({ description: e.target.value })}
                      className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Escaneie o QR Code..."
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Visual Tab */}
              <TabsContent value="visual" className="absolute inset-0 p-4 m-0 overflow-y-auto data-[state=inactive]:hidden">
                <div className="flex flex-col gap-5">
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Tipo de Fundo
                    </Label>
                    <div className="flex gap-2">
                      {["gradient", "color", "image"].map((type) => (
                        <button
                          key={type}
                          onClick={() => updatePageData({ backgroundType: type as any })}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all capitalize ${
                            pageData.backgroundType === type 
                              ? "bg-gray-900 text-white" 
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {type === "gradient" ? "Gradiente" : type === "color" ? "Cor" : "Imagem"}
                        </button>
                      ))}
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
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                      Cores do Card
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 mb-1 block">Fundo Card</label>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                          <input
                            type="color"
                            value={pageData.cardColor}
                            onChange={(e) => updatePageData({ cardColor: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                          />
                          <span className="text-xs font-mono">{pageData.cardColor}</span>
                        </div>
                      </div>
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
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-hidden">
          <div className="w-[375px] h-[700px] flex-shrink-0 bg-gray-900 rounded-[50px] p-3 shadow-2xl relative overflow-hidden">
            {/* Phone notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20" />
            
            {/* Screen */}
            <div 
              className="w-full h-full rounded-[40px] overflow-y-auto"
              style={{ 
                background: pageData.backgroundType === "gradient" 
                  ? pageData.backgroundGradient
                  : pageData.backgroundType === "color" 
                    ? pageData.backgroundColor 
                    : `url(${pageData.backgroundImage}) center/cover`,
              }}
            >
              <div className="min-h-full flex flex-col items-center justify-center p-5">
                {/* Card */}
                <div 
                  className="w-full rounded-3xl p-6 shadow-xl"
                  style={{ backgroundColor: pageData.cardColor }}
                >
                  {/* Checkout Direto - Mostra QR Code */}
                  {pageData.checkoutType === "direct" ? (
                    <>
                      {/* Header */}
                      <div className="text-center mb-5">
                        <h1 
                          className="text-lg font-bold mb-1"
                          style={{ color: pageData.textColor }}
                        >
                          {pageData.headline || "Finalizar Pagamento"}
                        </h1>
                        <p 
                          className="text-xs opacity-60"
                          style={{ color: pageData.textColor }}
                        >
                          {pageData.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div 
                        className="text-center mb-5"
                      >
                        <span className="text-xs opacity-50" style={{ color: pageData.textColor }}>Valor</span>
                        <div 
                          className="text-3xl font-bold"
                          style={{ color: pageData.accentColor }}
                        >
                          R$ {pageData.price || "0,00"}
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="bg-white rounded-2xl p-4 mx-auto w-fit mb-5 shadow-sm">
                        <div className="w-36 h-36 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center">
                          <QrCode className="w-20 h-20 text-gray-300" />
                        </div>
                      </div>

                      {/* Copy Button */}
                      <button
                        className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm"
                        style={{ 
                          backgroundColor: pageData.buttonColor,
                          color: pageData.buttonTextColor
                        }}
                      >
                        <Copy className="w-4 h-4" />
                        Copiar codigo PIX
                      </button>

                      {/* Timer */}
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs opacity-50" style={{ color: pageData.textColor }}>
                          Expira em 30:00
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Checkout com Formulario */
                    <>
                      {/* Header */}
                      <div className="text-center mb-5">
                        <h1 
                          className="text-lg font-bold mb-1"
                          style={{ color: pageData.textColor }}
                        >
                          {pageData.headline || "Finalizar Pagamento"}
                        </h1>
                        <div 
                          className="text-2xl font-bold"
                          style={{ color: pageData.accentColor }}
                        >
                          R$ {pageData.price || "0,00"}
                        </div>
                      </div>

                      {/* Form */}
                      <div className="space-y-3">
                        {pageData.formFields.showName && (
                          <div>
                            <label className="text-[10px] font-medium uppercase tracking-wide mb-1 block opacity-50" style={{ color: pageData.textColor }}>
                              Nome completo
                            </label>
                            <div className="h-10 rounded-lg border border-gray-200 bg-gray-50" />
                          </div>
                        )}
                        {pageData.formFields.showEmail && (
                          <div>
                            <label className="text-[10px] font-medium uppercase tracking-wide mb-1 block opacity-50" style={{ color: pageData.textColor }}>
                              E-mail
                            </label>
                            <div className="h-10 rounded-lg border border-gray-200 bg-gray-50" />
                          </div>
                        )}
                        {pageData.formFields.showEmail && pageData.formFields.showEmailConfirm && (
                          <div>
                            <label className="text-[10px] font-medium uppercase tracking-wide mb-1 block opacity-50" style={{ color: pageData.textColor }}>
                              Confirmar e-mail
                            </label>
                            <div className="h-10 rounded-lg border border-gray-200 bg-gray-50" />
                          </div>
                        )}
                        {pageData.formFields.showCpf && (
                          <div>
                            <label className="text-[10px] font-medium uppercase tracking-wide mb-1 block opacity-50" style={{ color: pageData.textColor }}>
                              CPF
                            </label>
                            <div className="h-10 rounded-lg border border-gray-200 bg-gray-50" />
                          </div>
                        )}
                        {pageData.formFields.showPhone && (
                          <div>
                            <label className="text-[10px] font-medium uppercase tracking-wide mb-1 block opacity-50" style={{ color: pageData.textColor }}>
                              Telefone
                            </label>
                            <div className="h-10 rounded-lg border border-gray-200 bg-gray-50" />
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm mt-5"
                        style={{ 
                          backgroundColor: pageData.buttonColor,
                          color: pageData.buttonTextColor
                        }}
                      >
                        {pageData.formButtonText || "Gerar PIX"}
                      </button>
                    </>
                  )}
                </div>

                {/* Security Badge */}
                <div className="mt-4 flex items-center gap-1.5 opacity-40">
                  <Shield className="w-3 h-3 text-white" />
                  <span className="text-[10px] text-white">Pagamento 100% seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
