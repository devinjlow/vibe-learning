'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'
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

interface UserDetails {
  background: string
  experience: string
  interests: string[]
}

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

const backgroundOptions = [
  "Computer Science",
  "Software Engineering",
  "Data Science",
  "Web Development",
  "Mobile Development",
  "DevOps",
  "Other"
] as const

const experienceOptions = [
  "0-2 years",
  "2-5 years",
  "5-10 years",
  "10+ years"
] as const

const interestOptions = [
  "Machine Learning",
  "Web Development",
  "Mobile Development",
  "Cloud Computing",
  "DevOps",
  "Data Science",
  "Cybersecurity",
  "UI/UX Design",
  "Game Development",
  "Blockchain"
] as const

type BackgroundOption = typeof backgroundOptions[number]
type ExperienceOption = typeof experienceOptions[number]
type InterestOption = typeof interestOptions[number]

export default function Profile() {
  const { toast } = useToast()
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No user found')

        const { data, error } = await supabase
          .from('user_details')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserDetails(data)
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
  }, [toast])

  const handleSave = async () => {
    if (!userDetails) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // First, check if the record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('user_details')
        .select('id')
        .eq('id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw checkError
      }

      let error
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_details')
          .update({
            background: userDetails.background,
            experience: userDetails.experience,
            interests: userDetails.interests,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        error = updateError
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('user_details')
          .insert({
            id: user.id,
            background: userDetails.background,
            experience: userDetails.experience,
            interests: userDetails.interests,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        error = insertError
      }

      if (error) {
        console.error('Error details:', error)
        throw error
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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
                  onValueChange={(value: BackgroundOption) => setUserDetails(prev => prev ? { ...prev, background: value } : null)}
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
                  value={userDetails?.experience}
                  onValueChange={(value: ExperienceOption) => setUserDetails(prev => prev ? { ...prev, experience: value } : null)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select experience" />
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