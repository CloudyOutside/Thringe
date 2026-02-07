import React from "react"
import { AppNav } from "@/components/app-nav"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <AppNav />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  )
}
