import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

const SUPABASE_URL = "https://izvulojnfvgsbmhyvqtn.supabase.co"
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dnVsb2puZnZnc2JtaHl2cXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTk0NTMsImV4cCI6MjA4ODgzNTQ1M30.Djnn3tsrxSGLBR-Bm1dWOpQe0NHCSOWJFZkbbTOk2oM"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const botId = searchParams.get("botId")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Get authenticated user
    const cookieStore = await cookies()
    const supabaseAuth = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Build query
    let query = supabase
      .from("payments")
      .select(`
        *,
        bots:bot_id (
          id,
          name
        )
      `, { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (botId) {
      query = query.eq("bot_id", botId)
    }

    if (status && status !== "todos") {
      query = query.eq("status", status)
    }

    const { data: payments, error, count } = await query

    if (error) {
      console.error("Error fetching payments:", error)
      return NextResponse.json(
        { error: "Erro ao buscar pagamentos" },
        { status: 500 }
      )
    }

    // Calculate stats
    const statsQuery = supabase
      .from("payments")
      .select("status, amount")
      .eq("user_id", user.id)

    if (botId) {
      statsQuery.eq("bot_id", botId)
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
    console.error("Error in payments list:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
