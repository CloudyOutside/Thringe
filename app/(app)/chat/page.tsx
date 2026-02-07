"use client"

import useSWR from "swr"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, MessageCircle, Tag } from "lucide-react"
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

export default function ChatListPage() {
  const { data, isLoading } = useSWR("/api/matches", fetcher)
  const matches: Match[] = data?.matches ?? []

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">Chat with your matches</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <MessageCircle className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-display text-lg font-semibold text-foreground">No conversations yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Match with items to start chatting with sellers.
            </p>
          </div>
          <Button asChild>
            <Link href="/discover">Discover Items</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match) => (
            <Link key={match.id} href={`/chat/${match.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                    {match.other_user?.avatar_url ? (
                      <Image
                        src={match.other_user.avatar_url || "/placeholder.svg"}
                        alt={match.other_user.display_name ?? "User"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold text-muted-foreground">
                        {(match.other_user?.display_name ?? "?")[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-foreground">
                      {match.other_user?.display_name ?? "Unknown"}
                    </p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      {match.clothing_items?.title ?? "Item"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
