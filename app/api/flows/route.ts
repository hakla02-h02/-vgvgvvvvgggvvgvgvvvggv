import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

// GET - Listar fluxos de um bot
export async function GET(req: NextRequest) {
  const supabase = getSupabase()
  const botId = req.nextUrl.searchParams.get("botId")
  
  if (!botId) {
    return NextResponse.json({ error: "botId obrigatorio" }, { status: 400 })
  }
  
  const { data: flows, error } = await supabase
    .from("flows")
    .select(`
      *,
      flow_nodes (*)
    `)
    .eq("bot_id", botId)
    .order("created_at", { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ flows })
}

// POST - Criar novo fluxo com nodes
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  
  try {
    const body = await req.json()
    const { botId, userId, name, welcomeMessage, mediaUrl, mediaType, buttons } = body
    
    if (!botId || !userId) {
      return NextResponse.json({ error: "botId e userId obrigatorios" }, { status: 400 })
    }
    
    // 1. Verificar se bot ja tem fluxo ativo
    const { data: existingFlow } = await supabase
      .from("flows")
      .select("id")
      .eq("bot_id", botId)
      .eq("status", "ativo")
      .single()
    
    if (existingFlow) {
      // Atualizar fluxo existente em vez de criar novo
      const { error: updateError } = await supabase
        .from("flows")
        .update({ name: name || "Fluxo Principal" })
        .eq("id", existingFlow.id)
      
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      
      // Deletar nodes antigos
      await supabase
        .from("flow_nodes")
        .delete()
        .eq("flow_id", existingFlow.id)
      
      // Criar novos nodes
      const nodes = [
        {
          flow_id: existingFlow.id,
          type: "trigger",
          label: "Inicio",
          position: 0,
          config: { trigger: "start" }
        },
        {
          flow_id: existingFlow.id,
          type: "message",
          label: "Boas-vindas",
          position: 1,
          config: {
            text: welcomeMessage || "Ola! Seja bem-vindo!",
            media_url: mediaUrl || null,
            media_type: mediaType || "none",
            buttons: buttons ? JSON.stringify(buttons) : null
          }
        }
      ]
      
      const { error: nodesError } = await supabase
        .from("flow_nodes")
        .insert(nodes)
      
      if (nodesError) {
        return NextResponse.json({ error: nodesError.message }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        flowId: existingFlow.id,
        message: "Fluxo atualizado com sucesso"
      })
    }
    
    // 2. Criar novo fluxo
    const { data: newFlow, error: flowError } = await supabase
      .from("flows")
      .insert({
        bot_id: botId,
        user_id: userId,
        name: name || "Fluxo Principal",
        status: "ativo",
        is_primary: true,
        category: "inicial",
        flow_type: "basic"
      })
      .select()
      .single()
    
    if (flowError) {
      return NextResponse.json({ error: flowError.message }, { status: 500 })
    }
    
    // 3. Criar nodes do fluxo
    const nodes = [
      {
        flow_id: newFlow.id,
        type: "trigger",
        label: "Inicio",
        position: 0,
        config: { trigger: "start" }
      },
      {
        flow_id: newFlow.id,
        type: "message",
        label: "Boas-vindas",
        position: 1,
        config: {
          text: welcomeMessage || "Ola! Seja bem-vindo!",
          media_url: mediaUrl || null,
          media_type: mediaType || "none",
          buttons: buttons ? JSON.stringify(buttons) : null
        }
      }
    ]
    
    const { error: nodesError } = await supabase
      .from("flow_nodes")
      .insert(nodes)
    
    if (nodesError) {
      return NextResponse.json({ error: nodesError.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      flowId: newFlow.id,
      message: "Fluxo criado com sucesso"
    })
    
  } catch (err) {
    console.error("[flows] Error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE - Deletar fluxo
export async function DELETE(req: NextRequest) {
  const supabase = getSupabase()
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
  
  return NextResponse.json({ success: true, message: "Fluxo deletado" })
}
