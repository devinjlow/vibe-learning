'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { LoadingSplash } from "@/components/ui/loading-splash"

interface UserDetails {
  id?: string
  background: string
  experience: string
  interests: string[]
  created_at?: string
  updated_at?: string
}

interface UserDetailsData {
  id: string
  background: string
  experience: string
  interests: string[]
  updated_at: string
  created_at?: string
}

type InterestOption = 'Business' | 'Finance' | 'Engineering' | 'Health & Wellness' | 'Education' | 'Entertainment' | 'Social Impact' | 'Technology'
type ExperienceOption = '< 1 year' | '1 - 3 years' | '4 - 7 years' | '8+ years'

const backgroundOptions = [
  'Student',
  'Engineering Professional',
  'Self-taught Developer',
  'Bootcamp Graduate',
  'Other'
]

const experienceOptions = [
  '< 1 year',
  '1 - 3 years',
  '4 - 7 years',
  '8+ years'
]

const interestOptions: InterestOption[] = [
  'Business',
  'Finance',
  'Engineering',
  'Health & Wellness',
  'Education',
  'Entertainment',
  'Social Impact',
  'Technology'
]

// Mock data for user projects
const userProjects = [
  {
    id: 1,
    title: "AI-Powered Code Review System",
    role: "Lead Developer",
    tasks: [
      { id: 1, title: "Set up ML pipeline", status: "In Progress" },
      { id: 2, title: "Implement code analysis", status: "Todo" }
    ]
  },
  {
    id: 2,
    title: "Real-time Collaboration Platform",
    role: "Backend Developer",
    tasks: [
      { id: 3, title: "Design WebSocket architecture", status: "Completed" },
      { id: 4, title: "Implement real-time sync", status: "In Progress" }
    ]
  }
]

export default function Profile() {
  const { toast } = useToast()
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // (Removed 5 second delay for loading splash testing)

        // Debug: Log session state before fetching user
        const sessionResult = await supabase.auth.getSession();
        console.log('DEBUG: Session result before getUser:', sessionResult);

        const { data: { user } } = await supabase.auth.getUser()
        console.log('DEBUG: User from getUser:', user);
        if (!user) throw new Error('No user found')

        const { data, error } = await supabase
          .from('user_details')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
        
        if (data) {
          setUserDetails(data)
        } else {
          // Initialize with empty values if no record exists
          setUserDetails({
            background: '',
            experience: '',
            interests: []
          })
        }
      } catch (error) {
        console.error('Error fetching user details:', error)
        toast({
          title: "Error",
          description: "Failed to load user details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [toast, supabase])

  const handleSave = async () => {
    if (!userDetails) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Validate required fields
      if (!userDetails.background || !userDetails.experience) {
        throw new Error('Background and experience are required')
      }

      // Basic validation for background
      if (userDetails.background.trim() === '') {
        throw new Error('Background cannot be empty')
      }

      // Basic validation for experience
      if (userDetails.experience.trim() === '') {
        throw new Error('Experience cannot be empty')
      }

      const now = new Date().toISOString()
      
      // Ensure interests is a proper array of strings
      const interests = Array.isArray(userDetails.interests) 
        ? userDetails.interests.filter(interest => typeof interest === 'string' && interest.trim() !== '')
        : []

      const data: UserDetailsData = {
        id: user.id,
        background: userDetails.background,
        experience: userDetails.experience,
        interests: interests,
        updated_at: now
      }

      // If this is a new record, add created_at
      if (!userDetails.id) {
        data.created_at = now
      }

      // Debug log the data being sent
      console.log('Sending data to database:', JSON.stringify(data, null, 2))

      const { error } = await supabase
        .from('user_details')
        .upsert(data, {
          onConflict: 'id'
        })

      if (error) {
        console.error('Full error object:', JSON.stringify(error, null, 2))
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        throw new Error(error.message || 'Failed to update profile')
      }

      // Refresh the user details after successful save
      const { data: updatedData, error: fetchError } = await supabase
        .from('user_details')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        console.error('Error fetching updated details:', fetchError)
      } else {
        setUserDetails(updatedData)
      }

      toast({
        title: "Success",
        description: "Your profile has been updated",
      })
      setEditing(false)
    } catch (error) {
      console.error('Error updating user details:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInterestToggle = (interest: InterestOption) => {
    if (!userDetails) return

    const currentInterests = userDetails.interests || []
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest]

    setUserDetails({
      ...userDetails,
      interests: newInterests
    })
  }

  if (loading) {
    return <LoadingSplash onComplete={() => setLoading(false)} />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      {/* User Details Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Info</CardTitle>
              <CardDescription>Your profile information</CardDescription>
            </div>
            <Button 
              onClick={() => editing ? handleSave() : setEditing(true)}
              variant={editing ? "default" : "outline"}
              disabled={saving}
            >
              {editing ? (saving ? 'Saving...' : 'Save Changes') : 'Edit Details'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div>
              <h3 className="font-medium mb-2">Background</h3>
              {editing ? (
                <Select
                  value={userDetails?.background}
                  onValueChange={(value: string) => setUserDetails(prev => prev ? { ...prev, background: value } : null)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select background" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-muted-foreground">{userDetails?.background || 'Not set'}</p>
              )}
            </div>
            <div>
              <h3 className="font-medium mb-2">Experience</h3>
              {editing ? (
                <Select
                  defaultValue={userDetails?.experience}
                  value={userDetails?.experience}
                  onValueChange={(value: ExperienceOption) => setUserDetails(prev => prev ? { ...prev, experience: value } : null)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue>
                      {userDetails?.experience || "Select experience"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-muted-foreground">{userDetails?.experience || 'Not set'}</p>
              )}
            </div>
            <div>
              <h3 className="font-medium mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {editing ? (
                  <>
                    {interestOptions.map((interest) => (
                      <Badge
                        key={interest}
                        variant={userDetails?.interests?.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                        {userDetails?.interests?.includes(interest) && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    ))}
                  </>
                ) : (
                  userDetails?.interests?.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  )) || <p className="text-muted-foreground">No interests set</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>Your active projects and tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {userProjects.map((project) => (
            <div key={project.id} className="space-y-4">
              <div>
                <h3 className="font-medium">{project.title}</h3>
                <p className="text-sm text-muted-foreground">Role: {project.role}</p>
              </div>
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
          ))}
        </CardContent>
      </Card>
    </div>
  )
} 