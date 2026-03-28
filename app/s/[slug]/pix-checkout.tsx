"use client"

import { useState, useEffect } from "react"
import { Copy, Check, QrCode, Loader2, Shield, ChevronRight } from "lucide-react"

type CheckoutFormFields = {
  showName?: boolean
  showEmail?: boolean
  showEmailConfirm?: boolean
  showCpf?: boolean
  showPhone?: boolean
}

type CheckoutData = {
  checkoutType?: "direct" | "form"
  accessToken?: string
  headline?: string
  description?: string
  price?: string
  pixKey?: string
  formFields?: CheckoutFormFields
  formButtonText?: string
  backgroundType?: "color" | "image" | "gradient"
  backgroundColor?: string
  backgroundGradient?: string
  backgroundImage?: string
  cardColor?: string
  textColor?: string
  accentColor?: string
  buttonColor?: string
  buttonTextColor?: string
}

export function PixCheckout({ data }: { data: Partial<CheckoutData> }) {
  const [pixCode, setPixCode] = useState("")
  const [qrCodeBase64, setQrCodeBase64] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")
  const [showPix, setShowPix] = useState(data.checkoutType !== "form")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    emailConfirm: "",
    cpf: "",
    phone: "",
  })

  // Valores default
  const checkoutType = data.checkoutType || "direct"
  const headline = data.headline || "Finalizar Pagamento"
  const description = data.description || "Escaneie o QR Code ou copie o codigo PIX"
  const price = data.price || "0,00"
  const pixKey = data.pixKey || ""
  const formFields = data.formFields || { showName: true, showEmail: true, showCpf: true }
  const formButtonText = data.formButtonText || "Gerar PIX"
  const bgType = data.backgroundType || "gradient"
  const bgColor = data.backgroundColor || "#0f172a"
  const bgGradient = data.backgroundGradient || "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
  const bgImage = data.backgroundImage || ""
  const cardColor = data.cardColor || "#ffffff"
  const textColor = data.textColor || "#1e293b"
  const accentColor = data.accentColor || "#10b981"
  const buttonColor = data.buttonColor || "#10b981"
  const buttonTextColor = data.buttonTextColor || "#ffffff"

  useEffect(() => {
    // Se checkout direto, gera PIX automaticamente
    if (checkoutType === "direct") {
      generatePix()
    }
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
            payer: checkoutType === "form" ? formData : undefined,
          }),
        })

        if (res.ok) {
          const result = await res.json()
          if (result.qrCode && result.qrCodeBase64) {
            setPixCode(result.qrCode)
            setQrCodeBase64(result.qrCodeBase64)
            setShowPix(true)
            setLoading(false)
            return
          }
        }
      }

      // Fallback: usa chave PIX manual
      if (pixKey) {
        setPixCode(pixKey)
        setShowPix(true)
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generatePix()
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

  const getBackground = () => {
    if (bgType === "gradient") return bgGradient
    if (bgType === "image" && bgImage) return `url(${bgImage}) center/cover`
    return bgColor
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-5"
      style={{ background: getBackground() }}
    >
      {/* Overlay para imagem de fundo */}
      {bgType === "image" && bgImage && (
        <div className="fixed inset-0 bg-black/50 z-0" />
      )}

      <div className="relative z-10 w-full max-w-sm">
        {/* Card Principal */}
        <div 
          className="rounded-3xl p-6 shadow-2xl"
          style={{ backgroundColor: cardColor }}
        >
          {/* Mostra Formulario OU PIX */}
          {!showPix && checkoutType === "form" ? (
            /* Formulario */
            <form onSubmit={handleFormSubmit}>
              {/* Header */}
              <div className="text-center mb-6">
                <h1 
                  className="text-xl font-bold mb-1"
                  style={{ color: textColor }}
                >
                  {headline}
                </h1>
                <div 
                  className="text-3xl font-bold"
                  style={{ color: accentColor }}
                >
                  R$ {price}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {formFields.showName && (
                  <div>
                    <label 
                      className="text-xs font-medium uppercase tracking-wide mb-1.5 block opacity-60"
                      style={{ color: textColor }}
                    >
                      Nome completo
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                      placeholder="Seu nome"
                    />
                  </div>
                )}

                {formFields.showEmail && (
                  <div>
                    <label 
                      className="text-xs font-medium uppercase tracking-wide mb-1.5 block opacity-60"
                      style={{ color: textColor }}
                    >
                      E-mail
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                      placeholder="seu@email.com"
                    />
                  </div>
                )}

                {formFields.showEmail && formFields.showEmailConfirm && (
                  <div>
                    <label 
                      className="text-xs font-medium uppercase tracking-wide mb-1.5 block opacity-60"
                      style={{ color: textColor }}
                    >
                      Confirmar e-mail
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.emailConfirm}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailConfirm: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                      placeholder="Confirme seu e-mail"
                    />
                  </div>
                )}

                {formFields.showCpf && (
                  <div>
                    <label 
                      className="text-xs font-medium uppercase tracking-wide mb-1.5 block opacity-60"
                      style={{ color: textColor }}
                    >
                      CPF
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cpf}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                      placeholder="000.000.000-00"
                    />
                  </div>
                )}

                {formFields.showPhone && (
                  <div>
                    <label 
                      className="text-xs font-medium uppercase tracking-wide mb-1.5 block opacity-60"
                      style={{ color: textColor }}
                    >
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 disabled:opacity-50"
                style={{ 
                  backgroundColor: buttonColor,
                  color: buttonTextColor
                }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {formButtonText}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* QR Code PIX */
            <>
              {/* Header */}
              <div className="text-center mb-5">
                <h1 
                  className="text-lg font-bold mb-1"
                  style={{ color: textColor }}
                >
                  {checkoutType === "form" ? "Pague com PIX" : headline}
                </h1>
                <p 
                  className="text-xs opacity-60"
                  style={{ color: textColor }}
                >
                  {description}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-5">
                <span className="text-xs opacity-50" style={{ color: textColor }}>Valor</span>
                <div 
                  className="text-3xl font-bold"
                  style={{ color: accentColor }}
                >
                  R$ {price}
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-2xl p-4 mx-auto w-fit mb-5 shadow-sm border border-gray-100">
                {loading ? (
                  <div className="w-44 h-44 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="w-44 h-44 flex items-center justify-center">
                    <p className="text-sm text-red-500 text-center px-4">{error}</p>
                  </div>
                ) : qrCodeBase64 ? (
                  <img 
                    src={`data:image/png;base64,${qrCodeBase64}`} 
                    alt="QR Code PIX"
                    className="w-44 h-44"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl">
                    <QrCode className="w-20 h-20 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Copy Button */}
              {pixCode && !error && (
                <button
                  onClick={copyToClipboard}
                  className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
                  style={{ 
                    backgroundColor: buttonColor,
                    color: buttonTextColor
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar codigo PIX
                    </>
                  )}
                </button>
              )}

              {/* Timer */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs opacity-50" style={{ color: textColor }}>
                  Expira em 30:00
                </span>
              </div>

              {/* PIX Code Display */}
              {pixCode && !error && (
                <div 
                  className="mt-4 p-3 rounded-xl bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={copyToClipboard}
                >
                  <p className="text-[9px] font-mono text-center break-all opacity-50 line-clamp-2" style={{ color: textColor }}>
                    {pixCode}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Security Badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-white/50" />
          <span className="text-[11px] text-white/50">Pagamento 100% seguro</span>
        </div>
      </div>
    </div>
  )
}
