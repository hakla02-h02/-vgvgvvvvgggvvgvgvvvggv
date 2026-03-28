"use client"

import { Lock, Heart, Image as ImageIcon, Video, CheckCircle2, Instagram, Globe } from "lucide-react"

type PrivacyPost = {
  id: string
  type: "image" | "video"
  url: string
}

// Tipos que correspondem ao editor conversion-editor
type PrivacyPageData = {
  // Profile
  username: string
  handle: string
  bio: string
  avatar: string
  coverImage: string
  isVerified: boolean
  // Stats
  stats: {
    photos: number
    videos: number
    locked: number
    likes: string
  }
  // Social Links
  socialLinks: {
    instagram?: string
    twitter?: string
    tiktok?: string
  }
  // Subscriptions
  subscriptions: {
    id: string
    name: string
    price: string
    discount?: string
  }[]
  // Posts
  postsCount: number
  mediasCount: number
  posts: PrivacyPost[]
  // CTA
  ctaUrl: string
  // Colors
  colors: {
    background: string
    text: string
    subtext: string
    accent: string
    cardBg: string
  }
}

export function PrivacyPage({ data }: { data: PrivacyPageData }) {
  const colors = data.colors || {
    background: "#fef7f0",
    text: "#1a1a1a",
    subtext: "#666666",
    accent: "#f97316",
    cardBg: "#ffffff"
  }

  const stats = data.stats || { photos: 0, videos: 0, locked: 0, likes: "0" }
  const socialLinks = data.socialLinks || {}
  const subscriptions = data.subscriptions || []

  const handlePlanClick = () => {
    if (data.ctaUrl) {
      window.location.href = data.ctaUrl
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="text-xl font-bold" style={{ color: colors.text }}>
          privacy<span style={{ color: colors.accent }}>.</span>
        </div>
        <Globe className="w-5 h-5" style={{ color: colors.subtext }} />
      </header>

      {/* Cover Image */}
      <div className="relative">
        {data.coverImage ? (
          <div 
            className="w-full h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${data.coverImage})` }}
          />
        ) : (
          <div className="w-full h-32" style={{ backgroundColor: `${colors.accent}20` }} />
        )}
        
        {/* Avatar */}
        <div className="absolute -bottom-10 left-4">
          {data.avatar ? (
            <img 
              src={data.avatar} 
              alt={data.username}
              className="w-20 h-20 rounded-full border-4 object-cover"
              style={{ borderColor: colors.background }}
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold"
              style={{ 
                backgroundColor: colors.cardBg,
                borderColor: colors.background,
                color: colors.subtext
              }}
            >
              {data.username?.charAt(0)?.toUpperCase() || "P"}
            </div>
          )}
        </div>

        {/* Stats on cover */}
        <div className="absolute bottom-2 right-4 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded">
            <ImageIcon className="w-3 h-3" />
            <span>{stats.photos}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded">
            <Video className="w-3 h-3" />
            <span>{stats.videos}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded">
            <Heart className="w-3 h-3" />
            <span>{stats.likes}</span>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-12 px-4">
        <div className="flex items-center gap-1 mb-1">
          <h1 className="text-xl font-bold" style={{ color: colors.text }}>
            {data.username || "SeuNome"}
          </h1>
          {data.isVerified && (
            <CheckCircle2 className="w-5 h-5" style={{ color: colors.accent }} />
          )}
        </div>
        <p className="text-sm mb-2" style={{ color: colors.subtext }}>
          @{data.handle || "seunome"}
        </p>
        {data.bio && (
          <p className="text-sm mb-1" style={{ color: colors.text }}>
            {data.bio.length > 80 ? data.bio.substring(0, 80) + "..." : data.bio}
          </p>
        )}
        {data.bio && data.bio.length > 80 && (
          <button className="text-sm font-medium" style={{ color: colors.accent }}>
            Ler mais
          </button>
        )}

        {/* Social Icons */}
        <div className="flex items-center gap-3 mt-4">
          {socialLinks.instagram && (
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" 
               className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {socialLinks.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
               className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          )}
          {socialLinks.tiktok && (
            <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
               className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Plans Section */}
      <div className="px-4 mt-6">
        <h2 className="font-semibold mb-3" style={{ color: colors.text }}>Assinaturas</h2>
        <div className="flex flex-col gap-2">
          {subscriptions.map((plan, index) => (
            <button
              key={plan.id}
              onClick={handlePlanClick}
              className="w-full py-3 px-4 rounded-xl flex items-center justify-between transition-all hover:scale-[1.01]"
              style={{ 
                background: index === 0 
                  ? `linear-gradient(90deg, ${colors.accent}40 0%, ${colors.accent}20 100%)`
                  : `linear-gradient(90deg, ${colors.accent}20 0%, ${colors.accent}10 100%)`,
                color: colors.text
              }}
            >
              <span className="font-medium">
                {plan.name} {plan.discount && `(${plan.discount})`}
              </span>
              <span className="font-semibold">R$ {plan.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mx-4 mt-6 py-3 px-4 rounded-xl" style={{ backgroundColor: colors.cardBg }}>
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold" style={{ color: colors.accent }}>{data.postsCount || 0}</span>
            <span style={{ color: colors.subtext }}>Postagens</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold" style={{ color: colors.subtext }}>{data.mediasCount || 0}</span>
            <span style={{ color: colors.subtext }}>Midias</span>
          </div>
        </div>
      </div>

      {/* Posts Grid com Blur */}
      <div className="px-4 mt-6 pb-8">
        {(data.posts || []).length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {(data.posts || []).map((post) => (
              <div key={post.id} className="aspect-square relative rounded-md overflow-hidden">
                {post.type === "video" ? (
                  <video src={post.url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={post.url} alt="" className="w-full h-full object-cover" />
                )}
                {/* Blur overlay com cadeado */}
                <div className="absolute inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white/80" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="rounded-xl p-8 flex flex-col items-center justify-center"
            style={{ backgroundColor: `${colors.accent}10` }}
          >
            <Lock className="w-10 h-10 mb-3" style={{ color: colors.subtext }} />
            <p className="text-sm text-center" style={{ color: colors.subtext }}>
              Assine para desbloquear o conteudo exclusivo
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
