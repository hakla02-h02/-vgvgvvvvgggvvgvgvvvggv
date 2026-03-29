import { getSupabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const flowId = searchParams.get("flowId")
    const action = searchParams.get("action") || "ver_planos"
    const planId = searchParams.get("planId")
    
    if (!flowId) {
      return NextResponse.json({ error: "flowId is required" }, { status: 400 })
    }
    
    const supabase = getSupabase()
    
    // Buscar o flow
    const { data: flow, error: flowError } = await supabase
      .from("flows")
      .select("*")
      .eq("id", flowId)
      .single()
    
    if (flowError || !flow) {
      return NextResponse.json({ 
        error: "Flow not found", 
        details: flowError?.message 
      }, { status: 404 })
    }
    
    const flowConfig = (flow.config as Record<string, unknown>) || {}
    
    // ACTION: ver_planos - mostrar os planos como botoes
    if (action === "ver_planos") {
      // Primeiro tenta buscar da tabela flow_plans
      const { data: dbPlans } = await supabase
        .from("flow_plans")
        .select("*")
        .eq("flow_id", flowId)
        .eq("is_active", true)
        .order("position", { ascending: true })
      
      // Se nao tiver na tabela, busca do config
      const configPlans = (flowConfig.plans as Array<{
        id: string
        name: string
        price: number
        description?: string
      }>) || []
      
      const plans = (dbPlans && dbPlans.length > 0) ? dbPlans : configPlans
      const plansSource = (dbPlans && dbPlans.length > 0) ? "database (flow_plans)" : "config JSON"
      
      if (plans.length === 0) {
        return NextResponse.json({
          success: true,
          action: "ver_planos",
          flowId: flow.id,
          flowName: flow.name,
          plansSource,
          message: "Nenhum plano encontrado",
          simulatedResponse: {
            type: "MESSAGE",
            content: "Nenhum plano disponivel no momento."
          }
        })
      }
      
      // Simular os botoes que seriam mostrados
      const planButtons = plans.map(plan => ({
        text: `${plan.name} - R$ ${Number(plan.price).toFixed(2).replace(".", ",")}`,
        callback_data: `plan_${plan.id}`,
        planDetails: {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          description: plan.description || null
        }
      }))
      
      return NextResponse.json({
        success: true,
        action: "ver_planos",
        flowId: flow.id,
        flowName: flow.name,
        plansSource,
        plansCount: plans.length,
        simulatedResponse: {
          type: "MESSAGE_WITH_BUTTONS",
          content: "Escolha seu plano:",
          buttons: planButtons
        },
        nextStep: "Clique em um plano para ver a simulacao do pagamento. Use: ?flowId=XXX&action=select_plan&planId=YYY"
      })
    }
    
    // ACTION: select_plan - simular selecao de plano e geracao de pagamento
    if (action === "select_plan" && planId) {
      // Buscar o plano
      let plan: Record<string, unknown> | null = null
      let planSource = ""
      
      // Primeiro tenta na tabela
      const { data: dbPlan } = await supabase
        .from("flow_plans")
        .select("*")
        .eq("id", planId)
        .single()
      
      if (dbPlan) {
        plan = dbPlan
        planSource = "database (flow_plans)"
      } else {
        // Busca no config
        const configPlans = (flowConfig.plans as Array<{
          id: string
          name: string
          price: number
          description?: string
        }>) || []
        const configPlan = configPlans.find(p => p.id === planId)
        if (configPlan) {
          plan = configPlan as Record<string, unknown>
          planSource = "config JSON"
        }
      }
      
      if (!plan) {
        return NextResponse.json({
          success: false,
          error: "Plano nao encontrado",
          planId
        }, { status: 404 })
      }
      
      // Pegar configuracoes de pagamento
      const payments = flowConfig.payments as Record<string, unknown> || {}
      const gateway = payments.gateway as string || "mercadopago"
      const pixKey = payments.pix_key as string || ""
      
      // Simular geracao de pagamento
      const paymentSimulation = {
        planSelected: {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          description: plan.description || null
        },
        paymentGateway: gateway,
        pixKey: pixKey || "(nao configurada)",
        simulatedMessages: [
          {
            step: 1,
            type: "MESSAGE",
            content: `Voce selecionou: *${plan.name}*\n\nValor: R$ ${Number(plan.price).toFixed(2).replace(".", ",")}\n\nGerando pagamento...`
          },
          {
            step: 2,
            type: "PIX_QR_CODE",
            content: pixKey 
              ? `QR Code PIX seria gerado aqui via ${gateway}\n\nChave PIX: ${pixKey}\nValor: R$ ${Number(plan.price).toFixed(2).replace(".", ",")}`
              : "ERRO: Chave PIX nao configurada no fluxo",
            qrCodeData: {
              gateway,
              pixKey,
              amount: plan.price,
              description: `Pagamento - ${plan.name}`
            }
          }
        ]
      }
      
      return NextResponse.json({
        success: true,
        action: "select_plan",
        flowId: flow.id,
        flowName: flow.name,
        planSource,
        paymentSimulation,
        warnings: !pixKey ? ["Chave PIX nao configurada! Configure em Configuracoes > Pagamentos"] : []
      })
    }
    
    return NextResponse.json({
      error: "Acao invalida",
      availableActions: [
        "ver_planos - Mostra os planos disponiveis",
        "select_plan - Simula selecao de plano (requer planId)"
      ]
    }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
