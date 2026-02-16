"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  AlertTriangle,
  Eye,
  Search,
  MoreHorizontal,
  Activity,
  Ban,
  FileText,
  Clock,
  TrendingUp,
  Users,
  ShieldCheck,
} from "lucide-react"

const platformStats = [
  { label: "Total Bots", value: "248", change: "+12 this week", icon: Bot },
  { label: "Active Users", value: "12,450", change: "+840 this month", icon: Users },
  { label: "Flagged Activity", value: "3", change: "Requires review", icon: AlertTriangle },
  { label: "Platform Revenue", value: "R$ 48,200", change: "+22% vs last month", icon: TrendingUp },
]

const allBots = [
  { id: "b1", name: "VendasBot", owner: "User #1042", status: "active", sales: 847, flags: 0, created: "Jan 15, 2026" },
  { id: "b2", name: "ProBot", owner: "User #892", status: "active", sales: 523, flags: 0, created: "Feb 02, 2026" },
  { id: "b3", name: "SpamBot_x", owner: "User #2341", status: "flagged", sales: 12, flags: 3, created: "Feb 10, 2026" },
  { id: "b4", name: "FunnelBot", owner: "User #1542", status: "active", sales: 312, flags: 0, created: "Jan 28, 2026" },
  { id: "b5", name: "SuspiciousBot", owner: "User #3104", status: "flagged", sales: 5, flags: 2, created: "Feb 12, 2026" },
  { id: "b6", name: "UpsellBot", owner: "User #1042", status: "active", sales: 156, flags: 0, created: "Feb 10, 2026" },
  { id: "b7", name: "LeadBot", owner: "User #892", status: "suspended", sales: 189, flags: 5, created: "Dec 10, 2025" },
  { id: "b8", name: "NewBot", owner: "User #4210", status: "active", sales: 0, flags: 0, created: "Feb 14, 2026" },
]

const activityLogs = [
  { time: "14:32", action: "Bot created", details: "User #4210 created NewBot", type: "info" },
  { time: "14:18", action: "Flagged activity", details: "SpamBot_x detected unusual message volume", type: "warning" },
  { time: "13:55", action: "Bot suspended", details: "LeadBot suspended for policy violation", type: "danger" },
  { time: "13:40", action: "Payment processed", details: "Platform fee: R$ 124.00 from VendasBot", type: "info" },
  { time: "13:20", action: "Config audit", details: "FunnelBot flow configuration reviewed", type: "info" },
  { time: "12:55", action: "Flagged activity", details: "SuspiciousBot clone detection triggered", type: "warning" },
  { time: "12:40", action: "User registered", details: "New user #4210 joined platform", type: "info" },
  { time: "12:10", action: "Bot reactivated", details: "UpsellBot reactivated by owner", type: "info" },
]

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  flagged: "bg-warning/10 text-warning border-warning/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
}

const logTypeStyles: Record<string, string> = {
  info: "text-muted-foreground",
  warning: "text-warning",
  danger: "text-destructive",
}

export default function AdminPage() {
  const [search, setSearch] = useState("")

  const filteredBots = allBots.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.owner.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScrollArea className="flex-1">
      {/* Admin Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/15">
            <ShieldCheck className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Platform monitoring and bot administration</p>
          </div>
        </div>
        <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
          Admin Access
        </Badge>
      </div>

      <div className="flex flex-col gap-6 p-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {platformStats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <span className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.change}</span>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="bots">
          <TabsList className="bg-secondary">
            <TabsTrigger value="bots">All Platform Bots</TabsTrigger>
            <TabsTrigger value="flags">Flagged Activity</TabsTrigger>
            <TabsTrigger value="logs">Action Logs</TabsTrigger>
          </TabsList>

          {/* Platform Bots */}
          <TabsContent value="bots" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-foreground">Bot Registry</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search bots..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-64 bg-secondary pl-9 border-border"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Bot Name</TableHead>
                      <TableHead className="text-muted-foreground">Owner</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Sales</TableHead>
                      <TableHead className="text-muted-foreground">Flags</TableHead>
                      <TableHead className="text-muted-foreground">Created</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBots.map((bot) => (
                      <TableRow key={bot.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{bot.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{bot.owner}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyles[bot.status]}>{bot.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{bot.sales}</TableCell>
                        <TableCell>
                          {bot.flags > 0 ? (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                              {bot.flags} flags
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{bot.created}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem className="text-foreground">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-foreground">
                                <FileText className="mr-2 h-4 w-4" />
                                Audit Config
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-foreground">
                                <Activity className="mr-2 h-4 w-4" />
                                View Metrics
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend Bot
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flagged */}
          <TabsContent value="flags" className="mt-6">
            <div className="flex flex-col gap-4">
              {allBots
                .filter((b) => b.flags > 0)
                .map((bot) => (
                  <Card key={bot.id} className="bg-card border-border border-l-4 border-l-warning">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-warning" />
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{bot.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {bot.owner} - {bot.flags} flags detected
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-border text-foreground">
                            <Eye className="mr-1.5 h-3.5 w-3.5" /> Review
                          </Button>
                          <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                            <Ban className="mr-1.5 h-3.5 w-3.5" /> Suspend
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Logs */}
          <TabsContent value="logs" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium text-foreground">Activity Log</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {activityLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-4 px-5 py-3">
                      <div className="flex items-center gap-2 pt-0.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">{log.time}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${logTypeStyles[log.type]}`}>
                          {log.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{log.details}</p>
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
  )
}
