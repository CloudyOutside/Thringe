"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  profiles: {
    display_name: string | null
  } | null
}

export default function ChatRoomPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const { data, isLoading, mutate } = useSWR(
    `/api/messages/${matchId}`,
    fetcher,
    { refreshInterval: 3000 }
  )

  const messages: Message[] = data?.messages ?? []
  const userId = data?.userId
  const match = data?.match

  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const content = newMessage
    setNewMessage("")

    try {
      await fetch(`/api/messages/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      mutate()
    } catch {
      setNewMessage(content)
    } finally {
      setIsSending(false)
    }
  }

  // Determine other user name from the match
  let otherName = "Chat"
  if (match && userId) {
    otherName =
      match.liker_id === userId
        ? "Seller"
        : "Buyer"
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-[calc(100svh-64px)] max-w-2xl flex-col md:h-[calc(100svh-57px)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/chat">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <p className="font-display font-semibold text-foreground">{otherName}</p>
          <p className="text-xs text-muted-foreground">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-display text-lg font-semibold text-foreground">Start the conversation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Say hi and discuss the item details!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => {
              const isOwn = msg.sender_id === userId
              return (
                <div
                  key={msg.id}
                  className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2",
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-border bg-card p-4"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  )
}
