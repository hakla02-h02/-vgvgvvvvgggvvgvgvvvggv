"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
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
  Target,
  TrendingUp,
  CheckCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const funnelData = [
  { step: "Page View", count: 12480, rate: "100%" },
  { step: "View Content", count: 8740, rate: "70.0%" },
  { step: "Lead", count: 4200, rate: "33.7%" },
  { step: "Initiate Checkout", count: 2847, rate: "22.8%" },
  { step: "Purchase", count: 2027, rate: "16.2%" },
]

const conversionTrend = [
  { day: "Mon", facebook: 42, tiktok: 28, google: 18 },
  { day: "Tue", facebook: 55, tiktok: 35, google: 22 },
  { day: "Wed", facebook: 48, tiktok: 42, google: 19 },
  { day: "Thu", facebook: 62, tiktok: 38, google: 28 },
  { day: "Fri", facebook: 71, tiktok: 45, google: 32 },
  { day: "Sat", facebook: 58, tiktok: 52, google: 24 },
  { day: "Sun", facebook: 45, tiktok: 32, google: 20 },
]

const utmData = [
  { source: "facebook", medium: "cpc", campaign: "weekend_promo", sales: 87, revenue: "R$ 17,139", roi: "342%" },
  { source: "tiktok", medium: "cpc", campaign: "launch_v2", sales: 62, revenue: "R$ 12,214", roi: "287%" },
  { source: "google", medium: "cpc", campaign: "brand_search", sales: 45, revenue: "R$ 8,865", roi: "412%" },
  { source: "organic", medium: "direct", campaign: "-", sales: 38, revenue: "R$ 7,486", roi: "-" },
  { source: "instagram", medium: "social", campaign: "stories_promo", sales: 28, revenue: "R$ 5,516", roi: "198%" },
  { source: "youtube", medium: "video", campaign: "tutorial_funnel", sales: 22, revenue: "R$ 4,334", roi: "256%" },
]

const pixelIntegrations = [
  { name: "Facebook Pixel", id: "1234567890", status: "active", events: 8420 },
  { name: "TikTok Pixel", id: "TT-987654", status: "active", events: 5230 },
  { name: "Google Ads Tag", id: "AW-112233", status: "active", events: 3140 },
  { name: "Kwai Ads Pixel", id: "KW-445566", status: "inactive", events: 0 },
]

const sourceColors = [
  "hsl(160, 60%, 45%)",
  "hsl(200, 65%, 50%)",
  "hsl(30, 80%, 55%)",
  "hsl(0, 0%, 40%)",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
]

const sourceData = [
  { name: "Facebook", value: 87 },
  { name: "TikTok", value: 62 },
  { name: "Google", value: 45 },
  { name: "Organic", value: 38 },
  { name: "Instagram", value: 28 },
  { name: "YouTube", value: 22 },
]

export default function AnalyticsPage() {
  const { selectedBot } = useBots()

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Analytics & Tracking" description="Pixel integration, conversion tracking, and UTM analytics" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Analytics & Tracking" description="Pixel integration, conversion tracking, and UTM analytics" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {funnelData.map((step) => (
              <Card key={step.step} className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{step.step}</p>
                  <p className="text-xl font-bold text-foreground">{step.count.toLocaleString()}</p>
                  <p className="text-xs text-accent">{step.rate}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="pixels">
            <TabsList className="bg-secondary">
              <TabsTrigger value="pixels">Pixel Integration</TabsTrigger>
              <TabsTrigger value="conversions">Conversions</TabsTrigger>
              <TabsTrigger value="utm">UTM Tracking</TabsTrigger>
              <TabsTrigger value="remarketing">Remarketing</TabsTrigger>
            </TabsList>

            {/* Pixels */}
            <TabsContent value="pixels" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {pixelIntegrations.map((pixel) => (
                  <Card key={pixel.name} className="bg-card border-border">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                            <Target className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{pixel.name}</h3>
                            <p className="text-xs text-muted-foreground">ID: {pixel.id}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            pixel.status === "active"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-muted text-muted-foreground border-border"
                          }
                        >
                          {pixel.status}
                        </Badge>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Events Tracked</p>
                          <p className="text-lg font-bold text-foreground">{pixel.events.toLocaleString()}</p>
                        </div>
                        <Switch defaultChecked={pixel.status === "active"} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Events config */}
              <Card className="mt-6 bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-foreground">Trackable Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {["PageView", "ViewContent", "Lead", "InitiateCheckout", "Purchase", "AddToCart", "CompleteRegistration", "CustomEvent"].map((event) => (
                      <div key={event} className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-success" />
                          <span className="text-sm text-foreground">{event}</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conversions */}
            <TabsContent value="conversions" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="bg-card border-border lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">Conversion Trend by Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={conversionTrend}>
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
                          <Line type="monotone" dataKey="facebook" stroke="hsl(160, 60%, 45%)" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="tiktok" stroke="hsl(200, 65%, 50%)" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="google" stroke="hsl(30, 80%, 55%)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">Sales by Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={sourceData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                            {sourceData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={sourceColors[index]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(0, 0%, 7%)",
                              border: "1px solid hsl(0, 0%, 14%)",
                              borderRadius: "8px",
                              color: "hsl(0, 0%, 95%)",
                              fontSize: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {sourceData.map((s, i) => (
                        <div key={s.name} className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sourceColors[i] }} />
                          <span className="text-xs text-muted-foreground">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* UTM Tracking */}
            <TabsContent value="utm" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-foreground">UTM Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Source</TableHead>
                        <TableHead className="text-muted-foreground">Medium</TableHead>
                        <TableHead className="text-muted-foreground">Campaign</TableHead>
                        <TableHead className="text-muted-foreground">Sales</TableHead>
                        <TableHead className="text-muted-foreground">Revenue</TableHead>
                        <TableHead className="text-muted-foreground">ROI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {utmData.map((row, i) => (
                        <TableRow key={i} className="border-border">
                          <TableCell className="font-medium text-foreground">{row.source}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{row.medium}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{row.campaign}</TableCell>
                          <TableCell className="font-medium text-foreground">{row.sales}</TableCell>
                          <TableCell className="font-medium text-foreground">{row.revenue}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              {row.roi}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Remarketing */}
            <TabsContent value="remarketing" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-foreground">Lead Recovery</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Automatically recover non-buying leads with targeted messages</p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-secondary p-3">
                        <p className="text-xs text-muted-foreground">Leads Recovered</p>
                        <p className="text-lg font-bold text-foreground">342</p>
                      </div>
                      <div className="rounded-lg bg-secondary p-3">
                        <p className="text-xs text-muted-foreground">Recovery Rate</p>
                        <p className="text-lg font-bold text-foreground">18.4%</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 w-full border-border text-foreground">
                      Configure Recovery
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Target className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-foreground">Behavioral Segmentation</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Segment users by behavior for targeted remarketing campaigns</p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-secondary p-3">
                        <p className="text-xs text-muted-foreground">Segments</p>
                        <p className="text-lg font-bold text-foreground">12</p>
                      </div>
                      <div className="rounded-lg bg-secondary p-3">
                        <p className="text-xs text-muted-foreground">Auto Campaigns</p>
                        <p className="text-lg font-bold text-foreground">8</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 w-full border-border text-foreground">
                      Manage Segments
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </>
  )
}
