"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  GitBranch,
  MessageSquare,
  Timer,
  Split,
  Repeat,
  CreditCard,
  Users,
  Zap,
  ArrowRight,
  Lock,
  GripVertical,
  ChevronRight,
} from "lucide-react"

interface FlowNode {
  id: string
  type: "trigger" | "message" | "delay" | "condition" | "payment" | "action" | "loop"
  label: string
  description: string
}

const sampleFlow: FlowNode[] = [
  { id: "1", type: "trigger", label: "User starts bot", description: "/start command received" },
  { id: "2", type: "message", label: "Welcome Message", description: "Send greeting + product info" },
  { id: "3", type: "delay", label: "Wait 5 minutes", description: "Delay before follow-up" },
  { id: "4", type: "condition", label: "User replied?", description: "Check for user interaction" },
  { id: "5", type: "payment", label: "Generate PIX", description: "Create R$ 197.00 PIX charge" },
  { id: "6", type: "action", label: "Add to VIP Group", description: "Grant access on payment" },
]

const nodeIcons: Record<string, React.ElementType> = {
  trigger: Zap,
  message: MessageSquare,
  delay: Timer,
  condition: Split,
  payment: CreditCard,
  action: Users,
  loop: Repeat,
}

const nodeColors: Record<string, string> = {
  trigger: "border-accent bg-accent/5",
  message: "border-blue-500/30 bg-blue-500/5",
  delay: "border-warning/30 bg-warning/5",
  condition: "border-purple-500/30 bg-purple-500/5",
  payment: "border-success/30 bg-success/5",
  action: "border-cyan-500/30 bg-cyan-500/5",
  loop: "border-orange-500/30 bg-orange-500/5",
}

const nodeIconColors: Record<string, string> = {
  trigger: "text-accent",
  message: "text-blue-400",
  delay: "text-warning",
  condition: "text-purple-400",
  payment: "text-success",
  action: "text-cyan-400",
  loop: "text-orange-400",
}

const existingFlows = [
  { id: "f1", name: "Basic Sales Funnel", bot: "VendasBot", nodes: 6, status: "active", conversion: "12.4%" },
  { id: "f2", name: "Upsell Flow", bot: "ProBot", nodes: 8, status: "active", conversion: "8.7%" },
  { id: "f3", name: "Lead Capture", bot: "LeadBot", nodes: 4, status: "paused", conversion: "5.1%" },
  { id: "f4", name: "Remarketing Sequence", bot: "FunnelBot", nodes: 10, status: "active", conversion: "6.3%" },
  { id: "f5", name: "Subscription Renewal", bot: "VendasBot", nodes: 5, status: "active", conversion: "22.1%" },
]

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
}

const proFeatures = [
  { label: "Conditional Logic", description: "If/then branching rules", icon: Split },
  { label: "Auto Loops", description: "Automated retry sequences", icon: Repeat },
  { label: "Custom Delays", description: "Programmable wait times", icon: Timer },
  { label: "Audience Segments", description: "Advanced segmentation", icon: Users },
]

export default function FlowsPage() {
  const [activeFlow, setActiveFlow] = useState(existingFlows[0])

  return (
    <>
      <DashboardHeader
        title="Flow Builder"
        description="Design automated messaging and sales flows"
      />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          <Tabs defaultValue="flows">
            <div className="flex items-center justify-between">
              <TabsList className="bg-secondary">
                <TabsTrigger value="flows">My Flows</TabsTrigger>
                <TabsTrigger value="builder">Visual Builder</TabsTrigger>
                <TabsTrigger value="pro">Advanced (PRO)</TabsTrigger>
              </TabsList>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                New Flow
              </Button>
            </div>

            <TabsContent value="flows" className="mt-6">
              <div className="grid gap-4 lg:grid-cols-3">
                {existingFlows.map((flow) => (
                  <Card
                    key={flow.id}
                    className={`cursor-pointer bg-card border-border transition-colors hover:bg-secondary/50 ${
                      activeFlow.id === flow.id ? "ring-1 ring-accent" : ""
                    }`}
                    onClick={() => setActiveFlow(flow)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{flow.name}</h3>
                            <p className="text-xs text-muted-foreground">{flow.bot}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={statusStyles[flow.status]}>
                          {flow.status}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Nodes</span>
                          <span className="text-sm font-medium text-foreground">{flow.nodes}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Conv.</span>
                          <span className="text-sm font-medium text-foreground">{flow.conversion}</span>
                        </div>
                        <div className="flex items-end">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                            Edit <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="builder" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-4">
                <Card className="bg-card border-border lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-foreground">Components</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 p-3">
                    {Object.entries(nodeIcons).map(([type, Icon]) => (
                      <div
                        key={type}
                        className="flex cursor-grab items-center gap-3 rounded-lg border border-border bg-secondary px-3 py-2.5 transition-colors hover:bg-muted"
                      >
                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                        <Icon className={`h-4 w-4 ${nodeIconColors[type]}`} />
                        <span className="text-sm capitalize text-foreground">{type}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-card border-border lg:col-span-3">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-foreground">
                        {activeFlow.name}
                      </CardTitle>
                      <Badge variant="outline" className={statusStyles[activeFlow.status]}>
                        {activeFlow.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {sampleFlow.map((node, i) => {
                        const Icon = nodeIcons[node.type]
                        return (
                          <div key={node.id}>
                            <div
                              className={`flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors hover:bg-secondary/50 ${nodeColors[node.type]}`}
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background/50">
                                <Icon className={`h-4 w-4 ${nodeIconColors[node.type]}`} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{node.label}</p>
                                <p className="text-xs text-muted-foreground">{node.description}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                <GripVertical className="h-3 w-3" />
                              </Button>
                            </div>
                            {i < sampleFlow.length - 1 && (
                              <div className="flex justify-center py-1">
                                <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pro" className="mt-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Lock className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Advanced Flow Builder (PRO)</h3>
                      <p className="text-sm text-muted-foreground">Drag and drop visual editor with conditional logic</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {proFeatures.map((feature) => (
                      <Card key={feature.label} className="bg-secondary border-border">
                        <CardContent className="p-4">
                          <feature.icon className="h-6 w-6 text-accent" />
                          <h4 className="mt-3 text-sm font-semibold text-foreground">{feature.label}</h4>
                          <p className="mt-1 text-xs text-muted-foreground">{feature.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Upgrade to PRO
                    </Button>
                    <span className="text-sm text-muted-foreground">Starting at R$ 97/month</span>
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
