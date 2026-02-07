"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { SwipeCard, type ClothingItem } from "@/components/swipe-card"
import { Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DiscoverPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/discover", fetcher)
  const [swiped, setSwiped] = useState<string[]>([])
  const [matchInfo, setMatchInfo] = useState<{
    itemTitle: string
    ownerName: string
    matchId: string
  } | null>(null)

  const items: ClothingItem[] = data?.items ?? []
  const visibleItems = items.filter((item) => !swiped.includes(item.id))

  const handleSwipe = useCallback(
    async (itemId: string, direction: "left" | "right") => {
      setSwiped((prev) => [...prev, itemId])

      try {
        const res = await fetch("/api/swipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: itemId, direction }),
        })
        const result = await res.json()

        if (result.match) {
          setMatchInfo({
            itemTitle: result.match.clothing_items?.title ?? "an item",
            ownerName: result.match.profiles?.display_name ?? "someone",
            matchId: result.match.id,
          })
        }
      } catch {
        // Silently handle - swipe is already reflected in UI
      }
    },
    []
  )

  const handleRefresh = () => {
    setSwiped([])
    mutate()
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">Something went wrong loading items.</p>
        <Button variant="outline" onClick={() => mutate()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Discover</h1>
          <p className="text-sm text-muted-foreground">Swipe right to like, left to pass</p>
        </div>

        {visibleItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-12 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-display text-lg font-semibold text-foreground">
                {"You've seen everything!"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back later for new items, or list your own.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button asChild>
                <Link href="/my-items">List an Item</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm">
            {visibleItems
              .slice(0, 2)
              .reverse()
              .map((item, idx) => (
                <SwipeCard
                  key={item.id}
                  item={item}
                  isTop={idx === visibleItems.slice(0, 2).length - 1}
                  onSwipe={(dir) => handleSwipe(item.id, dir)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Match Dialog */}
      <Dialog open={!!matchInfo} onOpenChange={() => setMatchInfo(null)}>
        <DialogContent className="text-center sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-primary">
              {"It's a Match!"}
            </DialogTitle>
            <DialogDescription>
              You liked <span className="font-semibold">{matchInfo?.itemTitle}</span> from{" "}
              <span className="font-semibold">{matchInfo?.ownerName}</span>. Start a conversation!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button asChild>
              <Link href={`/chat/${matchInfo?.matchId}`}>Send a Message</Link>
            </Button>
            <Button variant="outline" onClick={() => setMatchInfo(null)}>
              Keep Swiping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
