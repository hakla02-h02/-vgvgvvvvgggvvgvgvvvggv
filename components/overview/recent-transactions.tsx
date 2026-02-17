"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const vendas = [
  { user: "Carlos M.", valor: "R$ 197", status: "aprovada", tempo: "2 min" },
  { user: "Ana P.", valor: "R$ 497", status: "aprovada", tempo: "5 min" },
  { user: "Lucas S.", valor: "R$ 97", status: "pendente", tempo: "8 min" },
  { user: "Maria R.", valor: "R$ 297", status: "aprovada", tempo: "12 min" },
  { user: "Pedro L.", valor: "R$ 47", status: "expirada", tempo: "15 min" },
]

const statusStyles: Record<string, string> = {
  aprovada: "bg-success/10 text-success border-success/20",
  pendente: "bg-warning/10 text-warning border-warning/20",
  expirada: "bg-muted text-muted-foreground border-border",
}

export function RecentTransactions() {
  return (
    <Card className="bg-card border-border rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">
          Vendas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {vendas.map((venda, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-xs font-medium text-muted-foreground">
                  {venda.user.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{venda.user}</p>
                  <p className="text-xs text-muted-foreground">{venda.tempo} atras</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{venda.valor}</span>
                <Badge variant="outline" className={`rounded-lg ${statusStyles[venda.status]}`}>
                  {venda.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
