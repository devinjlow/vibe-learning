"use client"

import { useState, ChangeEvent } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"

interface CreateProjectDialogProps {
  trigger: React.ReactNode
}

export function CreateProjectDialog({ trigger }: CreateProjectDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platforms: "",
    techStack: "",
    timeline: "",
    teamSize: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Auth error:', userError)
        throw new Error('Authentication error. Please sign in to create a project.')
      }
      
      if (!user) {
        throw new Error('Please sign in to create a project.')
      }

      // Prepare the project data
      const projectData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        platforms: formData.platforms ? formData.platforms.split(',').map(p => p.trim()) : [],
        tech_stack: formData.techStack ? formData.techStack.split(',').map(t => t.trim()) : [],
        timeline: formData.timeline || null,
        team_size: formData.teamSize || null,
        status: 'planning',
        created_at: new Date().toISOString(),
      }

      const { error: insertError } = await supabase
        .from('projects')
        .insert([projectData])

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error(insertError.message)
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error creating project:', error)
      setError(error instanceof Error ? error.message : 'Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (Object.values(formData).some(value => value !== "")) {
      if (window.confirm("Are you sure you want to cancel? Any entered information will be lost.")) {
        setOpen(false)
        setError(null)
      }
    } else {
      setOpen(false)
      setError(null)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new project. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter project title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platforms">Target Platforms</Label>
            <Input
              id="platforms"
              value={formData.platforms}
              onChange={handleChange}
              placeholder="Web, iOS, Android (comma-separated)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="techStack">Tech Stack</Label>
            <Input
              id="techStack"
              value={formData.techStack}
              onChange={handleChange}
              placeholder="React, Node.js, PostgreSQL (comma-separated)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Input
                id="timeline"
                value={formData.timeline}
                onChange={handleChange}
                placeholder="3 months"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                id="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                placeholder="3-5 people"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 