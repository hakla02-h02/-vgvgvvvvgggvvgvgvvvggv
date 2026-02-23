"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BarChart3,
  DollarSign,
  Users,
  UserCheck,
  Bot,
  GitBranch,
  Megaphone,
  Send,
  Wrench,
  CreditCard,
  Crosshair,
  LinkIcon,
  Gift,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Power,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BotSwitcher } from "@/components/bot-switcher"
import { useAuth } from "@/lib/auth-context"

type NavItem = {
  label: string
  description: string
  href: string
  icon: LucideIcon
  locked?: boolean
}

type NavSection = {
  category: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    category: "MENU",
    items: [
      { label: "Dashboard", description: "Visao geral", href: "/", icon: LayoutDashboard },
      { label: "Analises", description: "Metricas e relatorios", href: "/analytics", icon: BarChart3 },
      { label: "Financeiro", description: "Receitas e transacoes", href: "/payments", icon: DollarSign },
      { label: "Clientes", description: "Base de leads", href: "/users", icon: Users },
      { label: "Afiliado", description: "Comissoes", href: "/affiliate", icon: UserCheck },
    ],
  },
  {
    category: "AUTOMACOES",
    items: [
      { label: "Meus Robos", description: "Gerenciar bots", href: "/bots", icon: Bot },
      { label: "Meus Fluxos", description: "Fluxos de venda", href: "/flows", icon: GitBranch },
      { label: "Remarketing", description: "Campanhas", href: "/campaigns", icon: Megaphone },
      { label: "Postagens", description: "Envios e agendamentos", href: "/posts", icon: Send },
      { label: "Ferramentas", description: "Utilitarios de midia", href: "/tools", icon: Wrench },
    ],
  },
  {
    category: "INTEGRACOES",
    items: [
      { label: "Gateways", description: "Pagamentos PIX", href: "/gateways", icon: CreditCard },
      { label: "Trackeamento", description: "Pixels e UTM", href: "/tracking", icon: Crosshair },
      { label: "Bio Link", description: "Paginas de bio", href: "/biolink", icon: LinkIcon },
    ],
  },
  {
    category: "RECOMPENSAS",
    items: [
      { label: "Indique e Ganhe", description: "Convide amigos", href: "/referral", icon: Gift },
      { label: "Premiacoes", description: "Conquistas e premios", href: "/rewards", icon: Trophy },
    ],
  },
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
          collapsed ? "w-16" : "w-64"
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
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-4 px-2">
            {navSections.map((section) => (
              <div key={section.category} className="flex flex-col gap-0.5">
                {/* Category label */}
                {!collapsed && (
                  <span className="px-3 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
                    {section.category}
                  </span>
                )}
                {collapsed && (
                  <div className="mx-auto mb-1 h-px w-6 bg-border" />
                )}

                {/* Items */}
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))

                  if (item.locked) {
                    const lockedContent = (
                      <span
                        key={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 opacity-30 cursor-not-allowed select-none",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-foreground truncate">{item.label}</span>
                            <span className="text-[11px] text-muted-foreground truncate">{item.description}</span>
                          </div>
                        )}
                      </span>
                    )

                    if (collapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>{lockedContent}</TooltipTrigger>
                          <TooltipContent side="right" className="bg-popover text-popover-foreground">
                            <p className="font-medium">{item.label}</p>
                            <p className="text-xs text-muted-foreground">Em breve</p>
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
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                        collapsed && "justify-center px-2",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-accent")} />
                      {!collapsed && (
                        <div className="flex flex-col min-w-0">
                          <span className={cn(
                            "text-sm font-medium truncate",
                            isActive ? "text-foreground" : "text-foreground/90"
                          )}>
                            {item.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate">{item.description}</span>
                        </div>
                      )}
                    </Link>
                  )

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="bg-popover text-popover-foreground">
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return linkContent
                })}
              </div>
            ))}
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
