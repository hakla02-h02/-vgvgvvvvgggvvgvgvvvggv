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

// POST - Todas as operacoes de escrita
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    // ============ FLOWS ============

    // Criar fluxo
    if (action === "create_flow") {
      const { botId, userId, name, flowType, category, isPrimary } = body
      
      const { data, error } = await supabase
        .from("flows")
        .insert({
          bot_id: botId,
          user_id: userId,
          name: name || "Novo Fluxo",
          status: "ativo",
          is_primary: isPrimary || false,
          flow_type: flowType || "basic",
          category: category || "personalizado"
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, flow: data })
    }

    // Atualizar fluxo
    if (action === "update_flow") {
      const { flowId, updates } = body
      
      const { data, error } = await supabase
        .from("flows")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", flowId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, flow: data })
    }

    // Deletar fluxo
    if (action === "delete_flow") {
      const { flowId } = body
      
      // Deletar nodes primeiro
      await supabase.from("flow_nodes").delete().eq("flow_id", flowId)
      
      const { error } = await supabase.from("flows").delete().eq("id", flowId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    // ============ NODES ============

    // Criar nodes
    if (action === "create_nodes") {
      const { flowId, nodes } = body
      
      for (const node of nodes) {
        const nodeData: Record<string, unknown> = { flow_id: flowId, ...node }
        if (!node.id) delete nodeData.id
        
        const { error } = await supabase.from("flow_nodes").insert(nodeData)
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }
      return NextResponse.json({ success: true, nodesCreated: nodes.length })
    }

    // Criar um node
    if (action === "create_node") {
      const { flowId, type, label, config, position } = body
      
      const { data, error } = await supabase
        .from("flow_nodes")
        .insert({
          flow_id: flowId,
          type,
          label,
          config,
          position
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, node: data })
    }

    // Atualizar node
    if (action === "update_node") {
      const { nodeId, updates } = body
      
      const { data, error } = await supabase
        .from("flow_nodes")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", nodeId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, node: data })
    }

    // Deletar node
    if (action === "delete_node") {
      const { nodeId } = body
      
      const { error } = await supabase.from("flow_nodes").delete().eq("id", nodeId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    // Atualizar posicoes dos nodes
    if (action === "update_node_positions") {
      const { nodes } = body // Array de { id, position }
      
      for (const node of nodes) {
        await supabase
          .from("flow_nodes")
          .update({ position: node.position })
          .eq("id", node.id)
      }
      return NextResponse.json({ success: true })
    }

    // ============ FLUXO COMPLETO (criar fluxo + nodes) ============

    if (action === "create_flow_with_nodes") {
      const { botId, userId, name, flowType, category, isPrimary, nodes } = body
      
      // Criar fluxo
      const { data: flow, error: flowError } = await supabase
        .from("flows")
        .insert({
          bot_id: botId,
          user_id: userId,
          name: name || "Novo Fluxo",
          status: "ativo",
          is_primary: isPrimary || false,
          flow_type: flowType || "basic",
          category: category || "personalizado"
        })
        .select()
        .single()

      if (flowError || !flow) {
        return NextResponse.json({ error: flowError?.message || "Erro ao criar fluxo" }, { status: 500 })
      }

      // Criar nodes
      if (nodes && nodes.length > 0) {
        for (const node of nodes) {
          const { error: nodeError } = await supabase
            .from("flow_nodes")
            .insert({
              flow_id: flow.id,
              type: node.type,
              label: node.label,
              config: node.config,
              position: node.position
            })

          if (nodeError) {
            // Rollback: deletar fluxo criado
            await supabase.from("flows").delete().eq("id", flow.id)
            return NextResponse.json({ error: nodeError.message }, { status: 500 })
          }
        }
      }

      // Buscar fluxo com nodes
      const { data: flowWithNodes } = await supabase
        .from("flows")
        .select("*, flow_nodes(*)")
        .eq("id", flow.id)
        .single()

      return NextResponse.json({ success: true, flow: flowWithNodes })
    }

    return NextResponse.json({ error: "Acao invalida: " + action }, { status: 400 })

  } catch (error) {
    console.error("[API flows] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE - Deletar fluxo (mantido para compatibilidade)
export async function DELETE(req: NextRequest) {
  const flowId = req.nextUrl.searchParams.get("flowId")

  if (!flowId) {
    return NextResponse.json({ error: "flowId obrigatorio" }, { status: 400 })
  }

  await supabase.from("flow_nodes").delete().eq("flow_id", flowId)
  const { error } = await supabase.from("flows").delete().eq("id", flowId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
