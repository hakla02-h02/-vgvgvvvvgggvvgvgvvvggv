"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Megaphone,
  Send,
  Clock,
  Users,
  MessageSquare,
  Image,
  Video,
  Music,
  MousePointerClick,
  TrendingUp,
  Eye,
  Target,
} from "lucide-react"

const campaigns = [
  {
    id: "c1",
    name: "Weekend Promo",
    status: "active",
    type: "broadcast",
    bot: "VendasBot",
    audience: 3240,
    sent: 3240,
    opened: 2810,
    clicked: 1420,
    converted: 187,
    scheduledAt: "Feb 14, 2026 10:00",
    content: "Special weekend offer - 40% off!",
  },
  {
    id: "c2",
    name: "Launch Sequence",
    status: "active",
    type: "sequence",
    bot: "ProBot",
    audience: 1890,
    sent: 1890,
    opened: 1560,
    clicked: 890,
    converted: 92,
    scheduledAt: "Feb 12, 2026 09:00",
    content: "New product launch campaign",
  },
  {
    id: "c3",
    name: "Remarketing Blast",
    status: "scheduled",
    type: "broadcast",
    bot: "FunnelBot",
    audience: 980,
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    scheduledAt: "Feb 17, 2026 14:00",
    content: "Come back and save 25%!",
  },
  {
    id: "c4",
    name: "Upsell Follow-up",
    status: "completed",
    type: "sequence",
    bot: "UpsellBot",
    audience: 560,
    sent: 560,
    opened: 430,
    clicked: 210,
    converted: 45,
    scheduledAt: "Feb 10, 2026 11:00",
    content: "Exclusive upgrade offer",
  },
  {
    id: "c5",
    name: "Win-back Campaign",
    status: "draft",
    type: "broadcast",
    bot: "LeadBot",
    audience: 2100,
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    scheduledAt: "-",
    content: "We miss you! Here is a special deal",
  },
]

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-muted text-muted-foreground border-border",
  draft: "bg-secondary text-muted-foreground border-border",
}

const contentTypes = [
  { label: "Text", icon: MessageSquare },
  { label: "Image", icon: Image },
  { label: "Video", icon: Video },
  { label: "Audio", icon: Music },
  { label: "Button", icon: MousePointerClick },
]

export default function CampaignsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0])

  return (
    <DashboardShell>
      <DashboardHeader title="Campaigns & Messaging" description="Mass messaging, scheduled broadcasts, and segmented campaigns" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Campaigns</p>
                  <p className="text-lg font-bold text-foreground">{campaigns.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Send className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Messages Sent</p>
                  <p className="text-lg font-bold text-foreground">5,690</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Open Rate</p>
                  <p className="text-lg font-bold text-foreground">84.6%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conversions</p>
                  <p className="text-lg font-bold text-foreground">324</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex items-center justify-between">
                <TabsList className="bg-secondary">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                </TabsList>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                      <Plus className="mr-2 h-4 w-4" />
                      New Campaign
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Create Campaign</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 pt-4">
                      <div className="flex flex-col gap-2">
                        <Label className="text-foreground">Campaign Name</Label>
                        <Input placeholder="My Campaign" className="bg-secondary border-border" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-foreground">Target Bot</Label>
                        <Select>
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue placeholder="Select bot" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="vendas">VendasBot</SelectItem>
                            <SelectItem value="pro">ProBot</SelectItem>
                            <SelectItem value="funnel">FunnelBot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-foreground">Content Type</Label>
                        <div className="flex gap-2">
                          {contentTypes.map((ct) => (
                            <Button
                              key={ct.label}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1.5 border-border text-foreground"
                            >
                              <ct.icon className="h-3.5 w-3.5" />
                              {ct.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-foreground">Message</Label>
                        <Textarea placeholder="Type your message..." className="bg-secondary border-border" rows={4} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch />
                          <Label className="text-sm text-foreground">Schedule for later</Label>
                        </div>
                      </div>
                      <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Send className="mr-2 h-4 w-4" />
                        Create Campaign
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <TabsContent value="all" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-5">
                  {/* Campaign list */}
                  <div className="flex flex-col gap-3 lg:col-span-3">
                    {campaigns.map((campaign) => (
                      <Card
                        key={campaign.id}
                        className={`cursor-pointer bg-card border-border transition-colors hover:bg-secondary/50 ${
                          selectedCampaign.id === campaign.id ? "ring-1 ring-accent" : ""
                        }`}
                        onClick={() => setSelectedCampaign(campaign)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                                <Megaphone className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-semibold text-foreground">{campaign.name}</h3>
                                  <Badge variant="outline" className={statusStyles[campaign.status]}>
                                    {campaign.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{campaign.bot} - {campaign.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-right">
                              <div>
                                <p className="text-sm font-medium text-foreground">{campaign.audience.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">audience</p>
                              </div>
                            </div>
                          </div>
                          {campaign.sent > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Delivery Progress</span>
                                <span>{Math.round((campaign.sent / campaign.audience) * 100)}%</span>
                              </div>
                              <Progress value={(campaign.sent / campaign.audience) * 100} className="mt-1.5 h-1.5 bg-secondary" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Campaign detail */}
                  <div className="lg:col-span-2">
                    <Card className="bg-card border-border">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                            <Megaphone className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-foreground">{selectedCampaign.name}</h2>
                            <p className="text-xs text-muted-foreground">{selectedCampaign.scheduledAt}</p>
                          </div>
                        </div>
                        <div className="mt-4 rounded-lg bg-secondary p-3">
                          <p className="text-sm text-foreground">{selectedCampaign.content}</p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-secondary p-3">
                            <p className="text-xs text-muted-foreground">Sent</p>
                            <p className="text-lg font-bold text-foreground">{selectedCampaign.sent.toLocaleString()}</p>
                          </div>
                          <div className="rounded-lg bg-secondary p-3">
                            <p className="text-xs text-muted-foreground">Opened</p>
                            <p className="text-lg font-bold text-foreground">{selectedCampaign.opened.toLocaleString()}</p>
                          </div>
                          <div className="rounded-lg bg-secondary p-3">
                            <p className="text-xs text-muted-foreground">Clicked</p>
                            <p className="text-lg font-bold text-foreground">{selectedCampaign.clicked.toLocaleString()}</p>
                          </div>
                          <div className="rounded-lg bg-secondary p-3">
                            <p className="text-xs text-muted-foreground">Converted</p>
                            <p className="text-lg font-bold text-foreground">{selectedCampaign.converted.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="active" className="mt-6">
                <div className="flex flex-col gap-3">
                  {campaigns.filter((c) => c.status === "active").map((campaign) => (
                    <Card key={campaign.id} className="bg-card border-border">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-4 w-4 text-success" />
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{campaign.name}</h3>
                            <p className="text-xs text-muted-foreground">{campaign.converted} conversions</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={statusStyles.active}>active</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="scheduled" className="mt-6">
                <div className="flex flex-col gap-3">
                  {campaigns.filter((c) => c.status === "scheduled").map((campaign) => (
                    <Card key={campaign.id} className="bg-card border-border">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-blue-400" />
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{campaign.name}</h3>
                            <p className="text-xs text-muted-foreground">{campaign.scheduledAt}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={statusStyles.scheduled}>scheduled</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="draft" className="mt-6">
                <div className="flex flex-col gap-3">
                  {campaigns.filter((c) => c.status === "draft").map((campaign) => (
                    <Card key={campaign.id} className="bg-card border-border">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{campaign.name}</h3>
                            <p className="text-xs text-muted-foreground">{campaign.audience.toLocaleString()} potential audience</p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                          <Send className="mr-1.5 h-3.5 w-3.5" /> Send Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ScrollArea>
    </DashboardShell>
  )
}
