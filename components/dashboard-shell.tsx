"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { BotProvider } from "@/lib/bot-context"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <BotProvider>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </BotProvider>
  )
}
