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
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Filter,
  Calendar,
  Download
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, 
  BarChart, Bar, Tooltip, PieChart, Pie, Cell
} from "recharts"

const performanceData = [
  { name: "01", visitors: 2400, conversions: 120, revenue: 4200 },
  { name: "05", visitors: 3200, conversions: 180, revenue: 5800 },
  { name: "10", visitors: 2800, conversions: 140, revenue: 4900 },
  { name: "15", visitors: 4100, conversions: 220, revenue: 7200 },
  { name: "20", visitors: 3600, conversions: 190, revenue: 6400 },
  { name: "25", visitors: 4800, conversions: 260, revenue: 8100 },
  { name: "30", visitors: 4200, conversions: 230, revenue: 7600 },
]

const channelData = [
  { name: "Facebook", value: 35, color: "#3b82f6" },
  { name: "TikTok", value: 28, color: "#0f172a" },
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
  { hour: "00h", value: 12 },
  { hour: "03h", value: 8 },
  { hour: "06h", value: 15 },
  { hour: "09h", value: 45 },
  { hour: "12h", value: 68 },
  { hour: "15h", value: 82 },
  { hour: "18h", value: 95 },
  { hour: "21h", value: 72 },
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
        <div className="p-6 space-y-6">
          
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Visao Geral</h2>
              <p className="text-sm text-muted-foreground">Ultimos 30 dias de performance</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Calendar className="h-4 w-4" />
                Mar 2026
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Filter className="h-4 w-4" />
                Filtros
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
                <Download className="h-4 w-4" />
                Exportar
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Visitantes"
              value="24.8K"
              change={12.5}
              icon={Users}
              trend="up"
            />
            <MetricCard 
              title="Conversoes"
              value="1,847"
              change={8.2}
              icon={TrendingUp}
              trend="up"
            />
            <MetricCard 
              title="Receita"
              value="R$ 86.4K"
              change={23.1}
              icon={DollarSign}
              trend="up"
            />
            <MetricCard 
              title="CTR"
              value="4.8%"
              change={-0.3}
              icon={MousePointerClick}
              trend="down"
            />
          </div>

          {/* Main Chart + Side Panel */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Performance Chart */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-foreground">Performance</h3>
                  <p className="text-sm text-muted-foreground">Visitantes e conversoes ao longo do tempo</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-xs text-muted-foreground">Visitantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                    <span className="text-xs text-muted-foreground">Conversoes</span>
                  </div>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.2}/>
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: 13,
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      fill="url(#visitorsGrad)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="hsl(var(--foreground))" 
                      strokeWidth={2}
                      fill="transparent" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Channel Distribution */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Canais</h3>
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="h-40 flex items-center justify-center mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={channelData} 
                      dataKey="value" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={45}
                      outerRadius={65}
                      strokeWidth={0}
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {channelData.map((channel) => (
                  <div key={channel.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: channel.color }}
                      />
                      <span className="text-sm text-foreground">{channel.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{channel.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Hourly Activity */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-foreground">Atividade por Hora</h3>
                  <p className="text-sm text-muted-foreground">Pico as 18h</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10">
                  <Activity className="h-3.5 w-3.5 text-accent-foreground" />
                  <span className="text-xs font-medium text-accent-foreground">Ao vivo</span>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} barSize={20}>
                    <XAxis 
                      dataKey="hour" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: 13,
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--accent))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Campaign Performance */}
            <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-foreground">Campanhas</h3>
                  <p className="text-sm text-muted-foreground">Top campanhas ativas</p>
                </div>
                <button className="text-sm font-medium text-accent-foreground hover:underline">
                  Ver todas
                </button>
              </div>
              <div className="space-y-4">
                {campaignData.map((campaign) => (
                  <div 
                    key={campaign.name} 
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        campaign.status === "active" ? "bg-accent/10" : "bg-muted"
                      }`}>
                        <Zap className={`h-5 w-5 ${
                          campaign.status === "active" ? "text-accent-foreground" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.clicks.toLocaleString()} clicks
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{campaign.conversions}</p>
                        <p className="text-xs text-muted-foreground">conversoes</p>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <p className="font-semibold text-foreground">{campaign.ctr}%</p>
                        <p className="text-xs text-muted-foreground">CTR</p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        campaign.status === "active" 
                          ? "bg-accent/10 text-accent-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {campaign.status === "active" ? "Ativa" : "Pausada"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard 
              icon={Eye}
              title="Paginas Vistas"
              value="156K"
              subtitle="media 6.3 por visita"
            />
            <InsightCard 
              icon={Target}
              title="Taxa de Rejeicao"
              value="32.4%"
              subtitle="abaixo da media"
            />
            <InsightCard 
              icon={Activity}
              title="Sessao Media"
              value="4m 23s"
              subtitle="+12% vs ultimo mes"
            />
            <InsightCard 
              icon={Zap}
              title="Velocidade"
              value="1.2s"
              subtitle="tempo de carga"
            />
          </div>

        </div>
      </ScrollArea>
    </>
  )
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend 
}: { 
  title: string
  value: string
  change: number
  icon: React.ElementType
  trend: "up" | "down"
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:border-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
          trend === "up" 
            ? "bg-accent/10 text-accent-foreground" 
            : "bg-destructive/10 text-destructive"
        }`}>
          {trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
    </div>
  )
}

function InsightCard({ 
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
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  )
}
