'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Mock data for projects preview
const previewProjects = [
  {
    id: 1,
    title: "AI-Powered Code Review System",
    description: "Building an intelligent system that helps review code and suggest improvements using machine learning.",
    owner: "Sarah Chen",
  },
  {
    id: 2,
    title: "Real-time Collaboration Platform",
    description: "A platform that enables real-time code editing and collaboration between team members.",
    owner: "Mike Johnson",
  },
  {
    id: 3,
    title: "Cloud Infrastructure Automation",
    description: "Automating cloud infrastructure deployment and management using Infrastructure as Code.",
    owner: "Alex Rodriguez",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center relative">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold animate-fade-in">
            VIBE CODING
          </h1>
          <p className="text-2xl text-muted-foreground animate-fade-in-delay">
            AI Powered Engineering Community
          </p>
        </div>
        <div className="absolute bottom-10 animate-bounce">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Discover Amazing Projects</h2>
            <p className="text-xl text-muted-foreground">
              Join a community of engineers building the future
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>By {project.owner}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">View Project</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to start your learning journey?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join our community of learners and start building your future today.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
