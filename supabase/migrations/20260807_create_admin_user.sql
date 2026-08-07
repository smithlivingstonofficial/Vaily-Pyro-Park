-- SQL Migration: 20260807_create_admin_user.sql
-- Purpose: Safely create or update Supabase Auth Admin User for vel56skc@gmail.com

-- Enable pgcrypto extension for bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  user_email TEXT := 'vel56skc@gmail.com';
  -- ⬇️ REPLACE THIS WITH YOUR DESIRED SECURE PASSWORD BEFORE RUNNING IN SUPABASE SQL EDITOR ⬇️
  raw_password TEXT := 'VailyPyroAdmin@2026!'; 
  hashed_password TEXT;
BEGIN
  -- Generate bcrypt hash using pgcrypto
  hashed_password := extensions.crypt(raw_password, extensions.gen_salt('bf', 10));

  -- Clean up any incomplete previous user creation attempt
  DELETE FROM auth.identities WHERE identity_data->>'email' = user_email OR provider_id = user_email;
  DELETE FROM auth.users WHERE email = user_email;

  -- Insert user into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    user_email,
    hashed_password,
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Vaily Pyro Admin", "role": "admin"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- Insert corresponding auth.identities record with provider_id
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    format('{"sub":"%s","email":"%s"}', new_user_id, user_email)::jsonb,
    'email',
    user_email,
    NOW(),
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Admin user % created successfully with ID %', user_email, new_user_id;
END $$;
