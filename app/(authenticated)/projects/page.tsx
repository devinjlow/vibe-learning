'use client';

import { useEffect, useState, useRef } from "react"
import { ProjectsList } from "@/components/project/projects-list"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateProjectDialog } from "@/components/project/create-project-dialog"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  user_id: string
  platforms?: string[]
  tech_stack?: string[]
  timeline?: string
  team_size?: string
  status?: string
  created_at?: string
  updated_at?: string
}

interface UserEmailMap {
  [userId: string]: string
}

type Tab = 'explore' | 'joined'

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('explore')
  const [projects, setProjects] = useState<Project[]>([])
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([])
  const [userEmails, setUserEmails] = useState<UserEmailMap>({})
  const [loading, setLoading] = useState(true)
  const fetchProjectsRef = useRef<() => Promise<void>>(() => Promise.resolve())
  const supabase = createClientComponentClient()

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
            .select('project_id, status')
            .eq('user_id', user.id)
            .eq('status', 'accepted')

          if (membershipsError) {
            console.error('Error fetching memberships:', membershipsError)
            return
          }

          if (memberships && memberships.length > 0) {
            const projectIds = memberships.map(m => m.project_id)
            const { data: joinedData, error: joinedError } = await supabase
              .from('projects')
              .select('*')
              .in('id', projectIds)

            if (joinedError) {
              console.error('Error fetching joined projects:', joinedError)
              return
            }

            setJoinedProjects(joinedData || [])
            // Collect all user_ids from both lists for email lookup
            const allUserIds = Array.from(new Set([
              ...data.map((p: Project) => p.user_id),
              ...(joinedData || []).map((p: Project) => p.user_id)
            ]))
            if (allUserIds.length > 0) {
              // Fetch emails from auth.users
              const { data: usersData, error: usersError } = await supabase
                .from('auth.users')
                .select('id, email')
                .in('id', allUserIds)
              if (!usersError && usersData) {
                const emailMap: UserEmailMap = {}
                usersData.forEach((u: any) => {
                  emailMap[u.id] = u.email
                })
                setUserEmails(emailMap)
              }
            }
          } else {
            setJoinedProjects([])
          }
        } else {
          setJoinedProjects([])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectsRef.current = fetchProjects
    fetchProjects()
  }, [])

  const handleProjectCreated = () => {
    setLoading(true)
    fetchProjectsRef.current()
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-8">
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
        <ProjectsList 
          projects={projects.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description,
            platforms: project.platforms,
            tech_stack: project.tech_stack
          }))} 
        />
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
              <div className="grid grid-cols-1 gap-6">
                {joinedProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <CardTitle>{project.title}</CardTitle>
                          <span className="text-muted-foreground text-sm">
                            {project.platforms?.join(', ')} - {project.tech_stack?.join(', ')}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
} 