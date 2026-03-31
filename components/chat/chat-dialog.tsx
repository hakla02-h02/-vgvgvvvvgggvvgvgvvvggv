"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, X, Search, MessageSquare, User, Bot, RefreshCw } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { cn } from "@/lib/utils"

interface Conversation {
  telegram_user_id: string
  telegram_chat_id: string
  first_name: string
  last_name?: string
  username?: string
  last_message?: string
  last_message_at?: string
  unread_count?: number
  bot_id: string
  bot_username?: string
}

interface Message {
  id: string
  bot_id: string
  telegram_user_id: string
  telegram_chat_id: string
  direction: "incoming" | "outgoing"
  message_type: "text" | "photo" | "video" | "document" | "callback"
  content: string
  media_url?: string
  created_at: string
}

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  botId?: string
  initialUserId?: string
}

export function ChatDialog({ open, onOpenChange, botId, initialUserId }: ChatDialogProps) {
  const supabase = createClientComponentClient()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Buscar conversas
  const fetchConversations = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      // Buscar bots do usuario
      const { data: bots } = await supabase
        .from("bots")
        .select("id, username")
        .eq("user_id", userData.user.id)

      if (!bots || bots.length === 0) return

      const botIds = bots.map(b => b.id)

      // Buscar mensagens agrupadas por usuario
      const { data: messagesData } = await supabase
        .from("bot_messages")
        .select("*")
        .in("bot_id", botIds)
        .order("created_at", { ascending: false })

      if (!messagesData) return

      // Agrupar por telegram_user_id
      const convMap = new Map<string, Conversation>()
      
      for (const msg of messagesData) {
        const key = `${msg.bot_id}_${msg.telegram_user_id}`
        if (!convMap.has(key)) {
          const bot = bots.find(b => b.id === msg.bot_id)
          convMap.set(key, {
            telegram_user_id: msg.telegram_user_id,
            telegram_chat_id: msg.telegram_chat_id,
            first_name: msg.user_first_name || "Usuario",
            last_name: msg.user_last_name,
            username: msg.user_username,
            last_message: msg.content,
            last_message_at: msg.created_at,
            bot_id: msg.bot_id,
            bot_username: bot?.username,
            unread_count: msg.direction === "incoming" ? 1 : 0,
          })
        }
      }

      setConversations(Array.from(convMap.values()))

      // Se tiver initialUserId, selecionar automaticamente
      if (initialUserId) {
        const conv = Array.from(convMap.values()).find(c => c.telegram_user_id === initialUserId)
        if (conv) {
          setSelectedConversation(conv)
        }
      }
    } catch (error) {
      console.error("Erro ao buscar conversas:", error)
    }
  }

  // Buscar mensagens da conversa selecionada
  const fetchMessages = async () => {
    if (!selectedConversation) return

    try {
      const { data } = await supabase
        .from("bot_messages")
        .select("*")
        .eq("bot_id", selectedConversation.bot_id)
        .eq("telegram_user_id", selectedConversation.telegram_user_id)
        .order("created_at", { ascending: true })

      if (data) {
        setMessages(data)
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error)
    }
  }

  // Enviar mensagem
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const response = await fetch("/api/telegram/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: selectedConversation.bot_id,
          chatId: selectedConversation.telegram_chat_id,
          message: newMessage,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewMessage("")
        // Recarregar mensagens
        await fetchMessages()
      } else {
        console.error("Erro ao enviar:", data.error)
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
    } finally {
      setSending(false)
    }
  }

  // Effect para buscar conversas quando abre
  useEffect(() => {
    if (open) {
      fetchConversations()
    }
  }, [open])

  // Effect para buscar mensagens quando seleciona conversa
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages()
    }
  }, [selectedConversation])

  // Effect para refresh automatico
  useEffect(() => {
    if (open && selectedConversation) {
      refreshIntervalRef.current = setInterval(() => {
        fetchMessages()
      }, 5000) // Refresh a cada 5 segundos
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [open, selectedConversation])

  // Filtrar conversas
  const filteredConversations = conversations.filter(conv => {
    const search = searchTerm.toLowerCase()
    return (
      conv.first_name?.toLowerCase().includes(search) ||
      conv.username?.toLowerCase().includes(search) ||
      conv.telegram_user_id.includes(search)
    )
  })

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 24) {
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-full">
          {/* Lista de conversas - Lado esquerdo */}
          <div className="w-80 border-r border-border flex flex-col bg-secondary/30">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversas
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchConversations}
                  className="h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-secondary/50"
                />
              </div>
            </div>

            {/* Lista de conversas */}
            <ScrollArea className="flex-1">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma conversa encontrada</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={`${conv.bot_id}_${conv.telegram_user_id}`}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer hover:bg-secondary/50 transition-colors border-b border-border/50",
                      selectedConversation?.telegram_user_id === conv.telegram_user_id &&
                        selectedConversation?.bot_id === conv.bot_id &&
                        "bg-secondary"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-accent/20 text-accent">
                        {conv.first_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {conv.first_name} {conv.last_name || ""}
                        </span>
                        {conv.last_message_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                      {conv.username && (
                        <p className="text-xs text-muted-foreground">@{conv.username}</p>
                      )}
                      {conv.last_message && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.last_message.substring(0, 30)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Area de chat - Lado direito */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header do chat */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-accent/20 text-accent">
                        {selectedConversation.first_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedConversation.first_name} {selectedConversation.last_name || ""}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.username ? `@${selectedConversation.username}` : `ID: ${selectedConversation.telegram_user_id}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                      via {selectedConversation.bot_username || "Bot"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={fetchMessages}
                      className="h-8 w-8"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mensagens */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-end gap-2",
                          msg.direction === "outgoing" ? "justify-end" : "justify-start"
                        )}
                      >
                        {msg.direction === "incoming" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-secondary text-xs">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2",
                            msg.direction === "outgoing"
                              ? "bg-accent text-accent-foreground rounded-br-md"
                              : "bg-secondary rounded-bl-md"
                          )}
                        >
                          {msg.media_url && (
                            <div className="mb-2">
                              {msg.message_type === "photo" ? (
                                <img src={msg.media_url} alt="Imagem" className="rounded-lg max-w-full" />
                              ) : msg.message_type === "video" ? (
                                <video src={msg.media_url} controls className="rounded-lg max-w-full" />
                              ) : null}
                            </div>
                          )}
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <span className={cn(
                            "text-xs mt-1 block",
                            msg.direction === "outgoing" ? "text-accent-foreground/70" : "text-muted-foreground"
                          )}>
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                        {msg.direction === "outgoing" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-accent/20 text-xs">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input de mensagem */}
                <div className="p-4 border-t border-border bg-secondary/20">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      sendMessage()
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={sending || !newMessage.trim()}>
                      {sending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              /* Estado vazio */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                  <p className="text-sm">Escolha uma conversa na lista para ver o historico de mensagens</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
