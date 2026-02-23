"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { CreditCard, Plus, DollarSign, ArrowRightLeft } from "lucide-react"

const gateways = [
  { nome: "Mercado Pago", tipo: "PIX / Cartao", status: "conectado", transacoes: 342, volume: "R$ 28.450" },
  { nome: "PagSeguro", tipo: "PIX / Boleto", status: "conectado", transacoes: 128, volume: "R$ 12.380" },
  { nome: "Stripe", tipo: "Cartao Internacional", status: "desconectado", transacoes: 0, volume: "R$ 0" },
  { nome: "Asaas", tipo: "PIX / Boleto / Cartao", status: "desconectado", transacoes: 0, volume: "R$ 0" },
]

export default function GatewaysPage() {
  const { selectedBot } = useBots()

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Gateways" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Gateways" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          <div className="grid gap-3 md:gap-4 grid-cols-3">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Gateways</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">2</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <ArrowRightLeft className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Transacoes</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">470</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Volume</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">R$ 40.8k</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pagamentos PIX e gateways de pagamento</p>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Gateway
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {gateways.map((gw) => (
              <Card key={gw.nome} className="bg-card border-border rounded-2xl">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{gw.nome}</h3>
                        <Badge
                          variant="outline"
                          className={`rounded-lg ${
                            gw.status === "conectado"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-secondary text-muted-foreground border-border"
                          }`}
                        >
                          {gw.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{gw.tipo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {gw.transacoes > 0 && (
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-foreground">{gw.volume}</p>
                        <p className="text-xs text-muted-foreground">{gw.transacoes} transacoes</p>
                      </div>
                    )}
                    <Switch defaultChecked={gw.status === "conectado"} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
