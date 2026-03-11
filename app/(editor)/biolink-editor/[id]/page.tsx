"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { 
  ChevronLeft, 
  Plus, 
  GripVertical, 
  Trash2, 
  Image as ImageIcon,
  Type,
  Link2,
  Palette,
  Save,
  Check,
  Loader2,
  Eye,
  ExternalLink,
  Globe,
} from "lucide-react"
import { toast } from "sonner"

// Types
export type BioLink = {
  id: string
  title: string
  url: string
}

export type BioPageData = {
  template: "minimal" | "gradient" | "glassmorphism"
  profile_name: string
  profile_bio: string
  profile_image: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  links: BioLink[]
  published: boolean
}

const defaultColors = {
  primary: "#000000",
  secondary: "#ffffff",
  accent: "#3b82f6",
  background: "#0f172a",
  text: "#ffffff"
}

const templates = [
  {
    id: "minimal" as const,
    name: "Minimal",
    description: "Design limpo e escuro",
    preview: "bg-[#0f172a]",
  },
  {
    id: "gradient" as const,
    name: "Gradient",
    description: "Gradiente vibrante",
    preview: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
  },
  {
    id: "glassmorphism" as const,
    name: "Glass",
    description: "Efeito vidro",
    preview: "bg-gradient-to-br from-blue-900 to-purple-900",
  },
]

const colorPresets = [
  { bg: "#0f172a", btn: "#ffffff", text: "#ffffff", btnText: "#0f172a" },
  { bg: "#1a1a2e", btn: "#e94560", text: "#ffffff", btnText: "#ffffff" },
  { bg: "#f5f5f5", btn: "#000000", text: "#000000", btnText: "#ffffff" },
  { bg: "#0d1b2a", btn: "#3a86ff", text: "#ffffff", btnText: "#ffffff" },
  { bg: "#2d132c", btn: "#ee4540", text: "#ffffff", btnText: "#ffffff" },
  { bg: "#1b262c", btn: "#bbe1fa", text: "#ffffff", btnText: "#000000" },
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DragonBioEditorPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [site, setSite] = useState<any>(null)
  const [pageData, setPageData] = useState<BioPageData>({
    template: "minimal",
    profile_name: "",
    profile_bio: "",
    profile_image: "",
    colors: defaultColors,
    links: [],
    published: false,
  })
  const [activeTab, setActiveTab] = useState("template")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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
        setPageData({
          template: data.site.template || "minimal",
          profile_name: data.site.profile_name || "",
          profile_bio: data.site.profile_bio || "",
          profile_image: data.site.profile_image || "",
          colors: data.site.colors || defaultColors,
          links: (data.site.dragon_bio_links || []).map((link: any) => ({
            id: link.id,
            title: link.title,
            url: link.url,
          })),
          published: data.site.published || false,
        })
      }
    } catch (error) {
      console.error("Erro ao carregar site:", error)
      toast.error("Erro ao carregar site")
    } finally {
      setLoading(false)
    }
  }

  const updatePageData = (updates: Partial<BioPageData>) => {
    setPageData(prev => ({ ...prev, ...updates }))
    setSaved(false)
  }

  const addLink = () => {
    const newLink: BioLink = {
      id: Date.now().toString(),
      title: "Novo Link",
      url: "https://",
    }
    updatePageData({ links: [...pageData.links, newLink] })
  }

  const updateLink = (linkId: string, updates: Partial<BioLink>) => {
    updatePageData({
      links: pageData.links.map(link => 
        link.id === linkId ? { ...link, ...updates } : link
      )
    })
  }

  const removeLink = (linkId: string) => {
    updatePageData({
      links: pageData.links.filter(link => link.id !== linkId)
    })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const res = await fetch(`/api/dragon-bio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: pageData.template,
          profile_name: pageData.profile_name,
          profile_bio: pageData.profile_bio,
          profile_image: pageData.profile_image,
          colors: pageData.colors,
          links: pageData.links,
          published: pageData.published,
        }),
      })

      if (!res.ok) {
        throw new Error("Erro ao salvar")
      }

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

  const handlePublish = async () => {
    const newPublished = !pageData.published
    updatePageData({ published: newPublished })
    
    try {
      await fetch(`/api/dragon-bio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newPublished }),
      })
      
      toast.success(newPublished ? "Site publicado!" : "Site despublicado")
    } catch (error) {
      console.error("Erro ao publicar:", error)
      toast.error("Erro ao alterar publicacao")
    }
  }

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    updatePageData({
      colors: {
        ...pageData.colors,
        background: preset.bg,
        secondary: preset.btn,
        text: preset.text,
        primary: preset.btnText,
      }
    })
  }

  // Get background style based on template
  const getBackgroundStyle = () => {
    if (pageData.template === "gradient") {
      return { background: "linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #f97316 100%)" }
    }
    if (pageData.template === "glassmorphism") {
      return { background: "linear-gradient(135deg, #1e3a8a 0%, #581c87 100%)" }
    }
    return { backgroundColor: pageData.colors.background }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">{site?.nome || "Carregando..."}</h1>
            <p className="text-[11px] text-gray-500">/s/{site?.slug}</p>
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
            variant={pageData.published ? "outline" : "default"}
            size="sm"
            onClick={handlePublish}
            className={cn(
              "h-9 px-3 rounded-lg text-sm",
              pageData.published 
                ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100" 
                : "bg-green-600 text-white hover:bg-green-700"
            )}
          >
            <Globe className="w-3.5 h-3.5 mr-1.5" />
            {pageData.published ? "Publicado" : "Publicar"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-4 rounded-lg bg-[#111] text-white hover:bg-[#222] text-sm"
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
        <div className="w-[340px] border-r border-gray-200 flex flex-col bg-white flex-shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="w-full bg-gray-100 rounded-lg h-10 p-1">
                <TabsTrigger value="template" className="flex-1 rounded-md text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Palette className="w-3.5 h-3.5 mr-1.5" />
                  Template
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex-1 rounded-md text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Type className="w-3.5 h-3.5 mr-1.5" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="links" className="flex-1 rounded-md text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Link2 className="w-3.5 h-3.5 mr-1.5" />
                  Links
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              {/* Template Tab */}
              <TabsContent value="template" className="p-4 m-0">
                <div className="flex flex-col gap-5">
                  {/* Template Selection */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Escolha um Template
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => updatePageData({ template: template.id })}
                          className={cn(
                            "relative group rounded-lg overflow-hidden border-2 transition-all",
                            pageData.template === template.id
                              ? "border-[#111] ring-2 ring-[#111]/10"
                              : "border-gray-100 hover:border-gray-200"
                          )}
                        >
                          <div className={`aspect-[9/16] ${template.preview}`}>
                            <div className="flex flex-col items-center justify-center h-full p-2">
                              <div className="w-4 h-4 rounded-full bg-white/20 mb-1" />
                              <div className="w-6 h-0.5 rounded bg-white/30 mb-0.5" />
                              <div className="w-5 h-0.5 rounded bg-white/20 mb-1.5" />
                              <div className="w-full space-y-0.5 px-1">
                                <div className="h-1.5 rounded-full bg-white/40" />
                                <div className="h-1.5 rounded-full bg-white/40" />
                                <div className="h-1.5 rounded-full bg-white/40" />
                              </div>
                            </div>
                          </div>
                          {pageData.template === template.id && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#111] flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                      {templates.find(t => t.id === pageData.template)?.name} - {templates.find(t => t.id === pageData.template)?.description}
                    </p>
                  </div>

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
                            pageData.colors.background === preset.bg && pageData.colors.secondary === preset.btn
                              ? "border-[#111] ring-2 ring-[#111]/10"
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
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400">Fundo</label>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1.5">
                          <input
                            type="color"
                            value={pageData.colors.background}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, background: e.target.value } })}
                            className="w-5 h-5 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={pageData.colors.background}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, background: e.target.value } })}
                            className="flex-1 h-5 bg-transparent border-0 text-[10px] font-mono px-1"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400">Botao</label>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1.5">
                          <input
                            type="color"
                            value={pageData.colors.secondary}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, secondary: e.target.value } })}
                            className="w-5 h-5 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={pageData.colors.secondary}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, secondary: e.target.value } })}
                            className="flex-1 h-5 bg-transparent border-0 text-[10px] font-mono px-1"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400">Texto</label>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1.5">
                          <input
                            type="color"
                            value={pageData.colors.text}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, text: e.target.value } })}
                            className="w-5 h-5 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={pageData.colors.text}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, text: e.target.value } })}
                            className="flex-1 h-5 bg-transparent border-0 text-[10px] font-mono px-1"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400">Texto Botao</label>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1.5">
                          <input
                            type="color"
                            value={pageData.colors.primary}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, primary: e.target.value } })}
                            className="w-5 h-5 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={pageData.colors.primary}
                            onChange={(e) => updatePageData({ colors: { ...pageData.colors, primary: e.target.value } })}
                            className="flex-1 h-5 bg-transparent border-0 text-[10px] font-mono px-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="p-4 m-0">
                <div className="flex flex-col gap-4">
                  {/* Profile Image */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2.5 block">
                      Foto de Perfil
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {pageData.profile_image ? (
                          <img 
                            src={pageData.profile_image} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <Input
                        placeholder="URL da imagem"
                        value={pageData.profile_image}
                        onChange={(e) => updatePageData({ profile_image: e.target.value })}
                        className="flex-1 h-9 text-xs"
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                      Nome
                    </Label>
                    <Input
                      value={pageData.profile_name}
                      onChange={(e) => updatePageData({ profile_name: e.target.value })}
                      className="h-9 text-sm"
                      placeholder="Seu nome"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                      Bio
                    </Label>
                    <textarea
                      value={pageData.profile_bio}
                      onChange={(e) => updatePageData({ profile_bio: e.target.value })}
                      className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#111]/10 focus:border-[#111]"
                      placeholder="Escreva uma bio curta"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="p-4 m-0">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                      Seus Links ({pageData.links.length})
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addLink}
                      className="h-7 text-xs rounded-lg"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {pageData.links.map((link, index) => (
                      <div
                        key={link.id}
                        className="border border-gray-200 rounded-lg p-3 bg-white"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-grab" />
                          <span className="text-[10px] text-gray-400 font-medium">Link {index + 1}</span>
                          <button
                            onClick={() => removeLink(link.id)}
                            className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Input
                            placeholder="Titulo do link"
                            value={link.title}
                            onChange={(e) => updateLink(link.id, { title: e.target.value })}
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="https://..."
                            value={link.url}
                            onChange={(e) => updateLink(link.id, { url: e.target.value })}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-[#f4f5f8] flex items-center justify-center p-6 overflow-hidden">
          {/* Phone Frame */}
          <div className="relative">
            {/* Phone outer frame */}
            <div className="w-[280px] h-[580px] bg-black rounded-[40px] p-[10px] shadow-2xl">
              {/* Phone inner screen */}
              <div 
                className="w-full h-full rounded-[32px] overflow-hidden relative"
                style={getBackgroundStyle()}
              >
                {/* Dynamic Island */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full" />
                
                {/* Content */}
                <div className="h-full flex flex-col items-center pt-16 px-5 pb-6">
                  {/* Profile */}
                  <div className="flex flex-col items-center mb-6">
                    <div 
                      className="w-20 h-20 rounded-full mb-3 flex items-center justify-center overflow-hidden"
                      style={{ 
                        backgroundColor: pageData.template === "glassmorphism" 
                          ? "rgba(255,255,255,0.1)" 
                          : pageData.colors.secondary + "20" 
                      }}
                    >
                      {pageData.profile_image ? (
                        <img 
                          src={pageData.profile_image} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full rounded-full"
                          style={{ backgroundColor: pageData.colors.secondary + "40" }}
                        />
                      )}
                    </div>
                    <h2 
                      className="text-base font-bold mb-0.5"
                      style={{ color: pageData.colors.text }}
                    >
                      {pageData.profile_name || "Seu Nome"}
                    </h2>
                    <p 
                      className="text-xs opacity-80 text-center max-w-[200px]"
                      style={{ color: pageData.colors.text }}
                    >
                      {pageData.profile_bio || "Sua bio aqui"}
                    </p>
                  </div>

                  {/* Links */}
                  <div className="w-full flex flex-col gap-2.5 flex-1 overflow-y-auto">
                    {pageData.links.map((link) => (
                      <button
                        key={link.id}
                        className={cn(
                          "w-full py-3 px-4 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]",
                          pageData.template === "glassmorphism" && "backdrop-blur-md"
                        )}
                        style={{ 
                          backgroundColor: pageData.template === "glassmorphism" 
                            ? "rgba(255,255,255,0.15)" 
                            : pageData.colors.secondary,
                          color: pageData.template === "glassmorphism" 
                            ? pageData.colors.text 
                            : pageData.colors.primary,
                          border: pageData.template === "glassmorphism" 
                            ? "1px solid rgba(255,255,255,0.2)" 
                            : "none"
                        }}
                      >
                        {link.title}
                      </button>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3">
                    <span 
                      className="text-[10px] opacity-50"
                      style={{ color: pageData.colors.text }}
                    >
                      dragon.bio
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Side buttons */}
            <div className="absolute right-[-2px] top-24 w-[3px] h-8 bg-gray-800 rounded-l" />
            <div className="absolute right-[-2px] top-36 w-[3px] h-14 bg-gray-800 rounded-l" />
            <div className="absolute left-[-2px] top-28 w-[3px] h-10 bg-gray-800 rounded-r" />
          </div>
        </div>
      </div>
    </div>
  )
}
