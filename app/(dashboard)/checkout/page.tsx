"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { ShoppingCart, Plus, Eye, Copy, ExternalLink } from "lucide-react"

const checkouts = [
  { id: "ck1", nome: "Produto Premium", preco: "R$ 197,00", vendas: 84, url: "/pay/produto-premium", ativo: true },
  { id: "ck2", nome: "Curso Bot Master", preco: "R$ 497,00", vendas: 42, url: "/pay/curso-bot-master", ativo: true },
  { id: "ck3", nome: "Consultoria 1h", preco: "R$ 297,00", vendas: 18, url: "/pay/consultoria-1h", ativo: true },
  { id: "ck4", nome: "Plano Anual", preco: "R$ 997,00", vendas: 8, url: "/pay/plano-anual", ativo: false },
]

export default function CheckoutPage() {
  const { selectedBot } = useBots()

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Checkout" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Checkout" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          <div className="grid gap-3 md:gap-4 grid-cols-3">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Checkouts</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">4</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Eye className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Vendas</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">152</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <ExternalLink className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Conversao</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">12,4%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Paginas de pagamento personalizadas</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Checkout
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Criar Checkout</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Nome do Produto</Label>
                    <Input placeholder="Ex: Meu Produto" className="bg-secondary border-border rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Preco</Label>
                    <Input placeholder="R$ 0,00" className="bg-secondary border-border rounded-xl" />
                  </div>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">Criar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col gap-3">
            {checkouts.map((ck) => (
              <Card key={ck.id} className="bg-card border-border rounded-2xl">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{ck.nome}</h3>
                        <Badge variant="outline" className="rounded-lg bg-accent/10 text-accent border-accent/20">{ck.preco}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{ck.vendas} vendas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
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
