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
} from "lucide-react"
import type { Bot as BotType } from "@/lib/bot-context"

// Registry of users who logged in (stored client-side, populated by auth events)
const USERS_REGISTRY_KEY = "teleflow_users_registry"
const BANNED_KEY = "teleflow_banned"

interface RegisteredUser {
  userId: string
  email: string
  firstSeen: number
}

function getUsersRegistry(): RegisteredUser[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function getBannedIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(BANNED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveBannedIds(ids: string[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(BANNED_KEY, JSON.stringify(ids))
}

function getStoredBots(): BotType[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("teleflow_bots")
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export default function AdmPage() {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [bots, setBots] = useState<BotType[]>([])
  const [bannedIds, setBannedIds] = useState<string[]>([])

  const loadData = useCallback(() => {
    setUsers(getUsersRegistry())
    setBots(getStoredBots())
    setBannedIds(getBannedIds())
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function toggleBan(userId: string) {
    let updated: string[]
    if (bannedIds.includes(userId)) {
      updated = bannedIds.filter((id) => id !== userId)
    } else {
      updated = [...bannedIds, userId]
    }
    saveBannedIds(updated)
    setBannedIds(updated)
  }

  function getUserBots(userId: string) {
    return bots.filter((b) => b.userId === userId)
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.userId.toLowerCase().includes(search.toLowerCase())
  )

  const totalBots = bots.length
  const activeUsers = users.filter((u) => !bannedIds.includes(u.userId)).length
  const bannedCount = users.filter((u) => bannedIds.includes(u.userId)).length

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-6 p-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border rounded-2xl">
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
          <Card className="bg-card border-border rounded-2xl">
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
          <Card className="bg-card border-border rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                  <Ban className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{bannedCount}</p>
                  <p className="text-sm text-muted-foreground">Banidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-card border-border rounded-2xl">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-base font-semibold text-foreground">Usuarios</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 bg-secondary pl-9 border-border text-sm rounded-xl"
              />
            </div>
          </div>
          <CardContent className="p-0">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Users className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {users.length === 0
                    ? "Nenhum usuario registrado ainda"
                    : "Nenhum resultado"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Email</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Bots</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Registrado em</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                    <TableHead className="text-muted-foreground text-xs text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const userBots = getUserBots(user.userId)
                    const isBanned = bannedIds.includes(user.userId)
                    return (
                      <TableRow key={user.userId} className="border-border">
                        <TableCell>
                          <span className="text-sm font-medium text-foreground">{user.email}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-foreground">{userBots.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.firstSeen).toLocaleDateString("pt-BR")}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isBanned ? (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs rounded-lg">
                              Banido
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs rounded-lg">
                              Ativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              {isBanned ? (
                                <DropdownMenuItem onClick={() => toggleBan(user.userId)} className="text-emerald-400">
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Desbanir
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => toggleBan(user.userId)} className="text-destructive">
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
    </ScrollArea>
  )
}
