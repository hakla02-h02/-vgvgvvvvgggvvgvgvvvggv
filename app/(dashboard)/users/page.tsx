"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import {
  Users, UserCheck, Crown, Search, MapPin, ShieldCheck,
  MessageSquare, Globe,
} from "lucide-react"

const usuarios = [
  { id: "u1", nome: "Carlos M.", telegram: "@carlosm", cidade: "Sao Paulo", grupos: 2, status: "ativo" },
  { id: "u2", nome: "Ana P.", telegram: "@anap", cidade: "Rio de Janeiro", grupos: 1, status: "ativo" },
  { id: "u3", nome: "Lucas S.", telegram: "@lucass", cidade: "Belo Horizonte", grupos: 1, status: "ativo" },
  { id: "u4", nome: "Maria R.", telegram: "@mariar", cidade: "Salvador", grupos: 3, status: "ativo" },
  { id: "u5", nome: "Pedro L.", telegram: "@pedrol", cidade: "Porto Alegre", grupos: 0, status: "inativo" },
  { id: "u6", nome: "Julia F.", telegram: "@juliaf", cidade: "Lisboa", grupos: 1, status: "ativo" },
  { id: "u7", nome: "Rafael G.", telegram: "@rafaelg", cidade: "Curitiba", grupos: 2, status: "ativo" },
]

const gruposVip = [
  { id: "g1", nome: "VIP Premium", membros: 420, autoAprovacao: true, boasVindas: true },
  { id: "g2", nome: "Curso Pro", membros: 185, autoAprovacao: true, boasVindas: true },
  { id: "g3", nome: "Inner Circle", membros: 72, autoAprovacao: true, boasVindas: false },
  { id: "g4", nome: "Comunidade Free", membros: 2100, autoAprovacao: false, boasVindas: true },
]

const geoStats = [
  { regiao: "Sao Paulo", usuarios: 1240, pct: 38 },
  { regiao: "Rio de Janeiro", usuarios: 580, pct: 18 },
  { regiao: "Minas Gerais", usuarios: 420, pct: 13 },
  { regiao: "Bahia", usuarios: 310, pct: 10 },
  { regiao: "Outros", usuarios: 690, pct: 21 },
]

export default function UsersPage() {
  const { selectedBot } = useBots()
  const [busca, setBusca] = useState("")

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Usuarios" />
        <NoBotSelected />
      </>
    )
  }

  const filtrados = usuarios.filter(
    (u) => u.nome.toLowerCase().includes(busca.toLowerCase()) ||
           u.telegram.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <>
      <DashboardHeader title="Usuarios" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
          {/* Stats */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-foreground">8.770</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <UserCheck className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ativos Hoje</p>
                  <p className="text-lg font-bold text-foreground">1.240</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Crown className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">VIP</p>
                  <p className="text-lg font-bold text-foreground">677</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paises</p>
                  <p className="text-lg font-bold text-foreground">12</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="usuarios">
            <TabsList className="bg-secondary rounded-xl">
              <TabsTrigger value="usuarios" className="rounded-lg">Usuarios</TabsTrigger>
              <TabsTrigger value="grupos" className="rounded-lg">Grupos VIP</TabsTrigger>
              <TabsTrigger value="geo" className="rounded-lg">Localizacao</TabsTrigger>
            </TabsList>

            <TabsContent value="usuarios" className="mt-6">
              <Card className="bg-card border-border rounded-2xl">
                <div className="p-5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuarios..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full sm:w-72 bg-secondary pl-9 border-border rounded-xl"
                    />
                  </div>
                </div>
                <CardContent className="p-0 overflow-x-auto">
                        <TableHead className="text-muted-foreground">Cidade</TableHead>
                        <TableHead className="text-muted-foreground">Grupos</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtrados.map((user) => (
                        <TableRow key={user.id} className="border-border">
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-foreground">{user.nome}</p>
                              <p className="text-xs text-muted-foreground">{user.telegram}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{user.cidade}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">{user.grupos}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`rounded-lg ${
                                user.status === "ativo"
                                  ? "bg-success/10 text-success border-success/20"
                                  : "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grupos" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {gruposVip.map((grupo) => (
                  <Card key={grupo.id} className="bg-card border-border rounded-2xl">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                          <Crown className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{grupo.nome}</h3>
                          <p className="text-xs text-muted-foreground">{grupo.membros} membros</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-foreground">Auto-aprovacao</span>
                          </div>
                          <Badge variant="outline" className={`rounded-lg ${grupo.autoAprovacao ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}`}>
                            {grupo.autoAprovacao ? "Sim" : "Nao"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-foreground">Boas-vindas</span>
                          </div>
                          <Badge variant="outline" className={`rounded-lg ${grupo.boasVindas ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}`}>
                            {grupo.boasVindas ? "Sim" : "Nao"}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4 w-full border-border text-foreground rounded-xl">
                        Gerenciar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="geo" className="mt-6">
              <Card className="bg-card border-border rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4">
                    {geoStats.map((region) => (
                      <div key={region.regiao} className="flex items-center gap-4">
                        <div className="w-32">
                          <span className="text-sm text-foreground">{region.regiao}</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-3 rounded-full bg-secondary">
                            <div
                              className="h-3 rounded-full bg-accent transition-all"
                              style={{ width: `${region.pct}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex w-24 items-center justify-end gap-2">
                          <span className="text-sm font-medium text-foreground">{region.usuarios.toLocaleString("pt-BR")}</span>
                          <span className="text-xs text-muted-foreground">{region.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </>
  )
}
