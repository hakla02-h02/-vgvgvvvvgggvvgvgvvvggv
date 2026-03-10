"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { Target, TrendingUp, Users, DollarSign, BarChart3, ChevronDown, ArrowUpRight, ArrowDownRight, Eye, MousePointerClick } from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts"

const conversaoTrend = [
  { dia: "Seg", facebook: 42, tiktok: 28, google: 18 },
  { dia: "Ter", facebook: 55, tiktok: 35, google: 22 },
  { dia: "Qua", facebook: 48, tiktok: 42, google: 19 },
  { dia: "Qui", facebook: 62, tiktok: 38, google: 28 },
  { dia: "Sex", facebook: 71, tiktok: 45, google: 32 },
  { dia: "Sab", facebook: 58, tiktok: 52, google: 24 },
  { dia: "Dom", facebook: 45, tiktok: 32, google: 20 },
]

const utmData = [
  { source: "facebook", campaign: "weekend_promo", vendas: 87, roi: "342%", trend: "up" },
  { source: "tiktok", campaign: "launch_v2", vendas: 62, roi: "287%", trend: "up" },
  { source: "google", campaign: "brand_search", vendas: 45, roi: "412%", trend: "down" },
  { source: "organico", campaign: "-", vendas: 38, roi: "-", trend: "up" },
  { source: "instagram", campaign: "stories", vendas: 28, roi: "198%", trend: "down" },
]

const pixels = [
  { nome: "Facebook Pixel", id: "1234567890", ativo: true, color: "#1877F2" },
  { nome: "TikTok Pixel", id: "TT-987654", ativo: true, color: "#000000" },
  { nome: "Google Ads Tag", id: "AW-112233", ativo: true, color: "#EA4335" },
  { nome: "Kwai Ads", id: "KW-445566", ativo: false, color: "#FF6B00" },
]

const sourceColors = [
  "#a3e635", "#3b82f6", "#f97316", "#71717a", "#8b5cf6",
]

const sourceData = [
  { name: "Facebook", value: 87 },
  { name: "TikTok", value: 62 },
  { name: "Google", value: 45 },
  { name: "Organico", value: 38 },
  { name: "Instagram", value: 28 },
]

const revenueData = [
  { day: "01", value: 2400 },
  { day: "05", value: 3100 },
  { day: "10", value: 2800 },
  { day: "15", value: 4200 },
  { day: "20", value: 3800 },
  { day: "25", value: 5100 },
  { day: "30", value: 4700 },
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
        <div className="flex flex-col gap-6 p-4 md:p-6">
          
          {/* KPI Cards Row */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {/* Total Visitantes */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Visitantes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">12.847</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-[#22c55e]" />
                    <span className="text-xs font-medium text-[#22c55e]">+12.5%</span>
                    <span className="text-xs text-gray-400">vs semana passada</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#a3e635]/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#65a30d]" />
                </div>
              </div>
            </div>

            {/* Taxa de Conversao */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Taxa de Conversao</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">4.8%</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-[#22c55e]" />
                    <span className="text-xs font-medium text-[#22c55e]">+0.8%</span>
                    <span className="text-xs text-gray-400">vs mes passado</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Receita */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">R$ 48.2K</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-[#22c55e]" />
                    <span className="text-xs font-medium text-[#22c55e]">+23.1%</span>
                    <span className="text-xs text-gray-400">vs mes passado</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* CTR */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">CTR Medio</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">2.3%</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                    <span className="text-xs font-medium text-red-500">-0.2%</span>
                    <span className="text-xs text-gray-400">vs semana passada</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <MousePointerClick className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Main Chart - Conversoes */}
            <div className="lg:col-span-3 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Conversoes por Fonte</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Ultimos 7 dias</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                  Esta Semana <ChevronDown className="h-3 w-3" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={conversaoTrend}>
                    <defs>
                      <linearGradient id="colorFacebook" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTiktok" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGoogle" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        fontSize: 13,
                      }}
                    />
                    <Area type="monotone" dataKey="facebook" stroke="#a3e635" strokeWidth={2} fill="url(#colorFacebook)" />
                    <Area type="monotone" dataKey="tiktok" stroke="#3b82f6" strokeWidth={2} fill="url(#colorTiktok)" />
                    <Area type="monotone" dataKey="google" stroke="#f97316" strokeWidth={2} fill="url(#colorGoogle)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#a3e635]" />
                  <span className="text-xs text-gray-600">Facebook</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                  <span className="text-xs text-gray-600">TikTok</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#f97316]" />
                  <span className="text-xs text-gray-600">Google</span>
                </div>
              </div>
            </div>

            {/* Pie Chart - Vendas por Fonte */}
            <div className="lg:col-span-2 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Vendas por Fonte</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Distribuicao total</p>
                </div>
              </div>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={sourceData} 
                      dataKey="value" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={80} 
                      innerRadius={55}
                      paddingAngle={2}
                    >
                      {sourceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={sourceColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Stats List */}
              <div className="mt-4 space-y-2">
                {sourceData.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sourceColors[i] }} />
                      <span className="text-sm text-gray-700">{s.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pixels Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Pixels de Rastreamento</h3>
              <button className="text-xs font-medium text-[#65a30d] hover:underline">+ Adicionar Pixel</button>
            </div>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {pixels.map((pixel) => (
                <div 
                  key={pixel.nome} 
                  className={`bg-white rounded-[20px] p-4 shadow-sm border transition-all ${pixel.ativo ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${pixel.color}15` }}
                    >
                      <Target className="h-5 w-5" style={{ color: pixel.color }} />
                    </div>
                    <Switch defaultChecked={pixel.ativo} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{pixel.nome}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{pixel.id}</p>
                </div>
              ))}
            </div>
          </div>

          {/* UTM Table */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Desempenho UTM</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Analise de campanhas por fonte</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                  Exportar
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="text-gray-500 text-xs font-medium">Fonte</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium">Campanha</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium">Vendas</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium">ROI</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium">Tendencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {utmData.map((row, i) => (
                    <TableRow key={i} className="border-gray-100 hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900 capitalize">{row.source}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">{row.campaign}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{row.vendas}</TableCell>
                      <TableCell>
                        {row.roi !== "-" ? (
                          <Badge className="bg-[#a3e635]/10 text-[#65a30d] border-0 rounded-lg font-semibold">{row.roi}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.trend === "up" ? (
                          <div className="flex items-center gap-1 text-[#22c55e]">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Alta</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-500">
                            <ArrowDownRight className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Baixa</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
