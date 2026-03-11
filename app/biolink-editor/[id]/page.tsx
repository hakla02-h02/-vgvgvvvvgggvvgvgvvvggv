"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { 
  ChevronLeft, 
  ChevronRight,
  Plus, 
  GripVertical, 
  Trash2, 
  Image as ImageIcon,
  Type,
  Link2,
  Palette,
  Save,
  Check,
  LayoutDashboard,
  BarChart3,
  DollarSign,
  Users,
  Bot,
  GitBranch,
  Megaphone,
  CreditCard,
  Crosshair,
  LinkIcon,
  Gift,
  Trophy,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

// Mini sidebar nav items
const navItems = [
  { icon: LayoutDashboard, href: "/", label: "Dashboard" },
  { icon: BarChart3, href: "/analytics", label: "Analises" },
  { icon: DollarSign, href: "/payments", label: "Financeiro" },
  { icon: Users, href: "/users", label: "Clientes" },
  { icon: Bot, href: "/bots", label: "Meus Robos" },
  { icon: GitBranch, href: "/flows", label: "Meus Fluxos" },
  { icon: Megaphone, href: "/campaigns", label: "Remarketing" },
  { icon: CreditCard, href: "/gateways", label: "Gateways" },
  { icon: Crosshair, href: "/tracking", label: "Trackeamento" },
  { icon: LinkIcon, href: "/biolink", label: "Dragon Sites", active: true },
  { icon: Gift, href: "/referral", label: "Indique e Ganhe" },
  { icon: Trophy, href: "/rewards", label: "Premiacoes" },
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
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-white">
        {/* Mini Sidebar - Collapsed */}
        <aside className="w-[68px] h-screen flex flex-col bg-white border-r border-gray-100">
          {/* Logo */}
          <div className="flex items-center justify-center pt-6 pb-4">
            <Link href="/" className="w-9 h-9 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg leading-none">D</span>
            </Link>
          </div>

          {/* Nav Items */}
          <ScrollArea className="flex-1 py-2">
            <nav className="flex flex-col gap-1 px-2">
              {navItems.map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center h-10 w-full rounded-xl transition-all",
                        item.active
                          ? "bg-[#111] text-[#a3e635]"
                          : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-white text-gray-900 border border-gray-100">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/biolink")}
                className="h-9 w-9 rounded-xl text-gray-500 hover:text-gray-900"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-gray-900">{pageName}</h1>
                <p className="text-xs text-gray-500">dragon.bio/{pageSlug}</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-10 px-5 rounded-xl bg-[#111] text-white hover:bg-[#222]"
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
          </header>

          {/* Editor + Preview Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Panel */}
            <div className="w-[380px] border-r border-gray-100 flex flex-col bg-white">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="px-5 pt-5">
                  <TabsList className="w-full bg-gray-100 rounded-xl h-11 p-1">
                    <TabsTrigger value="template" className="flex-1 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Palette className="w-3.5 h-3.5 mr-1.5" />
                      Template
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex-1 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Type className="w-3.5 h-3.5 mr-1.5" />
                      Perfil
                    </TabsTrigger>
                    <TabsTrigger value="links" className="flex-1 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Link2 className="w-3.5 h-3.5 mr-1.5" />
                      Links
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1">
                  {/* Template Tab */}
                  <TabsContent value="template" className="p-5 m-0">
                    <div className="flex flex-col gap-6">
                      {/* Template Selection */}
                      <div>
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                          Escolha um Template
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          {templates.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => updatePageData({ template: template.id })}
                              className={cn(
                                "relative group rounded-xl overflow-hidden border-2 transition-all",
                                pageData.template === template.id
                                  ? "border-[#111] ring-2 ring-[#111]/10"
                                  : "border-gray-100 hover:border-gray-200"
                              )}
                            >
                              <div className={`aspect-[9/16] ${template.preview}`}>
                                <div className="flex flex-col items-center justify-center h-full p-2">
                                  <div className="w-5 h-5 rounded-full bg-white/20 mb-1.5" />
                                  <div className="w-8 h-0.5 rounded bg-white/30 mb-0.5" />
                                  <div className="w-6 h-0.5 rounded bg-white/20 mb-2" />
                                  <div className="w-full space-y-1 px-1.5">
                                    <div className="h-2 rounded-full bg-white/40" />
                                    <div className="h-2 rounded-full bg-white/40" />
                                    <div className="h-2 rounded-full bg-white/40" />
                                  </div>
                                </div>
                              </div>
                              {pageData.template === template.id && (
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#111] flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">
                          {templates.find(t => t.id === pageData.template)?.name} - {templates.find(t => t.id === pageData.template)?.description}
                        </p>
                      </div>

                      {/* Color Presets */}
                      <div>
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                          Paleta de Cores
                        </Label>
                        <div className="grid grid-cols-6 gap-2">
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
                                  className="w-4/5 h-1.5 rounded-full"
                                  style={{ backgroundColor: preset.btn }}
                                />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Colors */}
                      <div>
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
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
                                className="w-6 h-6 rounded cursor-pointer border-0"
                              />
                              <Input
                                value={pageData.backgroundColor}
                                onChange={(e) => updatePageData({ backgroundColor: e.target.value })}
                                className="flex-1 h-6 bg-transparent border-0 text-[10px] font-mono px-1"
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
                                className="w-6 h-6 rounded cursor-pointer border-0"
                              />
                              <Input
                                value={pageData.buttonColor}
                                onChange={(e) => updatePageData({ buttonColor: e.target.value })}
                                className="flex-1 h-6 bg-transparent border-0 text-[10px] font-mono px-1"
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
                                className="w-6 h-6 rounded cursor-pointer border-0"
                              />
                              <Input
                                value={pageData.textColor}
                                onChange={(e) => updatePageData({ textColor: e.target.value })}
                                className="flex-1 h-6 bg-transparent border-0 text-[10px] font-mono px-1"
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
                                className="w-6 h-6 rounded cursor-pointer border-0"
                              />
                              <Input
                                value={pageData.buttonTextColor}
                                onChange={(e) => updatePageData({ buttonTextColor: e.target.value })}
                                className="flex-1 h-6 bg-transparent border-0 text-[10px] font-mono px-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Profile Tab */}
                  <TabsContent value="profile" className="p-5 m-0">
                    <div className="flex flex-col gap-5">
                      {/* Profile Image */}
                      <div>
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                          Foto de Perfil
                        </Label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {pageData.profileImage ? (
                              <img 
                                src={pageData.profileImage} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Input
                              placeholder="URL da imagem"
                              value={pageData.profileImage}
                              onChange={(e) => updatePageData({ profileImage: e.target.value })}
                              className="bg-gray-50 border-gray-200 rounded-lg h-10 text-sm"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Cole a URL da sua foto</p>
                          </div>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                          Nome
                        </Label>
                        <Input
                          placeholder="Seu nome"
                          value={pageData.profileName}
                          onChange={(e) => updatePageData({ profileName: e.target.value })}
                          className="bg-gray-50 border-gray-200 rounded-lg h-10"
                        />
                      </div>

                      {/* Bio */}
                      <div>
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                          Bio
                        </Label>
                        <textarea
                          placeholder="Sua bio aqui..."
                          value={pageData.profileBio}
                          onChange={(e) => updatePageData({ profileBio: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#111]/10 focus:border-[#111]"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Links Tab */}
                  <TabsContent value="links" className="p-5 m-0">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Seus Links ({pageData.links.length})
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addLink}
                          className="h-7 rounded-lg border-dashed text-xs"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Adicionar
                        </Button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {pageData.links.map((link, index) => (
                          <div
                            key={link.id}
                            className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-grab" />
                              <span className="text-[10px] font-medium text-gray-400">Link {index + 1}</span>
                              <div className="flex-1" />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLink(link.id)}
                                className="h-6 w-6 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Input
                                placeholder="Texto do botao"
                                value={link.label}
                                onChange={(e) => updateLink(link.id, { label: e.target.value })}
                                className="bg-white border-gray-200 rounded-lg h-9 text-sm"
                              />
                              <Input
                                placeholder="https://..."
                                value={link.url}
                                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                                className="bg-white border-gray-200 rounded-lg h-9 text-sm"
                              />
                            </div>
                          </div>
                        ))}

                        {pageData.links.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                              <Link2 className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Nenhum link adicionado</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addLink}
                              className="h-7 rounded-lg text-xs"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
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

            {/* Preview Area - Full width with phone on right side */}
            <div className="flex-1 bg-[#f8f9fa] flex items-center justify-end pr-20">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative w-[280px] h-[580px] bg-[#1a1a1a] rounded-[44px] p-2.5 shadow-2xl">
                  {/* Side buttons */}
                  <div className="absolute -left-0.5 top-24 w-0.5 h-8 bg-[#333] rounded-r-full" />
                  <div className="absolute -left-0.5 top-36 w-0.5 h-12 bg-[#333] rounded-r-full" />
                  <div className="absolute -left-0.5 top-52 w-0.5 h-12 bg-[#333] rounded-r-full" />
                  <div className="absolute -right-0.5 top-32 w-0.5 h-16 bg-[#333] rounded-l-full" />
                  
                  {/* Inner screen */}
                  <div className="w-full h-full rounded-[36px] overflow-hidden relative bg-black">
                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-10 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                    </div>
                    
                    {/* Preview Content */}
                    <BioPreview data={pageData} />
                  </div>
                </div>

                {/* Preview Label */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap">
                  Preview em Tempo Real
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
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
      className="w-full h-full flex flex-col items-center pt-14 px-5 pb-5 overflow-y-auto"
      style={{ 
        background: templateStyles.background,
        color: data.textColor 
      }}
    >
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 ring-4 ring-white/20">
          {data.profileImage ? (
            <img 
              src={data.profileImage} 
              alt={data.profileName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: data.buttonColor, color: data.buttonTextColor }}
            >
              {data.profileName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {/* Name */}
        <h1 
          className="text-lg font-bold mb-0.5"
          style={{ color: data.textColor }}
        >
          {data.profileName}
        </h1>
        
        {/* Bio */}
        <p 
          className="text-xs text-center opacity-80"
          style={{ color: data.textColor }}
        >
          {data.profileBio}
        </p>
      </div>

      {/* Links */}
      <div className="w-full flex flex-col gap-2.5">
        {data.links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "w-full py-3 px-4 rounded-xl font-medium text-sm text-center transition-all hover:scale-[1.02] hover:shadow-lg",
              data.template !== "minimal" ? templateStyles.buttonStyle : ""
            )}
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
      <div className="mt-auto pt-6">
        <p 
          className="text-[10px] opacity-50"
          style={{ color: data.textColor }}
        >
          dragon.bio
        </p>
      </div>
    </div>
  )
}
