-- Story views
create table if not exists public.story_views (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid references public.stories(id) on delete cascade not null,
  viewer_id uuid references public.profiles(id) on delete cascade not null,
  viewed_at timestamptz default now(),
  unique(story_id, viewer_id)
);

-- Highlights
create table if not exists public.highlights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text default '',
  cover_url text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Highlight items (stories added to highlights)
create table if not exists public.highlight_items (
  id uuid default uuid_generate_v4() primary key,
  highlight_id uuid references public.highlights(id) on delete cascade not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  media_url text not null,
  media_type text default 'image',
  created_at timestamptz default now(),
  unique(highlight_id, story_id)
);

-- RLS
alter table public.story_views enable row level security;
alter table public.highlights enable row level security;
alter table public.highlight_items enable row level security;

create policy "story_views_select" on public.story_views for select to authenticated using (true);
create policy "story_views_insert" on public.story_views for insert to authenticated with check (auth.uid() = viewer_id);

create policy "highlights_select" on public.highlights for select to authenticated using (true);
create policy "highlights_insert" on public.highlights for insert to authenticated with check (auth.uid() = user_id);
create policy "highlights_update" on public.highlights for update to authenticated using (auth.uid() = user_id);
create policy "highlights_delete" on public.highlights for delete to authenticated using (auth.uid() = user_id);

create policy "highlight_items_select" on public.highlight_items for select to authenticated using (true);
create policy "highlight_items_insert" on public.highlight_items for insert to authenticated
  with check (exists (select 1 from public.highlights where id = highlight_id and user_id = auth.uid()));
create policy "highlight_items_delete" on public.highlight_items for delete to authenticated
  using (exists (select 1 from public.highlights where id = highlight_id and user_id = auth.uid()));

-- Storage bucket for stories
insert into storage.buckets (id, name, public) values ('stories', 'stories', true) on conflict (id) do update set public = true;

create policy "stories_storage_select" on storage.objects for select using (bucket_id = 'stories');
create policy "stories_storage_insert" on storage.objects for insert to authenticated with check (bucket_id = 'stories');
create policy "stories_storage_delete" on storage.objects for delete to authenticated using (bucket_id = 'stories');

-- Indexes
create index if not exists idx_story_views_story_id on public.story_views(story_id);
create index if not exists idx_highlights_user_id on public.highlights(user_id);
create index if not exists idx_highlight_items_highlight_id on public.highlight_items(highlight_id);
