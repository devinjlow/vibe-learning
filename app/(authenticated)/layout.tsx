import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vibe Learning",
  description: "Learn and grow with Vibe Learning",
};

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={`relative min-h-screen flex flex-col ${inter.className} container mx-auto`}>
      {children}
      <Toaster />
    </div>
  );
} 