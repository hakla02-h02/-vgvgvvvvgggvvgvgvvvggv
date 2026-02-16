"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Search,
  Bot,
  MoreHorizontal,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  GitBranch,
  CreditCard,
  Megaphone,
  BarChart3,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BotData {
  id: string
  name: string
  username: string
  status: "active" | "paused" | "inactive"
  sales: number
  revenue: string
  users: number
  conversion: string
  flows: number
  createdAt: string
}

const botsData: BotData[] = [
  { id: "1", name: "VendasBot", username: "@vendas_bot", status: "active", sales: 847, revenue: "R$ 42,350.00", users: 3240, conversion: "12.4%", flows: 5, createdAt: "Jan 15, 2026" },
  { id: "2", name: "ProBot", username: "@pro_sales_bot", status: "active", sales: 523, revenue: "R$ 28,190.00", users: 1890, conversion: "9.8%", flows: 3, createdAt: "Feb 02, 2026" },
  { id: "3", name: "FunnelBot", username: "@funnel_master", status: "active", sales: 312, revenue: "R$ 15,600.00", users: 980, conversion: "7.2%", flows: 8, createdAt: "Jan 28, 2026" },
  { id: "4", name: "LeadBot", username: "@lead_capture", status: "paused", sales: 189, revenue: "R$ 9,450.00", users: 2100, conversion: "5.1%", flows: 2, createdAt: "Dec 10, 2025" },
  { id: "5", name: "UpsellBot", username: "@upsell_pro", status: "active", sales: 156, revenue: "R$ 7,800.00", users: 560, conversion: "15.3%", flows: 4, createdAt: "Feb 10, 2026" },
  { id: "6", name: "TestBot", username: "@test_staging", status: "inactive", sales: 0, revenue: "R$ 0.00", users: 12, conversion: "0%", flows: 1, createdAt: "Feb 14, 2026" },
]

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  inactive: "bg-muted text-muted-foreground border-border",
}

function BotDetailTabs({ bot }: { bot: BotData }) {
  return (
    <Tabs defaultValue="overview" className="mt-4">
      <TabsList className="bg-secondary">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="flows">Flows</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 rounded-lg bg-secondary p-4">
            <span className="text-xs text-muted-foreground">Total Sales</span>
            <span className="text-lg font-bold text-foreground">{bot.sales}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-secondary p-4">
            <span className="text-xs text-muted-foreground">Revenue</span>
            <span className="text-lg font-bold text-foreground">{bot.revenue}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-secondary p-4">
            <span className="text-xs text-muted-foreground">Users</span>
            <span className="text-lg font-bold text-foreground">{bot.users.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-secondary p-4">
            <span className="text-xs text-muted-foreground">Conversion</span>
            <span className="text-lg font-bold text-foreground">{bot.conversion}</span>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="flows" className="mt-4">
        <div className="flex flex-col gap-2">
          {Array.from({ length: bot.flows }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
              <div className="flex items-center gap-3">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Flow {i + 1}</span>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge>
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="payments" className="mt-4">
        <div className="flex items-center gap-3 rounded-lg bg-secondary p-4">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">{bot.sales} transactions processed</p>
            <p className="text-xs text-muted-foreground">Total: {bot.revenue}</p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="campaigns" className="mt-4">
        <div className="flex items-center gap-3 rounded-lg bg-secondary p-4">
          <Megaphone className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Active campaigns for this bot</p>
            <p className="text-xs text-muted-foreground">Reaching {bot.users.toLocaleString()} users</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

export default function BotsPage() {
  const [search, setSearch] = useState("")
  const [selectedBot, setSelectedBot] = useState<BotData | null>(null)

  const filteredBots = botsData.filter(
    (bot) =>
      bot.name.toLowerCase().includes(search.toLowerCase()) ||
      bot.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardShell>
      <DashboardHeader title="Bots Management" description="Create and manage your Telegram bots" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          {/* Actions bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search bots..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-72 bg-secondary pl-9 border-border"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Bot
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create New Bot</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Bot Name</Label>
                    <Input placeholder="My Sales Bot" className="bg-secondary border-border" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Telegram Bot Token</Label>
                    <Input placeholder="123456:ABC-DEF..." className="bg-secondary border-border" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Description</Label>
                    <Input placeholder="Describe your bot purpose" className="bg-secondary border-border" />
                  </div>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Create Bot
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Bots</p>
                  <p className="text-lg font-bold text-foreground">{botsData.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Activity className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-lg font-bold text-foreground">{botsData.filter((b) => b.status === "active").length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-bold text-foreground">R$ 103,390</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Conversion</p>
                  <p className="text-lg font-bold text-foreground">9.96%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bot list */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Left: Bot cards */}
            <div className="flex flex-col gap-3">
              {filteredBots.map((bot) => (
                <Card
                  key={bot.id}
                  className={`cursor-pointer bg-card border-border transition-colors hover:bg-secondary/50 ${
                    selectedBot?.id === bot.id ? "ring-1 ring-accent" : ""
                  }`}
                  onClick={() => setSelectedBot(bot)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <Bot className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{bot.name}</h3>
                            <Badge variant="outline" className={statusStyles[bot.status]}>
                              {bot.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{bot.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={bot.status === "active"} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem className="text-foreground">Edit Bot</DropdownMenuItem>
                            <DropdownMenuItem className="text-foreground">View Analytics</DropdownMenuItem>
                            <DropdownMenuItem className="text-foreground">Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Sales</span>
                        <span className="text-sm font-medium text-foreground">{bot.sales}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Revenue</span>
                        <span className="text-sm font-medium text-foreground">{bot.revenue}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Users</span>
                        <span className="text-sm font-medium text-foreground">{bot.users.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Conv.</span>
                        <span className="text-sm font-medium text-foreground">{bot.conversion}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right: Bot detail */}
            <div>
              {selectedBot ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                        <Bot className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">{selectedBot.name}</h2>
                        <p className="text-sm text-muted-foreground">{selectedBot.username} - Created {selectedBot.createdAt}</p>
                      </div>
                    </div>
                    <BotDetailTabs bot={selectedBot} />
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="flex h-64 items-center justify-center p-5">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Select a bot to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </DashboardShell>
  )
}
