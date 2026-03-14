"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Gift, Star, Trophy, Target, Lock, Check } from "lucide-react"
import { useState } from "react"

const premiacoes = [
  { 
    id: 1,
    titulo: "Pulseira Exclusiva",
    subtitulo: "Acesso VIP",
    pontos: "1K",
    pontosNum: 1000,
    descricao: "Desbloqueie seu acesso ao circulo interno com a pulseira oficial da comunidade.",
    desbloqueado: true,
  },
  { 
    id: 2,
    titulo: "Caneca + Pulseira",
    subtitulo: "Grupo de Networking",
    pontos: "10K",
    pontosNum: 10000,
    descricao: "Celebre sua primeira grande conquista e abra portas para conexoes que impulsionam o proximo passo.",
    desbloqueado: false,
  },
  { 
    id: 3,
    titulo: "Kit Premium",
    subtitulo: "Mentoria Exclusiva",
    pontos: "50K",
    pontosNum: 50000,
    descricao: "Acesso a mentoria individual com especialistas e kit completo de brindes exclusivos.",
    desbloqueado: false,
  },
  { 
    id: 4,
    titulo: "Experiencia VIP",
    subtitulo: "Evento Presencial",
    pontos: "100K",
    pontosNum: 100000,
    descricao: "Convite para evento presencial exclusivo com networking e palestras de alto nivel.",
    desbloqueado: false,
  },
  { 
    id: 5,
    titulo: "Parceria Oficial",
    subtitulo: "1 Milhao Faturado",
    pontos: "1M",
    pontosNum: 1000000,
    descricao: "O apice do premio. Reconhecimento maximo e acesso ao circulo mais exclusivo.",
    desbloqueado: false,
  },
]

export default function RewardsPage() {
  const [activeIndex, setActiveIndex] = useState(1)
  const pontosAtuais = 8500
  const proximaMeta = premiacoes.find(p => !p.desbloqueado)?.pontosNum || 10000
  const progresso = Math.min((pontosAtuais / proximaMeta) * 100, 100)

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? premiacoes.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === premiacoes.length - 1 ? 0 : prev + 1))
  }

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex
    
    if (diff === 0) {
      return {
        transform: 'translateX(0) scale(1)',
        opacity: 1,
        zIndex: 30,
        filter: 'blur(0px)',
      }
    } else if (diff === 1 || diff === -(premiacoes.length - 1)) {
      return {
        transform: 'translateX(115%) scale(0.88)',
        opacity: 0.5,
        zIndex: 20,
        filter: 'blur(3px)',
      }
    } else if (diff === -1 || diff === (premiacoes.length - 1)) {
      return {
        transform: 'translateX(-115%) scale(0.88)',
        opacity: 0.5,
        zIndex: 20,
        filter: 'blur(3px)',
      }
    }
    return {
      transform: 'translateX(0) scale(0.7)',
      opacity: 0,
      zIndex: 0,
      filter: 'blur(8px)',
    }
  }

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="min-h-full bg-[#f3f4f6] pb-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
            
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">Suas Conquistas</h1>
              <p className="text-sm text-[#666666]">Acompanhe seu progresso e resgate premios exclusivos</p>
            </div>

            {/* Progress Card */}
            <div className="bg-[#1A1A1A] rounded-[20px] p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ccff00]/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#ccff00]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Progresso Atual</p>
                    <p className="text-white/60 text-sm">Proxima meta: {premiacoes.find(p => !p.desbloqueado)?.pontos || "Completo"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#ccff00]">{pontosAtuais.toLocaleString('pt-BR')}</p>
                  <p className="text-white/60 text-sm">pontos</p>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-[#ccff00] h-full rounded-full transition-all duration-500 relative"
                  style={{ width: `${progresso}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#ccff00] rounded-full border-2 border-[#1A1A1A]"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/40">
                <span>0</span>
                <span>{(proximaMeta / 1000).toFixed(0)}K</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-[16px] p-5 border border-[#EEEEEE]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-[#ccff00]" />
                  </div>
                  <span className="text-sm text-[#666666]">Pontos Totais</span>
                </div>
                <p className="text-2xl font-bold text-[#1A1A1A]">8.500</p>
              </div>
              <div className="bg-white rounded-[16px] p-5 border border-[#EEEEEE]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-[#ccff00]" />
                  </div>
                  <span className="text-sm text-[#666666]">Resgatados</span>
                </div>
                <p className="text-2xl font-bold text-[#1A1A1A]">1</p>
              </div>
              <div className="bg-white rounded-[16px] p-5 border border-[#EEEEEE]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-[#ccff00]" />
                  </div>
                  <span className="text-sm text-[#666666]">Disponiveis</span>
                </div>
                <p className="text-2xl font-bold text-[#1A1A1A]">4</p>
              </div>
            </div>

            {/* Premios Section */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#1A1A1A] mb-1">Premios Disponiveis</h2>
              <p className="text-sm text-[#666666]">Navegue pelos premios e veja o que voce pode conquistar</p>
            </div>

            {/* Carousel Container */}
            <div className="bg-[#1A1A1A] rounded-[24px] p-8 mb-8 overflow-hidden">
              <div className="relative h-[420px] flex items-center justify-center">
                
                {/* Navigation Buttons */}
                <button 
                  onClick={handlePrev}
                  className="absolute left-2 z-40 w-12 h-12 rounded-full bg-[#ccff00] flex items-center justify-center hover:bg-[#b8e600] transition-all hover:scale-105"
                >
                  <ChevronLeft className="w-6 h-6 text-[#1A1A1A]" />
                </button>
                
                <button 
                  onClick={handleNext}
                  className="absolute right-2 z-40 w-12 h-12 rounded-full bg-[#ccff00] flex items-center justify-center hover:bg-[#b8e600] transition-all hover:scale-105"
                >
                  <ChevronRight className="w-6 h-6 text-[#1A1A1A]" />
                </button>

                {/* Cards Container */}
                <div className="relative w-full max-w-[300px] h-full flex items-center justify-center">
                  {premiacoes.map((premio, index) => (
                    <div
                      key={premio.id}
                      className="absolute w-full transition-all duration-500 ease-out cursor-pointer"
                      style={getCardStyle(index)}
                      onClick={() => setActiveIndex(index)}
                    >
                      {/* Card */}
                      <div className="relative bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-[20px] overflow-hidden border border-white/10">
                        
                        {/* Card Header with Image Area */}
                        <div className="relative h-44 bg-gradient-to-br from-[#2a3a2a] to-[#1a2a1a] flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 bg-[#ccff00]/5"></div>
                          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#ccff00]/20 border border-[#ccff00]/30">
                            <span className="text-xs font-bold text-[#ccff00]">{premio.pontos} FATURADO</span>
                          </div>
                          {premio.desbloqueado ? (
                            <div className="w-20 h-20 rounded-2xl bg-[#ccff00]/20 border border-[#ccff00]/40 flex items-center justify-center">
                              <Check className="w-10 h-10 text-[#ccff00]" />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                              <Lock className="w-10 h-10 text-white/30" />
                            </div>
                          )}
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-3xl font-black text-white">{premio.pontos}</span>
                            <div>
                              <p className="text-[#ccff00] font-bold text-sm">{premio.titulo} +</p>
                              <p className="text-[#ccff00] font-bold text-sm">{premio.subtitulo}</p>
                            </div>
                          </div>
                          <p className="text-white/60 text-sm leading-relaxed mb-5">{premio.descricao}</p>
                          
                          {premio.desbloqueado ? (
                            <button className="w-full py-3 rounded-xl bg-[#ccff00] text-[#1A1A1A] font-bold text-sm hover:bg-[#b8e600] transition-all">
                              Resgatar Premio
                            </button>
                          ) : (
                            <button className="w-full py-3 rounded-xl bg-white/10 text-white/50 font-bold text-sm cursor-not-allowed">
                              Bloqueado
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots Navigation */}
              <div className="flex justify-center gap-2 mt-4">
                {premiacoes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === activeIndex 
                        ? 'bg-[#ccff00] w-6' 
                        : 'bg-white/20 w-2 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Timeline / Milestones */}
            <div className="bg-white rounded-[20px] p-6 border border-[#EEEEEE]">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-6">Jornada de Conquistas</h3>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#EEEEEE]"></div>
                <div 
                  className="absolute left-5 top-0 w-0.5 bg-[#ccff00] transition-all duration-500"
                  style={{ height: `${(premiacoes.filter(p => p.desbloqueado).length / premiacoes.length) * 100}%` }}
                ></div>

                <div className="space-y-6">
                  {premiacoes.map((premio, index) => (
                    <div key={premio.id} className="flex items-start gap-4 relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        premio.desbloqueado 
                          ? 'bg-[#ccff00]' 
                          : 'bg-white border-2 border-[#EEEEEE]'
                      }`}>
                        {premio.desbloqueado ? (
                          <Check className="w-5 h-5 text-[#1A1A1A]" />
                        ) : (
                          <span className="text-sm font-bold text-[#666666]">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[#1A1A1A]">{premio.titulo}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#666666]">{premio.pontos}</span>
                          {premio.desbloqueado && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#ccff00]/20 text-[#7a9900] font-medium">Conquistado</span>
                          )}
                        </div>
                        <p className="text-sm text-[#666666]">{premio.subtitulo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </ScrollArea>
    </>
  )
}
