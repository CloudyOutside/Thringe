"use client"

import React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { X, Heart, Tag, Ruler, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ClothingItem {
  id: string
  title: string
  description: string | null
  size: string | null
  category: string | null
  condition: string | null
  image_url: string | null
  price: number | null
  profiles: {
    display_name: string | null
  } | null
}

interface SwipeCardProps {
  item: ClothingItem
  onSwipe: (direction: "left" | "right") => void
  isTop: boolean
}

export function SwipeCard({ item, onSwipe, isTop }: SwipeCardProps) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTop) return
    setIsDragging(true)
    startX.current = e.clientX
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    setDragX(e.clientX - startX.current)
  }

  const handlePointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)

    if (dragX > 100) {
      onSwipe("right")
    } else if (dragX < -100) {
      onSwipe("left")
    }
    setDragX(0)
  }

  const rotation = dragX * 0.1
  const opacity = Math.max(0, 1 - Math.abs(dragX) / 300)

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute inset-0 cursor-grab select-none overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-transform",
        isDragging ? "cursor-grabbing" : "transition-all duration-300",
        !isTop && "scale-95 opacity-60"
      )}
      style={
        isTop
          ? {
              transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
              opacity,
            }
          : undefined
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Swipe indicators */}
      {isTop && dragX > 50 && (
        <div className="absolute left-6 top-6 z-10 rounded-lg border-2 border-primary bg-primary/20 px-4 py-2 font-display text-lg font-bold text-primary">
          LIKE
        </div>
      )}
      {isTop && dragX < -50 && (
        <div className="absolute right-6 top-6 z-10 rounded-lg border-2 border-destructive bg-destructive/20 px-4 py-2 font-display text-lg font-bold text-destructive">
          PASS
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[3/4] w-full bg-muted">
        {item.image_url ? (
          <Image
            src={item.image_url || "/placeholder.svg"}
            alt={item.title}
            fill
            className="object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Tag className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-card/95 via-card/60 to-transparent p-5">
          <h2 className="font-display text-xl font-bold text-card-foreground">{item.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {item.price !== null && (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
                ${item.price}
              </span>
            )}
            {item.size && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Ruler className="h-3 w-3" />
                {item.size}
              </span>
            )}
            {item.condition && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                {item.condition}
              </span>
            )}
          </div>
          {item.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          )}
          {item.profiles?.display_name && (
            <p className="mt-1 text-xs text-muted-foreground">
              Listed by {item.profiles.display_name}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {isTop && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-6 bg-card p-4">
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-14 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              onSwipe("left")
            }}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Pass</span>
          </Button>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation()
              onSwipe("right")
            }}
          >
            <Heart className="h-6 w-6" />
            <span className="sr-only">Like</span>
          </Button>
        </div>
      )}
    </div>
  )
}
