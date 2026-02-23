"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { Gift, Users, DollarSign, Copy, Share2, Trophy } from "lucide-react"

const indicacoes = [
  { nome: "Lucas Mendes", email: "lucas@email.com", status: "ativo", ganho: "R$ 50,00" },
  { nome: "Fernanda Lima", email: "fer@email.com", status: "ativo", ganho: "R$ 50,00" },
  { nome: "Ricardo Santos", email: "ric@email.com", status: "pendente", ganho: "-" },
  { nome: "Camila Souza", email: "cam@email.com", status: "ativo", ganho: "R$ 50,00" },
  { nome: "Bruno Costa", email: "bru@email.com", status: "pendente", ganho: "-" },
]

const statusStyles: Record<string, string> = {
  ativo: "bg-success/10 text-success border-success/20",
  pendente: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
}

export default function ReferralPage() {
  const { selectedBot } = useBots()

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Indique e Ganhe" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Indique e Ganhe" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Indicados</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">5</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Ganhos</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">R$ 150</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Gift className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Bonus</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">R$ 50/ref</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Nivel</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">Bronze</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Seu Link de Indicacao</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value="https://app.dragon.com/invite/seu-codigo"
                  className="bg-secondary border-border rounded-xl text-muted-foreground"
                />
                <Button variant="outline" className="border-border rounded-xl shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl shrink-0">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Proximo nivel: Prata (10 indicacoes)</span>
                  <span>5/10</span>
                </div>
                <Progress value={50} className="h-2 bg-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Seus Indicados</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {indicacoes.map((ind, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background text-sm font-bold text-foreground">
                      {ind.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{ind.nome}</p>
                      <p className="text-xs text-muted-foreground">{ind.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{ind.ganho}</span>
                    <Badge variant="outline" className={`rounded-lg ${statusStyles[ind.status]}`}>
                      {ind.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  )
}
