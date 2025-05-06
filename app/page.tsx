import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"


export default async function Home() {
  // Fetch projects from Supabase
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error fetching projects:', error.message);
    return <div>Error loading projects: {error.message}</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Available Projects</h1>
          <Button>Create New Project</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
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
    </main>
  )
}
