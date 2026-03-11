"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRef, useState } from "react"

const premiacoes = [
  { 
    id: 1,
    titulo: "Badge Exclusivo", 
    descricao: "Destaque no ranking e reconhecimento na comunidade",
    meta: 10000,
    metaLabel: "R$ 10K",
    imagem: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=300&fit=crop",
    cor: "#a3e635"
  },
  { 
    id: 2,
    titulo: "Acesso Premium", 
    descricao: "Recursos exclusivos e suporte prioritario 24/7",
    meta: 100000,
    metaLabel: "R$ 100K",
    imagem: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop",
    cor: "#3b82f6"
  },
  { 
    id: 3,
    titulo: "Consultoria VIP", 
    descricao: "Sessao exclusiva com especialistas + taxa reduzida",
    meta: 500000,
    metaLabel: "R$ 500K",
    imagem: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop",
    cor: "#8b5cf6"
  },
  { 
    id: 4,
    titulo: "Membro Elite", 
    descricao: "Status VIP permanente + taxa zero por 3 meses",
    meta: 1000000,
    metaLabel: "R$ 1M",
    imagem: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop",
    cor: "#f59e0b"
  },
]

export default function RewardsPage() {
  const faturamentoAtual = 0
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Proxima meta
  const proximaMetaIdx = premiacoes.findIndex((p) => faturamentoAtual < p.meta)
  const proximaMeta = proximaMetaIdx >= 0 ? premiacoes[proximaMetaIdx] : premiacoes[premiacoes.length - 1]
  const faltaParaMeta = proximaMeta.meta - faturamentoAtual
  const progressoGeral = proximaMetaIdx >= 0 ? (faturamentoAtual / proximaMeta.meta) * 100 : 100

  // Drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f4f5f7] min-h-full">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#a3e635]/20 to-transparent"></div>
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#a3e635] relative z-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Premiacoes
              </h1>
              <p className="text-sm text-gray-500">
                Conquiste metas e desbloqueie recompensas exclusivas
              </p>
            </div>
          </div>

          {/* Card Hero - Progresso atual */}
          <div className="bg-[#111] rounded-[28px] p-6 md:p-8 mb-8 relative overflow-hidden">
            {/* Glows */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#a3e635] opacity-15 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500 opacity-10 blur-[50px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Seu faturamento atual</p>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    R$ {faturamentoAtual.toLocaleString("pt-BR")}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Faltam <span className="text-[#a3e635] font-semibold">R$ {faltaParaMeta.toLocaleString("pt-BR")}</span> para {proximaMeta.metaLabel}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-gray-400 text-xs mb-1">Proxima meta</p>
                    <p className="text-2xl font-bold text-[#a3e635]">{proximaMeta.metaLabel}</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[#1c1c1c] border border-white/5 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{progressoGeral.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="h-2 bg-[#1c1c1c] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#a3e635] to-[#84cc16] rounded-full transition-all"
                    style={{ width: `${progressoGeral}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">R$ 0</span>
                  <span className="text-xs text-gray-400">{proximaMeta.metaLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Titulo das premiacoes */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recompensas Disponiveis</h3>
            <p className="text-sm text-gray-500">{premiacoes.filter(p => faturamentoAtual >= p.meta).length}/{premiacoes.length} desbloqueadas</p>
          </div>

          {/* Carrossel de Premiacoes */}
          <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            className="flex gap-4 overflow-x-auto pb-4 cursor-grab active:cursor-grabbing scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {premiacoes.map((premio, index) => {
              const desbloqueado = faturamentoAtual >= premio.meta
              const progresso = Math.min(100, (faturamentoAtual / premio.meta) * 100)
              const falta = premio.meta - faturamentoAtual

              return (
                <div 
                  key={premio.id}
                  className={`flex-shrink-0 w-[280px] rounded-[24px] overflow-hidden transition-all ${
                    desbloqueado 
                      ? 'bg-white border-2 border-[#a3e635]/30 shadow-lg' 
                      : 'bg-white border border-gray-100 shadow-sm opacity-90'
                  }`}
                >
                  {/* Imagem */}
                  <div className="relative h-36 overflow-hidden">
                    <img 
                      src={premio.imagem} 
                      alt={premio.titulo}
                      className={`w-full h-full object-cover ${!desbloqueado ? 'grayscale' : ''}`}
                    />
                    {/* Overlay com meta */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: premio.cor }}
                      >
                        Meta: {premio.metaLabel}
                      </span>
                      {desbloqueado && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-white text-gray-900">
                          Desbloqueado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conteudo */}
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 mb-1">{premio.titulo}</h4>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{premio.descricao}</p>

                    {!desbloqueado ? (
                      <>
                        {/* Progresso */}
                        <div className="mb-2">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ width: `${progresso}%`, backgroundColor: premio.cor }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          Faltam <span className="font-semibold text-gray-600">R$ {falta.toLocaleString("pt-BR")}</span>
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-[#16a34a]">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        <span className="text-xs font-semibold">Premio conquistado</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dica */}
          <div className="mt-8 flex items-center gap-3 text-gray-500">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p className="text-sm">
              Arraste para o lado para ver todas as premiacoes disponiveis
            </p>
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
