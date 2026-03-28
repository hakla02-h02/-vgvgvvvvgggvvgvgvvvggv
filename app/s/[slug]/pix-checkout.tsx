"use client"

import { useState, useEffect } from "react"
import { Copy, Check, QrCode, Loader2 } from "lucide-react"

type PixCheckoutData = {
  accessToken?: string
  headline?: string
  description?: string
  price?: string
  pixKey?: string
  backgroundType?: "color" | "image"
  backgroundColor?: string
  backgroundImage?: string
  textColor?: string
  accentColor?: string
  buttonColor?: string
  buttonTextColor?: string
}

export function PixCheckout({ data }: { data: Partial<PixCheckoutData> }) {
  const [pixCode, setPixCode] = useState("")
  const [qrCodeBase64, setQrCodeBase64] = useState("")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  // Valores default
  const headline = data.headline || "Pagamento via PIX"
  const description = data.description || "Escaneie o QR Code ou copie o codigo PIX"
  const price = data.price || "0,00"
  const pixKey = data.pixKey || ""
  const bgType = data.backgroundType || "color"
  const bgColor = data.backgroundColor || "#0f172a"
  const bgImage = data.backgroundImage || ""
  const textColor = data.textColor || "#ffffff"
  const accentColor = data.accentColor || "#22c55e"
  const buttonColor = data.buttonColor || "#22c55e"
  const buttonTextColor = data.buttonTextColor || "#ffffff"

  useEffect(() => {
    generatePix()
  }, [])

  const generatePix = async () => {
    try {
      setLoading(true)
      setError("")

      // Se tem access token, tenta gerar via Mercado Pago
      if (data.accessToken) {
        const priceNumber = parseFloat(price.replace(",", "."))
        
        const res = await fetch("/api/mercadopago/pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: data.accessToken,
            amount: priceNumber,
            description: headline,
          }),
        })

        if (res.ok) {
          const result = await res.json()
          if (result.qrCode && result.qrCodeBase64) {
            setPixCode(result.qrCode)
            setQrCodeBase64(result.qrCodeBase64)
            setLoading(false)
            return
          }
        }
      }

      // Fallback: usa chave PIX manual
      if (pixKey) {
        setPixCode(pixKey)
        setLoading(false)
        return
      }

      setError("Configure o Mercado Pago ou uma chave PIX")
      setLoading(false)
    } catch (err) {
      console.error("Erro ao gerar PIX:", err)
      setError("Erro ao gerar codigo PIX")
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center"
      style={{ 
        backgroundColor: bgType === "color" ? bgColor : "#0f172a",
        backgroundImage: bgType === "image" && bgImage ? `url(${bgImage})` : undefined
      }}
    >
      {/* Overlay para imagem de fundo */}
      {bgType === "image" && bgImage && (
        <div className="absolute inset-0 bg-black/50" />
      )}

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Headline */}
        <h1 
          className="text-2xl font-bold text-center mb-2"
          style={{ color: textColor }}
        >
          {headline}
        </h1>
        
        <p 
          className="text-sm text-center mb-6 opacity-80"
          style={{ color: textColor }}
        >
          {description}
        </p>

        {/* Price */}
        <div 
          className="text-4xl font-bold mb-8"
          style={{ color: accentColor }}
        >
          R$ {price}
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-xl">
          {loading ? (
            <div className="w-48 h-48 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="w-48 h-48 flex items-center justify-center">
              <p className="text-sm text-red-500 text-center">{error}</p>
            </div>
          ) : qrCodeBase64 ? (
            <img 
              src={`data:image/png;base64,${qrCodeBase64}`} 
              alt="QR Code PIX"
              className="w-48 h-48"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
              <QrCode className="w-20 h-20 text-gray-400" />
            </div>
          )}
        </div>

        {/* Copy Button */}
        {pixCode && !error && (
          <button
            onClick={copyToClipboard}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ 
              backgroundColor: buttonColor,
              color: buttonTextColor
            }}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copiar codigo PIX
              </>
            )}
          </button>
        )}

        {/* Status */}
        <p 
          className="text-xs text-center mt-6 opacity-60"
          style={{ color: textColor }}
        >
          Aguardando confirmacao do pagamento...
        </p>

        {/* PIX Code Display (truncated) */}
        {pixCode && !error && (
          <div 
            className="mt-4 p-3 rounded-lg bg-black/20 w-full"
            onClick={copyToClipboard}
          >
            <p 
              className="text-[10px] font-mono text-center break-all opacity-60 line-clamp-2"
              style={{ color: textColor }}
            >
              {pixCode}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
