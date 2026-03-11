"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"

const premiacoes = [
  { 
    id: 1,
    titulo: "Badge Exclusivo", 
    descricao: "Destaque no ranking e reconhecimento na comunidade",
    meta: 10000,
    metaLabel: "R$ 10K",
    imagem: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=300&fit=crop",
  },
  { 
    id: 2,
    titulo: "Acesso Premium", 
    descricao: "Recursos exclusivos e suporte prioritario 24/7",
    meta: 100000,
    metaLabel: "R$ 100K",
    imagem: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop",
  },
  { 
    id: 3,
    titulo: "Consultoria VIP", 
    descricao: "Sessao exclusiva com especialistas + taxa reduzida",
    meta: 500000,
    metaLabel: "R$ 500K",
    imagem: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop",
  },
  { 
    id: 4,
    titulo: "Membro Elite", 
    descricao: "Status VIP permanente + taxa zero por 3 meses",
    meta: 1000000,
    metaLabel: "R$ 1M",
    imagem: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop",
  },
]

export default function RewardsPage() {
  const faturamentoAtual = 0

  // Proxima meta
  const proximaMetaIdx = premiacoes.findIndex((p) => faturamentoAtual < p.meta)
  const proximaMeta = proximaMetaIdx >= 0 ? premiacoes[proximaMetaIdx] : premiacoes[premiacoes.length - 1]
  const faltaParaMeta = proximaMeta.meta - faturamentoAtual
  const progressoGeral = proximaMetaIdx >= 0 ? (faturamentoAtual / proximaMeta.meta) * 100 : 100

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f4f5f7] min-h-full">
          
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#a3e635]/20 to-transparent"></div>
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#a3e635] relative z-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Premiacoes
              </h1>
              <p className="text-sm text-muted-foreground">
                Conquiste metas e desbloqueie recompensas exclusivas
              </p>
            </div>
          </div>

          {/* Hero Progress Module */}
          <div className="bg-[#111] rounded-[28px] p-6 md:p-8 mb-8 relative overflow-hidden">
            {/* Glows */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#a3e635] opacity-15 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#a3e635] opacity-10 blur-[50px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              {/* Top Row - Stats */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Seu faturamento</p>
                  <p className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    R$ {faturamentoAtual.toLocaleString("pt-BR")}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs mb-0.5">Proxima meta</p>
                    <p className="text-[#a3e635] font-bold text-xl">{proximaMeta.metaLabel}</p>
                  </div>
                  <div className="w-px h-10 bg-card/10"></div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs mb-0.5">Faltam</p>
                    <p className="text-white font-bold text-xl">R$ {faltaParaMeta.toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="h-3 bg-card/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#a3e635] to-[#84cc16] rounded-full transition-all duration-500 relative"
                    style={{ width: `${Math.max(progressoGeral, 2)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20"></div>
                  </div>
                </div>
                
                {/* Milestones */}
                <div className="flex justify-between mt-3">
                  {premiacoes.map((p, idx) => {
                    const posicao = (p.meta / premiacoes[premiacoes.length - 1].meta) * 100
                    const conquistado = faturamentoAtual >= p.meta
                    return (
                      <div 
                        key={p.id}
                        className="flex flex-col items-center"
                        style={{ position: 'absolute', left: `${posicao}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className={`w-2 h-2 rounded-full ${conquistado ? 'bg-[#a3e635]' : 'bg-card/30'}`}></div>
                        <span className={`text-[10px] mt-1 ${conquistado ? 'text-[#a3e635]' : 'text-muted-foreground'}`}>
                          {p.metaLabel}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section Title */}
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">Suas Recompensas</h2>
          </div>

          {/* Grid de Premiacoes - Layout responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {premiacoes.map((premio) => {
              const desbloqueado = faturamentoAtual >= premio.meta
              const progresso = Math.min(100, (faturamentoAtual / premio.meta) * 100)
              const falta = premio.meta - faturamentoAtual

              return (
                <div 
                  key={premio.id}
                  className={`rounded-[20px] overflow-hidden transition-all duration-300 ${
                    desbloqueado 
                      ? 'bg-[#111] shadow-[0_0_20px_rgba(163,230,53,0.1)]' 
                      : 'bg-card border border-border'
                  }`}
                >
                  {/* Image - Compacta */}
                  <div className="relative h-24 overflow-hidden">
                    <img 
                      src={premio.imagem} 
                      alt={premio.titulo}
                      className={`w-full h-full object-cover ${!desbloqueado ? 'grayscale-[50%] opacity-80' : ''}`}
                    />
                    <div className={`absolute inset-0 ${desbloqueado ? 'bg-gradient-to-t from-[#111]/80 to-transparent' : 'bg-gradient-to-t from-white/60 to-transparent'}`}></div>
                    
                    {/* Badge da meta */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold ${
                      desbloqueado 
                        ? 'bg-[#a3e635] text-black' 
                        : 'bg-card/95 text-gray-600'
                    }`}>
                      {premio.metaLabel}
                    </div>

                    {desbloqueado && (
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#a3e635] flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content - Compacto */}
                  <div className="p-4">
                    <h3 className={`font-semibold text-sm mb-1 ${desbloqueado ? 'text-white' : 'text-foreground'}`}>
                      {premio.titulo}
                    </h3>
                    <p className={`text-xs mb-3 line-clamp-2 ${desbloqueado ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                      {premio.descricao}
                    </p>

                    {!desbloqueado ? (
                      <div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full bg-gradient-to-r from-[#a3e635] to-[#84cc16] rounded-full"
                            style={{ width: `${Math.max(progresso, 3)}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Faltam <span className="font-medium text-gray-600">R$ {falta.toLocaleString("pt-BR")}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 py-1.5 px-2 bg-[#a3e635]/10 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#a3e635]"></div>
                        <span className="text-xs font-medium text-[#a3e635]">Conquistado</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </ScrollArea>
    </>
  )
}
