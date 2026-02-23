"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Bot,
  GitBranch,
  ShoppingCart,
  Megaphone,
  RefreshCw,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  Power,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BotSwitcher } from "@/components/bot-switcher"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  { label: "Painel", href: "/", icon: LayoutDashboard },
  { label: "Bots", href: "/bots", icon: Bot },
  { label: "Fluxos", href: "/flows", icon: GitBranch },
  { label: "Vendas", href: "/payments", icon: ShoppingCart, locked: true },
  { label: "Campanhas", href: "/campaigns", icon: Megaphone, locked: true },
  { label: "Assinaturas", href: "/subscriptions", icon: RefreshCw, locked: true },
  { label: "Analytics", href: "/analytics", icon: BarChart3, locked: true },
  { label: "Usuarios", href: "/users", icon: Users, locked: true },
]

interface DashboardSidebarProps {
  onNavigate?: () => void
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { session, logout } = useAuth()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* User Profile + Bot Switcher card */}
        <div className="border-b border-border px-2 py-3">
          <div className={cn(
            "rounded-xl bg-secondary/50 p-3 flex flex-col gap-2.5",
            collapsed && "items-center p-2"
          )}>
            {/* Top row: Avatar + Name + Power button */}
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/settings"
                    onClick={onNavigate}
                    className="rounded-xl transition-opacity hover:opacity-80"
                  >
                    <Avatar className="h-9 w-9 bg-secondary rounded-xl">
                      <AvatarFallback className="bg-secondary text-foreground text-sm font-bold rounded-xl">
                        {session?.name
                          ? session.name.charAt(0).toUpperCase()
                          : session?.email
                            ? session.email.charAt(0).toUpperCase()
                            : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground">
                  {session?.name || session?.email || "Minha conta"}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/settings"
                  onClick={onNavigate}
                  className="rounded-xl transition-opacity hover:opacity-80 shrink-0"
                >
                  <Avatar className="h-9 w-9 bg-secondary rounded-xl">
                    <AvatarFallback className="bg-secondary text-foreground text-sm font-bold rounded-xl">
                      {session?.name
                        ? session.name.charAt(0).toUpperCase()
                        : session?.email
                          ? session.email.charAt(0).toUpperCase()
                          : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <span className="text-sm font-semibold text-foreground truncate flex-1">
                  {session?.name || session?.email?.split("@")[0] || "Usuario"}
                </span>
                <button
                  onClick={logout}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
                  aria-label="Sair"
                >
                  <Power className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Bot Switcher dropdown */}
            <BotSwitcher collapsed={collapsed} />
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="flex flex-col gap-0.5 px-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href))

              if (item.locked) {
                const lockedContent = (
                  <span
                    key={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium opacity-30 cursor-not-allowed select-none"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </span>
                )

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{lockedContent}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-popover text-popover-foreground">
                        {item.label} (Em breve)
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return lockedContent
              }

              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-accent")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return linkContent
            })}
          </nav>
        </ScrollArea>

        {/* Collapse toggle */}
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full justify-center text-muted-foreground hover:text-foreground rounded-xl"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
