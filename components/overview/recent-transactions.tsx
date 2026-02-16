"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const transactions = [
  { id: "#TX-001", user: "Carlos M.", amount: "R$ 197,00", status: "paid", time: "2 min ago", bot: "VendasBot" },
  { id: "#TX-002", user: "Ana P.", amount: "R$ 497,00", status: "paid", time: "5 min ago", bot: "ProBot" },
  { id: "#TX-003", user: "Lucas S.", amount: "R$ 97,00", status: "pending", time: "8 min ago", bot: "VendasBot" },
  { id: "#TX-004", user: "Maria R.", amount: "R$ 297,00", status: "paid", time: "12 min ago", bot: "FunnelBot" },
  { id: "#TX-005", user: "Pedro L.", amount: "R$ 47,00", status: "expired", time: "15 min ago", bot: "VendasBot" },
  { id: "#TX-006", user: "Julia F.", amount: "R$ 197,00", status: "paid", time: "20 min ago", bot: "ProBot" },
]

const statusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  expired: "bg-destructive/10 text-destructive border-destructive/20",
}

export function RecentTransactions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {tx.user}
                  </span>
                  <span className="text-xs text-muted-foreground">{tx.id}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {tx.bot} - {tx.time}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {tx.amount}
                </span>
                <Badge
                  variant="outline"
                  className={statusStyles[tx.status]}
                >
                  {tx.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
