-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- PROFILES
-- =====================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text not null,
  bio text default '',
  website text default '',
  avatar_url text default '',
  is_private boolean default false,
  is_verified boolean default false,
  followers_count integer default 0,
  following_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- FRIENDSHIPS
-- =====================
create table public.friendships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  friend_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'blocked')) default 'pending',
  created_at timestamptz default now(),
  unique(user_id, friend_id)
);

-- =====================
-- POSTS
-- =====================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  caption text default '',
  location text default '',
  visibility text check (visibility in ('friends', 'close_friends', 'only_me')) default 'friends',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- POST MEDIA
-- =====================
create table public.post_media (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  url text not null,
  type text check (type in ('image', 'video')) not null,
  "order" integer default 0,
  created_at timestamptz default now()
);

-- =====================
-- LIKES
-- =====================
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- =====================
-- COMMENTS
-- =====================
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- =====================
-- STORIES
-- =====================
create table public.stories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  media_url text not null,
  media_type text check (media_type in ('image', 'video')) default 'image',
  expires_at timestamptz default (now() + interval '24 hours'),
  created_at timestamptz default now()
);

-- =====================
-- MESSAGES
-- =====================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- =====================
-- NOTIFICATIONS
-- =====================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade,
  type text check (type in ('like', 'comment', 'follow', 'follow_request', 'mention', 'tag')) not null,
  post_id uuid references public.posts(id) on delete cascade,
  payload jsonb default '{}',
  read boolean default false,
  created_at timestamptz default now()
);

-- =====================
-- SAVED POSTS
-- =====================
create table public.saved_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);
