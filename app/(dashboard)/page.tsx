"use client"

import {
  Search,
  Moon,
  Settings,
  Calendar,
  Filter,
  Home,
  BarChart2,
  TrendingUp,
  Megaphone,
  Clock,
  FileText,
  FileBarChart,
  HelpCircle,
  ChevronDown,
  Minus,
  Plus,
  Send,
  Mic,
  MoreVertical,
  List,
} from "lucide-react"
import { useBots } from "@/lib/bot-context"
import { useAuth } from "@/lib/auth-context"
import { NoBotSelected } from "@/components/no-bot-selected"

export default function DashboardPage() {
  const { selectedBot } = useBots()
  const { session } = useAuth()

  if (!selectedBot) {
    return <NoBotSelected />
  }

  const userName = session?.name || session?.email?.split("@")[0] || "Usuario"

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#f4f5f8]">
      {/* Top Header */}
      <header className="px-4 md:px-8 py-4 md:py-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-full shadow-sm w-full max-w-[400px]">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar"
            className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400"
          />
          <div className="hidden sm:flex items-center gap-1 bg-[#f0fdf4] text-[#166534] px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap">
            <span>⌘</span> + <span>Space</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm hover:bg-gray-50">
            <Moon size={18} />
          </button>
          <button className="w-9 h-9 md:w-10 md:h-10 bg-[#e4f6aa] rounded-full flex items-center justify-center text-[#4d7c0f] shadow-sm">
            <Settings size={18} />
          </button>
          <div className="h-6 w-px bg-gray-200 mx-1 md:mx-2 hidden md:block"></div>
          <div className="hidden md:flex items-center gap-3 cursor-pointer">
            <img
              src="https://i.pravatar.cc/150?img=11"
              alt="User Avatar"
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-tight">{userName}</span>
              <span className="text-[11px] text-gray-500">@{selectedBot.name}</span>
            </div>
            <ChevronDown size={16} className="text-gray-400 ml-1" />
          </div>
        </div>
      </header>

      {/* Dashboard Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
        {/* Content Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Painel Analítico
          </h1>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-medium hover:bg-gray-50">
              <Calendar size={16} className="text-gray-500" />
              Selecionar Data
            </button>
            <button className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Grid Layout - 2 column layout with Dragon AI on right spanning full height */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_280px] gap-5">
          {/* Sales Distribution Card - Top Left, spans 2 columns */}
          <div className="bg-[#111111] rounded-[24px] p-4 md:p-5 text-white relative overflow-hidden shadow-lg xl:col-span-2">
              {/* Glow effect */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-[#a3e635] opacity-20 blur-[40px] rounded-full pointer-events-none"></div>

              <div className="relative z-10">
                <h2 className="text-lg md:text-xl font-semibold mb-1">Distribuição de Vendas</h2>
                <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6">
                  Métricas de vendas mostrando crescimento em leads, receita e performance
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  {/* Metric 1 */}
                  <div className="bg-[#1c1c1c] rounded-2xl p-4 md:p-5 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm mb-2">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      Receita Total
                    </div>
                    <div className="text-2xl md:text-3xl font-bold flex items-end gap-1">
                      56.000 <span className="text-sm font-normal text-gray-500 mb-1">R$</span>
                    </div>
                  </div>
                  {/* Metric 2 */}
                  <div className="bg-[#1c1c1c] rounded-2xl p-4 md:p-5 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm mb-2">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      ROI
                    </div>
                    <div className="text-2xl md:text-3xl font-bold flex items-end gap-1">
                      +312 <span className="text-sm font-normal text-gray-500 mb-1">%</span>
                    </div>
                  </div>
                  {/* Metric 3 */}
                  <div className="bg-[#1c1c1c] rounded-2xl p-4 md:p-5 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm mb-2">
                      <div className="w-4 h-4 rounded-full bg-[#111111] flex items-center justify-center border border-gray-600">
                        <span className="text-[8px]">±</span>
                      </div>
                      Usuários Ativos
                    </div>
                    <div className="text-2xl md:text-3xl font-bold">12.846</div>
                  </div>
                </div>
              </div>
            </div>

          {/* Sales Analysis Card - Bottom Left */}
          <div className="bg-white rounded-[24px] p-4 md:p-5 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#a3e635]"></span>
                    <h3 className="font-semibold text-gray-900 text-sm">Análise de Vendas</h3>
                  </div>
                  <div className="text-[10px] font-medium text-gray-500 flex items-center cursor-pointer">
                    01-07 Jan <ChevronDown size={12} className="ml-1" />
                  </div>
                </div>

                <div className="flex-1 flex items-center gap-4">
                  {/* Donut Chart Simulation */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="12" strokeDasharray="4 4" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#gradient)" strokeWidth="14" strokeDasharray="160 251" strokeDashoffset="0" className="drop-shadow-sm" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#a3e635" strokeWidth="14" strokeDasharray="30 251" strokeDashoffset="-180" className="drop-shadow-sm" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-gray-900">R$728.000</span>
                      <span className="text-[8px] text-gray-400">Receita Total</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm bg-blue-600"></span>
                      <span className="text-xs font-bold text-gray-800">344</span>
                      <span className="text-xs text-gray-400">Leads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm bg-gray-200"></span>
                      <span className="text-xs font-bold text-gray-800">256</span>
                      <span className="text-xs text-gray-400">Receita</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm bg-[#a3e635]"></span>
                      <span className="text-xs font-bold text-gray-800">128</span>
                      <span className="text-xs text-gray-400">Crescimento</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 flex items-center gap-1">
                  <HelpCircle size={10} />
                  Calculado a partir da atividade agregada do período
                </div>
              </div>

          {/* Deal Analysis Card - Bottom Right */}
          <div className="bg-[#ebfcac] rounded-[24px] p-4 md:p-5 shadow-sm border border-[#e2f89f] flex flex-col relative overflow-hidden min-h-[220px]">
                <div className="flex justify-between items-center mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={14} className="text-[#4d7c0f]" />
                    <h3 className="font-semibold text-gray-900 text-sm">Análise de Negócios</h3>
                  </div>
                  <div className="text-[10px] font-medium text-[#4d7c0f] flex items-center cursor-pointer">
                    01-07 Jan <ChevronDown size={12} className="ml-1" />
                  </div>
                </div>

                {/* Cards em Fileira */}
                <div className="flex-1 flex items-end gap-3 mt-1 z-10">
                  {/* Card Ganhos */}
                  <div className="flex-1 h-[85%] bg-[#d9f970] rounded-2xl p-3 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, #84cc16 5px, #84cc16 10px)" }}></div>
                    <div className="relative z-10 bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#4d7c0f] inline-block">Ganhos 6K</div>
                  </div>
                  {/* Card Perdas */}
                  <div className="flex-1 h-[55%] bg-[#111] rounded-2xl p-3 shadow-lg">
                    <div className="bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-800 inline-block">Perdas 2K</div>
                  </div>
                  {/* Card Crescimento */}
                  <div className="flex-1 h-[70%] bg-[#d9f970] rounded-2xl p-3">
                    <div className="bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#4d7c0f] inline-block">Crescimento 4K</div>
                  </div>
                </div>
              </div>

          {/* Right Column - Dragon AI Panel - spans full height */}
          <div className="xl:row-span-2 xl:col-start-3 xl:row-start-1 order-last xl:order-none">
            <div className="bg-[#111] rounded-[40px] p-6 md:p-8 flex flex-col shadow-2xl relative overflow-hidden border border-white/5 min-h-[500px] xl:min-h-full">
              
              {/* Efeitos de fundo (Glow) */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#a3e635] opacity-10 blur-[60px] rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 opacity-5 blur-[60px] rounded-full"></div>

              {/* Cabeçalho */}
              <div className="flex justify-between items-center mb-8 md:mb-10 relative z-10">
                <button className="w-10 h-10 rounded-2xl bg-[#1c1c1c] flex items-center justify-center border border-white/5 text-gray-400 hover:text-white transition-all">
                  <Minus size={18} />
                </button>
                <span className="font-black text-lg md:text-xl text-white tracking-[0.2em] italic uppercase">Dragon AI</span>
                <button className="w-10 h-10 rounded-2xl bg-[#1c1c1c] flex items-center justify-center border border-white/5 text-gray-400 hover:text-white transition-all">
                  <Plus size={18} />
                </button>
              </div>

              {/* Área da Esfera 3D */}
              <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className="relative w-40 h-40 md:w-52 md:h-52 mb-8 md:mb-10 group">
                  {/* Esfera Principal com Gradiente Complexo */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d9f970] via-[#22c55e] to-[#064e3b] shadow-[0_0_50px_rgba(163,230,53,0.3)] animate-pulse transition-transform duration-700 group-hover:scale-105"></div>
                  
                  {/* Camada de Brilho e Reflexo (Efeito Vidro) */}
                  <div className="absolute inset-0 rounded-full shadow-[inset_-15px_-15px_30px_rgba(0,0,0,0.6),inset_15px_15px_30px_rgba(255,255,255,0.3)]"></div>
                  
                  {/* Pontos de Luz Internos */}
                  <div className="absolute top-6 left-10 w-12 h-12 rounded-full bg-white/30 blur-md"></div>
                  <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-cyan-400/20 blur-xl"></div>
                  
                  {/* Aro Externo Sutil */}
                  <div className="absolute -inset-4 rounded-full border border-[#a3e635]/5 scale-95 group-hover:scale-100 transition-transform duration-1000"></div>
                </div>
                
                <h2 className="text-gray-200 text-lg md:text-xl font-medium text-center">Como posso ajudar você hoje?</h2>
              </div>

              {/* Botões de Ação (Pro Analysis & Report) */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6 relative z-10">
                <button className="bg-[#1c1c1c] hover:bg-[#252525] py-4 md:py-6 rounded-[20px] md:rounded-[28px] border border-white/5 flex flex-col items-center gap-2 md:gap-3 transition-all group">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#a3e635] flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(163,230,53,0.4)] transition-all">
                    <Clock size={18} className="text-[#a3e635]" />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-black text-white/80 uppercase tracking-widest">Pro Analysis</span>
                </button>
                
                <button className="bg-[#1c1c1c] hover:bg-[#252525] py-4 md:py-6 rounded-[20px] md:rounded-[28px] border border-white/5 flex flex-col items-center gap-2 md:gap-3 transition-all group">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center group-hover:bg-[#333]">
                    <FileText size={18} className="text-gray-400" />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-black text-white/80 uppercase tracking-widest">Report</span>
                </button>
              </div>

              {/* Barra de Input / Chat */}
              <div className="relative z-10">
                <div className="bg-[#1c1c1c] rounded-[20px] md:rounded-[24px] p-2 pl-4 md:pl-6 flex items-center border border-white/5 focus-within:border-[#a3e635]/30 transition-colors">
                  <input 
                    type="text" 
                    placeholder="Ask anything..." 
                    className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-600 w-full font-medium"
                  />
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                      <Send size={16} className="transform rotate-45" />
                    </button>
                    <button className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] md:rounded-[18px] bg-black flex items-center justify-center text-gray-400 hover:text-[#a3e635] transition-all border border-white/10 shadow-lg">
                      <Mic size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Table Section */}
        <div className="mt-4 md:mt-5 bg-white rounded-[24px] p-4 md:p-6 shadow-sm border border-gray-100 mb-4">
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#ebfcac] rounded flex items-center justify-center">
                  <List size={12} className="text-[#4d7c0f]" />
                </div>
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                  Top Oportunidades
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 cursor-pointer">
                Mês <ChevronDown size={14} />
                <MoreVertical size={14} className="ml-2 text-gray-400" />
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-3 font-medium px-2">Nome</th>
                    <th className="pb-3 font-medium px-2">Região</th>
                    <th className="pb-3 font-medium px-2">Score</th>
                    <th className="pb-3 font-medium px-2">Nível de Risco</th>
                    <th className="pb-3 font-medium px-2">Lead Process</th>
                    <th className="pb-3 font-medium px-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1 */}
                  <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-800 shadow-sm flex items-center justify-center text-white text-[10px] font-bold">
                          QS
                        </div>
                        <span className="text-sm font-semibold text-gray-800">Quinta Starter</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-600 font-medium">BR</td>
                    <td className="py-4 px-2 text-sm font-bold text-gray-800">88%</td>
                    <td className="py-4 px-2">
                      {/* Risk Level Bar Chart */}
                      <div className="flex items-end gap-0.5 h-4">
                        <div className="w-1.5 bg-[#a3e635] rounded-t-sm h-full"></div>
                        <div className="w-1.5 bg-[#a3e635] rounded-t-sm h-[80%]"></div>
                        <div className="w-1.5 bg-[#a3e635] rounded-t-sm h-full"></div>
                        <div className="w-1.5 bg-[#a3e635] rounded-t-sm h-[90%]"></div>
                        <div className="w-1.5 bg-[#a3e635] rounded-t-sm h-[70%]"></div>
                        <div className="w-1.5 bg-gray-200 rounded-t-sm h-[40%]"></div>
                        <div className="w-1.5 bg-gray-200 rounded-t-sm h-[30%]"></div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-600 font-medium">+8.000</td>
                    <td className="py-4 px-2 text-sm font-bold text-gray-900 text-right">
                      +R$48.569,09
                    </td>
                  </tr>
                  {/* Row 2 */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-800 shadow-sm flex items-center justify-center text-white text-[10px] font-bold">
                          NS
                        </div>
                        <span className="text-sm font-semibold text-gray-800">Nova Systems</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-600 font-medium">SP</td>
                    <td className="py-4 px-2 text-sm font-bold text-gray-800">72%</td>
                    <td className="py-4 px-2">
                      <div className="flex items-end gap-0.5 h-4">
                        <div className="w-1.5 bg-blue-500 rounded-t-sm h-[60%]"></div>
                        <div className="w-1.5 bg-blue-500 rounded-t-sm h-[50%]"></div>
                        <div className="w-1.5 bg-blue-500 rounded-t-sm h-[70%]"></div>
                        <div className="w-1.5 bg-blue-500 rounded-t-sm h-[40%]"></div>
                        <div className="w-1.5 bg-gray-200 rounded-t-sm h-[30%]"></div>
                        <div className="w-1.5 bg-gray-200 rounded-t-sm h-[30%]"></div>
                        <div className="w-1.5 bg-gray-200 rounded-t-sm h-[20%]"></div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-600 font-medium">+3.200</td>
                    <td className="py-4 px-2 text-sm font-bold text-gray-900 text-right">
                      +R$12.450,00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  )
}
