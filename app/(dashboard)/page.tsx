"use client"

import { useState } from "react"
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
  X,
  Check,
} from "lucide-react"
import { useBots } from "@/lib/bot-context"
import { useAuth } from "@/lib/auth-context"
import { NoBotSelected } from "@/components/no-bot-selected"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

const dateRanges = [
  { label: "Hoje", value: "today" },
  { label: "Ultimos 7 dias", value: "7days" },
  { label: "Ultimos 30 dias", value: "30days" },
  { label: "Este mes", value: "month" },
  { label: "Este ano", value: "year" },
]

const filterOptions = [
  { label: "Todos", value: "all" },
  { label: "Ativos", value: "active" },
  { label: "Inativos", value: "inactive" },
  { label: "Novos", value: "new" },
]

// Função para gerar os intervalos de semanas do mês atual
function getCurrentMonthWeekRanges() {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  // Nomes dos meses em português
  const monthNames = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ]
  const fullMonthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]
  
  const monthAbbr = monthNames[currentMonth]
  const fullMonthName = fullMonthNames[currentMonth]
  
  // Último dia do mês
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  // Gerar semanas
  const weeks: string[] = []
  let startDay = 1
  
  while (startDay <= lastDay) {
    const endDay = Math.min(startDay + 6, lastDay)
    weeks.push(`${String(startDay).padStart(2, '0')}-${String(endDay).padStart(2, '0')} ${monthAbbr}`)
    startDay = endDay + 1
  }
  
  // Adicionar opção "Todo [Mês]"
  weeks.push(`Todo ${fullMonthName}`)
  
  return { weeks, firstWeek: weeks[0] }
}

export default function DashboardPage() {
  const { selectedBot } = useBots()
  const { session } = useAuth()
  const [selectedDateRange, setSelectedDateRange] = useState("7days")
  const [selectedFilter, setSelectedFilter] = useState("all")
  
  // Usar o mês atual para os intervalos
  const { weeks: currentMonthWeeks, firstWeek } = getCurrentMonthWeekRanges()
  const [salesDateRange, setSalesDateRange] = useState(firstWeek)
  const [dealDateRange, setDealDateRange] = useState(firstWeek)
  const [tablePeriod, setTablePeriod] = useState("month")

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
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-medium hover:bg-gray-50">
                  <Calendar size={16} className="text-gray-500" />
                  {dateRanges.find(d => d.value === selectedDateRange)?.label || "Selecionar Data"}
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="flex flex-col gap-1">
                  {dateRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setSelectedDateRange(range.value)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedDateRange === range.value 
                          ? "bg-[#ebfcac] text-[#4d7c0f] font-medium" 
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {range.label}
                      {selectedDateRange === range.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button className={`w-10 h-10 rounded-xl shadow-sm border flex items-center justify-center hover:bg-gray-50 ${
                  selectedFilter !== "all" 
                    ? "bg-[#ebfcac] border-[#a3e635] text-[#4d7c0f]" 
                    : "bg-white border-gray-100 text-gray-500"
                }`}>
                  <Filter size={16} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2" align="end">
                <div className="flex flex-col gap-1">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedFilter(option.value)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedFilter === option.value 
                          ? "bg-[#ebfcac] text-[#4d7c0f] font-medium" 
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {option.label}
                      {selectedFilter === option.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Grid Layout - 2 column layout with Dragon AI on right */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_240px] gap-4">
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
                      0 <span className="text-sm font-normal text-gray-500 mb-1">R$</span>
                    </div>
                  </div>
                  {/* Metric 2 */}
                  <div className="bg-[#1c1c1c] rounded-2xl p-4 md:p-5 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm mb-2">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      ROI
                    </div>
                    <div className="text-2xl md:text-3xl font-bold flex items-end gap-1">
                      0 <span className="text-sm font-normal text-gray-500 mb-1">%</span>
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
                    <div className="text-2xl md:text-3xl font-bold">0</div>
                  </div>
                </div>
              </div>
            </div>

          {/* Container para Análise de Vendas e Análise de Negócios lado a lado */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Sales Analysis Card */}
            <div className="flex-1 bg-white rounded-[24px] p-4 md:p-5 shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#a3e635]"></span>
                      <h3 className="font-semibold text-gray-900 text-sm">Análise de Vendas</h3>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-[10px] font-medium text-gray-500 flex items-center hover:text-gray-700 transition-colors">
                          {salesDateRange} <ChevronDown size={12} className="ml-1" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-2" align="end">
                        <div className="flex flex-col gap-1">
                          {currentMonthWeeks.map((range) => (
                            <button
                              key={range}
                              onClick={() => setSalesDateRange(range)}
                              className={`px-3 py-1.5 rounded text-xs text-left transition-colors ${
                                salesDateRange === range 
                                  ? "bg-[#ebfcac] text-[#4d7c0f] font-medium" 
                                  : "hover:bg-gray-100 text-gray-600"
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex-1 flex items-center gap-4">
                    {/* Donut Chart Simulation */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="12" strokeDasharray="4 4" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#gradient)" strokeWidth="14" strokeDasharray="0 251" strokeDashoffset="0" className="drop-shadow-sm" strokeLinecap="round" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#a3e635" strokeWidth="14" strokeDasharray="0 251" strokeDashoffset="-180" className="drop-shadow-sm" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-gray-900">R$0</span>
                        <span className="text-[8px] text-gray-400">Receita Total</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm bg-blue-600"></span>
                        <span className="text-xs font-bold text-gray-800">0</span>
                        <span className="text-xs text-gray-400">Leads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm bg-gray-200"></span>
                        <span className="text-xs font-bold text-gray-800">0</span>
                        <span className="text-xs text-gray-400">Receita</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm bg-[#a3e635]"></span>
                        <span className="text-xs font-bold text-gray-800">0</span>
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
            <div className="flex-1 bg-[#ebfcac] rounded-[24px] p-4 md:p-5 shadow-sm border border-[#e2f89f] flex flex-col relative overflow-hidden min-h-[220px]">
                  <div className="flex justify-between items-center mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={14} className="text-[#4d7c0f]" />
                      <h3 className="font-semibold text-gray-900 text-sm">Análise de Negócios</h3>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-[10px] font-medium text-[#4d7c0f] flex items-center hover:text-[#3d6c0f] transition-colors">
                          {dealDateRange} <ChevronDown size={12} className="ml-1" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-2" align="end">
                        <div className="flex flex-col gap-1">
                          {currentMonthWeeks.map((range) => (
                            <button
                              key={range}
                              onClick={() => setDealDateRange(range)}
                              className={`px-3 py-1.5 rounded text-xs text-left transition-colors ${
                                dealDateRange === range 
                                  ? "bg-[#d9f970] text-[#4d7c0f] font-medium" 
                                  : "hover:bg-[#e2f89f] text-[#4d7c0f]"
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Cards em Fileira */}
                  <div className="flex-1 flex items-end gap-3 mt-1 z-10">
                    {/* Card Ganhos */}
                    <div className="flex-1 h-[33%] bg-[#d9f970] rounded-2xl p-3 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, #84cc16 5px, #84cc16 10px)" }}></div>
                      <div className="relative z-10 bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#4d7c0f] inline-block">Ganhos 0</div>
                    </div>
                    {/* Card Perdas */}
                    <div className="flex-1 h-[33%] bg-[#111] rounded-2xl p-3 shadow-lg">
                      <div className="bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-800 inline-block">Perdas 0</div>
                    </div>
                    {/* Card Crescimento */}
                    <div className="flex-1 h-[33%] bg-[#d9f970] rounded-2xl p-3">
                      <div className="bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#4d7c0f] inline-block">Crescimento 0</div>
                    </div>
                  </div>
            </div>
          </div>

          {/* Right Column - Dragon AI Panel - compact for desktop */}
          <div className="xl:row-span-2 xl:col-start-3 xl:row-start-1 order-last xl:order-none">
            <div className="bg-[#111] rounded-[24px] p-4 md:p-5 flex flex-col shadow-2xl relative overflow-hidden border border-white/5 h-full max-h-[420px]">
              
              {/* Efeitos de fundo (Glow) */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#a3e635] opacity-10 blur-[40px] rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-500 opacity-5 blur-[40px] rounded-full"></div>

              {/* Cabeçalho */}
              <div className="flex justify-between items-center mb-4 relative z-10">
                <button className="w-8 h-8 rounded-xl bg-[#1c1c1c] flex items-center justify-center border border-white/5 text-gray-400 hover:text-white transition-all">
                  <Minus size={14} />
                </button>
                <span className="font-black text-sm text-white tracking-[0.15em] italic uppercase">Dragon AI</span>
                <button className="w-8 h-8 rounded-xl bg-[#1c1c1c] flex items-center justify-center border border-white/5 text-gray-400 hover:text-white transition-all">
                  <Plus size={14} />
                </button>
              </div>

              {/* Área da Esfera 3D */}
              <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-2">
                <div className="relative w-24 h-24 mb-4 group">
                  {/* Esfera Principal com Gradiente Complexo */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d9f970] via-[#22c55e] to-[#064e3b] shadow-[0_0_30px_rgba(163,230,53,0.3)] animate-pulse transition-transform duration-700 group-hover:scale-105"></div>
                  
                  {/* Camada de Brilho e Reflexo (Efeito Vidro) */}
                  <div className="absolute inset-0 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.6),inset_10px_10px_20px_rgba(255,255,255,0.3)]"></div>
                  
                  {/* Pontos de Luz Internos */}
                  <div className="absolute top-3 left-5 w-6 h-6 rounded-full bg-white/30 blur-md"></div>
                  <div className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-cyan-400/20 blur-xl"></div>
                  
                  {/* Aro Externo Sutil */}
                  <div className="absolute -inset-2 rounded-full border border-[#a3e635]/5 scale-95 group-hover:scale-100 transition-transform duration-1000"></div>
                </div>
                
                <h2 className="text-gray-200 text-sm font-medium text-center">Como posso ajudar?</h2>
              </div>

              {/* Botões de Ação (Pro Analysis & Report) */}
              <div className="grid grid-cols-2 gap-2 mb-3 relative z-10">
                <button className="bg-[#1c1c1c] hover:bg-[#252525] py-3 rounded-xl border border-white/5 flex flex-col items-center gap-1.5 transition-all group">
                  <div className="w-8 h-8 rounded-full border-2 border-[#a3e635] flex items-center justify-center group-hover:shadow-[0_0_10px_rgba(163,230,53,0.4)] transition-all">
                    <Clock size={14} className="text-[#a3e635]" />
                  </div>
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-wider">Análise Profunda</span>
                </button>
                
                <button className="bg-[#1c1c1c] hover:bg-[#252525] py-3 rounded-xl border border-white/5 flex flex-col items-center gap-1.5 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center group-hover:bg-[#333]">
                    <FileText size={14} className="text-gray-400" />
                  </div>
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-wider">Reportar Problema</span>
                </button>
              </div>

              {/* Barra de Input / Chat */}
              <div className="relative z-10">
                <div className="bg-[#1c1c1c] rounded-xl p-1.5 pl-3 flex items-center border border-white/5 focus-within:border-[#a3e635]/30 transition-colors">
                  <input 
                    type="text" 
                    placeholder="Pergunte o que quiser..." 
                    className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 w-full font-medium"
                  />
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                      <Send size={12} className="transform rotate-45" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-gray-400 hover:text-[#a3e635] transition-all border border-white/10">
                      <Mic size={14} />
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
                  Conversas Recentes
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                      {tablePeriod === "week" ? "Semana" : tablePeriod === "month" ? "Mes" : "Ano"} 
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-2" align="end">
                    <div className="flex flex-col gap-1">
                      {[
                        { label: "Semana", value: "week" },
                        { label: "Mes", value: "month" },
                        { label: "Ano", value: "year" },
                      ].map((period) => (
                        <button
                          key={period.value}
                          onClick={() => setTablePeriod(period.value)}
                          className={`px-3 py-1.5 rounded text-xs text-left transition-colors ${
                            tablePeriod === period.value 
                              ? "bg-[#ebfcac] text-[#4d7c0f] font-medium" 
                              : "hover:bg-gray-100 text-gray-600"
                          }`}
                        >
                          {period.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <MoreVertical size={14} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-3 font-medium px-2">Usuário</th>
                    <th className="pb-3 font-medium px-2">Canal</th>
                    <th className="pb-3 font-medium px-2">Mensagens</th>
                    <th className="pb-3 font-medium px-2">Status</th>
                    <th className="pb-3 font-medium px-2">Tempo de Resposta</th>
                    <th className="pb-3 font-medium px-2 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sem dados ainda */}
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                      Nenhuma conversa registrada ainda
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
