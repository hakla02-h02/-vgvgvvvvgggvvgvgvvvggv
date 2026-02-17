"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import {
  CheckCircle, Clock, XCircle, Search, Download, ShoppingCart,
} from "lucide-react"

const vendas = [
  { id: "PIX-2847", user: "Carlos M.", valor: "R$ 197", status: "aprovada", hora: "14:23" },
  { id: "PIX-2846", user: "Ana P.", valor: "R$ 497", status: "aprovada", hora: "14:18" },
  { id: "PIX-2845", user: "Lucas S.", valor: "R$ 97", status: "pendente", hora: "14:10" },
  { id: "PIX-2844", user: "Maria R.", valor: "R$ 297", status: "aprovada", hora: "13:55" },
  { id: "PIX-2843", user: "Pedro L.", valor: "R$ 47", status: "expirada", hora: "13:40" },
  { id: "PIX-2842", user: "Julia F.", valor: "R$ 197", status: "aprovada", hora: "13:32" },
  { id: "PIX-2841", user: "Rafael G.", valor: "R$ 497", status: "aprovada", hora: "13:20" },
  { id: "PIX-2840", user: "Camila T.", valor: "R$ 97", status: "cancelada", hora: "13:10" },
]

const statusStyles: Record<string, string> = {
  aprovada: "bg-success/10 text-success border-success/20",
  pendente: "bg-warning/10 text-warning border-warning/20",
  expirada: "bg-muted text-muted-foreground border-border",
  cancelada: "bg-destructive/10 text-destructive border-destructive/20",
}

const statusIcons: Record<string, React.ElementType> = {
  aprovada: CheckCircle,
  pendente: Clock,
  expirada: XCircle,
  cancelada: XCircle,
}

export default function PaymentsPage() {
  const { selectedBot } = useBots()
  const [filtro, setFiltro] = useState("todos")
  const [busca, setBusca] = useState("")

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Vendas" />
        <NoBotSelected />
      </>
    )
  }

  const filtradas = vendas.filter((v) => {
    const matchFiltro = filtro === "todos" || v.status === filtro
    const matchBusca =
      v.user.toLowerCase().includes(busca.toLowerCase()) ||
      v.id.toLowerCase().includes(busca.toLowerCase())
    return matchFiltro && matchBusca
  })

  return (
    <>
      <DashboardHeader title="Vendas" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          {/* Stats simples */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aprovadas</p>
                  <p className="text-2xl font-bold text-foreground">5</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-foreground">1</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hoje</p>
                  <p className="text-2xl font-bold text-foreground">8</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de vendas */}
          <Card className="bg-card border-border rounded-2xl">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-56 bg-secondary pl-9 border-border rounded-xl"
                />
              </div>
              <div className="flex items-center gap-3">
                <Select value={filtro} onValueChange={setFiltro}>
                  <SelectTrigger className="w-36 bg-secondary border-border rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="aprovada">Aprovadas</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="expirada">Expiradas</SelectItem>
                    <SelectItem value="cancelada">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="border-border text-foreground rounded-xl">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">ID</TableHead>
                    <TableHead className="text-muted-foreground">Usuario</TableHead>
                    <TableHead className="text-muted-foreground">Valor</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtradas.map((v) => {
                    const Icon = statusIcons[v.status]
                    return (
                      <TableRow key={v.id} className="border-border">
                        <TableCell className="font-mono text-xs text-foreground">{v.id}</TableCell>
                        <TableCell className="text-sm text-foreground">{v.user}</TableCell>
                        <TableCell className="font-medium text-foreground">{v.valor}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`flex w-fit items-center gap-1 rounded-lg ${statusStyles[v.status]}`}>
                            <Icon className="h-3 w-3" />
                            {v.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{v.hora}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  )
}
