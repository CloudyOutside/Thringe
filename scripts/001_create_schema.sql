-- ThrinGe Database Schema

-- Profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Clothing items table
create table if not exists public.clothing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  size text,
  category text,
  condition text,
  image_url text,
  price numeric(10, 2),
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.clothing_items enable row level security;

drop policy if exists "items_select_active" on public.clothing_items;
create policy "items_select_active" on public.clothing_items for select using (is_active = true);
drop policy if exists "items_insert_own" on public.clothing_items;
create policy "items_insert_own" on public.clothing_items for insert with check (auth.uid() = user_id);
drop policy if exists "items_update_own" on public.clothing_items;
create policy "items_update_own" on public.clothing_items for update using (auth.uid() = user_id);
drop policy if exists "items_delete_own" on public.clothing_items;
create policy "items_delete_own" on public.clothing_items for delete using (auth.uid() = user_id);

-- Swipes table
create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.clothing_items(id) on delete cascade,
  direction text not null check (direction in ('left', 'right')),
  created_at timestamptz default now(),
  unique(swiper_id, item_id)
);

alter table public.swipes enable row level security;

drop policy if exists "swipes_select_own" on public.swipes;
create policy "swipes_select_own" on public.swipes for select using (auth.uid() = swiper_id);
drop policy if exists "swipes_insert_own" on public.swipes;
create policy "swipes_insert_own" on public.swipes for insert with check (auth.uid() = swiper_id);

-- Matches table
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.clothing_items(id) on delete cascade,
  liker_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(item_id, liker_id)
);

alter table public.matches enable row level security;

drop policy if exists "matches_select_own" on public.matches;
create policy "matches_select_own" on public.matches for select using (auth.uid() = liker_id or auth.uid() = owner_id);
drop policy if exists "matches_insert_own" on public.matches;
create policy "matches_insert_own" on public.matches for insert with check (auth.uid() = liker_id);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

drop policy if exists "messages_select_match_participants" on public.messages;
create policy "messages_select_match_participants" on public.messages for select using (
  exists (
    select 1 from public.matches m
    where m.id = match_id
    and (auth.uid() = m.liker_id or auth.uid() = m.owner_id)
  )
);

drop policy if exists "messages_insert_match_participants" on public.messages;
create policy "messages_insert_match_participants" on public.messages for insert with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.matches m
    where m.id = match_id
    and (auth.uid() = m.liker_id or auth.uid() = m.owner_id)
  )
);
