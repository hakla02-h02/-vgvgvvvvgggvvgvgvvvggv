"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckCircle, AlertTriangle, Info } from "lucide-react"

const notifications = [
  {
    icon: CheckCircle,
    title: "New sale completed",
    message: "VendasBot processed R$ 197.00",
    time: "2 min ago",
    type: "success",
  },
  {
    icon: AlertTriangle,
    title: "PIX expired",
    message: "Transaction #TX-005 not completed",
    time: "15 min ago",
    type: "warning",
  },
  {
    icon: Info,
    title: "Campaign sent",
    message: '"Weekend Promo" delivered to 1,240 users',
    time: "1h ago",
    type: "info",
  },
  {
    icon: CheckCircle,
    title: "Bot activated",
    message: "FunnelBot is now live",
    time: "2h ago",
    type: "success",
  },
]

const typeColors: Record<string, string> = {
  success: "text-success",
  warning: "text-warning",
  info: "text-muted-foreground",
}

export function NotificationsPanel() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-foreground">
            Notifications
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3">
              <n.icon className={`mt-0.5 h-4 w-4 shrink-0 ${typeColors[n.type]}`} />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {n.title}
                </span>
                <span className="text-xs text-muted-foreground">{n.message}</span>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
