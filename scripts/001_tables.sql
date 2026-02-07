create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
