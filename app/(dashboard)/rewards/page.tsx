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
  },
  { 
    id: 2,
    titulo: "Acesso Premium", 
    descricao: "Recursos exclusivos e suporte prioritario 24/7",
    meta: 100000,
    metaLabel: "R$ 100K",
    imagem: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop",
  },
  { 
    id: 3,
    titulo: "Consultoria VIP", 
    descricao: "Sessao exclusiva com especialistas + taxa reduzida",
    meta: 500000,
    metaLabel: "R$ 500K",
    imagem: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop",
  },
  { 
    id: 4,
    titulo: "Membro Elite", 
    descricao: "Status VIP permanente + taxa zero por 3 meses",
    meta: 1000000,
    metaLabel: "R$ 1M",
    imagem: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop",
  },
]

export default function RewardsPage() {
  const faturamentoAtual = 0
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Proxima meta
  const proximaMetaIdx = premiacoes.findIndex((p) => faturamentoAtual < p.meta)
  const proximaMeta = proximaMetaIdx >= 0 ? premiacoes[proximaMetaIdx] : premiacoes[premiacoes.length - 1]
  const faltaParaMeta = proximaMeta.meta - faturamentoAtual
  const progressoGeral = proximaMetaIdx >= 0 ? (faturamentoAtual / proximaMeta.meta) * 100 : 100

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0))
    setScrollLeft(carouselRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 1.5
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f4f5f7] min-h-full">
          
          {/* Header Section */}
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

          {/* Hero Progress Module */}
          <div className="bg-[#111] rounded-[28px] p-6 md:p-8 mb-8 relative overflow-hidden">
            {/* Glows */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#a3e635] opacity-15 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#a3e635] opacity-10 blur-[50px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              {/* Top Row - Stats */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Seu faturamento</p>
                  <p className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    R$ {faturamentoAtual.toLocaleString("pt-BR")}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-gray-500 text-xs mb-0.5">Proxima meta</p>
                    <p className="text-[#a3e635] font-bold text-xl">{proximaMeta.metaLabel}</p>
                  </div>
                  <div className="w-px h-10 bg-white/10"></div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs mb-0.5">Faltam</p>
                    <p className="text-white font-bold text-xl">R$ {faltaParaMeta.toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#a3e635] to-[#84cc16] rounded-full transition-all duration-500 relative"
                    style={{ width: `${Math.max(progressoGeral, 2)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20"></div>
                  </div>
                </div>
                
                {/* Milestones */}
                <div className="flex justify-between mt-3">
                  {premiacoes.map((p, idx) => {
                    const posicao = (p.meta / premiacoes[premiacoes.length - 1].meta) * 100
                    const conquistado = faturamentoAtual >= p.meta
                    return (
                      <div 
                        key={p.id}
                        className="flex flex-col items-center"
                        style={{ position: 'absolute', left: `${posicao}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className={`w-2 h-2 rounded-full ${conquistado ? 'bg-[#a3e635]' : 'bg-white/30'}`}></div>
                        <span className={`text-[10px] mt-1 ${conquistado ? 'text-[#a3e635]' : 'text-gray-500'}`}>
                          {p.metaLabel}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section Title */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Suas Recompensas</h2>
            <span className="text-xs text-gray-400">Arraste para ver mais</span>
          </div>

          {/* Horizontal Carousel - Premium Cards */}
          <div 
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {premiacoes.map((premio) => {
              const desbloqueado = faturamentoAtual >= premio.meta
              const progresso = Math.min(100, (faturamentoAtual / premio.meta) * 100)
              const falta = premio.meta - faturamentoAtual

              return (
                <div 
                  key={premio.id}
                  className={`flex-shrink-0 w-[280px] md:w-[320px] rounded-[24px] overflow-hidden transition-all duration-300 ${
                    desbloqueado 
                      ? 'bg-[#111] shadow-[0_0_30px_rgba(163,230,53,0.15)]' 
                      : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Image Section */}
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={premio.imagem} 
                      alt={premio.titulo}
                      className={`w-full h-full object-cover transition-all duration-300 ${!desbloqueado ? 'grayscale-[60%]' : ''}`}
                      draggable={false}
                    />
                    <div className={`absolute inset-0 ${desbloqueado ? 'bg-gradient-to-t from-[#111] via-transparent to-transparent' : 'bg-gradient-to-t from-white via-transparent to-transparent'}`}></div>
                    
                    {/* Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold ${
                      desbloqueado 
                        ? 'bg-[#a3e635] text-black' 
                        : 'bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200'
                    }`}>
                      {premio.metaLabel}
                    </div>

                    {desbloqueado && (
                      <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#a3e635] flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    <h3 className={`font-bold text-lg mb-1 ${desbloqueado ? 'text-white' : 'text-gray-900'}`}>
                      {premio.titulo}
                    </h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${desbloqueado ? 'text-gray-400' : 'text-gray-500'}`}>
                      {premio.descricao}
                    </p>

                    {!desbloqueado ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Progresso</span>
                          <span className="text-xs font-medium text-gray-600">{progresso.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                          <div 
                            className="h-full bg-gradient-to-r from-[#a3e635] to-[#84cc16] rounded-full transition-all"
                            style={{ width: `${Math.max(progresso, 3)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400">
                          Faltam <span className="font-semibold text-gray-600">R$ {falta.toLocaleString("pt-BR")}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 py-2 px-3 bg-[#a3e635]/10 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-[#a3e635]"></div>
                        <span className="text-sm font-medium text-[#a3e635]">Premio conquistado</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </ScrollArea>
    </>
  )
}
