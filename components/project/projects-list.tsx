"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateProjectDialog } from "@/components/project/create-project-dialog"
import { ApplyToJoinDialog } from "@/components/project/apply-to-join-dialog"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Project {
  id: string
  title: string
  description: string
  owner: string
}

interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  status: 'pending' | 'accepted' | 'rejected'
}

interface ProjectsListProps {
  projects: Project[]
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [projectMemberships, setProjectMemberships] = useState<Record<string, ProjectMember>>({})
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('ProjectsList - Session:', session)
        setIsAuthenticated(!!session)
        if (session?.user) {
          console.log('ProjectsList - User:', session.user)
          // Fetch all project memberships for the current user
          const { data: memberships, error } = await supabase
            .from('project_members')
            .select('*')
            .eq('user_id', session.user.id)

          if (error) {
            console.error('Error fetching memberships:', error)
            return
          }

          // Convert array to object for easier lookup
          const membershipsMap = memberships.reduce((acc, membership) => {
            acc[membership.project_id] = membership
            return acc
          }, {} as Record<string, ProjectMember>)

          setProjectMemberships(membershipsMap)
        } else {
          console.log('ProjectsList - No user found in session')
        }
      } catch (error) {
        console.error('ProjectsList - Error checking auth:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isAuth = !!session?.user
      setIsAuthenticated(isAuth)
      console.log('ProjectsList - Auth state changed:', event, session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const getButtonContent = (projectId: string) => {
    const membership = projectMemberships[projectId]
    if (!membership) {
      return {
        text: "Apply to Join",
        variant: "default" as const,
        disabled: false
      }
    }
    switch (membership.status) {
      case 'pending':
        return {
          text: "Application Pending",
          variant: "outline" as const,
          disabled: true
        }
      case 'accepted':
        return {
          text: "Already Joined",
          variant: "outline" as const,
          disabled: true
        }
      case 'rejected':
        return {
          text: "Application Rejected",
          variant: "outline" as const,
          disabled: true
        }
      default:
        return {
          text: "Apply to Join",
          variant: "default" as const,
          disabled: false
        }
    }
  }

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
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => {
            const buttonContent = getButtonContent(project.id)
            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>By {project.owner}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </CardContent>
                <CardFooter>
                  {isAuthenticated ? (
                    buttonContent.disabled ? (
                      <Button 
                        className="w-full" 
                        variant={buttonContent.variant}
                        disabled={true}
                      >
                        {buttonContent.text}
                      </Button>
                    ) : (
                      <ApplyToJoinDialog
                        projectId={project.id}
                        trigger={
                          <Button className="w-full">
                            {buttonContent.text}
                          </Button>
                        }
                      />
                    )
                  ) : (
                    <Button className="w-full" variant="outline" asChild>
                      <Link href="/login">Sign in to Apply</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 