-- Create project_members table
create table project_members (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member',
  status text not null default 'pending', -- pending, accepted, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

-- Enable RLS
alter table project_members enable row level security;

-- Create policies
create policy "Users can view members of projects they can view"
  on project_members for select
  using (true);

create policy "Users can apply to join projects"
  on project_members for insert
  with check (auth.uid() = user_id);

create policy "Project owners can manage members"
  on project_members for all
  using (
    exists (
      select 1 from projects
      where projects.id = project_members.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
create trigger update_project_members_updated_at
  before update on project_members
  for each row
  execute function update_updated_at_column(); 