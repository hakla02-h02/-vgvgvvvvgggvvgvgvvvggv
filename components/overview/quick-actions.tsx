"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Megaphone, CreditCard, GitBranch } from "lucide-react"
import Link from "next/link"

const actions = [
  { label: "Create Bot", icon: Bot, href: "/bots" },
  { label: "New Campaign", icon: Megaphone, href: "/campaigns" },
  { label: "View Payments", icon: CreditCard, href: "/payments" },
  { label: "Build Flow", icon: GitBranch, href: "/flows" },
]

export function QuickActions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="flex h-auto flex-col items-center gap-2 border-border bg-secondary py-4 text-foreground hover:bg-accent hover:text-accent-foreground"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
