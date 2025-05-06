import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for user's projects and tasks
const userProjects = [
  {
    id: 1,
    title: "AI-Powered Code Review System",
    role: "Lead Developer",
    tasks: [
      { id: 1, title: "Implement ML model for code analysis", status: "In Progress" },
      { id: 2, title: "Design API endpoints", status: "Completed" },
    ],
  },
  {
    id: 2,
    title: "Real-time Collaboration Platform",
    role: "Backend Developer",
    tasks: [
      { id: 1, title: "Set up WebSocket server", status: "To Do" },
      { id: 2, title: "Implement real-time sync", status: "In Progress" },
    ],
  },
]

export default function Profile() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src="/placeholder-avatar.jpg" alt="User avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">John Doe</h1>
          <p className="text-muted-foreground">Full Stack Developer</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">My Projects</h2>
        <div className="grid gap-6">
          {userProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>Role: {project.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-medium">Tasks</h3>
                  <div className="space-y-2">
                    {project.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <span>{task.title}</span>
                        <span className="text-sm text-muted-foreground">{task.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 