"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
} from "lucide-react"

// Types
export type BioLink = {
  id: string
  label: string
  url: string
}

export type BioPageData = {
  template: "minimal" | "gradient" | "glassmorphism"
  profileName: string
  profileBio: string
  profileImage: string
  backgroundColor: string
  buttonColor: string
  textColor: string
  buttonTextColor: string
  links: BioLink[]
}

const defaultPageData: BioPageData = {
  template: "minimal",
  profileName: "Seu Nome",
  profileBio: "Sua bio aqui",
  profileImage: "",
  backgroundColor: "#0f172a",
  buttonColor: "#ffffff",
  textColor: "#ffffff",
  buttonTextColor: "#0f172a",
  links: [
    { id: "1", label: "Instagram", url: "https://instagram.com" },
    { id: "2", label: "YouTube", url: "https://youtube.com" },
    { id: "3", label: "WhatsApp", url: "https://wa.me" },
  ]
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

export default function DragonBioEditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const pageName = searchParams.get("name") || "Nova Pagina"
  const pageSlug = searchParams.get("slug") || "minha-pagina"
  
  const [pageData, setPageData] = useState<BioPageData>({
    ...defaultPageData,
    profileName: pageName,
  })
  const [activeTab, setActiveTab] = useState("template")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const updatePageData = (updates: Partial<BioPageData>) => {
    setPageData(prev => ({ ...prev, ...updates }))
    setSaved(false)
  }

  const addLink = () => {
    const newLink: BioLink = {
      id: Date.now().toString(),
      label: "Novo Link",
      url: "https://",
    }
    updatePageData({ links: [...pageData.links, newLink] })
  }

  const updateLink = (id: string, updates: Partial<BioLink>) => {
    updatePageData({
      links: pageData.links.map(link => 
        link.id === id ? { ...link, ...updates } : link
      )
    })
  }

  const removeLink = (id: string) => {
    updatePageData({
      links: pageData.links.filter(link => link.id !== id)
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    updatePageData({
      backgroundColor: preset.bg,
      buttonColor: preset.btn,
      textColor: preset.text,
      buttonTextColor: preset.btnText,
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
    return { backgroundColor: pageData.backgroundColor }
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
            <h1 className="font-semibold text-gray-900 text-sm">{pageName}</h1>
            <p className="text-[11px] text-gray-500">dragon.bio/{pageSlug}</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-9 px-4 rounded-lg bg-[#111] text-white hover:bg-[#222] text-sm"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                            pageData.backgroundColor === preset.bg && pageData.buttonColor === preset.btn
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
                            value={pageData.backgroundColor}
                            onChange={(e) => updatePageData({ backgroundColor: e.target.value })}
                            className="w-5 h-5 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={pageData.backgroundColor}
                            onChange={(e) => updatePageData({ backgroundColor: e.target.value })}
                            className="flex-1 h-5 bg-transparent border-0 text-[10px] font-mono px-1"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400">Botao</label>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1.5">
                          <input
                            type="color"
                            value={pageData.buttonColor}
                            onChange={(e) => updatePageData({ buttonColor: e.target.value })}
                            className="w-5 h-5 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={pageData.buttonColor}
                            onChange={(e) => updatePageData({ buttonColor: e.target.value })}
                            className="flex-1 h-5 bg-transparent border-0 text-[10px] font-mono px-1"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400">Texto</label>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1.5">
                          <input
                            type="color"
                            value={pageData.textColor}
                            onChange={(e) => updatePageData({ textColor: e.target.value })}
                            className="w-5 h-5 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={pageData.textColor}
                            onChange={(e) => updatePageData({ textColor: e.target.value })}
                            className="flex-1 h-5 bg-transparent border-0 text-[10px] font-mono px-1"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400">Texto Botao</label>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1.5">
                          <input
                            type="color"
                            value={pageData.buttonTextColor}
                            onChange={(e) => updatePageData({ buttonTextColor: e.target.value })}
                            className="w-5 h-5 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={pageData.buttonTextColor}
                            onChange={(e) => updatePageData({ buttonTextColor: e.target.value })}
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
                        {pageData.profileImage ? (
                          <img 
                            src={pageData.profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <Input
                        placeholder="URL da imagem"
                        value={pageData.profileImage}
                        onChange={(e) => updatePageData({ profileImage: e.target.value })}
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
                      value={pageData.profileName}
                      onChange={(e) => updatePageData({ profileName: e.target.value })}
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
                      value={pageData.profileBio}
                      onChange={(e) => updatePageData({ profileBio: e.target.value })}
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
                            value={link.label}
                            onChange={(e) => updateLink(link.id, { label: e.target.value })}
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
                          : pageData.buttonColor + "20" 
                      }}
                    >
                      {pageData.profileImage ? (
                        <img 
                          src={pageData.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full rounded-full"
                          style={{ backgroundColor: pageData.buttonColor + "40" }}
                        />
                      )}
                    </div>
                    <h2 
                      className="text-base font-bold mb-0.5"
                      style={{ color: pageData.textColor }}
                    >
                      {pageData.profileName || "Seu Nome"}
                    </h2>
                    <p 
                      className="text-xs opacity-80 text-center max-w-[200px]"
                      style={{ color: pageData.textColor }}
                    >
                      {pageData.profileBio || "Sua bio aqui"}
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
                            : pageData.buttonColor,
                          color: pageData.template === "glassmorphism" 
                            ? pageData.textColor 
                            : pageData.buttonTextColor,
                          border: pageData.template === "glassmorphism" 
                            ? "1px solid rgba(255,255,255,0.2)" 
                            : "none"
                        }}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3">
                    <span 
                      className="text-[10px] opacity-50"
                      style={{ color: pageData.textColor }}
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
