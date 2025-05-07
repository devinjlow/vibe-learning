'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Tabs defaultValue={pathname} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <Link href="/projects" passHref>
                <TabsTrigger value="/projects">Projects</TabsTrigger>
              </Link>
              <Link href="/profile" passHref>
                <TabsTrigger value="/profile">Profile</TabsTrigger>
              </Link>
              <Link href="/settings" passHref>
                <TabsTrigger value="/settings">Settings</TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
} 