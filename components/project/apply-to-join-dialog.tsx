'use client';

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface ApplyToJoinDialogProps {
  projectId: string
  trigger: React.ReactNode
}

export function ApplyToJoinDialog({ projectId, trigger }: ApplyToJoinDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Starting apply process...')
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('Current user:', user)
      
      if (userError) {
        console.error('Auth error:', userError)
        throw new Error('Authentication error. Please sign in to apply.')
      }
      
      if (!user) {
        throw new Error('Please sign in to apply.')
      }

      // Check if user has already applied
      console.log('Checking for existing application...')
      const { data: existingApplications, error: checkError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)

      console.log('Existing application check:', { existingApplications, checkError })

      if (checkError) {
        console.error('Error checking existing application:', checkError)
        throw new Error('Error checking existing application.')
      }

      if (existingApplications && existingApplications.length > 0) {
        throw new Error('You have already applied to this project.')
      }

      // Create the application
      console.log('Creating new application...')
      const { error: insertError } = await supabase
        .from('project_members')
        .insert([
          {
            project_id: projectId,
            user_id: user.id,
            status: 'pending'
          }
        ])

      if (insertError) {
        console.error('Error creating application:', insertError)
        throw new Error('Failed to create application. Please try again.')
      }

      console.log('Application created successfully!')
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error applying to project:', error)
      setError(error instanceof Error ? error.message : 'Failed to apply. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply to Join Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to apply to join this project? The project owner will review your application.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
            {error}
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              'Apply to Join'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 