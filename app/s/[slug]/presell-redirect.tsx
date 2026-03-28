"use client"

import { useEffect, useState } from "react"

type RedirectData = {
  redirectUrl: string
  delay: number
  message: string
}

export function PresellRedirect({ data }: { data: RedirectData }) {
  const [countdown, setCountdown] = useState(data.delay || 3)

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md text-center">
        {/* Spinner */}
        <div className="mb-8">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>

        {/* Mensagem */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          {data.message || "Redirecionando..."}
        </h1>

        {/* Countdown */}
        {data.delay > 0 && (
          <p className="text-gray-500">
            Voce sera redirecionado em <span className="font-bold text-blue-500">{countdown}</span> segundos
          </p>
        )}
      </div>
    </div>
  )
}
