"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { useBots } from "@/lib/bot-context"
import { supabase } from "@/lib/supabase"

export interface Gateway {
  id: string
  user_id: string
  bot_id: string | null
  gateway_name: string
  access_token: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  bot_id: string | null
  telegram_user_id: string | null
  gateway: string
  external_payment_id: string | null
  amount: number
  description: string | null
  qr_code: string | null
  qr_code_url: string | null
  copy_paste: string | null
  status: string
  created_at: string
  updated_at: string
}

// Gateways disponiveis na plataforma
export const AVAILABLE_GATEWAYS = [
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "PIX, Cartao de Credito e Debito",
    icon: "mercadopago",
    color: "#00bcff",
    methods: ["pix", "credit_card", "debit_card"],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Cartao Internacional",
    icon: "stripe",
    color: "#635bff",
    methods: ["credit_card"],
    comingSoon: true,
  },
  {
    id: "pagseguro",
    name: "PagSeguro",
    description: "PIX e Boleto",
    icon: "pagseguro",
    color: "#41ce68",
    methods: ["pix", "boleto"],
    comingSoon: true,
  },
] as const

interface GatewayContextType {
  gateways: Gateway[]
  payments: Payment[]
  isLoading: boolean
  connectGateway: (gatewayName: string, accessToken: string) => Promise<Gateway>
  disconnectGateway: (id: string) => Promise<void>
  updateGateway: (id: string, updates: Partial<Pick<Gateway, "access_token" | "is_active">>) => Promise<void>
  getGatewayByName: (name: string) => Gateway | undefined
  refreshGateways: () => Promise<void>
  refreshPayments: () => Promise<void>
}

const GatewayContext = createContext<GatewayContextType | null>(null)

export function GatewayProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const { selectedBot } = useBots()
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchGateways = useCallback(async () => {
    if (!session) {
      setGateways([])
      setIsLoading(false)
      return
    }

    let query = supabase
      .from("user_gateways")
      .select("*")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })

    // Se tiver bot selecionado, filtra por ele
    if (selectedBot) {
      query = query.or(`bot_id.eq.${selectedBot.id},bot_id.is.null`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching gateways:", error)
      setIsLoading(false)
      return
    }

    setGateways((data || []) as Gateway[])
    setIsLoading(false)
  }, [session, selectedBot])

  const fetchPayments = useCallback(async () => {
    if (!session || !selectedBot) {
      setPayments([])
      return
    }

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", session.userId)
      .eq("bot_id", selectedBot.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching payments:", error)
      return
    }

    setPayments((data || []) as Payment[])
  }, [session, selectedBot])

  useEffect(() => {
    fetchGateways()
  }, [fetchGateways])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const connectGateway = useCallback(
    async (gatewayName: string, accessToken: string): Promise<Gateway> => {
      if (!session) throw new Error("Nao autenticado")

      // Verifica se ja existe gateway com esse nome para o usuario/bot
      const existing = gateways.find(
        (g) => g.gateway_name === gatewayName && (g.bot_id === selectedBot?.id || g.bot_id === null)
      )

      if (existing) {
        // Atualiza o token existente
        const { error } = await supabase
          .from("user_gateways")
          .update({ 
            access_token: accessToken, 
            is_active: true,
            updated_at: new Date().toISOString() 
          })
          .eq("id", existing.id)

        if (error) {
          console.error("Error updating gateway:", error)
          throw new Error("Erro ao atualizar gateway")
        }

        const updated = { ...existing, access_token: accessToken, is_active: true }
        setGateways((prev) => prev.map((g) => (g.id === existing.id ? updated : g)))
        return updated
      }

      // Cria novo gateway
      const { data, error } = await supabase
        .from("user_gateways")
        .insert({
          user_id: session.userId,
          bot_id: selectedBot?.id || null,
          gateway_name: gatewayName,
          access_token: accessToken,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating gateway:", error)
        throw new Error("Erro ao conectar gateway")
      }

      const newGateway = data as Gateway
      setGateways((prev) => [newGateway, ...prev])
      return newGateway
    },
    [session, selectedBot, gateways]
  )

  const disconnectGateway = useCallback(async (id: string) => {
    const { error } = await supabase.from("user_gateways").delete().eq("id", id)

    if (error) {
      console.error("Error deleting gateway:", error)
      throw new Error("Erro ao desconectar gateway")
    }

    setGateways((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const updateGateway = useCallback(
    async (id: string, updates: Partial<Pick<Gateway, "access_token" | "is_active">>) => {
      const { error } = await supabase
        .from("user_gateways")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) {
        console.error("Error updating gateway:", error)
        throw new Error("Erro ao atualizar gateway")
      }

      setGateways((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))
    },
    []
  )

  const getGatewayByName = useCallback(
    (name: string) => {
      return gateways.find((g) => g.gateway_name === name && g.is_active)
    },
    [gateways]
  )

  const refreshGateways = useCallback(async () => {
    await fetchGateways()
  }, [fetchGateways])

  const refreshPayments = useCallback(async () => {
    await fetchPayments()
  }, [fetchPayments])

  return (
    <GatewayContext.Provider
      value={{
        gateways,
        payments,
        isLoading,
        connectGateway,
        disconnectGateway,
        updateGateway,
        getGatewayByName,
        refreshGateways,
        refreshPayments,
      }}
    >
      {children}
    </GatewayContext.Provider>
  )
}

export function useGateways() {
  const ctx = useContext(GatewayContext)
  if (!ctx) throw new Error("useGateways must be used within GatewayProvider")
  return ctx
}
