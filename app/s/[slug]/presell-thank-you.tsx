"use client"

type ThankYouData = {
  headline: string
  description: string
  buttonText: string
  buttonUrl: string
  showFooter: boolean
  footerText: string
  footerLinkText: string
  footerLinkUrl: string
  background: {
    type: "color" | "image"
    color: string
    gradientFrom: string
    gradientTo: string
  }
  buttonColor: string
}

export function PresellThankYou({ data }: { data: ThankYouData }) {
  const gradientFrom = data.background?.gradientFrom || "#f8fafc"
  const gradientTo = data.background?.gradientTo || "#e2e8f0"
  const buttonColor = data.buttonColor || "#2563eb"

  const handleClick = () => {
    if (data.buttonUrl) {
      window.location.href = data.buttonUrl
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ 
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
      }}
    >
      <div className="w-full max-w-lg text-center">
        {/* Icone de Check */}
        <div className="mb-8">
          <div 
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg"
            style={{ backgroundColor: buttonColor }}
          >
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {data.headline || "Muito Obrigado!"}
        </h1>

        {/* Descricao */}
        <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-md mx-auto">
          {data.description || "Sua acao foi concluida com sucesso."}
        </p>

        {/* Botao Principal */}
        {data.buttonText && (
          <button
            onClick={handleClick}
            className="px-8 py-4 text-white font-semibold text-lg rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            style={{ backgroundColor: buttonColor }}
          >
            {data.buttonText}
          </button>
        )}

        {/* Rodape */}
        {data.showFooter !== false && data.footerText && (
          <div className="mt-12 text-gray-500 text-sm">
            <span>{data.footerText} </span>
            {data.footerLinkText && (
              <a 
                href={data.footerLinkUrl || "#"}
                className="underline hover:text-gray-700 transition-colors"
                style={{ color: buttonColor }}
              >
                {data.footerLinkText}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
