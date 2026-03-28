"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Lock, Gift, Users, Award, Trophy, Star } from "lucide-react"

const niveis = [
  { 
    id: 0,
    nome: "Iniciante",
    meta: 0,
    metaLabel: "0",
    premios: [],
    descricao: "Comece sua jornada no Dragon!",
  },
  { 
    id: 1,
    nome: "Explorador",
    meta: 10000,
    metaLabel: "10K",
    premios: ["Caneca Exclusiva", "Grupo VIP de Networking"],
    descricao: "Primeiro degrau da jornada: a venda inaugural valida a proposta e abre reputacao inicial no mercado.",
  },
  { 
    id: 2,
    nome: "Avancado",
    meta: 100000,
    metaLabel: "100K",
    premios: ["Kit Premium Completo", "Sessao de Mentoria 1:1"],
    descricao: "Com R$ 100.000 faturados, a operacao ganha ritmo previsivel e dados para refinar oferta.",
  },
  { 
    id: 3,
    nome: "Expert",
    meta: 500000,
    metaLabel: "500K",
    premios: ["Convite Evento Presencial", "Selo Verificado"],
    descricao: "R$ 500.000 em vendas consolidam autoridade e viabilizam expansao sustentavel.",
  },
  { 
    id: 4,
    nome: "Ouro",
    meta: 1000000,
    metaLabel: "1M",
    premios: ["Trofeu Personalizado", "Parceria Oficial Dragon"],
    descricao: "R$ 1 milhao faturado consolida marca reconhecida e parcerias estrategicas.",
  },
]

const iconesPorNivel = [Star, Gift, Award, Trophy, Trophy]

export default function RewardsPage() {
  // Dados do usuario (mock) - TODO: Buscar do banco de dados
  const faturamentoAtual = 0
  
  // Encontrar nivel atual do usuario
  const nivelAtualIndex = niveis.findIndex(n => faturamentoAtual < n.meta) - 1
  const nivelAtual = nivelAtualIndex >= 0 ? nivelAtualIndex : (faturamentoAtual >= 1000000 ? 4 : 0)
  const proximoNivel = Math.min(nivelAtual + 1, niveis.length - 1)
  
  // Progresso para o proximo nivel
  const metaAtual = niveis[nivelAtual]?.meta || 0
  const metaProxima = niveis[proximoNivel]?.meta || 1000000
  const progressoNoNivel = metaProxima > metaAtual 
    ? ((faturamentoAtual - metaAtual) / (metaProxima - metaAtual)) * 100 
    : 100

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="min-h-full bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto px-6 py-10">
            
            {/* Header - Faturamento */}
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium mb-2">
                Faturamento Total
              </p>
              <p className="text-5xl font-black text-white tracking-tight">
                R$ {faturamentoAtual.toLocaleString("pt-BR")}
              </p>
            </div>

            {/* Card de Nivel Atual */}
            <div className="bg-[#111] rounded-2xl p-6 mb-12 border border-white/10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm uppercase tracking-wide">Seu nivel:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#b8ff29] flex items-center justify-center">
                      <span className="text-xs font-bold text-black">D</span>
                    </div>
                    <span className="font-bold text-white text-lg">{niveis[nivelAtual].nome}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm uppercase tracking-wide">Proximo:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#b8ff29]/20 flex items-center justify-center border border-[#b8ff29]">
                      <span className="text-xs font-bold text-[#b8ff29]">D</span>
                    </div>
                    <span className="font-bold text-white text-lg">{niveis[proximoNivel].nome}</span>
                  </div>
                </div>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#b8ff29] rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(progressoNoNivel, 0)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">R$ {metaAtual.toLocaleString("pt-BR")}</span>
                <span className="text-xs text-[#b8ff29] font-bold">{niveis[proximoNivel].metaLabel}</span>
              </div>
            </div>

            {/* Titulo Jornada */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-2">Jornada de Conquistas</h2>
              <p className="text-gray-500">Cada etapa e marcada por uma nova meta de faturamento.</p>
            </div>

            {/* Mapa Serpentina */}
            <div className="relative">
              {niveis.map((nivel, idx) => {
                const isDesbloqueado = faturamentoAtual >= nivel.meta
                const isAtual = idx === nivelAtual
                const isProximo = idx === proximoNivel && !isDesbloqueado
                const isEsquerda = idx % 2 === 0
                const IconeNivel = iconesPorNivel[idx]
                
                return (
                  <div key={nivel.id} className="relative">
                    {/* Linha conectora curva */}
                    {idx < niveis.length - 1 && (
                      <div className={`absolute ${isEsquerda ? 'left-1/2' : 'right-1/2'} top-full w-1/2 h-16`}>
                        <svg 
                          className="w-full h-full" 
                          viewBox="0 0 200 60" 
                          preserveAspectRatio="none"
                        >
                          <path
                            d={isEsquerda 
                              ? "M 0 0 Q 100 0 100 30 Q 100 60 200 60" 
                              : "M 200 0 Q 100 0 100 30 Q 100 60 0 60"
                            }
                            fill="none"
                            stroke={faturamentoAtual >= niveis[idx + 1]?.meta ? "#b8ff29" : "#333"}
                            strokeWidth="3"
                            strokeDasharray={faturamentoAtual >= niveis[idx + 1]?.meta ? "0" : "8 8"}
                          />
                        </svg>
                      </div>
                    )}
                    
                    {/* Card do Nivel */}
                    <div className={`flex items-center gap-6 mb-16 ${isEsquerda ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Node/Icone */}
                      <div className="flex-shrink-0 relative">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
                          isDesbloqueado 
                            ? 'bg-[#b8ff29] shadow-[0_0_30px_rgba(184,255,41,0.4)]' 
                            : 'bg-[#1a1a1a] border-2 border-[#333]'
                        }`}>
                          {isDesbloqueado ? (
                            <Check className="w-10 h-10 text-black" strokeWidth={3} />
                          ) : (
                            <Lock className="w-8 h-8 text-gray-600" />
                          )}
                        </div>
                        
                        {/* Badge VOCE ESTA AQUI */}
                        {isAtual && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#b8ff29] text-black text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                            VOCE ESTA AQUI
                          </div>
                        )}
                      </div>
                      
                      {/* Conteudo */}
                      <div className={`flex-1 ${isEsquerda ? 'text-left' : 'text-right'}`}>
                        <div className={`inline-block p-6 rounded-2xl transition-all ${
                          isDesbloqueado 
                            ? 'bg-[#111] border border-[#b8ff29]/30' 
                            : 'bg-[#111] border border-white/5 opacity-60'
                        }`}>
                          {/* Header */}
                          <div className={`flex items-center gap-3 mb-3 ${isEsquerda ? '' : 'flex-row-reverse'}`}>
                            <h3 className={`text-xl font-bold ${isDesbloqueado ? 'text-white' : 'text-gray-500'}`}>
                              {nivel.nome}
                            </h3>
                            <span className={`px-3 py-1 text-sm font-bold rounded-lg ${
                              isDesbloqueado 
                                ? 'bg-[#b8ff29] text-black' 
                                : 'bg-[#333] text-gray-500'
                            }`}>
                              {nivel.metaLabel}
                            </span>
                            {isProximo && (
                              <span className="text-[#b8ff29] text-xs font-bold">PROXIMO</span>
                            )}
                          </div>
                          
                          {/* Descricao */}
                          <p className={`text-sm mb-4 max-w-md ${isDesbloqueado ? 'text-gray-400' : 'text-gray-600'}`}>
                            {nivel.descricao}
                          </p>
                          
                          {/* Premios */}
                          {nivel.premios.length > 0 && (
                            <div className={`flex flex-wrap gap-2 ${isEsquerda ? '' : 'justify-end'}`}>
                              {nivel.premios.map((premio, pIdx) => (
                                <span 
                                  key={pIdx}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                                    isDesbloqueado 
                                      ? 'bg-[#b8ff29]/10 text-[#b8ff29] border border-[#b8ff29]/30' 
                                      : 'bg-white/5 text-gray-500 border border-white/10'
                                  }`}
                                >
                                  <Gift className="w-3 h-3" />
                                  {premio}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </ScrollArea>
    </>
  )
}
