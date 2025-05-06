import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vibe Learning - Project Collaboration",
  description: "A platform for engineers to collaborate on projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <Tabs defaultValue="home" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <Link href="/" passHref>
                    <TabsTrigger value="home">Home</TabsTrigger>
                  </Link>
                  <Link href="/profile" passHref>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                  </Link>
                  <Link href="/settings" passHref>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </Link>
                </TabsList>
              </Tabs>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
