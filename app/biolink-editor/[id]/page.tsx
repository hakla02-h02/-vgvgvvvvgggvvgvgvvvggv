"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  ChevronLeft, 
  Plus, 
  GripVertical, 
  Trash2, 
  ExternalLink,
  Image as ImageIcon,
  Type,
  Link2,
  Palette,
  Save,
  Eye,
  Check
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Types
export type BioLink = {
  id: string
  label: string
  url: string
  icon?: string
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
  backgroundColor: "#0f0f0f",
  buttonColor: "#a3e635",
  textColor: "#ffffff",
  buttonTextColor: "#000000",
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
    description: "Design limpo e minimalista",
    preview: "bg-[#0f0f0f]",
  },
  {
    id: "gradient" as const,
    name: "Gradient",
    description: "Fundo com gradiente vibrante",
    preview: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
  },
  {
    id: "glassmorphism" as const,
    name: "Glass",
    description: "Efeito vidro moderno",
    preview: "bg-gradient-to-br from-blue-900 to-purple-900",
  },
]

const colorPresets = [
  { bg: "#0f0f0f", btn: "#a3e635", text: "#ffffff", btnText: "#000000" },
  { bg: "#1a1a2e", btn: "#e94560", text: "#ffffff", btnText: "#ffffff" },
  { bg: "#f5f5f5", btn: "#000000", text: "#000000", btnText: "#ffffff" },
  { bg: "#0d1b2a", btn: "#3a86ff", text: "#ffffff", btnText: "#ffffff" },
  { bg: "#2d132c", btn: "#ee4540", text: "#ffffff", btnText: "#ffffff" },
  { bg: "#1b262c", btn: "#bbe1fa", text: "#ffffff", btnText: "#000000" },
]

export default function DragonBioEditorPage() {
  const router = useRouter()
  const params = useParams()
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
    // Simular salvamento - depois integrar com banco de dados
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

  return (
    <div className="flex h-screen bg-[#f4f5f7]">
      {/* Left Panel - Editor */}
      <div className="w-[400px] bg-white border-r border-gray-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/biolink")}
              className="h-9 w-9 rounded-xl"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">{pageName}</h1>
              <p className="text-xs text-gray-500">dragon.bio/{pageSlug}</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-4 rounded-xl bg-[#111] text-white hover:bg-[#222]"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Salvo
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvar
              </span>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="w-full bg-gray-100 rounded-xl h-11">
              <TabsTrigger value="template" className="flex-1 rounded-lg data-[state=active]:bg-white">
                <Palette className="w-4 h-4 mr-2" />
                Template
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex-1 rounded-lg data-[state=active]:bg-white">
                <Type className="w-4 h-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="links" className="flex-1 rounded-lg data-[state=active]:bg-white">
                <Link2 className="w-4 h-4 mr-2" />
                Links
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            {/* Template Tab */}
            <TabsContent value="template" className="p-4 m-0">
              <div className="flex flex-col gap-6">
                {/* Template Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Escolha um Template
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => updatePageData({ template: template.id })}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                          pageData.template === template.id
                            ? "border-[#a3e635] ring-2 ring-[#a3e635]/20"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className={`aspect-[9/16] ${template.preview}`}>
                          {/* Mini preview */}
                          <div className="flex flex-col items-center justify-center h-full p-2">
                            <div className="w-6 h-6 rounded-full bg-white/20 mb-2" />
                            <div className="w-10 h-1 rounded bg-white/30 mb-1" />
                            <div className="w-8 h-1 rounded bg-white/20 mb-3" />
                            <div className="w-full space-y-1.5 px-2">
                              <div className="h-3 rounded-full bg-white/40" />
                              <div className="h-3 rounded-full bg-white/40" />
                              <div className="h-3 rounded-full bg-white/40" />
                            </div>
                          </div>
                        </div>
                        {pageData.template === template.id && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#a3e635] flex items-center justify-center">
                            <Check className="w-3 h-3 text-black" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {templates.find(t => t.id === pageData.template)?.name} - {templates.find(t => t.id === pageData.template)?.description}
                  </p>
                </div>

                {/* Color Presets */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Paleta de Cores
                  </Label>
                  <div className="grid grid-cols-6 gap-2">
                    {colorPresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => applyColorPreset(preset)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                          pageData.backgroundColor === preset.bg && pageData.buttonColor === preset.btn
                            ? "border-[#a3e635] ring-2 ring-[#a3e635]/20"
                            : "border-gray-100"
                        }`}
                        style={{ backgroundColor: preset.bg }}
                      >
                        <div 
                          className="w-full h-full flex items-end justify-center pb-1"
                        >
                          <div 
                            className="w-4/5 h-2 rounded-full"
                            style={{ backgroundColor: preset.btn }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Cores Personalizadas
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-500">Fundo</label>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <input
                          type="color"
                          value={pageData.backgroundColor}
                          onChange={(e) => updatePageData({ backgroundColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0"
                        />
                        <Input
                          value={pageData.backgroundColor}
                          onChange={(e) => updatePageData({ backgroundColor: e.target.value })}
                          className="flex-1 h-8 bg-transparent border-0 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-500">Botao</label>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <input
                          type="color"
                          value={pageData.buttonColor}
                          onChange={(e) => updatePageData({ buttonColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0"
                        />
                        <Input
                          value={pageData.buttonColor}
                          onChange={(e) => updatePageData({ buttonColor: e.target.value })}
                          className="flex-1 h-8 bg-transparent border-0 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-500">Texto</label>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <input
                          type="color"
                          value={pageData.textColor}
                          onChange={(e) => updatePageData({ textColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0"
                        />
                        <Input
                          value={pageData.textColor}
                          onChange={(e) => updatePageData({ textColor: e.target.value })}
                          className="flex-1 h-8 bg-transparent border-0 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-500">Texto Botao</label>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <input
                          type="color"
                          value={pageData.buttonTextColor}
                          onChange={(e) => updatePageData({ buttonTextColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0"
                        />
                        <Input
                          value={pageData.buttonTextColor}
                          onChange={(e) => updatePageData({ buttonTextColor: e.target.value })}
                          className="flex-1 h-8 bg-transparent border-0 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="p-4 m-0">
              <div className="flex flex-col gap-5">
                {/* Profile Image */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Foto de Perfil
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {pageData.profileImage ? (
                        <img 
                          src={pageData.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="URL da imagem"
                        value={pageData.profileImage}
                        onChange={(e) => updatePageData({ profileImage: e.target.value })}
                        className="bg-gray-50 border-gray-200 rounded-xl h-11"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cole a URL da sua foto</p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nome
                  </Label>
                  <Input
                    placeholder="Seu nome"
                    value={pageData.profileName}
                    onChange={(e) => updatePageData({ profileName: e.target.value })}
                    className="bg-gray-50 border-gray-200 rounded-xl h-11"
                  />
                </div>

                {/* Bio */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Bio
                  </Label>
                  <textarea
                    placeholder="Sua bio aqui..."
                    value={pageData.profileBio}
                    onChange={(e) => updatePageData({ profileBio: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#a3e635]/20 focus:border-[#a3e635]"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Links Tab */}
            <TabsContent value="links" className="p-4 m-0">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">
                    Seus Links ({pageData.links.length})
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addLink}
                    className="h-8 rounded-lg border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {pageData.links.map((link, index) => (
                    <div
                      key={link.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                        <span className="text-xs font-medium text-gray-400">Link {index + 1}</span>
                        <div className="flex-1" />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLink(link.id)}
                          className="h-7 w-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Input
                          placeholder="Texto do botao"
                          value={link.label}
                          onChange={(e) => updateLink(link.id, { label: e.target.value })}
                          className="bg-white border-gray-200 rounded-lg h-10"
                        />
                        <Input
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => updateLink(link.id, { url: e.target.value })}
                          className="bg-white border-gray-200 rounded-lg h-10"
                        />
                      </div>
                    </div>
                  ))}

                  {pageData.links.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Link2 className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Nenhum link adicionado</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addLink}
                        className="h-8 rounded-lg"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Link
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#1a1a1a]">
        <div className="relative">
          {/* Phone Frame */}
          <div className="relative w-[320px] h-[650px] bg-black rounded-[50px] p-3 shadow-2xl">
            {/* Inner screen */}
            <div className="w-full h-full rounded-[38px] overflow-hidden relative">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-10" />
              
              {/* Preview Content */}
              <BioPreview data={pageData} />
            </div>
          </div>

          {/* Preview Label */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-gray-400 text-sm">
            <Eye className="w-4 h-4" />
            <span>Preview em Tempo Real</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Bio Preview Component
function BioPreview({ data }: { data: BioPageData }) {
  const getTemplateStyles = () => {
    switch (data.template) {
      case "gradient":
        return {
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f97316 100%)`,
          buttonStyle: "backdrop-blur-sm bg-white/20 border border-white/30",
        }
      case "glassmorphism":
        return {
          background: `linear-gradient(135deg, #1e3a5f 0%, #2d1b4e 100%)`,
          buttonStyle: "backdrop-blur-md bg-white/10 border border-white/20",
        }
      default:
        return {
          background: data.backgroundColor,
          buttonStyle: "",
        }
    }
  }

  const templateStyles = getTemplateStyles()

  return (
    <div 
      className="w-full h-full flex flex-col items-center pt-12 px-6 pb-6 overflow-y-auto"
      style={{ 
        background: templateStyles.background,
        color: data.textColor 
      }}
    >
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-4 ring-white/20">
          {data.profileImage ? (
            <img 
              src={data.profileImage} 
              alt={data.profileName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-3xl font-bold"
              style={{ backgroundColor: data.buttonColor, color: data.buttonTextColor }}
            >
              {data.profileName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {/* Name */}
        <h1 
          className="text-xl font-bold mb-1"
          style={{ color: data.textColor }}
        >
          {data.profileName}
        </h1>
        
        {/* Bio */}
        <p 
          className="text-sm text-center opacity-80"
          style={{ color: data.textColor }}
        >
          {data.profileBio}
        </p>
      </div>

      {/* Links */}
      <div className="w-full flex flex-col gap-3">
        {data.links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full py-3.5 px-5 rounded-xl font-medium text-center transition-all hover:scale-[1.02] hover:shadow-lg ${
              data.template !== "minimal" ? templateStyles.buttonStyle : ""
            }`}
            style={data.template === "minimal" ? {
              backgroundColor: data.buttonColor,
              color: data.buttonTextColor,
            } : {
              color: data.textColor,
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8">
        <p 
          className="text-xs opacity-50"
          style={{ color: data.textColor }}
        >
          dragon.bio
        </p>
      </div>
    </div>
  )
}
