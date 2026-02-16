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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Settings,
  Shield,
  Bell,
  Webhook,
  Download,
  Upload,
  Key,
  Globe,
  Palette,
  User,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Forward,
  Copy,
  Bot as BotIcon,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

const securitySettings = [
  {
    id: "forwarding",
    label: "Block Message Forwarding",
    description: "Prevent users from forwarding bot messages to other chats",
    enabled: true,
    icon: Forward,
  },
  {
    id: "download",
    label: "Block Media Downloads",
    description: "Restrict users from downloading media sent by the bot",
    enabled: true,
    icon: Download,
  },
  {
    id: "screenshot",
    label: "Screenshot Prevention",
    description: "Attempt to prevent screenshots in private channels (limited support)",
    enabled: false,
    icon: Camera,
  },
  {
    id: "spy",
    label: "Bot & Spy Tool Filtering",
    description: "Detect and block known bot scrapers and spy tools",
    enabled: true,
    icon: Eye,
  },
  {
    id: "clone",
    label: "Funnel Cloning Protection",
    description: "Protect your sales funnels from being cloned or replicated",
    enabled: true,
    icon: Copy,
  },
  {
    id: "ratelimit",
    label: "Rate Limiting",
    description: "Limit the number of requests per user to prevent abuse",
    enabled: true,
    icon: Shield,
  },
]

const notificationSettings = [
  { id: "sale", label: "New sale completed", description: "Get notified for every successful transaction", enabled: true },
  { id: "pix_expired", label: "PIX expired", description: "Alert when a generated PIX payment expires", enabled: true },
  { id: "pix_generated", label: "PIX generated", description: "Notify when a new PIX is generated", enabled: false },
  { id: "bot_error", label: "Bot errors", description: "Get notified when a bot encounters an error", enabled: true },
  { id: "campaign_complete", label: "Campaign completed", description: "Alert when a campaign finishes sending", enabled: true },
  { id: "subscription_expiring", label: "Subscription expiring", description: "Notify when a subscriber is about to expire", enabled: true },
  { id: "flagged_activity", label: "Flagged activity", description: "Alert for suspicious or irregular activity", enabled: true },
  { id: "new_user", label: "New user joined", description: "Notify when a new user interacts with your bot", enabled: false },
]

const webhooks = [
  { id: "w1", name: "Sales Webhook", url: "https://api.example.com/sales", events: ["purchase", "refund"], status: "active", lastTriggered: "2 min ago" },
  { id: "w2", name: "Lead Capture", url: "https://hooks.zapier.com/abc123", events: ["lead", "initiate_checkout"], status: "active", lastTriggered: "15 min ago" },
  { id: "w3", name: "CRM Integration", url: "https://crm.example.com/webhook", events: ["purchase", "lead", "subscription"], status: "inactive", lastTriggered: "2 days ago" },
]

export default function SettingsPage() {
  const [apiKeyVisible, setApiKeyVisible] = useState(false)

  return (
    <DashboardShell>
      <DashboardHeader title="Settings" description="Platform configuration, security, and integrations" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          <Tabs defaultValue="general">
            <TabsList className="bg-secondary">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="import-export">Import / Export</TabsTrigger>
            </TabsList>

            {/* General */}
            <TabsContent value="general" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Profile */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium text-foreground">Profile</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Display Name</Label>
                      <Input defaultValue="TeleFlow Admin" className="bg-secondary border-border" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Email</Label>
                      <Input defaultValue="admin@teleflow.io" className="bg-secondary border-border" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Telegram Username</Label>
                      <Input defaultValue="@teleflow_admin" className="bg-secondary border-border" />
                    </div>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-fit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </Button>
                  </CardContent>
                </Card>

                {/* API & Keys */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium text-foreground">API Keys</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Platform API Key</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type={apiKeyVisible ? "text" : "password"}
                          defaultValue="tf_live_sk_1234567890abcdef"
                          className="bg-secondary border-border font-mono text-sm"
                          readOnly
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 border-border text-muted-foreground hover:text-foreground"
                          onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        >
                          {apiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Webhook Secret</Label>
                      <Input
                        type="password"
                        defaultValue="whsec_abcdef1234567890"
                        className="bg-secondary border-border font-mono text-sm"
                        readOnly
                      />
                    </div>
                    <Button variant="outline" className="w-fit border-border text-foreground">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Regenerate Keys
                    </Button>
                  </CardContent>
                </Card>

                {/* Appearance */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium text-foreground">Appearance</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Theme</Label>
                      <Select defaultValue="dark">
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Language</Label>
                      <Select defaultValue="pt-br">
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="pt-br">Portugues (BR)</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Espanol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Timezone</Label>
                      <Select defaultValue="america-sp">
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="america-sp">America/Sao_Paulo (BRT)</SelectItem>
                          <SelectItem value="america-ny">America/New_York (EST)</SelectItem>
                          <SelectItem value="europe-lisbon">Europe/Lisbon (WET)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Default Bot Settings */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BotIcon className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium text-foreground">Default Bot Settings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Default Payment Gateway</Label>
                      <Select defaultValue="mercadopago">
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="mercadopago">MercadoPago</SelectItem>
                          <SelectItem value="pagbank">PagBank</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">PIX Expiration Time</Label>
                      <Select defaultValue="30">
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="1440">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-foreground">Auto-generate welcome message</span>
                        <span className="text-xs text-muted-foreground">Send a welcome when users start the bot</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-foreground">Auto-add to VIP group on payment</span>
                        <span className="text-xs text-muted-foreground">Automatically approve users after confirmed payment</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium text-foreground">Security Settings</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Configure security rules to protect your bots, content, and funnels
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {securitySettings.map((setting) => (
                      <div
                        key={setting.id}
                        className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-background/50">
                            <setting.icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-foreground">{setting.label}</span>
                            <span className="text-xs text-muted-foreground">{setting.description}</span>
                          </div>
                        </div>
                        <Switch defaultChecked={setting.enabled} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Two-Factor Auth */}
              <Card className="mt-6 bg-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <Lock className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Two-Factor Authentication</h3>
                        <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Enable 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium text-foreground">Notification Preferences</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      {notificationSettings.map((setting) => (
                        <div
                          key={setting.id}
                          className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-foreground">{setting.label}</span>
                            <span className="text-xs text-muted-foreground">{setting.description}</span>
                          </div>
                          <Switch defaultChecked={setting.enabled} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border h-fit">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium text-foreground">Delivery Channels</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-foreground">Telegram Notifications</span>
                        <span className="text-xs text-muted-foreground">Receive alerts directly in Telegram</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-foreground">Email Notifications</span>
                        <span className="text-xs text-muted-foreground">Receive alerts via email</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-foreground">Mobile Push Notifications</span>
                        <span className="text-xs text-muted-foreground">Browser and mobile push alerts</span>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      <Label className="text-foreground">Notification Telegram Chat ID</Label>
                      <Input defaultValue="-1001234567890" className="bg-secondary border-border font-mono text-sm" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Notification Email</Label>
                      <Input defaultValue="alerts@teleflow.io" className="bg-secondary border-border" />
                    </div>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-fit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Notification Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Webhooks */}
            <TabsContent value="webhooks" className="mt-6">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Custom Webhooks</h3>
                    <p className="text-xs text-muted-foreground">Integrate with external systems via webhook triggers</p>
                  </div>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Webhook className="mr-2 h-4 w-4" />
                    Add Webhook
                  </Button>
                </div>

                <div className="flex flex-col gap-4">
                  {webhooks.map((webhook) => (
                    <Card key={webhook.id} className="bg-card border-border">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                              <Webhook className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-foreground">{webhook.name}</h3>
                                <Badge
                                  variant="outline"
                                  className={
                                    webhook.status === "active"
                                      ? "bg-success/10 text-success border-success/20"
                                      : "bg-muted text-muted-foreground border-border"
                                  }
                                >
                                  {webhook.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground font-mono">{webhook.url}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="border-border text-foreground">
                              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                              Test
                            </Button>
                            <Switch defaultChecked={webhook.status === "active"} />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Events:</span>
                            <div className="flex gap-1.5">
                              {webhook.events.map((event) => (
                                <Badge key={event} variant="outline" className="border-border text-foreground text-xs">
                                  {event}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Last triggered: {webhook.lastTriggered}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Webhook Configuration */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-foreground">Available Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {[
                        { event: "purchase", description: "Triggered on successful payment" },
                        { event: "refund", description: "Triggered when a refund is processed" },
                        { event: "lead", description: "Triggered when a new lead is captured" },
                        { event: "initiate_checkout", description: "Triggered when checkout begins" },
                        { event: "subscription.created", description: "New subscription started" },
                        { event: "subscription.canceled", description: "Subscription was canceled" },
                        { event: "bot.error", description: "Bot encountered an error" },
                        { event: "user.joined", description: "New user interacted with bot" },
                        { event: "campaign.sent", description: "Campaign finished sending" },
                      ].map((item) => (
                        <div key={item.event} className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-mono text-foreground">{item.event}</span>
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          </div>
                          <CheckCircle className="h-3.5 w-3.5 text-success" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Import / Export */}
            <TabsContent value="import-export" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Export */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium text-foreground">Export Data</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground">Download a full backup of your platform data</p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {[
                      { label: "Bot Configurations", description: "All bot settings and flow configs", size: "~2.4 MB" },
                      { label: "User & Member Lists", description: "All users, groups, and memberships", size: "~8.1 MB" },
                      { label: "Transaction History", description: "Complete payment and PIX records", size: "~12.3 MB" },
                      { label: "Campaign Data", description: "All campaigns, messages, and analytics", size: "~4.7 MB" },
                      { label: "Full Platform Backup", description: "Everything - complete data export", size: "~27.5 MB" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm text-foreground">{item.label}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{item.size}</span>
                          <Button variant="outline" size="sm" className="border-border text-foreground">
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            Export
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Import */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium text-foreground">Import Data</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground">Restore or transfer configurations from a backup file</p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-secondary/50 px-6 py-10">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm text-foreground">Drag and drop your backup file here</p>
                        <p className="text-xs text-muted-foreground">Supports .json and .csv files up to 50MB</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-border text-foreground">
                        Browse Files
                      </Button>
                    </div>

                    <div className="rounded-lg bg-secondary p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Import Warning</p>
                          <p className="text-xs text-muted-foreground">
                            Importing data will overwrite existing configurations. Make sure to export a backup before importing.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Import Mode</Label>
                      <Select defaultValue="merge">
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="merge">Merge with existing data</SelectItem>
                          <SelectItem value="overwrite">Overwrite all data</SelectItem>
                          <SelectItem value="append">Append only (no overwrites)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
