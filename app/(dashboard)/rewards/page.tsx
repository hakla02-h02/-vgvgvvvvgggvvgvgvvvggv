"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import { Trophy, Target, Lock, DollarSign, Gift } from "lucide-react"

const milestones = [
  { label: "R$ 10K", value: 10000, premio: "Badge exclusivo + destaque no ranking" },
  { label: "R$ 100K", value: 100000, premio: "Acesso a recursos premium + suporte prioritario" },
  { label: "R$ 500K", value: 500000, premio: "Consultoria exclusiva + taxa reduzida" },
  { label: "R$ 1M", value: 1000000, premio: "Membro VIP + taxa zero por 3 meses" },
]

export default function RewardsPage() {
  const { selectedBot } = useBots()
  const faturamentoAtual = 0

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Premiacoes" />
        <NoBotSelected />
      </>
    )
  }

  const currentMilestoneIdx = milestones.findIndex((m) => faturamentoAtual < m.value)
  const proximaMeta = currentMilestoneIdx >= 0 ? milestones[currentMilestoneIdx] : milestones[milestones.length - 1]

  return (
    <>
      <DashboardHeader title="Premiacoes" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          {/* Stats cards */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Faturamento</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">R$ {faturamentoAtual.toLocaleString("pt-BR")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Target className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Proxima meta</p>
                  <p className="text-lg md:text-2xl font-bold text-accent">{proximaMeta.label}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Metas atingidas</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    {milestones.filter((m) => faturamentoAtual >= m.value).length}/{milestones.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Gift className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Premios</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    {milestones.filter((m) => faturamentoAtual >= m.value).length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Milestones track */}
          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Metas de Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
                {milestones.map((m, i) => {
                  const unlocked = faturamentoAtual >= m.value
                  return (
                    <div key={m.label} className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-colors ${
                          unlocked
                            ? "border-accent bg-accent/10"
                            : "border-border bg-secondary/50"
                        }`}>
                          {unlocked ? (
                            <Trophy className="h-6 w-6 text-accent" />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground/50" />
                          )}
                        </div>
                        <span className={`text-xs font-bold ${
                          unlocked ? "text-accent" : "text-muted-foreground/60"
                        }`}>
                          {m.label}
                        </span>
                      </div>
                      {i < milestones.length - 1 && (
                        <div className={`h-0.5 w-10 rounded-full shrink-0 mt-[-22px] ${
                          unlocked ? "bg-accent" : "bg-border"
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detailed milestones */}
          <Card className="bg-card border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Detalhes das Premiacoes</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {milestones.map((m) => {
                const unlocked = faturamentoAtual >= m.value
                const progress = Math.min(100, (faturamentoAtual / m.value) * 100)
                return (
                  <div
                    key={m.label}
                    className={`rounded-xl p-4 ${
                      unlocked
                        ? "bg-accent/5 border border-accent/20"
                        : "bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          unlocked ? "bg-accent/10" : "bg-background"
                        }`}>
                          {unlocked ? (
                            <Trophy className="h-5 w-5 text-accent" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Meta {m.label}</p>
                          <p className="text-xs text-muted-foreground">{m.premio}</p>
                        </div>
                      </div>
                      {unlocked ? (
                        <Badge variant="outline" className="rounded-lg bg-accent/10 text-accent border-accent/20">Desbloqueado</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">{progress.toFixed(0)}%</span>
                      )}
                    </div>
                    {!unlocked && (
                      <Progress value={progress} className="h-1.5 bg-background mt-1" />
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  )
}
