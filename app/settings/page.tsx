import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Account Settings</h1>
      
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account's profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-md"
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">Receive email updates about your projects</p>
            </div>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Project Invitations</h3>
              <p className="text-sm text-muted-foreground">Get notified when you're invited to projects</p>
            </div>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
          <Button>Save Preferences</Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  )
} 