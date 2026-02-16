"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Bot, TrendingUp, ShoppingCart } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
  useEffect(() => {
    async function testConnection() {
      try {
        const { error } = await supabase.from("_test_ping").select("*").limit(1)
        if (error && error.code === "PGRST116") {
          // Table doesn't exist but connection works
          console.log("[v0] Supabase connected successfully (table not found is expected)")
        } else if (error && error.code === "42P01") {
          console.log("[v0] Supabase connected successfully (relation does not exist is expected)")
        } else if (error) {
          console.log("[v0] Supabase connection test error:", error.message, error.code)
        } else {
          console.log("[v0] Supabase connected and query successful")
        }
      } catch (err) {
        console.log("[v0] Supabase connection failed:", err)
      }
    }
    testConnection()
  }, [])

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
