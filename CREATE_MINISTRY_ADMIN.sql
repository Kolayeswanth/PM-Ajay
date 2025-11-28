-- Create Ministry Admin User
DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- 1. Create User in auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token
  )
  VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'centre@pmajay.gov.in',
    crypt('Centre@2024!Secure', gen_salt('bf')), -- Password
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ministry Admin"}',
    now(),
    now(),
    'authenticated',
    'authenticated',
    ''
  );

  -- 2. Create Profile in public.profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new_user_id,
    'centre@pmajay.gov.in',
    'Ministry Admin',
    'ministry_admin'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'ministry_admin';

END $$;
