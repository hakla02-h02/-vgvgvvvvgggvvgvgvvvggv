"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Lock } from "lucide-react"

const premiacoes = [
  { 
    id: 1,
    titulo: "Caneca + Pulseira",
    subtitulo: "Grupo de Networking",
    pontos: "10K",
    pontosNum: 10000,
    descricao: "Celebre sua primeira grande conquista e abra portas para conexoes que impulsionam o proximo passo.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TMhkBoA48JSpENaJVFkZRyrrQ2Y5JZ.png",
  },
  { 
    id: 2,
    titulo: "Kit Premium",
    subtitulo: "Mentoria Exclusiva",
    pontos: "100K",
    pontosNum: 100000,
    descricao: "Acesso a mentoria individual com especialistas e kit completo de brindes exclusivos.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Zjc1SF7AR4QiHPCSItIilGEKhwR6Uz.png",
  },
  { 
    id: 3,
    titulo: "Experiencia VIP",
    subtitulo: "Evento Presencial",
    pontos: "500K",
    pontosNum: 500000,
    descricao: "Convite para evento presencial exclusivo com networking e palestras de alto nivel.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-lh6iqRrOeYyMAq0IC6x8spZMt6dENP.png",
  },
  { 
    id: 4,
    titulo: "Parceria Oficial",
    subtitulo: "1 Milhao Faturado",
    pontos: "1M",
    pontosNum: 1000000,
    descricao: "O apice do premio. Reconhecimento maximo e acesso ao circulo mais exclusivo.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-E1Izb9ktpBbqZlZTcVf6kpy6MAbafF.png",
  },
]

export default function RewardsPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const currentPremio = premiacoes[activeIndex]
  
  // Dados do usuario (mock)
  const faturamentoAtual = 8500
  const isDesbloqueado = faturamentoAtual >= currentPremio.pontosNum
  const progressPercent = Math.min((faturamentoAtual / currentPremio.pontosNum) * 100, 100)

  // Encontrar quantas premiacoes estao desbloqueadas
  const desbloqueadasCount = premiacoes.filter(p => faturamentoAtual >= p.pontosNum).length

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="min-h-full bg-foreground">
          <div className="max-w-2xl mx-auto px-6 py-10">
            
            {/* Faturamento - Flutuante */}
            <div className="text-center mb-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium mb-2">
                Faturamento Total
              </p>
              <p className="text-5xl font-black text-white tracking-tight">
                R$ {faturamentoAtual.toLocaleString("pt-BR")}
              </p>
            </div>

            {/* Barra de progresso - Flutuante */}
            <div className="mb-16">
              <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-[#ccff00] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-gray-600">R$ 0</span>
                <span className="text-[10px] text-[#ccff00] font-semibold">{currentPremio.pontos}</span>
              </div>
            </div>

            {/* Premiacao Central - Flutuante */}
            <div className="flex flex-col items-center mb-20">
              {/* Glow */}
              <div className={`absolute w-80 h-80 rounded-full blur-[100px] transition-colors duration-500 ${
                isDesbloqueado ? 'bg-[#ccff00]/10' : 'bg-white/[0.02]'
              }`} />
              
              {/* Imagem */}
              <div className="relative w-52 h-52 mb-6">
                <img 
                  src={currentPremio.plaquinha} 
                  alt={currentPremio.titulo}
                  className={`w-full h-full object-contain transition-all duration-500 ${
                    !isDesbloqueado && 'opacity-30 grayscale'
                  }`}
                />
                {!isDesbloqueado && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10">
                      <Lock className="w-6 h-6 text-gray-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Meta */}
              <span className="text-[#ccff00] text-xs font-bold tracking-widest mb-2">
                META {currentPremio.pontos}
              </span>

              {/* Titulo */}
              <h2 className="text-2xl font-bold text-white mb-1 text-center">
                {currentPremio.titulo}
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                {currentPremio.subtitulo}
              </p>

              {/* Descricao */}
              <p className="text-gray-400 text-sm text-center max-w-sm leading-relaxed mb-8">
                {currentPremio.descricao}
              </p>

              {/* Botao */}
              {isDesbloqueado ? (
                <button className="px-10 py-3.5 bg-[#ccff00] text-black font-bold text-sm rounded-full hover:bg-[#d4ff4d] transition-all shadow-[0_0_40px_rgba(204,255,0,0.3)]">
                  Resgatar Premio
                </button>
              ) : (
                <div className="px-10 py-3.5 bg-white/5 text-gray-500 font-medium text-sm rounded-full border border-white/5">
                  Faltam R$ {(currentPremio.pontosNum - faturamentoAtual).toLocaleString("pt-BR")}
                </div>
              )}
            </div>

            {/* Timeline Horizontal - Flutuante */}
            <div className="relative">
              {/* Linha base */}
              <div className="absolute top-5 left-0 right-0 h-px bg-white/10" />
              
              {/* Linha de progresso */}
              <div 
                className="absolute top-5 left-0 h-px bg-[#ccff00] transition-all duration-700"
                style={{ 
                  width: `${desbloqueadasCount > 0 
                    ? ((desbloqueadasCount - 0.5) / (premiacoes.length - 1)) * 100 
                    : 0}%` 
                }}
              />

              {/* Pontos */}
              <div className="relative flex justify-between">
                {premiacoes.map((premio, index) => {
                  const unlocked = faturamentoAtual >= premio.pontosNum
                  const isActive = index === activeIndex
                  
                  return (
                    <button
                      key={premio.id}
                      onClick={() => setActiveIndex(index)}
                      className="flex flex-col items-center group"
                    >
                      {/* Circulo */}
                      <div className={`
                        relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                        ${unlocked 
                          ? 'bg-[#ccff00] text-black' 
                          : isActive 
                            ? 'bg-foreground border-2 border-[#ccff00] text-[#ccff00]' 
                            : 'bg-foreground border border-white/10 text-gray-600'
                        }
                        ${isActive && 'scale-125'}
                        group-hover:scale-110
                      `}>
                        {unlocked ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span className="text-xs font-bold">{index + 1}</span>
                        )}
                      </div>

                      {/* Label */}
                      <span className={`
                        mt-3 text-[10px] font-bold transition-all
                        ${isActive ? 'text-[#ccff00]' : unlocked ? 'text-white' : 'text-gray-600'}
                      `}>
                        {premio.pontos}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </ScrollArea>
    </>
  )
}
