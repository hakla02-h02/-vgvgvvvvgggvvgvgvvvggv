"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  RefreshCw,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Bell,
  UserMinus,
  ArrowUpRight,
  ShoppingCart,
} from "lucide-react"

const subStats = [
  { label: "Active Subscribers", value: "1,247", change: "+84 this month", icon: Users },
  { label: "Monthly Recurring", value: "R$ 24,940", change: "+12.3%", icon: DollarSign },
  { label: "Churn Rate", value: "3.2%", change: "-0.8% vs last month", icon: UserMinus },
  { label: "Renewals Today", value: "42", change: "18 pending", icon: RefreshCw },
]

const plans = [
  { id: "p1", name: "Basic", price: "R$ 19,90/mo", subscribers: 580, revenue: "R$ 11,542", retention: 92 },
  { id: "p2", name: "Pro", price: "R$ 49,90/mo", subscribers: 420, revenue: "R$ 20,958", retention: 88 },
  { id: "p3", name: "VIP", price: "R$ 97,00/mo", subscribers: 247, revenue: "R$ 23,959", retention: 95 },
]

const subscribers = [
  { id: "s1", name: "Carlos M.", plan: "VIP", status: "active", nextRenewal: "Feb 22, 2026", since: "Dec 2025", spent: "R$ 291,00" },
  { id: "s2", name: "Ana P.", plan: "Pro", status: "active", nextRenewal: "Feb 25, 2026", since: "Jan 2026", spent: "R$ 99,80" },
  { id: "s3", name: "Lucas S.", plan: "Basic", status: "expiring", nextRenewal: "Feb 17, 2026", since: "Nov 2025", spent: "R$ 59,70" },
  { id: "s4", name: "Maria R.", plan: "VIP", status: "active", nextRenewal: "Mar 01, 2026", since: "Jan 2026", spent: "R$ 97,00" },
  { id: "s5", name: "Pedro L.", plan: "Pro", status: "expired", nextRenewal: "-", since: "Oct 2025", spent: "R$ 199,60" },
  { id: "s6", name: "Julia F.", plan: "Basic", status: "active", nextRenewal: "Feb 28, 2026", since: "Feb 2026", spent: "R$ 19,90" },
  { id: "s7", name: "Rafael G.", plan: "VIP", status: "active", nextRenewal: "Mar 05, 2026", since: "Dec 2025", spent: "R$ 291,00" },
  { id: "s8", name: "Camila T.", plan: "Basic", status: "expiring", nextRenewal: "Feb 18, 2026", since: "Jan 2026", spent: "R$ 39,80" },
]

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  expiring: "bg-warning/10 text-warning border-warning/20",
  expired: "bg-destructive/10 text-destructive border-destructive/20",
}

const reminderSettings = [
  { label: "7 days before expiration", enabled: true },
  { label: "3 days before expiration", enabled: true },
  { label: "1 day before expiration", enabled: true },
  { label: "On expiration day", enabled: true },
  { label: "Auto-remove after expiration", enabled: false },
  { label: "Discount renewal offer", enabled: true },
]

export default function SubscriptionsPage() {
  return (
    <DashboardShell>
      <DashboardHeader title="Subscriptions" description="Recurring billing and subscriber management" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {subStats.map((stat) => (
              <Card key={stat.label} className="bg-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <span className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</span>
                      <span className="flex items-center gap-1 text-xs text-success">
                        <ArrowUpRight className="h-3 w-3" />
                        {stat.change}
                      </span>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <stat.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="plans">
            <TabsList className="bg-secondary">
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
              <TabsTrigger value="upsell">Upsell / Downsell</TabsTrigger>
            </TabsList>

            {/* Plans */}
            <TabsContent value="plans" className="mt-6">
              <div className="grid gap-4 md:grid-cols-3">
                {plans.map((plan) => (
                  <Card key={plan.id} className="bg-card border-border">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                        <span className="text-sm font-medium text-accent">{plan.price}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Subscribers</p>
                          <p className="text-lg font-bold text-foreground">{plan.subscribers}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="text-lg font-bold text-foreground">{plan.revenue}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Retention</span>
                          <span>{plan.retention}%</span>
                        </div>
                        <Progress value={plan.retention} className="mt-1.5 h-1.5 bg-secondary" />
                      </div>
                      <Button variant="outline" size="sm" className="mt-4 w-full border-border text-foreground">
                        Manage Plan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Subscribers */}
            <TabsContent value="subscribers" className="mt-6">
              <Card className="bg-card border-border">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Subscriber</TableHead>
                        <TableHead className="text-muted-foreground">Plan</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Next Renewal</TableHead>
                        <TableHead className="text-muted-foreground">Member Since</TableHead>
                        <TableHead className="text-muted-foreground">Total Spent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.map((sub) => (
                        <TableRow key={sub.id} className="border-border">
                          <TableCell className="font-medium text-foreground">{sub.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-border text-foreground">{sub.plan}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusStyles[sub.status]}>{sub.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{sub.nextRenewal}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{sub.since}</TableCell>
                          <TableCell className="font-medium text-foreground">{sub.spent}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reminders */}
            <TabsContent value="reminders" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium text-foreground">Renewal Reminders</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {reminderSettings.map((setting, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{setting.label}</span>
                        </div>
                        <Switch defaultChecked={setting.enabled} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Upsell / Downsell */}
            <TabsContent value="upsell" className="mt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-foreground">Upsell</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Post-purchase offers to increase ticket value immediately</p>
                    <div className="mt-4 rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Active Offers</p>
                      <p className="text-lg font-bold text-foreground">8</p>
                      <p className="text-xs text-success">+R$ 4,230 additional revenue</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 w-full border-border text-foreground">
                      Manage Upsells
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-foreground">Downsell</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Alternative offers after rejection to recover lost sales</p>
                    <div className="mt-4 rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Recovery Rate</p>
                      <p className="text-lg font-bold text-foreground">23.4%</p>
                      <p className="text-xs text-success">142 sales recovered</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 w-full border-border text-foreground">
                      Manage Downsells
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <ShoppingCart className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-foreground">Order Bump</h3>
                    <p className="mt-1 text-sm text-muted-foreground">One-click complementary offers at checkout</p>
                    <div className="mt-4 rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Acceptance Rate</p>
                      <p className="text-lg font-bold text-foreground">31.7%</p>
                      <p className="text-xs text-success">+R$ 2,890 avg order bump</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 w-full border-border text-foreground">
                      Manage Bumps
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </DashboardShell>
  )
}
