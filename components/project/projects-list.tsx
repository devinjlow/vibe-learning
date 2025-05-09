"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateProjectDialog } from "@/components/project/create-project-dialog"
import { supabase } from "@/lib/supabase"

interface Project {
  id: string
  title: string
  description: string
  owner: string
}

interface ProjectsListProps {
  projects: Project[]
}

// Import the shared auth state
declare const authState: {
  isAuthenticated: boolean
  isLoading: boolean
  listeners: Set<(isAuthenticated: boolean) => void>
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(authState.isAuthenticated)
  const [isLoading, setIsLoading] = useState(authState.isLoading)

  useEffect(() => {
    // Add this component as a listener
    authState.listeners.add(setIsAuthenticated)
    setIsLoading(authState.isLoading)

    return () => {
      authState.listeners.delete(setIsAuthenticated)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Available Projects</h1>
        {!isLoading && isAuthenticated && (
          <CreateProjectDialog
            trigger={
              <Button>Create New Project</Button>
            }
          />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>By {project.owner}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Apply to Join</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 