"use client"

import { Bell, Search, Bot } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useBots } from "@/lib/bot-context"
import { useAuth } from "@/lib/auth-context"

interface DashboardHeaderProps {
  title: string
  description?: string
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const { selectedBot } = useBots()
  const { session } = useAuth()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {selectedBot && (
          <Badge variant="outline" className="ml-2 border-accent/30 bg-accent/5 text-accent">
            <Bot className="mr-1 h-3 w-3" />
            {selectedBot.name}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 bg-secondary pl-9 text-sm border-border"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-accent p-0 text-[10px] text-accent-foreground flex items-center justify-center">
            3
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button>
        <Avatar className="h-8 w-8 bg-secondary">
          <AvatarFallback className="bg-secondary text-foreground text-xs">
            {session?.email ? session.email.slice(0, 2).toUpperCase() : "TF"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
