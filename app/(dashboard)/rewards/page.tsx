"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { Trophy, Star, Target, Zap, Award, Crown, Medal } from "lucide-react"

const conquistas = [
  { nome: "Primeiro Bot", descricao: "Crie seu primeiro bot", icon: Zap, progresso: 100, concluida: true },
  { nome: "10 Vendas", descricao: "Realize 10 vendas pelo bot", icon: Target, progresso: 100, concluida: true },
  { nome: "100 Leads", descricao: "Capture 100 leads", icon: Star, progresso: 78, concluida: false },
  { nome: "Mestre dos Fluxos", descricao: "Crie 5 fluxos de venda", icon: Award, progresso: 60, concluida: false },
  { nome: "Top Afiliado", descricao: "Indique 10 amigos", icon: Crown, progresso: 50, concluida: false },
  { nome: "R$ 10k em Vendas", descricao: "Atinja R$ 10.000 em vendas", icon: Medal, progresso: 35, concluida: false },
]

const niveis = [
  { nome: "Bronze", min: 0, max: 500, cor: "hsl(30, 60%, 50%)" },
  { nome: "Prata", min: 500, max: 2000, cor: "hsl(0, 0%, 65%)" },
  { nome: "Ouro", min: 2000, max: 5000, cor: "hsl(45, 80%, 55%)" },
  { nome: "Diamante", min: 5000, max: 10000, cor: "hsl(200, 70%, 55%)" },
]

export default function RewardsPage() {
  const { selectedBot } = useBots()
  const pontosAtuais = 780

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Premiacoes" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Pontos</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{pontosAtuais}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Star className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Nivel</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">Prata</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Award className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Conquistas</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">2/6</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Target className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Proximo</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">Ouro</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Niveis de Premiacao</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {niveis.map((nivel) => {
                const progresso = Math.min(100, Math.max(0, ((pontosAtuais - nivel.min) / (nivel.max - nivel.min)) * 100))
                const atingido = pontosAtuais >= nivel.max
                const atual = pontosAtuais >= nivel.min && pontosAtuais < nivel.max

                return (
                  <div key={nivel.nome} className="flex items-center gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                      style={{ backgroundColor: `${nivel.cor}20`, color: nivel.cor }}
                    >
                      {nivel.nome.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{nivel.nome}</span>
                        <span className="text-xs text-muted-foreground">{nivel.min} - {nivel.max} pts</span>
                      </div>
                      <Progress value={atingido ? 100 : atual ? progresso : 0} className="h-2 bg-secondary" />
                    </div>
                    {atingido && (
                      <Badge variant="outline" className="rounded-lg bg-success/10 text-success border-success/20">Completo</Badge>
                    )}
                    {atual && (
                      <Badge variant="outline" className="rounded-lg bg-accent/10 text-accent border-accent/20">Atual</Badge>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Conquistas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {conquistas.map((c) => (
                <div
                  key={c.nome}
                  className={`flex items-center gap-3 rounded-xl p-3 ${
                    c.concluida ? "bg-success/5 border border-success/20" : "bg-secondary"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    c.concluida ? "bg-success/10" : "bg-background"
                  }`}>
                    <c.icon className={`h-5 w-5 ${c.concluida ? "text-success" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{c.nome}</p>
                      {c.concluida && (
                        <Badge variant="outline" className="rounded-lg bg-success/10 text-success border-success/20 shrink-0">Feita</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{c.descricao}</p>
                    {!c.concluida && (
                      <Progress value={c.progresso} className="h-1.5 bg-background mt-1.5" />
                    )}
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
