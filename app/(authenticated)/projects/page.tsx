import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Mock data for projects
const projects = [
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

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Available Projects</h1>
        <Button>Create New Project</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
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