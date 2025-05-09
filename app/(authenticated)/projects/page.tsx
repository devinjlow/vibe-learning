'use client';

import { useEffect, useState } from "react"
import { ProjectsList } from "@/components/project/projects-list"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Project {
  id: string
  title: string
  description: string
  owner: string
}

type Tab = 'explore' | 'joined'

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('explore')
  const [projects, setProjects] = useState<Project[]>([])
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        // Fetch all projects
        const { data, error } = await supabase
          .from('projects')
          .select('*')

        if (error) {
          console.error('Error fetching projects:', error.message)
          return
        }

        if (data) {
          setProjects(data)
        }

        // Fetch joined projects
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: memberships, error: membershipsError } = await supabase
            .from('project_members')
            .select('project_id')
            .eq('user_id', user.id)
            .eq('status', 'accepted')

          if (membershipsError) {
            console.error('Error fetching memberships:', membershipsError)
            return
          }

          if (memberships && memberships.length > 0) {
            const { data: joinedData, error: joinedError } = await supabase
              .from('projects')
              .select('*')
              .in('id', memberships.map(m => m.project_id))

            if (joinedError) {
              console.error('Error fetching joined projects:', joinedError)
              return
            }

            setJoinedProjects(joinedData || [])
          }
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return <div>Loading projects...</div>
  }

  return (
    <div className="space-y-6">
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('explore')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'explore'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Explore Projects
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'joined'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            My Projects
          </button>
        </div>
      </div>

      {activeTab === 'explore' ? (
        <ProjectsList projects={projects} />
      ) : (
        <div className="space-y-6">
          {joinedProjects.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No Projects Yet</h2>
              <p className="text-muted-foreground">
                You haven't joined any projects yet. Check out the Explore tab to find projects to join!
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">My Projects</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription>By {project.owner}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
} 