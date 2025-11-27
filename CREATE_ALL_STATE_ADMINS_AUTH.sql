-- Create authentication accounts for ALL State Admins
-- Password: Test123!
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    state_record RECORD;
    new_user_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Loop through all state admins in profiles table
    FOR state_record IN 
        SELECT id, email, full_name 
        FROM profiles 
        WHERE role = 'state_admin'
    LOOP
        -- Check if user already exists in auth
        SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = state_record.email) INTO user_exists;
        
        IF user_exists THEN
            -- Update existing user's password
            UPDATE auth.users 
            SET encrypted_password = crypt('Test123!', gen_salt('bf'))
            WHERE email = state_record.email;
            
            RAISE NOTICE 'Updated password for: %', state_record.email;
        ELSE
            -- Create new auth user
            new_user_id := gen_random_uuid();
            
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                created_at,
                updated_at,
                confirmation_token,
                recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                new_user_id,
                'authenticated',
                'authenticated',
                state_record.email,
                crypt('Test123!', gen_salt('bf')),
                NOW(),
                NOW(),
                NOW(),
                '',
                ''
            );
            
            RAISE NOTICE 'Created auth account for: %', state_record.email;
        END IF;
        
        -- Update the profile to link with the auth user
        UPDATE profiles 
        SET id = (SELECT id FROM auth.users WHERE email = state_record.email)
        WHERE email = state_record.email;
        
    END LOOP;
    
    RAISE NOTICE 'Completed! All state admins now have auth accounts with password: Test123!';
END $$;

-- Verify all state admins now have auth accounts
SELECT 
    p.email,
    p.full_name,
    p.role,
    CASE 
        WHEN au.email IS NOT NULL THEN '✓ Auth Account Exists'
        ELSE '✗ No Auth Account'
    END as auth_status
FROM profiles p
LEFT JOIN auth.users au ON p.email = au.email
WHERE p.role = 'state_admin'
ORDER BY p.full_name;
