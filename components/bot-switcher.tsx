"use client"

import { useState } from "react"
import { useBots } from "@/lib/bot-context"
import { Bot, ChevronDown, Plus, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function BotSwitcher({ collapsed }: { collapsed: boolean }) {
  const { bots, selectedBot, setSelectedBot } = useBots()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  if (bots.length === 0) {
    return (
      <button
        onClick={() => router.push("/bots")}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-accent",
          collapsed ? "justify-center" : "w-full"
        )}
      >
        <Plus className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Criar bot</span>}
      </button>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary w-full",
            collapsed && "justify-center px-2"
          )}
        >
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent/20 text-accent">
            <Bot className="h-3 w-3" />
          </div>
          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">{selectedBot?.name || "Selecionar"}</span>
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-popover border-border">
        {bots.map((bot) => (
          <DropdownMenuItem
            key={bot.id}
            onClick={() => {
              setSelectedBot(bot)
              setOpen(false)
            }}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              selectedBot?.id === bot.id && "bg-secondary"
            )}
          >
            <Circle
              className={cn(
                "h-2 w-2 shrink-0",
                bot.status === "active" ? "fill-accent text-accent" : "fill-muted-foreground text-muted-foreground"
              )}
            />
            <span className="truncate">{bot.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={() => {
            setOpen(false)
            router.push("/bots")
          }}
          className="flex items-center gap-2 cursor-pointer text-accent"
        >
          <Plus className="h-3 w-3" />
          <span>Criar novo bot</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
