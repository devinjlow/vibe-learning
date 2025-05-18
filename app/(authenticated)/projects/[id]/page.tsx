"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Calendar, Clock, Tag, Link as LinkIcon, MessageSquare, Pencil, Trash2, MoreVertical, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Project {
  id: string
  title: string
  description: string
  platforms?: string[]
  tech_stack?: string[]
  timeline?: string
  team_size?: string
  status?: string
  created_at?: string
  updated_at?: string
  user_id: string
}

interface Task {
  id: string
  project_id: string
  title: string
  description: string
  type: 'Task' | 'Bug' | 'Feature'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  assignee_id?: string
  due_date?: string
  status: 'To Do' | 'In Progress' | 'Done'
  estimate?: string
  labels?: string[]
  created_at: string
  updated_at: string
}

interface ProjectMember {
  id: string
  user_id: string
  email: string
  role: string
}

interface ProjectMemberWithUser {
  id: string
  user_id: string
  users: {
    email: string
  }
}

interface TaskComment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  user_name: string
}

interface RawTaskComment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  user: {
    email: string
  } | null
}

export default function ProjectDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [filters, setFilters] = useState({
    assignee: 'all',
    priority: 'all',
    type: 'all'
  })
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)
  const [isEditingTask, setIsEditingTask] = useState(false)
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})
  const [newComment, setNewComment] = useState('')
  const [taskComments, setTaskComments] = useState<TaskComment[]>([])
  const [newTask, setNewTask] = useState<Partial<Task>>({
    type: 'Task',
    priority: 'Medium',
    status: 'To Do'
  })
  const [hasChanges, setHasChanges] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProject() {
      console.log('Starting fetchProject')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session:', session)
        const user = session?.user

        console.log('Fetching project with ID:', resolvedParams.id)
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', resolvedParams.id)
          .single()

        if (error) {
          console.error('Error fetching project:', error)
          return
        }
        console.log('Project data:', data)

        setProject(data)
        setIsOwner(user?.id === data.user_id)

        // Fetch project members
        console.log('Fetching project members')
        const { data: membersData, error: membersError } = await supabase
          .from('project_members')
          .select('id, user_id, email')
          .eq('project_id', resolvedParams.id)
          .eq('status', 'accepted')

        if (membersError) {
          console.error('Error fetching members:', membersError)
          return
        }
        console.log('Members data:', membersData)

        // Add current user to members list if they're not already included
        const currentUserMember = user ? {
          id: 'current-user',
          user_id: user.id,
          email: user.email || 'Current User',
          role: 'Member'
        } : null

        const formattedMembers = [
          ...(currentUserMember ? [currentUserMember] : []),
          ...membersData.map(member => ({
            id: member.id,
            user_id: member.user_id,
            email: member.email || 'Unknown User',
            role: member.user_id === data.user_id ? 'Owner' : 'Member'
          }))
        ]

        setMembers(formattedMembers)

        // Fetch tasks with all related data
        console.log('Fetching tasks for project:', resolvedParams.id)
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', resolvedParams.id)
          .order('created_at', { ascending: false })

        if (tasksError) {
          console.error('Error fetching tasks:', tasksError)
          return
        }

        console.log('Raw tasks data:', tasksData)
        console.log('Number of tasks:', tasksData?.length)
        setTasks(tasksData || [])
      } catch (error) {
        console.error('Error in fetchProject:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [resolvedParams.id, supabase])

  useEffect(() => {
    // Apply filters whenever tasks or filters change
    let filtered = [...tasks]
    
    if (filters.assignee !== 'all') {
      filtered = filtered.filter(task => task.assignee_id === filters.assignee)
    }
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }
    
    if (filters.type !== 'all') {
      filtered = filtered.filter(task => task.type === filters.type)
    }
    
    setFilteredTasks(filtered)
  }, [tasks, filters])

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', resolvedParams.id)

      if (error) {
        throw error
      }

      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
      })

      router.push('/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({
        title: "Error",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreateTask = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            project_id: resolvedParams.id,
            ...newTask,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error

      setTasks(prev => [data, ...prev])
      setIsCreateTaskOpen(false)
      setNewTask({
        type: 'Task',
        priority: 'Medium',
        status: 'To Do'
      })

      toast({
        title: "Task created",
        description: "The task has been successfully created.",
      })
    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: "Error",
        description: "Failed to create the task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTaskClick = async (task: Task) => {
    // Clear previous comments immediately
    setTaskComments([])
    setNewComment('')
    
    setSelectedTask(task)
    setEditedTask(task)
    setHasChanges(false)
    setIsTaskDetailsOpen(true)

    // Fetch task comments
    const { data: comments, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return
    }

    console.log('Fetched comments:', comments)
    setTaskComments(comments || [])
  }

  const handleTaskChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSaveChanges = async () => {
    await handleUpdateTask()
    setHasChanges(false)
  }

  const handleUpdateTask = async () => {
    if (!selectedTask) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...editedTask,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTask.id)
        .select()
        .single()

      if (error) throw error

      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id ? data : task
      ))
      setSelectedTask(data)
      setIsEditingTask(false)

      toast({
        title: "Task updated",
        description: "The task has been successfully updated.",
      })
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Failed to update the task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return

    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', selectedTask.id)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== selectedTask.id))
      setIsTaskDetailsOpen(false)
      setSelectedTask(null)

      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Error",
        description: "Failed to delete the task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async () => {
    if (!selectedTask || !newComment.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get user's name from their email (everything before the @)
      const userName = user.email?.split('@')[0] || 'Unknown User'

      const { data, error } = await supabase
        .from('task_comments')
        .insert([
          {
            task_id: selectedTask.id,
            user_id: user.id,
            user_name: userName,
            content: newComment.trim(),
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error

      console.log('New comment data:', data)
      setTaskComments(prev => [...prev, data])
      setNewComment('')

      toast({
        title: "Comment added",
        description: "Your comment has been added to the task.",
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add the comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Add handler for dialog close
  const handleDialogClose = () => {
    setIsTaskDetailsOpen(false)
    setSelectedTask(null)
    setEditedTask({})
    setTaskComments([])
    setNewComment('')
    setHasChanges(false)
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground">The project you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <p className="text-muted-foreground mt-2">{project.description}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>General information about the project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Platforms</h3>
                  <p className="text-muted-foreground">
                    {project.platforms?.join(', ') || 'No platforms specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Tech Stack</h3>
                  <p className="text-muted-foreground">
                    {project.tech_stack?.join(', ') || 'No tech stack specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Timeline</h3>
                  <p className="text-muted-foreground">
                    {project.timeline || 'No timeline specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Team Size</h3>
                  <p className="text-muted-foreground">
                    {project.team_size || 'No team size specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>Team communication and discussions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Communication features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Tasks</h2>
              <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to create a new task.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newTask.title || ''}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter task title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newTask.description || ''}
                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter task description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={newTask.type}
                          onValueChange={(value: 'Task' | 'Bug' | 'Feature') => 
                            setNewTask(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Task">Task</SelectItem>
                            <SelectItem value="Bug">Bug</SelectItem>
                            <SelectItem value="Feature">Feature</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value: 'Low' | 'Medium' | 'High' | 'Critical') => 
                            setNewTask(prev => ({ ...prev, priority: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="assignee">Assignee</Label>
                        <Select
                          value={newTask.assignee_id}
                          onValueChange={(value) => 
                            setNewTask(prev => ({ ...prev, assignee_id: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            {members.map(member => (
                              <SelectItem key={member.id} value={member.user_id}>
                                {member.email} ({member.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={newTask.due_date || ''}
                          onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="estimate">Time Estimate</Label>
                      <Input
                        id="estimate"
                        value={newTask.estimate || ''}
                        onChange={(e) => setNewTask(prev => ({ ...prev, estimate: e.target.value }))}
                        placeholder="e.g., 2 hours, 1 day"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask}>
                      Create Task
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <Label className="text-sm mb-2 block">Assignee</Label>
                <Select
                  value={filters.assignee}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, assignee: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All assignees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All assignees</SelectItem>
                    {members.map(member => (
                      <SelectItem key={member.id} value={member.user_id}>
                        {member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-sm mb-2 block">Priority</Label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-sm mb-2 block">Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Feature">Feature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ assignee: 'all', priority: 'all', type: 'all' })}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleTaskClick(task)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <CardDescription>{task.description}</CardDescription>
                      </div>
                      <Badge variant={
                        task.priority === 'Critical' ? 'destructive' :
                        task.priority === 'High' ? 'default' :
                        task.priority === 'Medium' ? 'secondary' :
                        'outline'
                      }>
                        {task.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {task.type}
                      </div>
                      {task.assignee_id && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {members.find(m => m.user_id === task.assignee_id)?.email}
                        </div>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                      {task.estimate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {task.estimate}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks match the current filters
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Project settings and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteProject}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Project"}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Once you delete a project, there is no going back. Please be certain.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Project settings coming soon...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Details Dialog */}
      <Dialog open={isTaskDetailsOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col [&>button]:hidden">
          {selectedTask && (
            <>
              <DialogHeader className="flex-none">
                <DialogTitle className="sr-only">Task Details</DialogTitle>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Input
                      value={editedTask.title || selectedTask.title}
                      onChange={(e) => handleTaskChange('title', e.target.value)}
                      className="text-2xl font-bold bg-muted/50 hover:bg-muted/80 focus:bg-muted/80 transition-colors p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Textarea
                      value={editedTask.description || selectedTask.description}
                      onChange={(e) => handleTaskChange('description', e.target.value)}
                      className="min-h-[100px] mt-2 bg-muted/50 hover:bg-muted/80 focus:bg-muted/80 transition-colors p-2 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="flex items-center gap-2 ml-4 w-[120px] justify-end">
                    {hasChanges && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSaveChanges}
                        className="h-8"
                      >
                        Save
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Task
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="[&>button]:hidden">
                            <DialogHeader>
                              <DialogTitle>Delete Task</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this task? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={(e) => {
                                e.stopPropagation();
                                const dialog = e.currentTarget.closest('dialog');
                                if (dialog) dialog.close();
                              }}>
                                Cancel
                              </Button>
                              <Button variant="destructive" onClick={handleDeleteTask}>
                                Delete Task
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground h-8 w-8 flex items-center justify-center">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </DialogClose>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-none grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Type</Label>
                    <Select
                      value={editedTask.type || selectedTask.type}
                      onValueChange={(value: 'Task' | 'Bug' | 'Feature') => 
                        handleTaskChange('type', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Task">Task</SelectItem>
                        <SelectItem value="Bug">Bug</SelectItem>
                        <SelectItem value="Feature">Feature</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 block">Priority</Label>
                    <Select
                      value={editedTask.priority || selectedTask.priority}
                      onValueChange={(value: 'Low' | 'Medium' | 'High' | 'Critical') => 
                        handleTaskChange('priority', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 block">Assignee</Label>
                    <Select
                      value={editedTask.assignee_id || selectedTask.assignee_id}
                      onValueChange={(value) => 
                        handleTaskChange('assignee_id', value)
                      }
                    >
                      <SelectTrigger className="text-left w-full">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {members.map(member => (
                          <SelectItem key={member.id} value={member.user_id} className="w-full truncate">
                            {member.email} ({member.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Due Date</Label>
                    <Input
                      type="date"
                      value={editedTask.due_date || selectedTask.due_date || ''}
                      onChange={(e) => handleTaskChange('due_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Time Estimate</Label>
                    <Input
                      value={editedTask.estimate || selectedTask.estimate || ''}
                      onChange={(e) => handleTaskChange('estimate', e.target.value)}
                      placeholder="e.g., 2 hours, 1 day"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Status</Label>
                    <Select
                      value={editedTask.status || selectedTask.status}
                      onValueChange={(value: 'To Do' | 'In Progress' | 'Done') => 
                        handleTaskChange('status', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="my-6 flex-none" />

              <div className="flex flex-col min-h-0">
                <h3 className="font-medium mb-4">Comments</h3>
                <div className={`space-y-4 pr-2 ${taskComments.length > 0 ? 'flex-1 overflow-y-auto' : ''}`}>
                  {taskComments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {(comment.user_name?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{comment.user_name || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {taskComments.length === 0 && (
                    <p className="text-sm text-muted-foreground">No comments yet</p>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAddComment()
                      }
                    }}
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 