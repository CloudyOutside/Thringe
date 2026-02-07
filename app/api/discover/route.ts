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

  // Get items the user hasn't swiped on, excluding their own items
  const { data: swipedItems } = await supabase
    .from("swipes")
    .select("item_id")
    .eq("swiper_id", user.id)

  const swipedIds = swipedItems?.map((s) => s.item_id) ?? []

  let query = supabase
    .from("clothing_items")
    .select("*, profiles(display_name)")
    .eq("is_active", true)
    .neq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  if (swipedIds.length > 0) {
    query = query.not("id", "in", `(${swipedIds.join(",")})`)
  }

  const { data: items, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: items ?? [] })
}
