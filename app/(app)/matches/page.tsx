"use client"

import useSWR from "swr"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Heart, MessageCircle, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Match {
  id: string
  created_at: string
  clothing_items: {
    title: string
    image_url: string | null
  } | null
  other_user: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

export default function MatchesPage() {
  const { data, isLoading } = useSWR("/api/matches", fetcher)
  const matches: Match[] = data?.matches ?? []

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Matches</h1>
        <p className="text-sm text-muted-foreground">Your liked items and connections</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Heart className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-display text-lg font-semibold text-foreground">No matches yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start swiping to find pieces you love!
            </p>
          </div>
          <Button asChild>
            <Link href="/discover">Go Discover</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match) => (
            <Link key={match.id} href={`/chat/${match.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {match.clothing_items?.image_url ? (
                      <Image
                        src={match.clothing_items.image_url || "/placeholder.svg"}
                        alt={match.clothing_items.title ?? "Item"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Tag className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-display font-semibold text-foreground">
                      {match.clothing_items?.title ?? "Item"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      with {match.other_user?.display_name ?? "Unknown"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
