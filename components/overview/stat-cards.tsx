"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Bot, Users, ShoppingCart, TrendingUp } from "lucide-react"

const stats = [
  { label: "Bots Ativos", value: "3", icon: Bot },
  { label: "Usuarios", value: "1.240", icon: Users },
  { label: "Vendas Hoje", value: "24", icon: ShoppingCart },
  { label: "Conversao", value: "8,4%", icon: TrendingUp },
]

export function StatCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border rounded-2xl">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
