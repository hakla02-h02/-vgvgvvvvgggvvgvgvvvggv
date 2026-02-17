"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { Target, CheckCircle } from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
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
  { source: "facebook", campaign: "weekend_promo", vendas: 87, roi: "342%" },
  { source: "tiktok", campaign: "launch_v2", vendas: 62, roi: "287%" },
  { source: "google", campaign: "brand_search", vendas: 45, roi: "412%" },
  { source: "organico", campaign: "-", vendas: 38, roi: "-" },
  { source: "instagram", campaign: "stories", vendas: 28, roi: "198%" },
]

const pixels = [
  { nome: "Facebook Pixel", id: "1234567890", ativo: true },
  { nome: "TikTok Pixel", id: "TT-987654", ativo: true },
  { nome: "Google Ads Tag", id: "AW-112233", ativo: true },
  { nome: "Kwai Ads", id: "KW-445566", ativo: false },
]

const sourceColors = [
  "hsl(160, 60%, 45%)", "hsl(200, 65%, 50%)", "hsl(30, 80%, 55%)",
  "hsl(0, 0%, 40%)", "hsl(280, 65%, 60%)",
]

const sourceData = [
  { name: "Facebook", value: 87 },
  { name: "TikTok", value: 62 },
  { name: "Google", value: 45 },
  { name: "Organico", value: 38 },
  { name: "Instagram", value: 28 },
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
        <div className="flex flex-col gap-6 p-6">
          {/* Graficos */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="bg-card border-border rounded-2xl lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Conversoes por Fonte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={conversaoTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 14%)" />
                      <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(0, 0%, 7%)",
                          border: "1px solid hsl(0, 0%, 14%)",
                          borderRadius: "12px",
                          color: "hsl(0, 0%, 95%)",
                          fontSize: 13,
                        }}
                      />
                      <Line type="monotone" dataKey="facebook" stroke="hsl(160, 60%, 45%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="tiktok" stroke="hsl(200, 65%, 50%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="google" stroke="hsl(30, 80%, 55%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Vendas por Fonte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sourceData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={45}>
                        {sourceData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={sourceColors[index]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(0, 0%, 7%)",
                          border: "1px solid hsl(0, 0%, 14%)",
                          borderRadius: "12px",
                          color: "hsl(0, 0%, 95%)",
                          fontSize: 13,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  {sourceData.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sourceColors[i] }} />
                      <span className="text-xs text-muted-foreground">{s.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pixels */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {pixels.map((pixel) => (
              <Card key={pixel.nome} className="bg-card border-border rounded-2xl">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{pixel.nome}</p>
                      <p className="text-xs text-muted-foreground">{pixel.id}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={pixel.ativo} />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* UTM Table */}
          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Desempenho UTM</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Fonte</TableHead>
                    <TableHead className="text-muted-foreground">Campanha</TableHead>
                    <TableHead className="text-muted-foreground">Vendas</TableHead>
                    <TableHead className="text-muted-foreground">ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {utmData.map((row, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell className="font-medium text-foreground">{row.source}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{row.campaign}</TableCell>
                      <TableCell className="font-medium text-foreground">{row.vendas}</TableCell>
                      <TableCell>
                        {row.roi !== "-" ? (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20 rounded-lg">{row.roi}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  )
}
