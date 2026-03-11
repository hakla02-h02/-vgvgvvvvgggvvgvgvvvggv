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
    cor: "#a3e635"
  },
  { 
    id: 2,
    titulo: "Acesso Premium", 
    descricao: "Recursos exclusivos e suporte prioritario 24/7",
    meta: 100000,
    metaLabel: "R$ 100K",
    imagem: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop",
    cor: "#3b82f6"
  },
  { 
    id: 3,
    titulo: "Consultoria VIP", 
    descricao: "Sessao exclusiva com especialistas + taxa reduzida",
    meta: 500000,
    metaLabel: "R$ 500K",
    imagem: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop",
    cor: "#8b5cf6"
  },
  { 
    id: 4,
    titulo: "Membro Elite", 
    descricao: "Status VIP permanente + taxa zero por 3 meses",
    meta: 1000000,
    metaLabel: "R$ 1M",
    imagem: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop",
    cor: "#f59e0b"
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
          
          {/* Header */}
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
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Premiacoes
              </h1>
              <p className="text-sm text-gray-500">
                Conquiste metas e desbloqueie recompensas exclusivas
              </p>
            </div>
          </div>

          {/* Card de Progresso Atual */}
          <div className="bg-white rounded-[24px] border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Faturamento atual</p>
                <p className="text-2xl font-bold text-gray-900">R$ {faturamentoAtual.toLocaleString("pt-BR")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Proxima meta</p>
                <p className="text-lg font-bold" style={{ color: proximaMeta.cor }}>{proximaMeta.metaLabel}</p>
              </div>
            </div>
            
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full rounded-full transition-all bg-[#a3e635]"
                style={{ width: `${progressoGeral}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400">
              Faltam <span className="text-gray-600 font-medium">R$ {faltaParaMeta.toLocaleString("pt-BR")}</span> para a proxima premiacao
            </p>
          </div>

          {/* Lista de Premiacoes */}
          <div className="space-y-3">
            {premiacoes.map((premio) => {
              const desbloqueado = faturamentoAtual >= premio.meta
              const progresso = Math.min(100, (faturamentoAtual / premio.meta) * 100)
              const falta = premio.meta - faturamentoAtual

              return (
                <div 
                  key={premio.id}
                  className={`bg-white rounded-[20px] border overflow-hidden transition-all ${
                    desbloqueado 
                      ? 'border-[#a3e635]/40 shadow-sm' 
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-stretch">
                    {/* Imagem */}
                    <div className="relative w-28 md:w-36 flex-shrink-0">
                      <img 
                        src={premio.imagem} 
                        alt={premio.titulo}
                        className={`w-full h-full object-cover ${!desbloqueado ? 'grayscale opacity-80' : ''}`}
                      />
                      {desbloqueado && (
                        <div className="absolute inset-0 bg-[#a3e635]/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#16a34a]" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Conteudo */}
                    <div className="flex-1 p-4 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{premio.titulo}</h4>
                          <p className="text-xs text-gray-500 line-clamp-1">{premio.descricao}</p>
                        </div>
                        <span 
                          className="px-2.5 py-1 rounded-full text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: premio.cor }}
                        >
                          {premio.metaLabel}
                        </span>
                      </div>

                      {!desbloqueado ? (
                        <div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ width: `${progresso}%`, backgroundColor: premio.cor }}
                            ></div>
                          </div>
                          <p className="text-[11px] text-gray-400">
                            Faltam <span className="font-medium text-gray-600">R$ {falta.toLocaleString("pt-BR")}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-[#16a34a] font-medium">Premio conquistado</p>
                      )}
                    </div>
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
