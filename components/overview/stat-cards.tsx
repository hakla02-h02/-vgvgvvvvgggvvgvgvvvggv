"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Bot, TrendingUp, ShoppingCart } from "lucide-react"

const stats = [
  {
    label: "Revenue Today",
    value: "R$ 12,480.00",
    change: "+18.2%",
    positive: true,
    icon: DollarSign,
  },
  {
    label: "Active Bots",
    value: "24",
    change: "+3 this week",
    positive: true,
    icon: Bot,
  },
  {
    label: "Conversion Rate",
    value: "8.4%",
    change: "+1.2%",
    positive: true,
    icon: TrendingUp,
  },
  {
    label: "Total Transactions",
    value: "1,847",
    change: "+124 today",
    positive: true,
    icon: ShoppingCart,
  },
]

export function StatCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <span className="text-2xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs text-success">{stat.change}</span>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
