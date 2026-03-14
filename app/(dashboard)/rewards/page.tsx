"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Gift, Zap, HeadphonesIcon, Award, Star, Trophy, Target, Clock } from "lucide-react"

const premiacoes = [
  { 
    id: 1,
    titulo: "Gift Card Amazon R$ 100", 
    descricao: "Vale-presente para utilizar em qualquer compra na Amazon Brasil.",
    pontos: 1500,
    icon: Gift,
    status: "disponivel"
  },
  { 
    id: 2,
    titulo: "Beta Features Access", 
    descricao: "Acesso antecipado as novas ferramentas de IA antes do lancamento.",
    pontos: 500,
    icon: Zap,
    status: "disponivel"
  },
  { 
    id: 3,
    titulo: "Suporte Prioritario", 
    descricao: "Fila exclusiva para atendimento com resposta em menos de 2 horas.",
    pontos: 0,
    icon: HeadphonesIcon,
    status: "resgatado"
  },
  { 
    id: 4,
    titulo: "Badges Exclusivos", 
    descricao: "Icones e badges premium para destacar seu perfil na comunidade.",
    pontos: 200,
    icon: Award,
    status: "disponivel"
  },
]

const atividadeRecente = [
  { id: 1, titulo: "Conclusao de Projeto", pontos: "+1,200", tempo: "Ontem" },
  { id: 2, titulo: "Resgate Realizado", pontos: "-500", tempo: "2 dias atras" },
  { id: 3, titulo: "Streak Semanal", pontos: "+150", tempo: "3 dias atras" },
]

export default function RewardsPage() {
  const pontosTotal = 12450
  const pontosDisponiveis = 3200
  const statusAtual = "Elite Gold"
  const proximoNivel = 850

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="min-h-full bg-[#f3f4f6] text-[#1A1A1A] pb-8">
          <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:max-w-5xl space-y-6 pt-6">
            
            {/* Hero Section */}
            <section className="text-center space-y-2 lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1A1A1A] text-balance">
                Minhas Premiacoes
              </h2>
              <p className="text-[#666666] text-sm max-w-xs mx-auto lg:mx-0 lg:max-w-md">
                Voce esta a {proximoNivel} pontos de atingir o nivel Platinum.
              </p>
            </section>

            {/* Desktop: Two column layout */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">
              
              {/* Points Hero Card */}
              <div className="relative overflow-hidden rounded-[24px] p-6 sm:p-8 bg-foreground dark:bg-card text-background dark:text-foreground">
                {/* Glow effect */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-accent opacity-20 blur-[40px] rounded-full pointer-events-none"></div>
                <div className="flex flex-col gap-4 sm:gap-6 relative z-10 h-full justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-widest font-semibold mb-1">Pontos Disponiveis</p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">
                        {pontosDisponiveis.toLocaleString('pt-BR')}
                      </span>
                      <Star className="w-6 h-6 text-accent" fill="currentColor" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 sm:pt-6 border-t border-background/10 dark:border-border">
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Pontos Totais</p>
                      <p className="text-xl lg:text-2xl font-bold">{pontosTotal.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Status Atual</p>
                      <p className="text-xl lg:text-2xl font-bold text-accent">{statusAtual}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#EEEEEE]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#ccff00]/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#1A1A1A]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1A1A]">Proximo Nivel: Platinum</p>
                    <p className="text-xs text-[#666666]">Faltam {proximoNivel} pontos</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-[#EEEEEE] rounded-full h-3 mb-4">
                  <div className="bg-[#ccff00] h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
                
                <div className="flex justify-between text-xs text-[#666666]">
                  <span>Elite Gold</span>
                  <span>78% completo</span>
                  <span>Platinum</span>
                </div>

                {/* Achievements */}
                <div className="mt-6 pt-6 border-t border-[#EEEEEE]">
                  <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider mb-4">Conquistas Recentes</p>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ccff00]/20 flex items-center justify-center border border-[#ccff00]/40">
                      <Trophy className="w-4 h-4 text-[#1A1A1A]" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#ccff00]/20 flex items-center justify-center border border-[#ccff00]/40">
                      <Zap className="w-4 h-4 text-[#1A1A1A]" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#ccff00]/20 flex items-center justify-center border border-[#ccff00]/40">
                      <Star className="w-4 h-4 text-[#1A1A1A]" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#EEEEEE] flex items-center justify-center text-[#666666]">
                      <span className="text-xs font-bold">+9</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Two column layout for Rewards + Activity */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">
              
              {/* Rewards List */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#666666] uppercase tracking-wider">Recompensas Disponiveis</h3>
                </div>
                
                <div className="bg-[#16181d] border border-white/5 rounded-3xl overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {premiacoes.map((premio) => {
                      const Icon = premio.icon
                      const resgatado = premio.status === "resgatado"
                      
                      return (
                        <div key={premio.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#ccff00]/20 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-[#ccff00]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-bold text-white text-sm">{premio.titulo}</p>
                                  <p className="text-xs text-gray-400 mt-1">{premio.descricao}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-xs font-bold text-white">
                                  {resgatado ? 'Ativo' : `${premio.pontos.toLocaleString('pt-BR')} pts`}
                                </span>
                                <button 
                                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                                    resgatado 
                                      ? 'bg-white/10 text-gray-400 cursor-not-allowed' 
                                      : 'bg-[#ccff00] text-black hover:bg-[#b8e600]'
                                  }`}
                                  disabled={resgatado}
                                >
                                  {resgatado ? 'Resgatado' : 'Resgatar'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>

              {/* Activity Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#666666] uppercase tracking-wider">Atividade Recente</h3>
                  <button className="text-xs text-[#666666] font-medium hover:text-[#1A1A1A] transition-colors">Ver todas</button>
                </div>
                
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#EEEEEE]">
                  <div className="space-y-4">
                    {atividadeRecente.map((atividade) => (
                      <div key={atividade.id} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#f3f4f6] flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-[#666666]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[#1A1A1A] text-sm">{atividade.titulo}</p>
                          <p className="text-xs text-[#666666]">{atividade.tempo}</p>
                        </div>
                        <span className={`text-sm font-bold ${atividade.pontos.startsWith('+') ? 'text-green-600' : 'text-[#666666]'}`}>
                          {atividade.pontos}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Challenge Card */}
                <div className="bg-[#ccff00] rounded-[24px] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <p className="font-bold text-black">Desafio da Semana</p>
                      <p className="text-xs text-black/70">Complete e ganhe 500 pontos</p>
                    </div>
                  </div>
                  <p className="text-sm text-black/80 mb-4">Complete 3 revisoes de codigo e ganhe um bonus de pontos extras!</p>
                  <div className="w-full bg-black/10 rounded-full h-2 mb-2">
                    <div className="bg-black h-full rounded-full" style={{ width: '66%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-black">
                    <span>2 de 3 concluidos</span>
                    <span>66%</span>
                  </div>
                </div>
              </section>
            </div>

          </div>
        </div>
      </ScrollArea>
    </>
  )
}
