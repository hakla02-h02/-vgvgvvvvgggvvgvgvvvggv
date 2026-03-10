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
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] xl:grid-rows-[auto_1fr] gap-5">
          {/* Sales Distribution Card - Top Left */}
          <div className="bg-[#111111] rounded-[24px] p-4 md:p-5 text-white relative overflow-hidden shadow-lg xl:col-start-1 xl:row-start-1">
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

          {/* Analysis Cards Row - Bottom Left */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 xl:col-start-1 xl:row-start-2">
              {/* Sales Analysis Card */}
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

              {/* Deal Analysis Card */}
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

                {/* Abstract Chart Representation */}
                <div className="flex-1 relative mt-1 z-10">
                  <div className="absolute top-0 left-0 w-[45%] h-[80%] bg-[#d9f970] rounded-xl flex items-start p-3 overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, #84cc16 5px, #84cc16 10px)" }}></div>
                    <div className="relative z-10 bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#4d7c0f]">Ganhos 6K</div>
                  </div>
                  <div className="absolute top-4 right-0 w-[45%] h-[40%] bg-[#d9f970] rounded-xl flex items-start justify-end p-3">
                    <div className="bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#4d7c0f]">Crescimento 4K</div>
                  </div>
                  <div className="absolute bottom-0 right-[10%] w-[40%] h-[35%] bg-[#111] rounded-xl flex items-end justify-start p-3 shadow-lg">
                    <div className="absolute -top-6 left-0 bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-800">Perdas 2K</div>
                  </div>
                </div>
              </div>
          </div>

          {/* Right Column - Dragon AI Panel - spans full height */}
          <div className="xl:row-span-full xl:col-start-2 xl:row-start-1 order-last xl:order-none">
            <div className="bg-[#0f0f0f] rounded-[24px] p-4 flex flex-col h-full shadow-[0_20px_40px_rgba(0,0,0,0.2)] relative overflow-hidden min-h-[450px] xl:min-h-full">
              {/* Background glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#00ffb3]/5 blur-[100px] pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-center mb-6 relative z-10 text-white">
                <button className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="text-sm font-medium tracking-wide">Dragon AI</span>
                <button className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Plus size={14} />
                </button>
              </div>

              {/* 3D Sphere Area */}
              <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className="w-[100px] h-[100px] rounded-full relative flex-shrink-0 animate-float">
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #00ffb3 0%, #c6ff00 100%)',
                      boxShadow: 'inset -16px -16px 32px rgba(0,0,0,0.5), inset 8px 8px 16px rgba(255,255,255,0.8), 0 0 50px rgba(160,255,0,0.3)',
                      filter: 'blur(0.3px)'
                    }}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-white/60 blur-[2px] mix-blend-overlay" />
                </div>
                
                <p className="text-sm text-gray-300 text-center mt-6">Como posso ajudar você hoje?</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-3 relative z-10 flex-shrink-0">
                <button className="h-[36px] bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] rounded-lg flex items-center justify-center gap-1.5 transition-all group">
                  <Clock size={12} className="text-[#c6ff00]" />
                  <span className="text-[10px] font-medium text-white">Analysis</span>
                </button>
                <button className="h-[36px] bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] rounded-lg flex items-center justify-center gap-1.5 transition-all group">
                  <FileText size={12} className="text-[#00ffb3]" />
                  <span className="text-[10px] font-medium text-white">Relatório</span>
                </button>
              </div>

              {/* Chat Input */}
              <div className="relative z-10 flex-shrink-0">
                <input 
                  type="text" 
                  placeholder="Ask anything..." 
                  className="w-full h-[38px] bg-[rgba(255,255,255,0.06)] border-none rounded-lg pl-3 pr-16 text-xs text-white focus:outline-none focus:bg-[rgba(255,255,255,0.1)] placeholder-gray-500 backdrop-blur-md transition-all"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <button className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <Send size={12} />
                  </button>
                  <button className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center hover:bg-[#c6ff00] transition-colors shadow-lg">
                    <Mic size={12} />
                  </button>
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
