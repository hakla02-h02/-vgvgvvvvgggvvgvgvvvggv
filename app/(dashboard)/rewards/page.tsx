"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Lock, ChevronRight } from "lucide-react"

const premiacoes = [
  { 
    id: 1,
    titulo: "Caneca + Pulseira",
    subtitulo: "Grupo de Networking",
    pontos: "10K",
    pontosNum: 10000,
    nivel: "Explorador",
    descricao: "Primeiro degrau da jornada: a venda inaugural valida a proposta e abre reputacao inicial no mercado.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TMhkBoA48JSpENaJVFkZRyrrQ2Y5JZ.png",
  },
  { 
    id: 2,
    titulo: "Kit Premium",
    subtitulo: "Mentoria Exclusiva",
    pontos: "100K",
    pontosNum: 100000,
    nivel: "Avancado",
    descricao: "Com R$ 100.000 faturados, a operacao ganha ritmo previsivel e dados para refinar oferta.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Zjc1SF7AR4QiHPCSItIilGEKhwR6Uz.png",
  },
  { 
    id: 3,
    titulo: "Experiencia VIP",
    subtitulo: "Evento Presencial",
    pontos: "500K",
    pontosNum: 500000,
    nivel: "Expert",
    descricao: "R$ 500.000 em vendas consolidam autoridade e viabilizam expansao sustentavel.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-lh6iqRrOeYyMAq0IC6x8spZMt6dENP.png",
  },
  { 
    id: 4,
    titulo: "Parceria Oficial",
    subtitulo: "1 Milhao Faturado",
    pontos: "1M",
    pontosNum: 1000000,
    nivel: "Ouro",
    descricao: "R$ 1 milhao faturado consolida marca reconhecida e parcerias estrategicas.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-E1Izb9ktpBbqZlZTcVf6kpy6MAbafF.png",
  },
]

export default function RewardsPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const currentPremio = premiacoes[activeIndex]
  
  // Dados do usuario (mock) - TODO: Buscar do banco de dados
  const faturamentoAtual = 0
  const isDesbloqueado = faturamentoAtual >= currentPremio.pontosNum
  const progressPercent = Math.min((faturamentoAtual / currentPremio.pontosNum) * 100, 100)

  // Encontrar nivel atual
  const nivelAtualIndex = premiacoes.findIndex(p => faturamentoAtual < p.pontosNum)

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="min-h-full bg-[#f3f4f6]">
          <div className="max-w-3xl mx-auto px-6 py-10">
            
            {/* Faturamento */}
            <div className="text-center mb-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium mb-2">
                Faturamento Total
              </p>
              <p className="text-5xl font-black text-gray-900 tracking-tight">
                R$ {faturamentoAtual.toLocaleString("pt-BR")}
              </p>
            </div>

            {/* Barra de progresso */}
            <div className="mb-16">
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-[#ccff00] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[11px] text-gray-400">R$ 0</span>
                <span className="text-[11px] text-[#9ab300] font-semibold">{currentPremio.pontos}</span>
              </div>
            </div>

            {/* Premiacao Central */}
            <div className="flex flex-col items-center mb-20">
              {/* Imagem */}
              <div className="relative w-56 h-56 mb-6">
                <img 
                  src={currentPremio.plaquinha} 
                  alt={currentPremio.titulo}
                  className={`w-full h-full object-contain drop-shadow-2xl transition-all duration-500 ${
                    !isDesbloqueado && 'opacity-40 grayscale'
                  }`}
                />
                {!isDesbloqueado && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Meta */}
              <span className="text-[#9ab300] text-xs font-bold tracking-widest mb-2">
                META {currentPremio.pontos}
              </span>

              {/* Titulo */}
              <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">
                {currentPremio.titulo}
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                {currentPremio.subtitulo}
              </p>

              {/* Descricao */}
              <p className="text-gray-500 text-sm text-center max-w-md leading-relaxed mb-8">
                {currentPremio.descricao}
              </p>

              {/* Botao */}
              {isDesbloqueado ? (
                <button className="px-10 py-3.5 bg-[#ccff00] text-black font-bold text-sm rounded-full hover:bg-[#d4ff4d] transition-all shadow-lg">
                  Resgatar Premio
                </button>
              ) : (
                <div className="px-10 py-3.5 bg-gray-200 text-gray-500 font-medium text-sm rounded-full">
                  Faltam R$ {(currentPremio.pontosNum - faturamentoAtual).toLocaleString("pt-BR")}
                </div>
              )}
            </div>

            {/* Jornada de Conquistas - Design System IndieGanhe */}
            <div className="mt-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Jornada de conquistas</h3>
                <p className="text-gray-500 text-sm mt-1">Cada etapa e marcada por uma nova meta de faturamento.</p>
              </div>

              {/* Card principal escuro - igual IndieGanhe */}
              <div className="bg-[#16181d] rounded-2xl p-6 mb-8 border border-white/5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-[#888] text-sm uppercase tracking-wide">Seu nivel:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#ccff00] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-black">D</span>
                      </div>
                      <span className="font-semibold text-white">
                        {nivelAtualIndex === 0 ? "Iniciante" : premiacoes[Math.max(0, nivelAtualIndex - 1)].nivel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#888] text-sm uppercase tracking-wide">Proximo:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#ccff00]/30 flex items-center justify-center border border-[#ccff00]">
                        <span className="text-[10px] font-bold text-[#ccff00]">D</span>
                      </div>
                      <span className="font-semibold text-white">
                        {premiacoes[Math.min(nivelAtualIndex, premiacoes.length - 1)].nivel}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ccff00] rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[#666]">R$ 0</span>
                  <span className="text-xs text-[#ccff00] font-semibold">{premiacoes[nivelAtualIndex]?.pontos || "1M"}</span>
                </div>
              </div>

              {/* Grid de cards escuros - igual IndieGanhe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {premiacoes.map((premio, idx) => {
                  const unlocked = faturamentoAtual >= premio.pontosNum
                  const isCurrent = idx === nivelAtualIndex - 1 && unlocked
                  const isNext = idx === nivelAtualIndex
                  
                  return (
                    <button
                      key={premio.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative text-left p-5 rounded-2xl transition-all border ${
                        activeIndex === idx 
                          ? 'bg-[#16181d] border-[#ccff00]' 
                          : 'bg-[#16181d] border-white/5 hover:border-white/20'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            unlocked ? 'bg-[#ccff00]' : 'bg-white/10'
                          }`}>
                            {unlocked ? (
                              <Check className="w-5 h-5 text-black" />
                            ) : (
                              <Lock className="w-4 h-4 text-[#666]" />
                            )}
                          </div>
                          <span className="font-semibold text-white">{premio.nivel}</span>
                          <span className="px-2.5 py-1 bg-[#ccff00] text-black text-xs font-bold rounded-lg">
                            {premio.pontos}
                          </span>
                        </div>
                        {isCurrent && (
                          <span className="text-[#ccff00] text-xs font-semibold">Seu nivel</span>
                        )}
                        {isNext && (
                          <span className="text-[#ccff00] text-xs font-semibold">Proximo</span>
                        )}
                      </div>
                      
                      {/* Descricao */}
                      <p className="text-[#888] text-sm leading-relaxed">
                        {premio.descricao}
                      </p>

                      {/* Indicador de selecionado */}
                      {activeIndex === idx && (
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#ccff00]" />
                      )}
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
