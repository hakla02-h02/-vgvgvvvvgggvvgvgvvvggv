"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
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
import { NoBotSelected } from "@/components/no-bot-selected"
import { useBots } from "@/lib/bot-context"
import {
  Users,
  UserCheck,
  Crown,
  Search,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Download,
  Upload,
  Globe,
} from "lucide-react"

const usersData = [
  { id: "u1", name: "Carlos M.", telegram: "@carlosm", country: "Brazil", state: "SP", city: "Sao Paulo", groups: 2, purchases: 3, lastActive: "2 min ago", status: "active" },
  { id: "u2", name: "Ana P.", telegram: "@anap", country: "Brazil", state: "RJ", city: "Rio de Janeiro", groups: 1, purchases: 5, lastActive: "5 min ago", status: "active" },
  { id: "u3", name: "Lucas S.", telegram: "@lucass", country: "Brazil", state: "MG", city: "Belo Horizonte", groups: 1, purchases: 1, lastActive: "1h ago", status: "active" },
  { id: "u4", name: "Maria R.", telegram: "@mariar", country: "Brazil", state: "BA", city: "Salvador", groups: 3, purchases: 4, lastActive: "3h ago", status: "active" },
  { id: "u5", name: "Pedro L.", telegram: "@pedrol", country: "Brazil", state: "RS", city: "Porto Alegre", groups: 0, purchases: 0, lastActive: "2d ago", status: "inactive" },
  { id: "u6", name: "Julia F.", telegram: "@juliaf", country: "Portugal", state: "Lisboa", city: "Lisbon", groups: 1, purchases: 2, lastActive: "30 min ago", status: "active" },
  { id: "u7", name: "Rafael G.", telegram: "@rafaelg", country: "Brazil", state: "PR", city: "Curitiba", groups: 2, purchases: 6, lastActive: "15 min ago", status: "active" },
  { id: "u8", name: "Camila T.", telegram: "@camilat", country: "Brazil", state: "CE", city: "Fortaleza", groups: 1, purchases: 1, lastActive: "1d ago", status: "active" },
]

const vipGroups = [
  { id: "g1", name: "VIP Premium Members", members: 420, bot: "VendasBot", autoApproval: true, welcome: true },
  { id: "g2", name: "Pro Course Access", members: 185, bot: "ProBot", autoApproval: true, welcome: true },
  { id: "g3", name: "Inner Circle", members: 72, bot: "FunnelBot", autoApproval: true, welcome: false },
  { id: "g4", name: "Free Community", members: 2100, bot: "LeadBot", autoApproval: false, welcome: true },
]

const geoStats = [
  { region: "Sao Paulo", users: 1240, percentage: 38 },
  { region: "Rio de Janeiro", users: 580, percentage: 18 },
  { region: "Minas Gerais", users: 420, percentage: 13 },
  { region: "Bahia", users: 310, percentage: 10 },
  { region: "Others", users: 690, percentage: 21 },
]

export default function UsersPage() {
  const { selectedBot } = useBots()
  const [search, setSearch] = useState("")

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Users & Groups" description="User management, VIP groups, and geolocation" />
        <NoBotSelected />
      </>
    )
  }
  const filteredUsers = usersData.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.telegram.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <DashboardHeader title="Users & Groups" description="User management, VIP groups, and geolocation" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                  <p className="text-lg font-bold text-foreground">8,770</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <UserCheck className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Today</p>
                  <p className="text-lg font-bold text-foreground">1,240</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Crown className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">VIP Members</p>
                  <p className="text-lg font-bold text-foreground">677</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Countries</p>
                  <p className="text-lg font-bold text-foreground">12</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users">
            <div className="flex items-center justify-between">
              <TabsList className="bg-secondary">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="groups">VIP Groups</TabsTrigger>
                <TabsTrigger value="geo">Geolocation</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-border text-foreground">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button variant="outline" size="sm" className="border-border text-foreground">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Users list */}
            <TabsContent value="users" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-72 bg-secondary pl-9 border-border"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">User</TableHead>
                        <TableHead className="text-muted-foreground">Location</TableHead>
                        <TableHead className="text-muted-foreground">Groups</TableHead>
                        <TableHead className="text-muted-foreground">Purchases</TableHead>
                        <TableHead className="text-muted-foreground">Last Active</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="border-border">
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.telegram}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{user.city}, {user.state}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">{user.groups}</TableCell>
                          <TableCell className="text-sm text-foreground">{user.purchases}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.lastActive}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                user.status === "active"
                                  ? "bg-success/10 text-success border-success/20"
                                  : "bg-muted text-muted-foreground border-border"
                              }
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

            {/* VIP Groups */}
            <TabsContent value="groups" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {vipGroups.map((group) => (
                  <Card key={group.id} className="bg-card border-border">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                            <Crown className="h-5 w-5 text-warning" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
                            <p className="text-xs text-muted-foreground">{group.bot} - {group.members} members</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-foreground">Auto-approval after payment</span>
                          </div>
                          <Badge variant="outline" className={group.autoApproval ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}>
                            {group.autoApproval ? "On" : "Off"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-foreground">Personalized welcome</span>
                          </div>
                          <Badge variant="outline" className={group.welcome ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}>
                            {group.welcome ? "On" : "Off"}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4 w-full border-border text-foreground">
                        Manage Group
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Geolocation */}
            <TabsContent value="geo" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-foreground">User Distribution by Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {geoStats.map((region) => (
                      <div key={region.region} className="flex items-center gap-4">
                        <div className="w-36">
                          <span className="text-sm text-foreground">{region.region}</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-3 rounded-full bg-secondary">
                            <div
                              className="h-3 rounded-full bg-accent transition-all"
                              style={{ width: `${region.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex w-24 items-center justify-end gap-2">
                          <span className="text-sm font-medium text-foreground">{region.users.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">{region.percentage}%</span>
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
