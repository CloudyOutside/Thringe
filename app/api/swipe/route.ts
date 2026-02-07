import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { item_id, direction } = await request.json()

  if (!item_id || !direction || !["left", "right"].includes(direction)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  // Record the swipe
  const { error: swipeError } = await supabase.from("swipes").insert({
    swiper_id: user.id,
    item_id,
    direction,
  })

  if (swipeError) {
    return NextResponse.json({ error: swipeError.message }, { status: 500 })
  }

  let match = null

  // If it's a right swipe, check for a match
  if (direction === "right") {
    // Get the item to find the owner
    const { data: item } = await supabase
      .from("clothing_items")
      .select("user_id")
      .eq("id", item_id)
      .single()

    if (item) {
      // Create a match record
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .insert({
          item_id,
          liker_id: user.id,
          owner_id: item.user_id,
        })
        .select("*, clothing_items(title, image_url), profiles!matches_owner_id_fkey(display_name)")
        .single()

      if (!matchError && matchData) {
        match = matchData
      }
    }
  }

  return NextResponse.json({ success: true, match })
}
