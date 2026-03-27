import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Supabase com credenciais hardcoded
const supabaseUrl = "https://izvulojnfvgsbmhyvqtn.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dnVsb2puZnZnc2JtaHl2cXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTk0NTMsImV4cCI6MjA4ODgzNTQ1M30.Djnn3tsrxSGLBR-Bm1dWOpQe0NHCSOWJFZkbbTOk2oM"

const supabase = createClient(supabaseUrl, supabaseKey)

// GET - Buscar fluxos de um bot
export async function GET(req: NextRequest) {
  const botId = req.nextUrl.searchParams.get("botId")
  
  if (!botId) {
    return NextResponse.json({ error: "botId obrigatorio" }, { status: 400 })
  }

  const { data: flows, error } = await supabase
    .from("flows")
    .select("*, flow_nodes(*)")
    .eq("bot_id", botId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ flows })
}

// POST - Criar ou atualizar fluxo com mensagem de boas-vindas
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { botId, userId, flowId, welcomeMessage, buttons } = body

    console.log("[API flows] POST received:", { botId, userId, flowId, welcomeMessage })

    if (!botId || !userId) {
      return NextResponse.json({ error: "botId e userId obrigatorios" }, { status: 400 })
    }

    if (!welcomeMessage) {
      return NextResponse.json({ error: "welcomeMessage obrigatoria" }, { status: 400 })
    }

    let flow = null

    // Se tem flowId, atualiza o fluxo existente
    if (flowId) {
      // Atualizar nodes do fluxo
      // Primeiro deleta os nodes antigos
      await supabase
        .from("flow_nodes")
        .delete()
        .eq("flow_id", flowId)

      // Criar novos nodes
      const nodes = [
        {
          flow_id: flowId,
          type: "trigger",
          label: "Inicio",
          position: 0,
          config: { trigger_type: "start" }
        },
        {
          flow_id: flowId,
          type: "message",
          label: "Boas-vindas",
          position: 1,
          config: { 
            text: welcomeMessage,
            buttons: buttons || []
          }
        }
      ]

      const { error: nodesError } = await supabase
        .from("flow_nodes")
        .insert(nodes)

      if (nodesError) {
        console.error("[API flows] Error inserting nodes:", nodesError)
        return NextResponse.json({ error: "Erro ao salvar nodes: " + nodesError.message }, { status: 500 })
      }

      // Buscar fluxo atualizado
      const { data: updatedFlow } = await supabase
        .from("flows")
        .select("*, flow_nodes(*)")
        .eq("id", flowId)
        .single()

      flow = updatedFlow
      console.log("[API flows] Flow updated:", flowId)

    } else {
      // Criar novo fluxo
      const { data: newFlow, error: flowError } = await supabase
        .from("flows")
        .insert({
          bot_id: botId,
          user_id: userId,
          name: "Fluxo de Boas-vindas",
          status: "ativo",
          is_primary: true,
          flow_type: "basic",
          category: "inicial"
        })
        .select()
        .single()

      if (flowError || !newFlow) {
        console.error("[API flows] Error creating flow:", flowError)
        return NextResponse.json({ error: "Erro ao criar fluxo: " + (flowError?.message || "desconhecido") }, { status: 500 })
      }

      console.log("[API flows] Flow created:", newFlow.id)

      // Criar nodes
      const nodes = [
        {
          flow_id: newFlow.id,
          type: "trigger",
          label: "Inicio",
          position: 0,
          config: { trigger_type: "start" }
        },
        {
          flow_id: newFlow.id,
          type: "message",
          label: "Boas-vindas",
          position: 1,
          config: { 
            text: welcomeMessage,
            buttons: buttons || []
          }
        }
      ]

      const { error: nodesError } = await supabase
        .from("flow_nodes")
        .insert(nodes)

      if (nodesError) {
        console.error("[API flows] Error inserting nodes:", nodesError)
        // Deletar o fluxo criado ja que os nodes falharam
        await supabase.from("flows").delete().eq("id", newFlow.id)
        return NextResponse.json({ error: "Erro ao salvar nodes: " + nodesError.message }, { status: 500 })
      }

      // Buscar fluxo com nodes
      const { data: flowWithNodes } = await supabase
        .from("flows")
        .select("*, flow_nodes(*)")
        .eq("id", newFlow.id)
        .single()

      flow = flowWithNodes
      console.log("[API flows] Flow with nodes created:", newFlow.id)
    }

    return NextResponse.json({ success: true, flow })

  } catch (error) {
    console.error("[API flows] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE - Deletar fluxo
export async function DELETE(req: NextRequest) {
  const flowId = req.nextUrl.searchParams.get("flowId")

  if (!flowId) {
    return NextResponse.json({ error: "flowId obrigatorio" }, { status: 400 })
  }

  // Deletar nodes primeiro
  await supabase
    .from("flow_nodes")
    .delete()
    .eq("flow_id", flowId)

  // Deletar fluxo
  const { error } = await supabase
    .from("flows")
    .delete()
    .eq("id", flowId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
