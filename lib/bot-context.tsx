"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"

const BOTS_STORAGE_KEY = "teleflow_bots"
const SELECTED_BOT_KEY = "teleflow_selected_bot"

export interface BotGroup {
  name: string
  link: string
}

export interface Bot {
  id: string
  userId: string
  name: string
  token: string
  group: BotGroup | null
  createdAt: number
  status: "active" | "inactive"
}

interface BotContextType {
  bots: Bot[]
  selectedBot: Bot | null
  setSelectedBot: (bot: Bot) => void
  addBot: (name: string, token: string, group?: BotGroup) => Bot
  updateBot: (id: string, updates: Partial<Omit<Bot, "id" | "userId">>) => void
  deleteBot: (id: string) => void
}

const BotContext = createContext<BotContextType | null>(null)

function getStoredBots(): Bot[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(BOTS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveBotsToStorage(bots: Bot[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(BOTS_STORAGE_KEY, JSON.stringify(bots))
}

function getStoredSelectedBotId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(SELECTED_BOT_KEY)
}

function saveSelectedBotId(id: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(SELECTED_BOT_KEY, id)
}

export function BotProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [allBots, setAllBots] = useState<Bot[]>([])
  const [selectedBot, setSelectedBotState] = useState<Bot | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Load bots from storage
  useEffect(() => {
    const stored = getStoredBots()
    setAllBots(stored)
    setLoaded(true)
  }, [])

  // Filter bots by current user and auto-select
  const userBots = session ? allBots.filter((b) => b.userId === session.userId) : []

  useEffect(() => {
    if (!loaded || !session) return
    const savedId = getStoredSelectedBotId()
    const found = userBots.find((b) => b.id === savedId)
    if (found) {
      setSelectedBotState(found)
    } else if (userBots.length > 0) {
      setSelectedBotState(userBots[0])
      saveSelectedBotId(userBots[0].id)
    } else {
      setSelectedBotState(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, session?.userId, allBots])

  const setSelectedBot = useCallback((bot: Bot) => {
    setSelectedBotState(bot)
    saveSelectedBotId(bot.id)
  }, [])

  const addBot = useCallback((name: string, token: string, group?: BotGroup): Bot => {
    if (!session) throw new Error("Not logged in")
    const newBot: Bot = {
      id: "bot_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      userId: session.userId,
      name,
      token,
      group: group || null,
      createdAt: Date.now(),
      status: "active",
    }
    const updated = [...allBots, newBot]
    setAllBots(updated)
    saveBotsToStorage(updated)
    setSelectedBotState(newBot)
    saveSelectedBotId(newBot.id)
    return newBot
  }, [session, allBots])

  const updateBot = useCallback((id: string, updates: Partial<Omit<Bot, "id" | "userId">>) => {
    const updated = allBots.map((b) => (b.id === id ? { ...b, ...updates } : b))
    setAllBots(updated)
    saveBotsToStorage(updated)
    if (selectedBot?.id === id) {
      setSelectedBotState({ ...selectedBot, ...updates } as Bot)
    }
  }, [allBots, selectedBot])

  const deleteBot = useCallback((id: string) => {
    const updated = allBots.filter((b) => b.id !== id)
    setAllBots(updated)
    saveBotsToStorage(updated)
    if (selectedBot?.id === id) {
      const remaining = updated.filter((b) => b.userId === session?.userId)
      if (remaining.length > 0) {
        setSelectedBotState(remaining[0])
        saveSelectedBotId(remaining[0].id)
      } else {
        setSelectedBotState(null)
      }
    }
  }, [allBots, selectedBot, session])

  return (
    <BotContext.Provider value={{ bots: userBots, selectedBot, setSelectedBot, addBot, updateBot, deleteBot }}>
      {children}
    </BotContext.Provider>
  )
}

export function useBots() {
  const ctx = useContext(BotContext)
  if (!ctx) throw new Error("useBots must be used within BotProvider")
  return ctx
}
