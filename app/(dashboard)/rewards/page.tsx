"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Gift, Zap, HeadphonesIcon, Award, Check, Lock, Star, TrendingUp, ChevronRight, Globe, History, Bolt, Shield, Diamond } from "lucide-react"

const premiacoes = [
  { 
    id: 1,
    titulo: "Gift Card Amazon R$ 100", 
    descricao: "Resgate um vale-presente para utilizar em qualquer compra na Amazon Brasil.",
    pontos: 1500,
    icon: Gift,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    status: "disponivel"
  },
  { 
    id: 2,
    titulo: "Beta Features Access", 
    descricao: "Tenha acesso antecipado as novas ferramentas de IA antes do lancamento oficial.",
    pontos: 500,
    icon: Zap,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    status: "disponivel"
  },
  { 
    id: 3,
    titulo: "Suporte Prioritario", 
    descricao: "Fila exclusiva para atendimento tecnico com resposta em menos de 2 horas.",
    pontos: 0,
    icon: HeadphonesIcon,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    status: "resgatado"
  },
  { 
    id: 4,
    titulo: "Badges Exclusivos", 
    descricao: "Conjunto de icones e badges premium para destacar seu perfil na comunidade.",
    pontos: 200,
    icon: Award,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    status: "disponivel"
  },
]

const jornada = [
  { id: 1, nome: "Starter", conquistado: true, atual: false },
  { id: 2, nome: "Silver Tier", conquistado: true, atual: false },
  { id: 3, nome: "Elite Gold", conquistado: true, atual: true },
  { id: 4, nome: "Platinum", conquistado: false, atual: false },
  { id: 5, nome: "Legendary", conquistado: false, atual: false },
]

const atividadeRecente = [
  { id: 1, titulo: "Conclusao de Projeto", pontos: "+1,200", tempo: "Ontem", tipo: "ganho" },
  { id: 2, titulo: "Resgate Realizado", pontos: "-500", tempo: "2 dias atras", tipo: "gasto" },
  { id: 3, titulo: "Streak Semanal", pontos: "+150", tempo: "3 dias atras", tipo: "ganho" },
]

export default function RewardsPage() {
  const pontosTotal = 12450
  const pontosDisponiveis = 3200
  const statusAtual = "Elite Gold"
  const rankGlobal = 412
  const badgesColetados = 12
  const badgesTotal = 24
  const desafioProgresso = 66

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="min-h-full bg-[#f3f4f6] text-[#1A1A1A] pb-8">
          <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Content */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Welcome Section */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Minhas Premiacoes</h1>
                  <p className="text-[#64748B] mt-2 text-base md:text-lg">Voce esta a 850 pontos de atingir o nivel Platinum.</p>
                </div>

                {/* Points Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 md:p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#E5E7EB]">
                    <p className="text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-widest mb-1">Pontos Totais</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl md:text-3xl font-black text-slate-900">{pontosTotal.toLocaleString('pt-BR')}</span>
                      <span className="text-green-500 text-sm font-bold mb-1">+12%</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 md:p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#E5E7EB]">
                    <p className="text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-widest mb-1">Disponiveis</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl md:text-3xl font-black text-slate-900">{pontosDisponiveis.toLocaleString('pt-BR')}</span>
                      <Star className="w-5 h-5 text-[#ccff00] mb-1" fill="#ccff00" />
                    </div>
                  </div>
                  <div className="bg-[#ccff00] p-5 md:p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <p className="text-[10px] md:text-xs font-bold text-black uppercase tracking-widest mb-1">Status Atual</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-black text-black">{statusAtual}</span>
                      <Award className="w-5 h-5 text-black" />
                    </div>
                  </div>
                </div>

                {/* Journey Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900">Jornada de Conquistas</h2>
                    <button className="text-sm font-semibold text-[#64748B] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors">
                      Ver detalhes <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-white p-6 md:p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#E5E7EB] overflow-x-auto">
                    <div className="relative flex items-center justify-between min-w-[500px]">
                      {/* Progress Line */}
                      <div 
                        className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #ccff00 0%, #ccff00 40%, #E5E7EB 40%, #E5E7EB 100%)' }}
                      ></div>
                      
                      {/* Milestones */}
                      {jornada.map((item) => (
                        <div key={item.id} className="relative flex flex-col items-center">
                          <div className={`
                            ${item.atual ? 'w-12 h-12 scale-110 ring-4 ring-[#ccff00]/20' : 'w-10 h-10'} 
                            rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10
                            ${item.conquistado ? 'bg-[#ccff00]' : 'bg-slate-100 border-[#E5E7EB]'}
                          `}>
                            {item.conquistado ? (
                              item.atual ? (
                                <TrendingUp className={`${item.atual ? 'w-6 h-6' : 'w-5 h-5'} text-black`} />
                              ) : (
                                <Check className="w-5 h-5 text-black" />
                              )
                            ) : (
                              <Lock className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <span className={`mt-4 whitespace-nowrap ${
                            item.atual ? 'text-sm font-black text-slate-900' : 
                            item.conquistado ? 'text-xs font-bold text-slate-900' : 
                            'text-xs font-medium text-[#64748B]'
                          }`}>
                            {item.nome}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Rewards Grid */}
                <section className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">Recompensas Disponiveis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {premiacoes.map((premio) => {
                      const Icon = premio.icon
                      const resgatado = premio.status === "resgatado"
                      
                      return (
                        <div 
                          key={premio.id}
                          className="bg-white p-5 md:p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#E5E7EB] hover:border-[#ccff00]/50 transition-all flex flex-col h-full"
                        >
                          <div className={`w-12 h-12 ${premio.iconBg} ${premio.iconColor} rounded-xl flex items-center justify-center mb-5`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold mb-2 text-slate-900">{premio.titulo}</h3>
                          <p className="text-[#64748B] text-sm flex-1">{premio.descricao}</p>
                          <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4">
                            <span className="font-bold text-slate-900">
                              {resgatado ? 'Ativo' : `${premio.pontos.toLocaleString('pt-BR')} pts`}
                            </span>
                            <button 
                              className={`px-5 py-2 font-bold text-sm rounded-xl transition-all ${
                                resgatado 
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                  : 'bg-[#ccff00] text-black hover:shadow-lg hover:shadow-[#ccff00]/20'
                              }`}
                              disabled={resgatado}
                            >
                              {resgatado ? 'Ja Resgatado' : 'Resgatar'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              </div>

              {/* Right Side Panel */}
              <aside className="lg:col-span-4 space-y-6">
                
                {/* Achievements Summary Card */}
                <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#E5E7EB] p-6 md:p-8">
                  <h3 className="text-xl font-bold mb-6 text-slate-900">Resumo de Conquistas</h3>
                  <div className="space-y-6">
                    
                    {/* Global Rank */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Globe className="w-5 h-5 text-[#ccff00]" />
                        </div>
                        <span className="text-sm font-semibold">Rank Global</span>
                      </div>
                      <span className="text-lg font-black text-slate-900">#{rankGlobal}</span>
                    </div>

                    {/* Badges Collection */}
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4">
                        Badges Coletados ({badgesColetados}/{badgesTotal})
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="aspect-square rounded-full bg-[#ccff00]/20 flex items-center justify-center border border-[#ccff00]/40">
                          <Bolt className="w-4 h-4 text-black" />
                        </div>
                        <div className="aspect-square rounded-full bg-[#ccff00]/20 flex items-center justify-center border border-[#ccff00]/40">
                          <Shield className="w-4 h-4 text-black" />
                        </div>
                        <div className="aspect-square rounded-full bg-[#ccff00]/20 flex items-center justify-center border border-[#ccff00]/40">
                          <Diamond className="w-4 h-4 text-black" />
                        </div>
                        <div className="aspect-square rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 opacity-40">
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4">Atividade Recente</p>
                      <div className="space-y-4">
                        {atividadeRecente.map((atividade) => (
                          <div key={atividade.id} className="flex gap-4">
                            <div className={`w-1 rounded-full ${atividade.tipo === 'ganho' ? 'bg-[#ccff00]' : 'bg-blue-500'}`}></div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{atividade.titulo}</p>
                              <p className="text-xs text-[#64748B]">{atividade.pontos} pontos - {atividade.tempo}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-8 py-3 bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                    Ver historico completo <History className="w-4 h-4" />
                  </button>
                </div>

                {/* Challenge Card */}
                <div className="bg-gradient-to-br from-[#ccff00] to-[#b8e600] rounded-2xl p-6 md:p-8 text-black shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                  <h4 className="text-lg font-black mb-2">Desafio da Semana</h4>
                  <p className="text-sm font-medium mb-6 opacity-80">Complete 3 revisoes de codigo e ganhe um bonus de 500 pontos extras!</p>
                  <div className="w-full bg-black/10 rounded-full h-2 mb-2">
                    <div className="bg-black h-full rounded-full" style={{ width: `${desafioProgresso}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span>2 de 3 concluidos</span>
                    <span>{desafioProgresso}%</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
