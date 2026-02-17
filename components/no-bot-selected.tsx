"use client"

import { useRouter } from "next/navigation"
import { Bot, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NoBotSelected() {
  const router = useRouter()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
        <Bot className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Nenhum bot selecionado</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie seu primeiro bot para comecar a usar o painel
        </p>
      </div>
      <Button
        onClick={() => router.push("/bots")}
        className="bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Criar Bot
      </Button>
    </div>
  )
}
