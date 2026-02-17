"use client"

import { useState, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bot,
  Search,
  MoreHorizontal,
  Ban,
  CheckCircle,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { getAllUsers, saveAllUsers, type StoredUser } from "@/lib/auth-context"
import type { Bot as BotType } from "@/lib/bot-context"

function getStoredBots(): BotType[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("teleflow_bots")
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function AdminPage() {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<StoredUser[]>([])
  const [bots, setBots] = useState<BotType[]>([])

  const loadData = useCallback(() => {
    setUsers(getAllUsers())
    setBots(getStoredBots())
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function toggleBan(userId: string) {
    const updated = users.map((u) =>
      u.userId === userId ? { ...u, banned: !u.banned } : u
    )
    saveAllUsers(updated)
    setUsers(updated)
  }

  function getUserBots(userId: string) {
    return bots.filter((b) => b.userId === userId)
  }

  const filteredUsers = users.filter(
    (u) => u.email.toLowerCase().includes(search.toLowerCase()) ||
           u.userId.toLowerCase().includes(search.toLowerCase())
  )

  const totalBots = bots.length
  const activeUsers = users.filter((u) => !u.banned).length
  const bannedUsers = users.filter((u) => u.banned).length

  return (
    <ScrollArea className="flex-1 h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15">
            <ShieldCheck className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Painel Admin</h1>
            <p className="text-sm text-muted-foreground">Gerencie todos os usuarios da plataforma</p>
          </div>
        </div>
        <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-xs">
          Admin
        </Badge>
      </div>

      <div className="flex flex-col gap-6 p-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeUsers}</p>
                  <p className="text-sm text-muted-foreground">Usuarios ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Bot className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalBots}</p>
                  <p className="text-sm text-muted-foreground">Bots criados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                  <Ban className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{bannedUsers}</p>
                  <p className="text-sm text-muted-foreground">Banidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-card border-border">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-base font-semibold text-foreground">Usuarios</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 bg-secondary pl-9 border-border text-sm"
              />
            </div>
          </div>
          <CardContent className="p-0">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Users className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {users.length === 0 ? "Nenhum usuario registrado ainda" : "Nenhum resultado"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Email</TableHead>
                    <TableHead className="text-muted-foreground text-xs">ID</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Bots</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Registrado em</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const userBots = getUserBots(user.userId)
                    return (
                      <TableRow key={user.userId} className="border-border">
                        <TableCell>
                          <span className="text-sm font-medium text-foreground">{user.email}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-muted-foreground">{user.userId}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-foreground">{userBots.length}</span>
                            {userBots.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({userBots.map((b) => b.name).join(", ")})
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.registeredAt).toLocaleDateString("pt-BR")}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.banned ? (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                              Banido
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                              Ativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              {user.banned ? (
                                <DropdownMenuItem
                                  onClick={() => toggleBan(user.userId)}
                                  className="text-success"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Desbanir
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => toggleBan(user.userId)}
                                  className="text-destructive"
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Banir
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Back to dashboard link */}
      <div className="flex justify-center pb-8">
        <a
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Zap className="h-4 w-4" />
          Voltar ao painel
        </a>
      </div>
    </ScrollArea>
  )
}
