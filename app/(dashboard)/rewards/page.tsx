"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check } from "lucide-react"
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
  
  // Dados do usuario (mock)
  const pontosAtuais = 8500
  const proximaMeta = 10000
  const progressPercent = Math.min((pontosAtuais / proximaMeta) * 100, 100)

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="min-h-full bg-[#f3f4f6] pb-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
            
            {/* Barra de Progresso */}
            <div className="bg-[#16181d] rounded-3xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Seu Progresso</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">R$ {pontosAtuais.toLocaleString("pt-BR")}</span>
                    <span className="text-sm text-gray-500">/ R$ {proximaMeta.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#ccff00] bg-[#ccff00]/10 px-3 py-1.5 rounded-full">
                    {progressPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-[#ccff00] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                Faltam <span className="text-white font-semibold">R$ {(proximaMeta - pontosAtuais).toLocaleString("pt-BR")}</span> para desbloquear a proxima premiacao
              </p>
            </div>

            {/* Premiacao em Destaque */}
            <div className="bg-[#16181d] rounded-3xl overflow-hidden border border-white/5">
              {/* Imagem */}
              <div className="relative h-64 bg-gradient-to-b from-[#1a1a1a] to-[#16181d] flex items-center justify-center">
                <img 
                  src={currentPremio.plaquinha} 
                  alt={`Plaquinha ${currentPremio.pontos}`}
                  className="w-40 h-auto object-contain"
                />
              </div>
              
              {/* Info */}
              <div className="p-6 text-center">
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="text-[#ccff00] text-xs font-bold uppercase tracking-wider">Meta</span>
                  <span className="text-2xl font-black text-white">{currentPremio.pontos}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{currentPremio.titulo}</h3>
                <p className="text-sm text-gray-500 mb-4">{currentPremio.subtitulo}</p>
                <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto mb-6">{currentPremio.descricao}</p>
                
                {currentPremio.desbloqueado ? (
                  <button className="w-full max-w-xs mx-auto py-3 rounded-2xl bg-[#ccff00] text-black font-bold text-sm hover:bg-[#b8e600] transition-colors">
                    Resgatar Premio
                  </button>
                ) : (
                  <button className="w-full max-w-xs mx-auto py-3 rounded-2xl bg-white/5 text-gray-500 font-semibold text-sm cursor-not-allowed border border-white/5">
                    Bloqueado
                  </button>
                )}
              </div>
            </div>

            {/* Timeline / Mapa de Progresso */}
            <div className="bg-[#16181d] rounded-3xl p-6 border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-6 text-center">Sua Jornada</p>
              
              <div className="relative">
                {/* Linha conectora vertical */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-white/10" />
                
                {/* Linha de progresso */}
                <div 
                  className="absolute left-6 top-6 w-0.5 bg-[#ccff00] transition-all duration-500"
                  style={{ 
                    height: `${Math.min((premiacoes.filter(p => p.desbloqueado).length / premiacoes.length) * 100, 0)}%` 
                  }}
                />
                
                {/* Items */}
                <div className="space-y-0">
                  {premiacoes.map((premio, index) => {
                    const isActive = index === activeIndex
                    const isCompleted = premio.desbloqueado
                    
                    return (
                      <button
                        key={premio.id}
                        onClick={() => setActiveIndex(index)}
                        className={`relative w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
                          isActive ? "bg-white/5" : "hover:bg-white/[0.02]"
                        }`}
                      >
                        {/* Indicador */}
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompleted 
                            ? "bg-[#ccff00]" 
                            : isActive 
                              ? "bg-white/10 ring-2 ring-[#ccff00]" 
                              : "bg-white/5"
                        }`}>
                          {isCompleted ? (
                            <Check className="w-5 h-5 text-black" />
                          ) : (
                            <span className={`text-sm font-bold ${isActive ? "text-[#ccff00]" : "text-gray-600"}`}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`font-semibold truncate ${isActive ? "text-white" : "text-gray-400"}`}>
                              {premio.titulo}
                            </p>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                              isCompleted 
                                ? "bg-[#ccff00]/20 text-[#ccff00]" 
                                : isActive
                                  ? "bg-white/10 text-white"
                                  : "bg-white/5 text-gray-500"
                            }`}>
                              {premio.pontos}
                            </span>
                          </div>
                          <p className={`text-xs truncate ${isActive ? "text-gray-400" : "text-gray-600"}`}>
                            {premio.subtitulo}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </ScrollArea>
    </>
  )
}
