"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Lock, Gift, Users, Award, Trophy, Star, Copy, Share2 } from "lucide-react"
import Image from "next/image"

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

export default function RewardsPage() {
  const [copied, setCopied] = useState(false)
  
  // Dados do usuario (mock) - TODO: Buscar do banco de dados
  const faturamentoAtual = 0
  const referralCode = "DRAGON2024"
  const referralLink = `https://dragon.app/ref/${referralCode}`
  
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="min-h-full bg-background">
          <div className="max-w-4xl mx-auto px-6 py-10">
            
            {/* Header - Faturamento Total */}
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-[#b8ff29] font-medium mb-2">
                Faturamento Total
              </p>
              <p className="text-5xl font-black text-foreground tracking-tight">
                R$ {faturamentoAtual.toLocaleString("pt-BR")}
              </p>
            </div>

            {/* Barra de Progresso */}
            <div className="mb-10">
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#b8ff29] rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(progressoNoNivel, 0)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">R$ {metaAtual.toLocaleString("pt-BR")}</span>
                <span className="text-xs text-[#b8ff29] font-bold">{niveis[proximoNivel].metaLabel}</span>
              </div>
            </div>

            {/* Card Premiacao Central - Trofeu/Plaquinha */}
            <Card className="mb-10 bg-gradient-to-br from-secondary/50 to-secondary/30 border-border/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col items-center py-10">
                  {/* Imagem do Trofeu */}
                  <div className="relative w-48 h-48 mb-6">
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 via-white to-gray-400 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-gray-300">
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <svg className="w-12 h-12 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z"/>
                          </svg>
                        </div>
                        <p className="text-xs font-bold text-gray-600 tracking-wider">DRAGON</p>
                        <p className="text-3xl font-black text-gray-500 mt-1">{niveis[proximoNivel].metaLabel}</p>
                        <div className="w-10 h-10 rounded-full bg-gray-400/50 flex items-center justify-center mx-auto mt-2">
                          <Lock className="w-5 h-5 text-gray-500" />
                        </div>
                        <p className="text-[8px] text-gray-500 mt-2 tracking-wider">PARABENS PELO FATURAMENTO</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info da Meta */}
                  <p className="text-sm text-[#b8ff29] font-bold tracking-wider mb-1">META {niveis[proximoNivel].metaLabel}</p>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {niveis[proximoNivel].premios[0] || "Premiacao Especial"}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {niveis[proximoNivel].premios[1] || "Desbloqueie ao atingir a meta"}
                  </p>
                  
                  {/* Botao */}
                  <Button className="bg-[#b8ff29] text-black hover:bg-[#a8ef19] font-bold px-8">
                    Ver Detalhes da Premiacao
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card Convide Amigos */}
            <Card className="mb-12 bg-secondary/30 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#b8ff29]/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#b8ff29]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Convide Amigos</h3>
                    <p className="text-sm text-muted-foreground">Ganhe bonus por cada indicacao</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground truncate">{referralLink}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-[#b8ff29]/50 text-[#b8ff29] hover:bg-[#b8ff29]/10"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button className="bg-[#b8ff29] text-black hover:bg-[#a8ef19]">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Titulo Jornada de Conquistas */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Jornada de Conquistas</h2>
              <p className="text-muted-foreground">Cada etapa e marcada por uma nova meta de faturamento.</p>
            </div>

            {/* Card Nivel Atual */}
            <Card className="mb-10 bg-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm uppercase tracking-wide">Seu nivel:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#b8ff29] flex items-center justify-center">
                        <span className="text-xs font-bold text-black">D</span>
                      </div>
                      <span className="font-bold text-foreground text-lg">{niveis[nivelAtual].nome}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm uppercase tracking-wide">Proximo:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#b8ff29]/20 flex items-center justify-center border border-[#b8ff29]">
                        <span className="text-xs font-bold text-[#b8ff29]">D</span>
                      </div>
                      <span className="font-bold text-foreground text-lg">{niveis[proximoNivel].nome}</span>
                    </div>
                  </div>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#b8ff29] rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(progressoNoNivel, 0)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">R$ {metaAtual.toLocaleString("pt-BR")}</span>
                  <span className="text-xs text-[#b8ff29] font-bold">{niveis[proximoNivel].metaLabel}</span>
                </div>
              </CardContent>
            </Card>

            {/* Mapa Serpentina - Jornada de Conquistas */}
            <div className="relative pb-8">
              {niveis.slice(1).map((nivel, idx) => {
                const isDesbloqueado = faturamentoAtual >= nivel.meta
                const isAtual = idx + 1 === nivelAtual
                const isProximo = idx + 1 === proximoNivel && !isDesbloqueado
                const isEsquerda = idx % 2 === 0
                
                return (
                  <div key={nivel.id} className="relative">
                    {/* Linha conectora curva */}
                    {idx < niveis.length - 2 && (
                      <div className={`absolute ${isEsquerda ? 'left-1/2' : 'right-1/2'} top-full w-1/2 h-12 z-0`}>
                        <svg 
                          className="w-full h-full" 
                          viewBox="0 0 200 48" 
                          preserveAspectRatio="none"
                        >
                          <path
                            d={isEsquerda 
                              ? "M 0 0 Q 100 0 100 24 Q 100 48 200 48" 
                              : "M 200 0 Q 100 0 100 24 Q 100 48 0 48"
                            }
                            fill="none"
                            stroke={faturamentoAtual >= niveis[idx + 2]?.meta ? "#b8ff29" : "hsl(var(--border))"}
                            strokeWidth="2"
                            strokeDasharray={faturamentoAtual >= niveis[idx + 2]?.meta ? "0" : "6 6"}
                          />
                        </svg>
                      </div>
                    )}
                    
                    {/* Card do Nivel */}
                    <div className={`flex items-start gap-4 mb-12 ${isEsquerda ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Node/Icone */}
                      <div className="flex-shrink-0 relative z-10">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                          isDesbloqueado 
                            ? 'bg-[#b8ff29] shadow-[0_0_20px_rgba(184,255,41,0.3)]' 
                            : 'bg-card border-2 border-border'
                        }`}>
                          {isDesbloqueado ? (
                            <Check className="w-7 h-7 text-black" strokeWidth={3} />
                          ) : (
                            <Lock className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        
                        {/* Badge VOCE ESTA AQUI */}
                        {isAtual && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#b8ff29] text-black text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg">
                            VOCE ESTA AQUI
                          </div>
                        )}
                        
                        {/* Indicador Proximo */}
                        {isProximo && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#b8ff29] rounded-full animate-pulse" />
                        )}
                      </div>
                      
                      {/* Conteudo do Card */}
                      <Card className={`flex-1 transition-all ${
                        isDesbloqueado 
                          ? 'bg-card border-[#b8ff29]/30' 
                          : 'bg-card/50 border-border/50 opacity-70'
                      } ${isProximo ? 'border-[#b8ff29]/50' : ''}`}>
                        <CardContent className="p-5">
                          {/* Header */}
                          <div className={`flex items-center gap-3 mb-2 ${isEsquerda ? '' : 'flex-row-reverse'}`}>
                            <h3 className={`text-lg font-bold ${isDesbloqueado ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {nivel.nome}
                            </h3>
                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
                              isDesbloqueado 
                                ? 'bg-[#b8ff29] text-black' 
                                : 'bg-secondary text-muted-foreground'
                            }`}>
                              {nivel.metaLabel}
                            </span>
                            {isProximo && (
                              <span className="text-[#b8ff29] text-xs font-bold">Proximo</span>
                            )}
                          </div>
                          
                          {/* Descricao */}
                          <p className={`text-sm mb-3 ${isDesbloqueado ? 'text-muted-foreground' : 'text-muted-foreground/70'} ${isEsquerda ? 'text-left' : 'text-right'}`}>
                            {nivel.descricao}
                          </p>
                          
                          {/* Premios */}
                          {nivel.premios.length > 0 && (
                            <div className={`flex flex-wrap gap-2 ${isEsquerda ? '' : 'justify-end'}`}>
                              {nivel.premios.map((premio, pIdx) => (
                                <span 
                                  key={pIdx}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                    isDesbloqueado 
                                      ? 'bg-[#b8ff29]/10 text-[#b8ff29] border border-[#b8ff29]/30' 
                                      : 'bg-secondary/50 text-muted-foreground border border-border/50'
                                  }`}
                                >
                                  <Gift className="w-3 h-3" />
                                  {premio}
                                </span>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
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
