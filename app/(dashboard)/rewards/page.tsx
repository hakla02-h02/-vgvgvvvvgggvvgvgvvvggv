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
    nivel: "Explorador",
    emoji: "🪙",
    descricao: "Primeiro degrau da jornada: a venda inaugural valida a proposta, comprova interesse real e abre reputacao inicial no mercado.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TMhkBoA48JSpENaJVFkZRyrrQ2Y5JZ.png",
  },
  { 
    id: 2,
    titulo: "Kit Premium",
    subtitulo: "Mentoria Exclusiva",
    pontos: "100K",
    pontosNum: 100000,
    nivel: "Avancado",
    emoji: "💰",
    descricao: "Com R$ 100.000 faturados, a operacao ganha ritmo previsivel; dados permitem refinar oferta, marketing e aprimorar suporte.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Zjc1SF7AR4QiHPCSItIilGEKhwR6Uz.png",
  },
  { 
    id: 3,
    titulo: "Experiencia VIP",
    subtitulo: "Evento Presencial",
    pontos: "500K",
    pontosNum: 500000,
    nivel: "Expert",
    emoji: "🥫",
    descricao: "R$ 500.000 em vendas consolidam autoridade; receita estavel viabiliza equipe enxuta, processos solidos e expansao sustentavel.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-lh6iqRrOeYyMAq0IC6x8spZMt6dENP.png",
  },
  { 
    id: 4,
    titulo: "Parceria Oficial",
    subtitulo: "1 Milhao Faturado",
    pontos: "1Mi",
    pontosNum: 1000000,
    nivel: "Ouro",
    emoji: "🏅",
    descricao: "R$ 1 milhao faturado consolida marca reconhecida; comunidade engajada impulsiona reputacao, recomendacoes organicas e parcerias.",
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

  // Encontrar nivel atual e proximo
  const nivelAtualIndex = premiacoes.findIndex(p => faturamentoAtual < p.pontosNum)
  const nivelAtual = nivelAtualIndex > 0 ? premiacoes[nivelAtualIndex - 1] : null
  const proximoNivel = premiacoes[nivelAtualIndex] || premiacoes[premiacoes.length - 1]

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

            {/* Jornada de conquistas */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Jornada de conquistas</h3>
              <p className="text-gray-500 text-sm mb-6">Cada etapa e marcada por uma nova meta de faturamento.</p>
              
              {/* Nivel atual e proximo */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Seu nivel:</span>
                    <span className="text-xl">{nivelAtual?.emoji || "🪙"}</span>
                    <span className="font-semibold text-gray-900">{nivelAtual?.nivel || "Iniciante"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Proximo nivel:</span>
                    <span className="text-xl">{proximoNivel.emoji}</span>
                    <span className="font-semibold text-gray-900">{proximoNivel.nivel}</span>
                  </div>
                </div>
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((faturamentoAtual / proximoNivel.pontosNum) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Grid de cards estilo roadmap */}
              <div className="relative">
                {/* Cards em grid 2x2 com linhas tracejadas conectando */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {premiacoes.map((premio, index) => {
                    const unlocked = faturamentoAtual >= premio.pontosNum
                    const isActive = index === activeIndex
                    const isCurrentLevel = nivelAtualIndex === index
                    const isNextLevel = nivelAtualIndex === index
                    
                    return (
                      <div key={premio.id} className="relative">
                        {/* Linha tracejada conectora - horizontal */}
                        {index % 2 === 0 && index < premiacoes.length - 1 && (
                          <div className="absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-gray-200" />
                        )}
                        
                        {/* Linha tracejada conectora - vertical para proxima linha */}
                        {index < premiacoes.length - 2 && index % 2 === 1 && (
                          <div className="absolute -bottom-4 left-1/2 h-8 border-l-2 border-dashed border-gray-200" />
                        )}
                        
                        {/* Card */}
                        <button
                          onClick={() => setActiveIndex(index)}
                          className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                            isActive 
                              ? 'border-blue-500 bg-white shadow-lg' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{premio.emoji}</span>
                            <span className="font-bold text-gray-900">{premio.nivel}</span>
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                              {premio.pontos}
                            </span>
                            {isCurrentLevel && nivelAtualIndex > 0 && (
                              <span className="ml-auto text-xs text-gray-400">Seu nivel</span>
                            )}
                            {isNextLevel && (
                              <span className="ml-auto text-xs text-blue-500">Proximo nivel</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            {premio.descricao}
                          </p>
                          {unlocked && (
                            <div className="flex items-center gap-1.5 mt-3 text-green-600">
                              <Check className="w-4 h-4" />
                              <span className="text-xs font-medium">Desbloqueado</span>
                            </div>
                          )}
                        </button>
                      </div>
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
