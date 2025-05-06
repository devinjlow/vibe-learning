"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="mr-8 flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">VIBE</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Projects
            </Link>
            <Link
              href="/profile"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/profile"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Profile
            </Link>
            <Link
              href="/settings"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/settings"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
} 