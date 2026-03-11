import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

// GET - Buscar site específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { data: site, error } = await supabase
      .from("dragon_bio_sites")
      .select(`
        *,
        dragon_bio_links (*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    // Ordenar links pelo order_index
    if (site?.dragon_bio_links) {
      site.dragon_bio_links.sort((a: any, b: any) => a.order_index - b.order_index)
    }

    return NextResponse.json({ site })
  } catch (error: any) {
    console.error("Erro ao buscar site:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar site
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { template, profile_name, profile_bio, profile_image, colors, links, published } = body

    const supabase = getSupabase()

    // Atualizar site
    const updateData: any = { updated_at: new Date().toISOString() }
    if (template !== undefined) updateData.template = template
    if (profile_name !== undefined) updateData.profile_name = profile_name
    if (profile_bio !== undefined) updateData.profile_bio = profile_bio
    if (profile_image !== undefined) updateData.profile_image = profile_image
    if (colors !== undefined) updateData.colors = colors
    if (published !== undefined) updateData.published = published

    const { data: site, error: siteError } = await supabase
      .from("dragon_bio_sites")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (siteError) throw siteError

    // Atualizar links se fornecidos
    if (links !== undefined) {
      // Deletar links antigos
      await supabase.from("dragon_bio_links").delete().eq("site_id", id)

      // Inserir novos links
      if (links.length > 0) {
        const linksToInsert = links.map((link: any, index: number) => ({
          site_id: id,
          title: link.title,
          url: link.url,
          order_index: index
        }))

        const { error: linksError } = await supabase
          .from("dragon_bio_links")
          .insert(linksToInsert)

        if (linksError) throw linksError
      }
    }

    // Buscar site atualizado com links
    const { data: updatedSite } = await supabase
      .from("dragon_bio_sites")
      .select(`
        *,
        dragon_bio_links (*)
      `)
      .eq("id", id)
      .single()

    return NextResponse.json({ site: updatedSite })
  } catch (error: any) {
    console.error("Erro ao atualizar site:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
