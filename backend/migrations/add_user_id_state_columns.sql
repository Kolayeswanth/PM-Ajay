-- Add user_id and state columns to implementing_agencies table

DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'implementing_agencies' AND column_name = 'user_id') THEN
        ALTER TABLE implementing_agencies ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;

    -- Add state column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'implementing_agencies' AND column_name = 'state') THEN
        ALTER TABLE implementing_agencies ADD COLUMN state VARCHAR(255);
    END IF;
END $$;
