"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  MousePointerClick, 
  Activity,
  Zap,
  Target,
  Eye,
  ChevronDown,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Globe,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  Calendar,
  Filter,
  Download,
  Play,
  Pause,
  HelpCircle
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, 
  BarChart, Bar, Tooltip, PieChart, Pie, Cell, LineChart, Line
} from "recharts"

const performanceData = [
  { name: "Sem 1", visitors: 2400, conversions: 120, revenue: 4200 },
  { name: "Sem 2", visitors: 3200, conversions: 180, revenue: 5800 },
  { name: "Sem 3", visitors: 2800, conversions: 140, revenue: 4900 },
  { name: "Sem 4", visitors: 4100, conversions: 220, revenue: 7200 },
  { name: "Sem 5", visitors: 3600, conversions: 190, revenue: 6400 },
  { name: "Sem 6", visitors: 4800, conversions: 260, revenue: 8100 },
  { name: "Sem 7", visitors: 5200, conversions: 310, revenue: 9600 },
]

const channelData = [
  { name: "Facebook", value: 35, color: "#3b82f6" },
  { name: "TikTok", value: 28, color: "#111111" },
  { name: "Google", value: 20, color: "#f97316" },
  { name: "Direto", value: 17, color: "#a3e635" },
]

const campaignData = [
  { name: "Promo Weekend", clicks: 2840, conversions: 312, ctr: 11.0, status: "active" },
  { name: "Launch V2", clicks: 1920, conversions: 187, ctr: 9.7, status: "active" },
  { name: "Brand Search", clicks: 1450, conversions: 203, ctr: 14.0, status: "active" },
  { name: "Retargeting", clicks: 980, conversions: 145, ctr: 14.8, status: "paused" },
]

const hourlyData = [
  { hour: "06h", value: 15 },
  { hour: "09h", value: 45 },
  { hour: "12h", value: 68 },
  { hour: "15h", value: 82 },
  { hour: "18h", value: 95 },
  { hour: "21h", value: 72 },
  { hour: "00h", value: 28 },
]

const revenueBreakdown = [
  { label: "Vendas Diretas", value: 45600, percentage: 62 },
  { label: "Afiliados", value: 18200, percentage: 25 },
  { label: "Parcerias", value: 9600, percentage: 13 },
]

export default function AnalyticsPage() {
  const { selectedBot } = useBots()

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Analytics" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Analytics" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 bg-[#f4f5f8] min-h-full">
          
          {/* Page Title + Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Painel Analítico
            </h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 text-sm font-medium hover:bg-gray-50 transition-colors">
                <Calendar size={16} className="text-gray-500" />
                Selecionar Data
              </button>
              <button className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <Filter size={16} />
              </button>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_280px] gap-5">
            
            {/* Hero Stats Card - Dark Theme */}
            <div className="bg-[#111111] rounded-[24px] p-5 md:p-6 text-white relative overflow-hidden shadow-lg xl:col-span-2">
              {/* Glow Effect */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-[#a3e635] opacity-20 blur-[40px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10">
                <h2 className="text-lg md:text-xl font-semibold mb-1">Distribuição de Vendas</h2>
                <p className="text-gray-400 text-xs md:text-sm mb-5">
                  Métricas de vendas mostrando crescimento em leads, receita e performance
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Metric 1 - Receita */}
                  <div className="bg-[#1c1c1c] rounded-2xl p-4 md:p-5 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm mb-2">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      Receita Total
                    </div>
                    <div className="text-2xl md:text-3xl font-bold flex items-end gap-1">
                      56.000 <span className="text-sm font-normal text-gray-500 mb-1">R$</span>
                    </div>
                  </div>
                  
                  {/* Metric 2 - ROI */}
                  <div className="bg-[#1c1c1c] rounded-2xl p-4 md:p-5 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm mb-2">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      ROI
                    </div>
                    <div className="text-2xl md:text-3xl font-bold flex items-end gap-1">
                      +312 <span className="text-sm font-normal text-gray-500 mb-1">%</span>
                    </div>
                  </div>
                  
                  {/* Metric 3 - Usuarios */}
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

            {/* AI Insights Panel - Right Column */}
            <div className="xl:row-span-2 xl:col-start-3 xl:row-start-1 order-last xl:order-none">
              <div className="bg-[#111] rounded-[32px] p-5 md:p-6 flex flex-col shadow-2xl relative overflow-hidden border border-white/5 min-h-[420px] xl:min-h-full">
                
                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#a3e635] opacity-10 blur-[50px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 opacity-5 blur-[50px] rounded-full"></div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#a3e635]/20 flex items-center justify-center">
                      <Sparkles size={16} className="text-[#a3e635]" />
                    </div>
                    <span className="font-bold text-white text-sm">AI Insights</span>
                  </div>
                  <button className="text-gray-500 hover:text-white transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>

                {/* Insights List */}
                <div className="flex-1 space-y-3 relative z-10">
                  <InsightItem 
                    title="Pico de Tráfego"
                    description="Melhor horário às 18h-20h"
                    trend="+23%"
                    positive
                  />
                  <InsightItem 
                    title="Taxa de Conversão"
                    description="Acima da média do setor"
                    trend="+8.2%"
                    positive
                  />
                  <InsightItem 
                    title="Bounce Rate"
                    description="Precisa de atenção"
                    trend="-2.1%"
                    positive={false}
                  />
                  <InsightItem 
                    title="ROI Campanhas"
                    description="Facebook liderando"
                    trend="+45%"
                    positive
                  />
                </div>

                {/* CTA Button */}
                <button className="mt-4 w-full bg-[#a3e635] hover:bg-[#b4f046] text-black font-semibold py-3 rounded-2xl transition-all relative z-10 text-sm">
                  Ver Relatório Completo
                </button>
              </div>
            </div>

            {/* Sales Analysis + Business Analysis Row */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-5 xl:col-span-2">
              
              {/* Sales Analysis Card */}
              <div className="flex-1 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635]"></span>
                    <h3 className="font-semibold text-gray-900 text-sm">Análise de Vendas</h3>
                  </div>
                  <div className="text-[11px] font-medium text-gray-500 flex items-center cursor-pointer hover:text-gray-700 transition-colors">
                    01-07 Jan <ChevronDown size={12} className="ml-1" />
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  {/* Donut Chart */}
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="12" strokeDasharray="4 4" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#salesGradient)" strokeWidth="14" strokeDasharray="160 251" strokeDashoffset="0" className="drop-shadow-sm" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#a3e635" strokeWidth="14" strokeDasharray="30 251" strokeDashoffset="-180" className="drop-shadow-sm" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="salesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-bold text-gray-900">R$728.000</span>
                      <span className="text-[9px] text-gray-400">Receita Total</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-col gap-2.5">
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

              {/* Business Analysis Card - Lime Theme */}
              <div className="flex-1 bg-[#ebfcac] rounded-[24px] p-5 shadow-sm border border-[#e2f89f] relative overflow-hidden min-h-[240px]">
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={14} className="text-[#4d7c0f]" />
                    <h3 className="font-semibold text-gray-900 text-sm">Análise de Negócios</h3>
                  </div>
                  <div className="text-[11px] font-medium text-[#4d7c0f] flex items-center cursor-pointer">
                    01-07 Jan <ChevronDown size={12} className="ml-1" />
                  </div>
                </div>

                {/* Visual Bars */}
                <div className="flex-1 flex items-end gap-3 mt-2 relative z-10 h-32">
                  <div className="flex-1 h-[85%] bg-[#d9f970] rounded-2xl p-3 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, #84cc16 5px, #84cc16 10px)" }}></div>
                    <div className="relative z-10 bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#4d7c0f] inline-block">Ganhos 6K</div>
                  </div>
                  <div className="flex-1 h-[55%] bg-[#111] rounded-2xl p-3 shadow-lg">
                    <div className="bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-800 inline-block">Perdas 2K</div>
                  </div>
                  <div className="flex-1 h-[70%] bg-[#d9f970] rounded-2xl p-3">
                    <div className="bg-white/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#4d7c0f] inline-block">Crescimento 4K</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <StatCard 
              icon={Users}
              label="Visitantes"
              value="24.8K"
              change={12.5}
              positive
            />
            <StatCard 
              icon={TrendingUp}
              label="Conversões"
              value="1,847"
              change={8.2}
              positive
            />
            <StatCard 
              icon={DollarSign}
              label="Receita"
              value="R$ 86.4K"
              change={23.1}
              positive
            />
            <StatCard 
              icon={MousePointerClick}
              label="CTR"
              value="4.8%"
              change={-0.3}
              positive={false}
            />
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-5 mt-5">
            
            {/* Main Performance Chart */}
            <div className="lg:col-span-2 bg-white rounded-[24px] p-5 md:p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Performance Semanal</h3>
                  <p className="text-sm text-gray-500">Visitantes e conversões ao longo do tempo</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#a3e635]" />
                    <span className="text-xs text-gray-500">Visitantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111]" />
                    <span className="text-xs text-gray-500">Conversões</span>
                  </div>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a3e635" stopOpacity={0.3}/>
                        <stop offset="100%" stopColor="#a3e635" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="#a3e635" 
                      strokeWidth={2.5}
                      fill="url(#visitorsGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="#111" 
                      strokeWidth={2}
                      fill="transparent" 
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Channel Distribution */}
            <div className="bg-white rounded-[24px] p-5 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900">Canais de Tráfego</h3>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="h-36 flex items-center justify-center mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={channelData} 
                      dataKey="value" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={40}
                      outerRadius={60}
                      strokeWidth={0}
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5">
                {channelData.map((channel) => (
                  <div key={channel.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: channel.color }}
                      />
                      <span className="text-sm text-gray-600">{channel.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{channel.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaigns Section */}
          <div className="bg-white rounded-[24px] p-5 md:p-6 shadow-sm border border-gray-100 mt-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">Campanhas</h3>
                <p className="text-sm text-gray-500">Top campanhas ativas</p>
              </div>
              <button className="text-sm font-semibold text-[#4d7c0f] hover:underline">
                Ver todas
              </button>
            </div>
            <div className="space-y-3">
              {campaignData.map((campaign) => (
                <div 
                  key={campaign.name} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      campaign.status === "active" ? "bg-[#ebfcac]" : "bg-gray-200"
                    }`}>
                      <Zap className={`h-5 w-5 ${
                        campaign.status === "active" ? "text-[#4d7c0f]" : "text-gray-500"
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{campaign.name}</p>
                      <p className="text-sm text-gray-500">
                        {campaign.clicks.toLocaleString()} clicks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 sm:gap-8">
                    <div className="text-center sm:text-right">
                      <p className="font-bold text-gray-900">{campaign.conversions}</p>
                      <p className="text-xs text-gray-500">conversoes</p>
                    </div>
                    <div className="text-center sm:text-right min-w-[50px]">
                      <p className="font-bold text-gray-900">{campaign.ctr}%</p>
                      <p className="text-xs text-gray-500">CTR</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      campaign.status === "active" 
                        ? "bg-[#ebfcac] text-[#4d7c0f]" 
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {campaign.status === "active" ? "Ativa" : "Pausada"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row - Hourly + Quick Stats */}
          <div className="grid lg:grid-cols-2 gap-5 mt-5 mb-4">
            
            {/* Hourly Activity */}
            <div className="bg-white rounded-[24px] p-5 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-gray-900">Atividade por Hora</h3>
                  <p className="text-sm text-gray-500">Pico as 18h</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ebfcac] border border-[#d9f970]">
                  <Activity className="h-3.5 w-3.5 text-[#4d7c0f]" />
                  <span className="text-xs font-semibold text-[#4d7c0f]">Ao vivo</span>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} barSize={28}>
                    <XAxis 
                      dataKey="hour" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#9ca3af", fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#a3e635" 
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Insights Grid */}
            <div className="grid grid-cols-2 gap-4">
              <QuickInsight 
                icon={Eye}
                title="Páginas Vistas"
                value="156K"
                subtitle="média 6.3/visita"
              />
              <QuickInsight 
                icon={Target}
                title="Taxa de Rejeição"
                value="32.4%"
                subtitle="abaixo da média"
              />
              <QuickInsight 
                icon={Clock}
                title="Sessão Média"
                value="4m 23s"
                subtitle="+12% vs mês"
              />
              <QuickInsight 
                icon={Zap}
                title="Velocidade"
                value="1.2s"
                subtitle="tempo de carga"
              />
            </div>
          </div>

        </div>
      </ScrollArea>
    </>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  positive 
}: { 
  icon: React.ElementType
  label: string
  value: string
  change: number
  positive: boolean
}) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 hover:border-[#a3e635]/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
          positive 
            ? "bg-[#ebfcac] text-[#4d7c0f]" 
            : "bg-red-50 text-red-600"
        }`}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function InsightItem({ 
  title, 
  description, 
  trend, 
  positive 
}: { 
  title: string
  description: string
  trend: string
  positive: boolean
}) {
  return (
    <div className="bg-[#1c1c1c] rounded-2xl p-4 border border-white/5">
      <div className="flex items-start justify-between mb-1">
        <span className="text-white font-medium text-sm">{title}</span>
        <span className={`text-xs font-semibold ${positive ? "text-[#a3e635]" : "text-red-400"}`}>
          {trend}
        </span>
      </div>
      <p className="text-gray-500 text-xs">{description}</p>
    </div>
  )
}

function QuickInsight({ 
  icon: Icon, 
  title, 
  value, 
  subtitle 
}: { 
  icon: React.ElementType
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <span className="text-xs text-gray-500">{title}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  )
}
