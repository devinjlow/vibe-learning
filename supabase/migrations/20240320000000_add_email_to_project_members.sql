-- Add email column to project_members table
ALTER TABLE project_members ADD COLUMN email text;

-- Update existing records with email from auth.users
UPDATE project_members pm
SET email = au.email
FROM auth.users au
WHERE pm.user_id = au.id;

-- Make email column not null after updating existing records
ALTER TABLE project_members ALTER COLUMN email SET NOT NULL; 