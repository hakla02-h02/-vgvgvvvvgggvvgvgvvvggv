"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { StatCards } from "@/components/overview/stat-cards"
import { RevenueChart } from "@/components/overview/revenue-chart"
import { NoBotSelected } from "@/components/no-bot-selected"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { useBots } from "@/lib/bot-context"
import { ShoppingCart, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const { selectedBot } = useBots()

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Painel" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Painel" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          {/* Vendas de hoje + Faturado */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <ShoppingCart className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vendas Hoje</p>
                  <p className="text-3xl font-bold text-foreground tracking-tight">24</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/10">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Faturado Hoje</p>
                  <p className="text-3xl font-bold text-foreground tracking-tight">R$ 4.720</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grafico de vendas */}
          <RevenueChart />

          {/* Stats secundarios */}
          <StatCards />
        </div>
      </ScrollArea>
    </>
  )
}
