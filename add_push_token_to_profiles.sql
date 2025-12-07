-- Add push_token column to profiles table
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'push_token') THEN
        ALTER TABLE profiles ADD COLUMN push_token TEXT;
        RAISE NOTICE 'Added push_token column to profiles table';
    ELSE
        RAISE NOTICE 'push_token column already exists in profiles table';
    END IF;
END $$;
