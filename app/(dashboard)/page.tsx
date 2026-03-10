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

        {/* Grid Layout */}
        <div className="grid grid-cols-12 gap-4 md:gap-5 auto-rows-min">
          {/* Left Column Group (Spans 8 cols) */}
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-4 md:gap-5">
            {/* Smart Sales Distribution Card */}
            <div className="bg-[#111111] rounded-[24px] p-4 md:p-6 text-white relative overflow-hidden shadow-lg">
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

            {/* Row for Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {/* Sales Analysis Card */}
              <div className="bg-white rounded-[24px] p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#a3e635]"></span>
                    <h3 className="font-semibold text-gray-900">Análise de Vendas</h3>
                  </div>
                  <div className="text-xs font-medium text-gray-500 flex items-center cursor-pointer">
                    01-07 Jan <ChevronDown size={14} className="ml-1" />
                  </div>
                </div>

                <div className="flex-1 flex items-center gap-4 md:gap-6">
                  {/* Donut Chart Simulation */}
                  <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 ml-2">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {/* Background Dashed Circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#f3f4f6"
                        strokeWidth="12"
                        strokeDasharray="4 4"
                      />
                      {/* Purple/Blue Segment */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="url(#gradient)"
                        strokeWidth="14"
                        strokeDasharray="160 251"
                        strokeDashoffset="0"
                        className="drop-shadow-sm"
                        strokeLinecap="round"
                      />
                      {/* Solid Green Segment */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#a3e635"
                        strokeWidth="14"
                        strokeDasharray="30 251"
                        strokeDashoffset="-180"
                        className="drop-shadow-sm"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs md:text-sm font-bold text-gray-900">R$728.000</span>
                      <span className="text-[8px] text-gray-400 text-center leading-tight mt-0.5">
                        Receita Total
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-col gap-2 md:gap-3">
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

                <div className="mt-4 pt-4 border-t border-gray-100 text-[10px] text-gray-400 flex items-center gap-1.5">
                  <HelpCircle size={10} />
                  Calculado a partir da atividade agregada do período selecionado
                </div>
              </div>

              {/* Deal Analysis Card */}
              <div className="bg-[#ebfcac] rounded-[24px] p-4 md:p-6 shadow-sm border border-[#e2f89f] flex flex-col relative overflow-hidden min-h-[250px]">
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={16} className="text-[#4d7c0f]" />
                    <h3 className="font-semibold text-gray-900">Análise de Negócios</h3>
                  </div>
                  <div className="text-xs font-medium text-[#4d7c0f] flex items-center cursor-pointer">
                    01-07 Jan <ChevronDown size={14} className="ml-1" />
                  </div>
                </div>

                {/* Abstract Chart Representation */}
                <div className="flex-1 relative mt-2 z-10">
                  {/* Win Deals Block */}
                  <div className="absolute top-0 left-0 w-[45%] h-[80%] bg-[#d9f970] rounded-xl flex items-start p-3 overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent, transparent 5px, #84cc16 5px, #84cc16 10px)",
                      }}
                    ></div>
                    <div className="relative z-10 bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#4d7c0f]">
                      Ganhos 6K
                    </div>
                  </div>

                  {/* AI Improved Block */}
                  <div className="absolute top-4 right-0 w-[45%] h-[40%] bg-[#d9f970] rounded-xl flex items-start justify-end p-3">
                    <div className="bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#4d7c0f]">
                      Crescimento 4K
                    </div>
                  </div>

                  {/* Lost Deals Block */}
                  <div className="absolute bottom-0 right-[10%] w-[40%] h-[35%] bg-[#111] rounded-xl flex items-end justify-start p-3 shadow-lg">
                    <div className="absolute -top-6 left-0 bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-800">
                      Perdas 2K
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Bostie AI (Spans 4 cols) */}
          <div className="col-span-12 xl:col-span-4 flex">
            <div className="bg-[#111111] rounded-[24px] p-4 md:p-6 flex flex-col w-full shadow-xl relative overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 md:mb-8 relative z-10 text-white">
                <button className="w-8 h-8 rounded-full bg-[#1c1c1c] flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="font-semibold text-base md:text-lg tracking-wide">Dragon AI</span>
                <button className="w-8 h-8 rounded-full bg-[#1c1c1c] flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors">
                  <Plus size={14} />
                </button>
              </div>

              {/* 3D Sphere Graphic */}
              <div className="flex-1 flex flex-col items-center justify-center mb-6 md:mb-8 relative z-10">
                <div className="relative w-36 h-36 md:w-48 md:h-48 mb-6 md:mb-8">
                  {/* The complex sphere effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d9f970] via-[#22c55e] to-[#022c22] shadow-[0_10px_40px_-10px_rgba(163,230,53,0.6)]"></div>
                  <div className="absolute inset-0 rounded-full shadow-[inset_-15px_-15px_30px_rgba(0,0,0,0.8),inset_15px_15px_30px_rgba(255,255,255,0.4)]"></div>
                  <div className="absolute bottom-4 right-8 w-20 h-20 rounded-full bg-cyan-400 opacity-30 blur-[15px]"></div>
                  <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white opacity-40 blur-[8px]"></div>
                </div>

                <p className="text-gray-300 text-sm md:text-[15px]">Como posso ajudar você hoje?</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                <button className="bg-[#1c1c1c] hover:bg-[#252525] text-white py-3 md:py-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d9f970] to-[#84cc16] p-[1px] group-hover:shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-shadow">
                    <div className="w-full h-full bg-[#1c1c1c] rounded-full flex items-center justify-center">
                      <Clock size={14} className="text-[#a3e635]" />
                    </div>
                  </div>
                  <span className="text-xs font-medium">Análise Pro</span>
                </button>
                <button className="bg-[#1c1c1c] hover:bg-[#252525] text-white py-3 md:py-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                    <FileText size={14} className="text-gray-300" />
                  </div>
                  <span className="text-xs font-medium">Relatório</span>
                </button>
              </div>

              {/* Input Area */}
              <div className="relative z-10 mt-auto">
                <div className="bg-[#1c1c1c] rounded-2xl p-1 pl-4 flex items-center border border-white/5 shadow-inner">
                  <input
                    type="text"
                    placeholder="Pergunte qualquer coisa..."
                    className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full"
                  />
                  <div className="flex items-center gap-1 pr-1">
                    <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      <Send size={16} className="transform rotate-45" />
                    </button>
                    <button className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-gray-300 hover:text-white transition-colors border border-white/10">
                      <Mic size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Table Section (Spans full width 12 cols) */}
          <div className="col-span-12 bg-white rounded-[24px] p-4 md:p-6 shadow-sm border border-gray-100 mb-4">
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
    </div>
  )
}
