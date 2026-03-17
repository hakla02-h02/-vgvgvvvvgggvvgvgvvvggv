import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://izvulojnfvgsbmhyvqtn.supabase.co"
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const botId = searchParams.get("botId")
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    console.log("[v0] Fetching payments - botId:", botId, "userId:", userId, "status:", status)

    // Build query - buscar todos os pagamentos (filtrados por botId se passado)
    let query = supabase
      .from("payments")
      .select(`
        *,
        bots:bot_id (
          id,
          name
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtrar por user_id se passado
    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (botId) {
      query = query.eq("bot_id", botId)
    }

    if (status && status !== "todos") {
      query = query.eq("status", status)
    }

    const { data: payments, error, count } = await query

    if (error) {
      console.error("[v0] Error fetching payments:", error)
      return NextResponse.json(
        { error: "Erro ao buscar pagamentos" },
        { status: 500 }
      )
    }
    
    console.log("[v0] Found", payments?.length || 0, "payments")

    // Calculate stats - mesmo filtro
    let statsQuery = supabase
      .from("payments")
      .select("status, amount")

    if (userId) {
      statsQuery = statsQuery.eq("user_id", userId)
    }

    if (botId) {
      statsQuery = statsQuery.eq("bot_id", botId)
    }

    const { data: allPayments } = await statsQuery

    const stats = {
      total: allPayments?.length || 0,
      approved: allPayments?.filter(p => p.status === "approved").length || 0,
      pending: allPayments?.filter(p => p.status === "pending").length || 0,
      rejected: allPayments?.filter(p => p.status === "rejected").length || 0,
      cancelled: allPayments?.filter(p => p.status === "cancelled").length || 0,
      totalApproved: allPayments
        ?.filter(p => p.status === "approved")
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0,
      totalPending: allPayments
        ?.filter(p => p.status === "pending")
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0,
    }

    return NextResponse.json({
      payments: payments || [],
      stats,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("[v0] ERROR in payments list:", error)
    console.error("[v0] Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: "Erro interno do servidor", details: String(error) },
      { status: 500 }
    )
  }
}
