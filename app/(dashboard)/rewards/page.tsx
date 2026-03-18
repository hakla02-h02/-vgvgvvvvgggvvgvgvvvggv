"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Check, Trophy, Target, Zap } from "lucide-react"
import { useState } from "react"

const premiacoes = [
  { 
    id: 1,
    titulo: "Caneca + Pulseira",
    subtitulo: "Grupo de Networking",
    pontos: "10K",
    pontosNum: 10000,
    descricao: "Celebre sua primeira grande conquista e abra portas para conexoes que impulsionam o proximo passo.",
    desbloqueado: false,
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TMhkBoA48JSpENaJVFkZRyrrQ2Y5JZ.png",
  },
  { 
    id: 2,
    titulo: "Kit Premium",
    subtitulo: "Mentoria Exclusiva",
    pontos: "100K",
    pontosNum: 100000,
    descricao: "Acesso a mentoria individual com especialistas e kit completo de brindes exclusivos.",
    desbloqueado: false,
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Zjc1SF7AR4QiHPCSItIilGEKhwR6Uz.png",
  },
  { 
    id: 3,
    titulo: "Experiencia VIP",
    subtitulo: "Evento Presencial",
    pontos: "500K",
    pontosNum: 500000,
    descricao: "Convite para evento presencial exclusivo com networking e palestras de alto nivel.",
    desbloqueado: false,
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-lh6iqRrOeYyMAq0IC6x8spZMt6dENP.png",
  },
  { 
    id: 4,
    titulo: "Parceria Oficial",
    subtitulo: "1 Milhao Faturado",
    pontos: "1M",
    pontosNum: 1000000,
    descricao: "O apice do premio. Reconhecimento maximo e acesso ao circulo mais exclusivo.",
    desbloqueado: false,
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-E1Izb9ktpBbqZlZTcVf6kpy6MAbafF.png",
  },
]

export default function RewardsPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const currentPremio = premiacoes[activeIndex]
  const progressPercent = 85
  const pontosAtuais = 8500
  const proximaMeta = 10000

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? premiacoes.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === premiacoes.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="min-h-full bg-[#f3f4f6] pb-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
            
            {/* Hero Module - Progress + Stats */}
            <div className="grid grid-cols-12 gap-4 mb-8">
              {/* Main Progress Panel */}
              <div className="col-span-8 bg-white rounded-[16px] p-6 border border-[#E5E7EB]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#9CA3AF] font-medium mb-1">Progresso atual</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#111827]">R$ 8.500</span>
                      <span className="text-sm text-[#6B7280]">de R$ 10.000</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#9CA3AF] mb-1">Proxima recompensa</p>
                    <p className="text-sm font-semibold text-[#111827]">Caneca + Pulseira</p>
                  </div>
                </div>
                
                <div className="relative h-2 bg-[#E5E7EB] rounded-full overflow-hidden mb-3">
                  <div 
                    className="absolute left-0 top-0 h-full bg-[#ccff00] rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#6B7280]">Faltam <span className="font-medium text-[#111827]">R$ 1.500</span> para desbloquear</p>
                  <p className="text-xs font-medium text-[#ccff00] bg-[#ccff00]/10 px-2 py-1 rounded-md">{progressPercent}%</p>
                </div>
              </div>

              {/* Stats Side Panel */}
              <div className="col-span-4 flex flex-col gap-4">
                <div className="flex-1 bg-white rounded-[16px] p-4 border border-[#E5E7EB]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ccff00]/15 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-[#97c700]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Conquistados</p>
                      <p className="text-xl font-bold text-[#111827]">0</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-[16px] p-4 border border-[#E5E7EB]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
                      <Target className="w-5 h-5 text-[#6B7280]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Disponiveis</p>
                      <p className="text-xl font-bold text-[#111827]">{premiacoes.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards Showcase Module */}
            <div className="grid grid-cols-12 gap-4 mb-8">
              {/* Featured Reward Card */}
              <div className="col-span-5">
                <div className="bg-[#111827] rounded-[16px] overflow-hidden h-full" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                  {/* Card Visual */}
                  <div className="relative h-80 bg-gradient-to-br from-[#1a2a1a] via-[#111827] to-[#0d1117] flex items-center justify-center p-6">
                    <img 
                      src={currentPremio.plaquinha} 
                      alt={`Plaquinha ${currentPremio.pontos}`}
                      className="w-44 h-auto object-contain"
                    />
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-5">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-black text-white">{currentPremio.pontos}</span>
                        <span className="text-[#ccff00] text-xs font-semibold uppercase tracking-wide">Meta</span>
                      </div>
                      <p className="text-white font-semibold">{currentPremio.titulo}</p>
                      <p className="text-white/50 text-sm">{currentPremio.subtitulo}</p>
                    </div>
                    
                    <p className="text-white/40 text-sm leading-relaxed mb-5">{currentPremio.descricao}</p>
                    
                    {currentPremio.desbloqueado ? (
                      <button className="w-full py-2.5 rounded-lg bg-[#ccff00] text-[#111827] font-semibold text-sm hover:bg-[#d4ff1a] transition-colors">
                        Resgatar
                      </button>
                    ) : (
                      <button className="w-full py-2.5 rounded-lg bg-white/5 text-white/30 font-semibold text-sm cursor-not-allowed border border-white/5">
                        Bloqueado
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Rewards Navigation Panel */}
              <div className="col-span-7 bg-white rounded-[16px] p-6 border border-[#E5E7EB]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">Todas as recompensas</h3>
                    <p className="text-xs text-[#9CA3AF]">Navegue entre os premios disponiveis</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrev}
                      className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#374151]" />
                    </button>
                    <button 
                      onClick={handleNext}
                      className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-[#374151]" />
                    </button>
                  </div>
                </div>

                {/* Rewards List */}
                <div className="space-y-2">
                  {premiacoes.map((premio, index) => (
                    <button
                      key={premio.id}
                      onClick={() => setActiveIndex(index)}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                        index === activeIndex 
                          ? 'bg-[#111827]' 
                          : 'bg-[#F9FAFB] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        premio.desbloqueado 
                          ? 'bg-[#ccff00]' 
                          : index === activeIndex 
                            ? 'bg-white/10' 
                            : 'bg-[#E5E7EB]'
                      }`}>
                        {premio.desbloqueado ? (
                          <Check className="w-5 h-5 text-[#111827]" />
                        ) : (
                          <span className={`text-sm font-bold ${index === activeIndex ? 'text-white/50' : 'text-[#9CA3AF]'}`}>{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-medium ${index === activeIndex ? 'text-white' : 'text-[#111827]'}`}>{premio.titulo}</p>
                        <p className={`text-xs ${index === activeIndex ? 'text-white/50' : 'text-[#9CA3AF]'}`}>{premio.subtitulo}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                          premio.desbloqueado 
                            ? 'bg-[#ccff00]/15 text-[#97c700]'
                            : index === activeIndex 
                              ? 'bg-white/10 text-white/50' 
                              : 'bg-[#F3F4F6] text-[#6B7280]'
                        }`}>
                          {premio.pontos}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Journey Timeline Module */}
            <div className="bg-white rounded-[16px] p-6 border border-[#E5E7EB]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">Jornada de Conquistas</h3>
                  <p className="text-xs text-[#9CA3AF]">Acompanhe seu progresso em cada nivel</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ccff00]/10">
                  <Zap className="w-4 h-4 text-[#97c700]" />
                  <span className="text-xs font-medium text-[#97c700]">0 de {premiacoes.length} conquistados</span>
                </div>
              </div>
              
              {/* Horizontal Timeline */}
              <div className="relative">
                <div className="flex items-center justify-between">
                  {premiacoes.map((premio, index) => (
                    <div key={premio.id} className="flex flex-col items-center relative z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${
                        premio.desbloqueado 
                          ? 'bg-[#ccff00]' 
                          : 'bg-[#F3F4F6] border-2 border-[#E5E7EB]'
                      }`}>
                        {premio.desbloqueado ? (
                          <Check className="w-6 h-6 text-[#111827]" />
                        ) : (
                          <span className="text-sm font-bold text-[#9CA3AF]">{index + 1}</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#111827] text-center">{premio.pontos}</p>
                      <p className="text-[10px] text-[#9CA3AF] text-center max-w-[80px] truncate">{premio.titulo}</p>
                    </div>
                  ))}
                </div>
                
                {/* Connection Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-[#E5E7EB] -z-0">
                  <div 
                    className="h-full bg-[#ccff00] transition-all duration-500"
                    style={{ width: `${(premiacoes.filter(p => p.desbloqueado).length / (premiacoes.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </ScrollArea>
    </>
  )
}
