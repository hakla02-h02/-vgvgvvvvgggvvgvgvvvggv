"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Lock, Copy, Users, DollarSign, Gift, Trophy, Gem, Crown, Star } from "lucide-react"

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
    icon: Trophy,
    color: "#39FF14",
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
    icon: Star,
    color: "#39FF14",
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
    icon: Gem,
    color: "#FFD700",
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
    icon: Crown,
    color: "#FFD700",
  },
  { 
    id: 5,
    titulo: "Elite Dragon",
    subtitulo: "Acesso Total",
    pontos: "2M",
    pontosNum: 2000000,
    nivel: "Rubi",
    descricao: "R$ 2 milhoes em faturamento abrem portas para o circulo de elite Dragon.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-E1Izb9ktpBbqZlZTcVf6kpy6MAbafF.png",
    icon: Gem,
    color: "#FF4444",
  },
  { 
    id: 6,
    titulo: "Safira Dragon",
    subtitulo: "Reconhecimento Maximo",
    pontos: "5M",
    pontosNum: 5000000,
    nivel: "Safira",
    descricao: "R$ 5 milhoes consolidam lideranca absoluta no ecossistema Dragon.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-E1Izb9ktpBbqZlZTcVf6kpy6MAbafF.png",
    icon: Gem,
    color: "#4488FF",
  },
  { 
    id: 7,
    titulo: "Esmeralda Dragon",
    subtitulo: "Lenda",
    pontos: "10M",
    pontosNum: 10000000,
    nivel: "Esmeralda",
    descricao: "R$ 10 milhoes - voce se tornou uma lenda do ecossistema Dragon.",
    plaquinha: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-E1Izb9ktpBbqZlZTcVf6kpy6MAbafF.png",
    icon: Gem,
    color: "#00FF88",
  },
]

export default function RewardsPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const currentPremio = premiacoes[activeIndex]
  
  // Dados do usuario (mock)
  const faturamentoAtual = 8500
  const ganhosIndicacao = 1250
  const usuariosIndicados = 3
  const referralLink = "https://dragon.app/ref/usuario123"
  
  // Encontrar nivel atual
  const nivelAtualIndex = premiacoes.findIndex(p => faturamentoAtual < p.pontosNum)
  const nivelAtual = nivelAtualIndex === 0 ? "Iniciante" : premiacoes[Math.max(0, nivelAtualIndex - 1)].nivel
  const proximoNivel = premiacoes[Math.min(nivelAtualIndex, premiacoes.length - 1)]
  
  const progressPercent = Math.min((faturamentoAtual / proximoNivel.pontosNum) * 100, 100)
  const isDesbloqueado = faturamentoAtual >= currentPremio.pontosNum

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="min-h-full bg-[#0A0A0A]">
          <div className="max-w-4xl mx-auto px-6 py-10">
            
            {/* Header - Faturamento Total */}
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[#666] font-medium mb-3">
                Faturamento Total
              </p>
              <p className="text-6xl font-black text-white tracking-tight mb-2">
                R$ {faturamentoAtual.toLocaleString("pt-BR")}
              </p>
            </div>

            {/* Barra de Progresso Principal */}
            <div className="bg-[#111] rounded-2xl p-6 mb-8 border border-[#222]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-[#666] text-sm uppercase tracking-wide">Seu nivel:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#39FF14] flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.4)]">
                      <span className="text-xs font-bold text-black">D</span>
                    </div>
                    <span className="font-bold text-white text-lg">{nivelAtual}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#666] text-sm uppercase tracking-wide">Proximo:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#39FF14]/20 flex items-center justify-center border-2 border-[#39FF14]">
                      <span className="text-xs font-bold text-[#39FF14]">D</span>
                    </div>
                    <span className="font-bold text-white text-lg">{proximoNivel.nivel}</span>
                  </div>
                </div>
              </div>
              <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#39FF14] to-[#7FFF00] rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(57,255,20,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-sm text-[#666]">R$ 0</span>
                <span className="text-sm text-[#39FF14] font-bold">{proximoNivel.pontos}</span>
              </div>
            </div>

            {/* Premiacao Central */}
            <div className="bg-[#111] rounded-2xl p-8 mb-8 border border-[#222] text-center">
              {/* Imagem */}
              <div className="relative w-64 h-64 mx-auto mb-6">
                <div className={`absolute inset-0 rounded-full ${isDesbloqueado ? 'bg-[#39FF14]/10 animate-pulse' : ''}`} />
                <img 
                  src={currentPremio.plaquinha} 
                  alt={currentPremio.titulo}
                  className={`w-full h-full object-contain drop-shadow-2xl transition-all duration-500 ${
                    !isDesbloqueado && 'opacity-40 grayscale'
                  }`}
                />
                {!isDesbloqueado && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center border-2 border-[#333]">
                      <Lock className="w-7 h-7 text-[#666]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 rounded-full border border-[#39FF14]/30 mb-4">
                <Trophy className="w-4 h-4 text-[#39FF14]" />
                <span className="text-[#39FF14] text-sm font-bold tracking-wide">
                  DRAGON {currentPremio.pontos}
                </span>
              </div>

              {/* Titulo */}
              <h2 className="text-3xl font-bold text-white mb-2">
                {currentPremio.titulo}
              </h2>
              <p className="text-[#888] text-lg mb-4">
                {currentPremio.subtitulo}
              </p>

              {/* Descricao */}
              <p className="text-[#666] text-sm max-w-md mx-auto leading-relaxed mb-8">
                {currentPremio.descricao}
              </p>

              {/* Botao */}
              {isDesbloqueado ? (
                <button className="px-12 py-4 bg-[#39FF14] text-black font-bold text-sm rounded-full hover:bg-[#7FFF00] transition-all shadow-[0_0_30px_rgba(57,255,20,0.4)]">
                  Resgatar Premio
                </button>
              ) : (
                <div className="px-12 py-4 bg-[#1a1a1a] text-[#666] font-medium text-sm rounded-full border border-[#333]">
                  Faltam R$ {(currentPremio.pontosNum - faturamentoAtual).toLocaleString("pt-BR")}
                </div>
              )}
            </div>

            {/* Convide Amigos */}
            <div className="bg-[#111] rounded-2xl p-6 mb-8 border border-[#222]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[#39FF14]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Convide amigos e ganhe comissoes</h3>
                  <p className="text-[#666] text-sm">Ganhe 10% de comissao em cada venda dos seus indicados</p>
                </div>
              </div>

              {/* Link de Indicacao */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 bg-[#0a0a0a] rounded-xl px-4 py-3 border border-[#222]">
                  <p className="text-[#888] text-sm truncate">{referralLink}</p>
                </div>
                <button 
                  onClick={copyLink}
                  className="px-6 py-3 bg-[#39FF14] text-black font-bold text-sm rounded-xl hover:bg-[#7FFF00] transition-all flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#222]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[#39FF14]" />
                    </div>
                    <div>
                      <p className="text-[#666] text-xs uppercase tracking-wide">Ganhos Totais</p>
                      <p className="text-white text-xl font-bold">R$ {ganhosIndicacao.toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#222]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#39FF14]" />
                    </div>
                    <div>
                      <p className="text-[#666] text-xs uppercase tracking-wide">Usuarios Indicados</p>
                      <p className="text-white text-xl font-bold">{usuariosIndicados}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Jornada de Conquistas - Estilo Mapa/Caminho */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">Jornada de Conquistas</h3>
              <p className="text-[#666] text-sm mb-8">Cada etapa e marcada por uma nova meta de faturamento.</p>

              {/* Mapa da Jornada */}
              <div className="relative">
                {/* Linha conectora vertical */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#39FF14] via-[#39FF14]/50 to-[#333]" />
                
                {premiacoes.map((premio, idx) => {
                  const unlocked = faturamentoAtual >= premio.pontosNum
                  const isCurrent = idx === nivelAtualIndex
                  const isPast = idx < nivelAtualIndex
                  const IconComponent = premio.icon
                  
                  return (
                    <div
                      key={premio.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative flex items-start gap-6 mb-6 cursor-pointer group`}
                    >
                      {/* Node/Icone */}
                      <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        unlocked || isPast
                          ? 'bg-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.5)]' 
                          : isCurrent 
                            ? 'bg-[#39FF14]/20 border-2 border-[#39FF14]'
                            : 'bg-[#1a1a1a] border border-[#333]'
                      }`}>
                        {unlocked || isPast ? (
                          <Check className="w-6 h-6 text-black" />
                        ) : (
                          <IconComponent className={`w-5 h-5 ${isCurrent ? 'text-[#39FF14]' : 'text-[#666]'}`} />
                        )}
                      </div>

                      {/* Card */}
                      <div className={`flex-1 bg-[#111] rounded-2xl p-5 border transition-all ${
                        activeIndex === idx 
                          ? 'border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.1)]' 
                          : isCurrent
                            ? 'border-[#39FF14]/50'
                            : 'border-[#222] group-hover:border-[#333]'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white text-lg">{premio.nivel}</span>
                            <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                              unlocked || isPast
                                ? 'bg-[#39FF14] text-black'
                                : 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30'
                            }`}>
                              {premio.pontos}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPast && (
                              <span className="text-[#39FF14] text-xs font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Conquistado
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[#39FF14] text-xs font-semibold animate-pulse">Proximo</span>
                            )}
                          </div>
                        </div>
                        <p className="text-[#888] text-sm leading-relaxed">
                          {premio.descricao}
                        </p>
                      </div>
                    </div>
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
