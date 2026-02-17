"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { name: "Jan", vendas: 18 },
  { name: "Fev", vendas: 24 },
  { name: "Mar", vendas: 20 },
  { name: "Abr", vendas: 32 },
  { name: "Mai", vendas: 28 },
  { name: "Jun", vendas: 42 },
  { name: "Jul", vendas: 38 },
  { name: "Ago", vendas: 45 },
  { name: "Set", vendas: 40 },
  { name: "Out", vendas: 52 },
  { name: "Nov", vendas: 48 },
  { name: "Dez", vendas: 58 },
]

export function RevenueChart() {
  return (
    <Card className="bg-card border-border rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Vendas por Mes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 14%)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 7%)",
                  border: "1px solid hsl(0, 0%, 14%)",
                  borderRadius: "12px",
                  color: "hsl(0, 0%, 95%)",
                  fontSize: 13,
                }}
                formatter={(value: number) => [value, "Vendas"]}
              />
              <Area
                type="monotone"
                dataKey="vendas"
                stroke="hsl(160, 60%, 45%)"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
