"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import {
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  CreditCard,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const paymentStats = [
  { label: "Total Revenue", value: "R$ 103,390.00", change: "+18.2%", positive: true, icon: DollarSign },
  { label: "PIX Generated", value: "2,847", change: "+124 today", positive: true, icon: ShoppingCart },
  { label: "Paid", value: "2,027", change: "71.2% rate", positive: true, icon: CheckCircle },
  { label: "Expired", value: "584", change: "-12% vs last week", positive: true, icon: XCircle },
]

const transactions = [
  { id: "PIX-2847", user: "Carlos M.", email: "carlos@email.com", amount: "R$ 197,00", status: "paid", bot: "VendasBot", campaign: "Weekend Promo", generated: "14:23", paid: "14:25", duration: "2 min" },
  { id: "PIX-2846", user: "Ana P.", email: "ana@email.com", amount: "R$ 497,00", status: "paid", bot: "ProBot", campaign: "Launch", generated: "14:18", paid: "14:20", duration: "2 min" },
  { id: "PIX-2845", user: "Lucas S.", email: "lucas@email.com", amount: "R$ 97,00", status: "pending", bot: "VendasBot", campaign: "Organic", generated: "14:10", paid: "-", duration: "-" },
  { id: "PIX-2844", user: "Maria R.", email: "maria@email.com", amount: "R$ 297,00", status: "paid", bot: "FunnelBot", campaign: "Retarget", generated: "13:55", paid: "14:01", duration: "6 min" },
  { id: "PIX-2843", user: "Pedro L.", email: "pedro@email.com", amount: "R$ 47,00", status: "expired", bot: "VendasBot", campaign: "Weekend Promo", generated: "13:40", paid: "-", duration: "-" },
  { id: "PIX-2842", user: "Julia F.", email: "julia@email.com", amount: "R$ 197,00", status: "paid", bot: "ProBot", campaign: "Launch", generated: "13:32", paid: "13:34", duration: "2 min" },
  { id: "PIX-2841", user: "Rafael G.", email: "rafael@email.com", amount: "R$ 497,00", status: "paid", bot: "VendasBot", campaign: "Organic", generated: "13:20", paid: "13:28", duration: "8 min" },
  { id: "PIX-2840", user: "Camila T.", email: "camila@email.com", amount: "R$ 97,00", status: "canceled", bot: "LeadBot", campaign: "Remarketing", generated: "13:10", paid: "-", duration: "-" },
  { id: "PIX-2839", user: "Bruno A.", email: "bruno@email.com", amount: "R$ 197,00", status: "paid", bot: "FunnelBot", campaign: "Retarget", generated: "12:55", paid: "12:58", duration: "3 min" },
  { id: "PIX-2838", user: "Fernanda S.", email: "fernanda@email.com", amount: "R$ 297,00", status: "paid", bot: "ProBot", campaign: "Launch", generated: "12:40", paid: "12:42", duration: "2 min" },
]

const dailyData = [
  { day: "Mon", paid: 32, expired: 8 },
  { day: "Tue", paid: 45, expired: 12 },
  { day: "Wed", paid: 38, expired: 6 },
  { day: "Thu", paid: 52, expired: 10 },
  { day: "Fri", paid: 61, expired: 14 },
  { day: "Sat", paid: 48, expired: 9 },
  { day: "Sun", paid: 37, expired: 7 },
]

const statusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  expired: "bg-muted text-muted-foreground border-border",
  canceled: "bg-destructive/10 text-destructive border-destructive/20",
}

const statusIcons: Record<string, React.ElementType> = {
  paid: CheckCircle,
  pending: Clock,
  expired: XCircle,
  canceled: AlertTriangle,
}

export default function PaymentsPage() {
  const { selectedBot } = useBots()
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Payments" description="Payment automation and transaction management" />
        <NoBotSelected />
      </>
    )
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filter === "all" || tx.status === filter
    const matchesSearch =
      tx.user.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <>
      <DashboardHeader title="Payments" description="Payment automation and transaction management" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {paymentStats.map((stat) => (
              <Card key={stat.label} className="bg-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <span className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</span>
                      <span className="flex items-center gap-1 text-xs text-success">
                        {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
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

          <Tabs defaultValue="transactions">
            <TabsList className="bg-secondary">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="chart">Daily Report</TabsTrigger>
              <TabsTrigger value="gateways">Gateways</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-sm font-medium text-foreground">All Transactions</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-48 bg-secondary pl-9 border-border"
                        />
                      </div>
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-32 bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="border-border text-foreground">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">ID</TableHead>
                        <TableHead className="text-muted-foreground">User</TableHead>
                        <TableHead className="text-muted-foreground">Amount</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Bot</TableHead>
                        <TableHead className="text-muted-foreground">Campaign</TableHead>
                        <TableHead className="text-muted-foreground">Generated</TableHead>
                        <TableHead className="text-muted-foreground">Paid At</TableHead>
                        <TableHead className="text-muted-foreground">Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((tx) => {
                        const StatusIcon = statusIcons[tx.status]
                        return (
                          <TableRow key={tx.id} className="border-border">
                            <TableCell className="font-mono text-xs text-foreground">{tx.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm text-foreground">{tx.user}</p>
                                <p className="text-xs text-muted-foreground">{tx.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{tx.amount}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`flex w-fit items-center gap-1 ${statusStyles[tx.status]}`}>
                                <StatusIcon className="h-3 w-3" />
                                {tx.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{tx.bot}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{tx.campaign}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{tx.generated}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{tx.paid}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{tx.duration}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chart" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Daily PIX Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 14%)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(0, 0%, 7%)",
                            border: "1px solid hsl(0, 0%, 14%)",
                            borderRadius: "8px",
                            color: "hsl(0, 0%, 95%)",
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="paid" fill="hsl(160, 60%, 45%)" radius={[4, 4, 0, 0]} name="Paid" />
                        <Bar dataKey="expired" fill="hsl(0, 0%, 30%)" radius={[4, 4, 0, 0]} name="Expired" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gateways" className="mt-6">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { name: "MercadoPago", connected: true, transactions: 1240, revenue: "R$ 62,000" },
                  { name: "PagBank", connected: true, transactions: 580, revenue: "R$ 29,000" },
                  { name: "Stripe", connected: false, transactions: 0, revenue: "R$ 0" },
                ].map((gw) => (
                  <Card key={gw.name} className="bg-card border-border">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{gw.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {gw.connected ? "Connected" : "Not connected"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            gw.connected
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-muted text-muted-foreground border-border"
                          }
                        >
                          {gw.connected ? "Active" : "Setup"}
                        </Badge>
                      </div>
                      {gw.connected && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Transactions</p>
                            <p className="text-sm font-medium text-foreground">{gw.transactions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                            <p className="text-sm font-medium text-foreground">{gw.revenue}</p>
                          </div>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full border-border text-foreground"
                      >
                        {gw.connected ? "Manage" : "Connect"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </>
  )
}
