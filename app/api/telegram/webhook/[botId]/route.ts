import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

// POST /api/telegram/webhook/[botId]
// Receives events from Telegram when bot is added/removed from groups
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params
  const supabase = getSupabase()

  try {
    const update = await req.json()
    console.log("[v0] Telegram webhook received for bot:", botId, JSON.stringify(update, null, 2))

    // Handle my_chat_member event - bot added/removed from group
    if (update.my_chat_member) {
      const chatMember = update.my_chat_member
      const chat = chatMember.chat
      const newStatus = chatMember.new_chat_member?.status

      console.log("[v0] my_chat_member event:", {
        chat_id: chat.id,
        title: chat.title,
        type: chat.type,
        new_status: newStatus
      })

      // Bot was added or promoted to admin
      if (newStatus === "administrator" || newStatus === "member") {
        const isAdmin = newStatus === "administrator"
        
        // Check if bot can invite users (for admins)
        const canInvite = isAdmin && chatMember.new_chat_member?.can_invite_users === true

        // Upsert the group
        const { error } = await supabase
          .from("bot_groups")
          .upsert({
            bot_id: botId,
            chat_id: chat.id,
            title: chat.title || "Grupo sem nome",
            chat_type: chat.type,
            is_admin: isAdmin,
            can_invite: canInvite,
            updated_at: new Date().toISOString()
          }, {
            onConflict: "bot_id,chat_id"
          })

        if (error) {
          console.error("[v0] Error saving bot_group:", error)
        } else {
          console.log("[v0] Bot group saved successfully")
        }
      }

      // Bot was removed or demoted
      if (newStatus === "left" || newStatus === "kicked") {
        const { error } = await supabase
          .from("bot_groups")
          .delete()
          .eq("bot_id", botId)
          .eq("chat_id", chat.id)

        if (error) {
          console.error("[v0] Error removing bot_group:", error)
        } else {
          console.log("[v0] Bot group removed successfully")
        }
      }
    }

    // Handle regular messages to capture groups bot is in
    if (update.message?.chat?.type && update.message.chat.type !== "private") {
      const chat = update.message.chat
      
      // Upsert the group (we know bot is at least a member)
      const { error } = await supabase
        .from("bot_groups")
        .upsert({
          bot_id: botId,
          chat_id: chat.id,
          title: chat.title || "Grupo sem nome",
          chat_type: chat.type,
          is_admin: false, // Will be updated by my_chat_member event
          can_invite: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "bot_id,chat_id",
          ignoreDuplicates: true // Don't overwrite admin status
        })

      if (error && !error.message.includes("duplicate")) {
        console.error("[v0] Error saving bot_group from message:", error)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}

// GET - For webhook verification
export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" })
}
