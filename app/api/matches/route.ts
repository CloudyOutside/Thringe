import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get matches where the user is either the liker or the owner
  const { data: matches, error } = await supabase
    .from("matches")
    .select(`
      *,
      clothing_items(title, image_url),
      liker:profiles!matches_liker_id_fkey(id, display_name, avatar_url),
      owner:profiles!matches_owner_id_fkey(id, display_name, avatar_url)
    `)
    .or(`liker_id.eq.${user.id},owner_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Annotate each match with the "other" person
  const annotated = (matches ?? []).map((m) => ({
    ...m,
    other_user: m.liker_id === user.id ? m.owner : m.liker,
  }))

  return NextResponse.json({ matches: annotated })
}
