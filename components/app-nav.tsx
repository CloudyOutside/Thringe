"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Compass, Plus, Heart, MessageCircle, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/my-items", label: "My Items", icon: Plus },
  { href: "/matches", label: "Matches", icon: Heart },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
]

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <>
      {/* Desktop top nav */}
      <header className="sticky top-0 z-50 hidden border-b border-border bg-background/80 backdrop-blur-md md:block">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/discover" className="font-display text-xl font-bold tracking-tight text-foreground">
            Thrin<span className="text-primary">Ge</span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                    <span className={cn(isActive && "text-primary font-medium")}>{item.label}</span>
                  </Link>
                </Button>
              )
            })}
            <div className="ml-2 h-6 w-px bg-border" />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </nav>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-xs",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
