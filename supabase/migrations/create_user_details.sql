-- Create user_details table
CREATE TABLE user_details (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    background TEXT NOT NULL CHECK (background IN (
        'Student',
        'Engineering Professional',
        'Self-taught Developer',
        'Bootcamp Graduate',
        'Other'
    )),
    experience TEXT NOT NULL CHECK (experience IN (
        '< 1 year',
        '1 - 3 years',
        '4 - 7 years',
        '8+ years'
    )),
    interests TEXT[] NOT NULL CHECK (
        interests <@ ARRAY[
            'Business',
            'Finance',
            'Engineering',
            'Health & Wellness',
            'Education',
            'Entertainment',
            'Social Impact',
            'Technology'
        ]::TEXT[]
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_user_details_id ON user_details(id);

-- Add RLS (Row Level Security) policies
ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own details
CREATE POLICY "Users can view own details"
    ON user_details
    FOR SELECT
    USING (auth.uid() = id);

-- Policy to allow users to update their own details
CREATE POLICY "Users can update own details"
    ON user_details
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy to allow users to insert their own details
CREATE POLICY "Users can insert own details"
    ON user_details
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_details_updated_at
    BEFORE UPDATE ON user_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 