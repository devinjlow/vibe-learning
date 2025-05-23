'use client';

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ApplyToJoinDialogProps {
  projectId: string
  trigger: React.ReactNode
}

export function ApplyToJoinDialog({ projectId, trigger }: ApplyToJoinDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleApply = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get the current session user (assume authenticated)
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) {
        throw new Error('Authentication error. Please sign in to apply.')
      }

      // Check if user has already applied
      const { data: existingApplications, error: checkError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)

      if (checkError) {
        throw new Error('Error checking existing application.')
      }
      if (existingApplications && existingApplications.length > 0) {
        throw new Error('You have already applied to this project.')
      }

      // Create the application
      const { error: insertError } = await supabase
        .from('project_members')
        .insert([
          {
            project_id: projectId,
            user_id: user.id,
            email: user.email,
            status: 'pending'
          }
        ])
      if (insertError) {
        throw new Error('Failed to create application. Please try again.')
      }
      setOpen(false)
      router.refresh()
    } catch (error) {
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