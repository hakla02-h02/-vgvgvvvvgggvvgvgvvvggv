import { getSupabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = getSupabase()
  
  const { data: site } = await supabase
    .from("dragon_bio_sites")
    .select("profile_name, profile_bio")
    .eq("slug", slug)
    .single()

  if (!site) {
    return { title: "Site não encontrado" }
  }

  return {
    title: site.profile_name,
    description: site.profile_bio,
  }
}

export default async function DragonBioPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = getSupabase()

  // Buscar site
  const { data: site, error } = await supabase
    .from("dragon_bio_sites")
    .select(`
      *,
      dragon_bio_links (*)
    `)
    .eq("slug", slug)
    .single()

  if (error || !site) {
    notFound()
  }

  // Ordenar links
  const links = (site.dragon_bio_links || []).sort((a: any, b: any) => a.order_index - b.order_index)
  const colors = site.colors || {
    primary: "#000000",
    secondary: "#ffffff",
    accent: "#3b82f6",
    background: "#0f172a",
    text: "#ffffff"
  }

  // Renderizar baseado no template
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start pt-16 pb-8 px-4"
      style={{ 
        background: site.template === "gradient" 
          ? `linear-gradient(135deg, ${colors.background} 0%, ${colors.accent} 100%)`
          : site.template === "glass"
          ? `linear-gradient(180deg, ${colors.background} 0%, ${colors.primary} 100%)`
          : colors.background
      }}
    >
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8">
        {site.profile_image ? (
          <img 
            src={site.profile_image} 
            alt={site.profile_name}
            className="w-24 h-24 rounded-full object-cover mb-4 border-2"
            style={{ borderColor: colors.accent }}
          />
        ) : (
          <div 
            className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl font-bold"
            style={{ 
              backgroundColor: colors.secondary,
              color: colors.background
            }}
          >
            {site.profile_name?.charAt(0)?.toUpperCase() || "D"}
          </div>
        )}
        
        <h1 
          className="text-xl font-bold mb-1"
          style={{ color: colors.text }}
        >
          {site.profile_name}
        </h1>
        
        {site.profile_bio && (
          <p 
            className="text-sm opacity-80 text-center max-w-xs"
            style={{ color: colors.text }}
          >
            {site.profile_bio}
          </p>
        )}
      </div>

      {/* Links Section */}
      <div className="w-full max-w-md space-y-3">
        {links.map((link: any) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              block w-full py-4 px-6 text-center font-medium rounded-xl
              transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
              ${site.template === "glass" ? "backdrop-blur-md bg-white/10 border border-white/20" : ""}
            `}
            style={{ 
              backgroundColor: site.template === "glass" ? "rgba(255,255,255,0.1)" : colors.secondary,
              color: site.template === "glass" ? colors.text : colors.background,
              borderRadius: site.template === "minimal" ? "9999px" : "12px"
            }}
          >
            {link.title}
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8">
        <p 
          className="text-xs opacity-50"
          style={{ color: colors.text }}
        >
          dragon.bio
        </p>
      </div>
    </div>
  )
}
