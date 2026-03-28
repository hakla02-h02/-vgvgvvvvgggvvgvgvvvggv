"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

type RedirectData = {
  redirectUrl: string
  delay: number
  message: string
  fallbackText: string
}

export function PresellRedirect({ data }: { data: RedirectData }) {
  const [countdown, setCountdown] = useState(data.delay || 2)

  useEffect(() => {
    if (countdown <= 0 && data.redirectUrl) {
      window.location.href = data.redirectUrl
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, data.redirectUrl])

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: "#0088cc" }}
    >
      <div className="text-center max-w-[90%]">
        {/* Circulo com logo do Telegram */}
        <div 
          className="w-[120px] h-[120px] rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"
          style={{ background: "linear-gradient(180deg, #24A1DE 0%, #1c82b1 100%)" }}
        >
          <Image 
            src="/telegram-white.png" 
            alt="Telegram" 
            width={60} 
            height={60}
            className="object-contain"
          />
        </div>

        {/* Spinner de Loading */}
        <div className="w-[45px] h-[45px] border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6" />

        {/* Texto Principal */}
        <div className="text-white text-2xl font-medium mb-5">
          {data.message || "Redirecionando..."}
        </div>

        {/* Link Manual */}
        <a 
          href={data.redirectUrl || "#"}
          className="text-white underline text-base opacity-90 hover:opacity-100 transition-opacity"
        >
          {data.fallbackText || "Clique aqui se nao for redirecionado"}
        </a>
      </div>
    </div>
  )
}
