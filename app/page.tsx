import { supabase } from "@/lib/supabase"
import { ProjectsList } from "@/components/project/projects-list"

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

  return <ProjectsList projects={projects || []} />
} 