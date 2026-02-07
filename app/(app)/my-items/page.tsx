"use client"

import useSWR from "swr"
import { AddItemForm } from "@/components/add-item-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, Trash2, Tag, Ruler, Sparkles } from "lucide-react"
import Image from "next/image"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Item {
  id: string
  title: string
  description: string | null
  size: string | null
  category: string | null
  condition: string | null
  image_url: string | null
  price: number | null
  is_active: boolean
  created_at: string
}

export default function MyItemsPage() {
  const { data, isLoading, mutate } = useSWR("/api/items", fetcher)
  const items: Item[] = data?.items ?? []

  const handleDelete = async (id: string) => {
    await fetch("/api/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    mutate()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Items</h1>
          <p className="text-sm text-muted-foreground">Manage your listed clothing</p>
        </div>
        <AddItemForm onItemAdded={() => mutate()} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Package className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-display text-lg font-semibold text-foreground">No items yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              List your first thrifted find for others to discover.
            </p>
          </div>
          <AddItemForm onItemAdded={() => mutate()} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {item.image_url ? (
                  <Image
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Tag className="h-8 w-8" />
                  </div>
                )}
                {item.category && (
                  <Badge className="absolute left-2 top-2 bg-background/80 text-foreground backdrop-blur-sm">
                    {item.category}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold text-foreground">{item.title}</h3>
                  {item.price !== null && (
                    <span className="shrink-0 font-semibold text-primary">${item.price}</span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {item.size && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Ruler className="h-3 w-3" /> {item.size}
                    </span>
                  )}
                  {item.condition && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" /> {item.condition}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
