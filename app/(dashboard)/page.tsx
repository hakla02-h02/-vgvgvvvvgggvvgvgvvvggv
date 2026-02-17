"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { StatCards } from "@/components/overview/stat-cards"
import { RevenueChart } from "@/components/overview/revenue-chart"
import { RecentTransactions } from "@/components/overview/recent-transactions"
import { QuickActions } from "@/components/overview/quick-actions"
import { NotificationsPanel } from "@/components/overview/notifications-panel"
import { NoBotSelected } from "@/components/no-bot-selected"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useBots } from "@/lib/bot-context"

export default function DashboardPage() {
  const { selectedBot } = useBots()

  if (!selectedBot) {
    return (
      <>
        <DashboardHeader title="Dashboard" description="Overview of your Telegram sales automation" />
        <NoBotSelected />
      </>
    )
  }

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description="Overview of your Telegram sales automation"
      />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          <StatCards />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <QuickActions />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentTransactions />
            <NotificationsPanel />
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
