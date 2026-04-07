-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.stories enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.saved_posts enable row level security;

-- =====================
-- PROFILES POLICIES
-- =====================
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- =====================
-- POSTS POLICIES
-- =====================
create policy "Posts viewable by friends or owner"
  on public.posts for select to authenticated
  using (
    user_id = auth.uid()
    or visibility = 'friends'
    or exists (
      select 1 from public.friendships
      where status = 'accepted'
      and ((user_id = auth.uid() and friend_id = posts.user_id)
        or (friend_id = auth.uid() and user_id = posts.user_id))
    )
  );

create policy "Users can create their own posts"
  on public.posts for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update to authenticated using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete to authenticated using (auth.uid() = user_id);

-- =====================
-- POST MEDIA POLICIES
-- =====================
create policy "Post media viewable by authenticated users"
  on public.post_media for select to authenticated using (true);

create policy "Users can insert media for their posts"
  on public.post_media for insert to authenticated
  with check (exists (select 1 from public.posts where id = post_id and user_id = auth.uid()));

create policy "Users can delete media for their posts"
  on public.post_media for delete to authenticated
  using (exists (select 1 from public.posts where id = post_id and user_id = auth.uid()));

-- =====================
-- LIKES POLICIES
-- =====================
create policy "Likes viewable by authenticated users"
  on public.likes for select to authenticated using (true);

create policy "Users can like posts"
  on public.likes for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can unlike posts"
  on public.likes for delete to authenticated using (auth.uid() = user_id);

-- =====================
-- COMMENTS POLICIES
-- =====================
create policy "Comments viewable by authenticated users"
  on public.comments for select to authenticated using (true);

create policy "Users can comment"
  on public.comments for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete to authenticated using (auth.uid() = user_id);

-- =====================
-- FRIENDSHIPS POLICIES
-- =====================
create policy "Users can view their own friendships"
  on public.friendships for select to authenticated
  using (user_id = auth.uid() or friend_id = auth.uid());

create policy "Users can send friend requests"
  on public.friendships for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update friendships they're part of"
  on public.friendships for update to authenticated
  using (user_id = auth.uid() or friend_id = auth.uid());

create policy "Users can delete their own friendships"
  on public.friendships for delete to authenticated
  using (user_id = auth.uid() or friend_id = auth.uid());

-- =====================
-- MESSAGES POLICIES
-- =====================
create policy "Users can view their own messages"
  on public.messages for select to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "Users can send messages"
  on public.messages for insert to authenticated with check (auth.uid() = sender_id);

-- =====================
-- NOTIFICATIONS POLICIES
-- =====================
create policy "Users can view their own notifications"
  on public.notifications for select to authenticated using (user_id = auth.uid());

create policy "System can insert notifications"
  on public.notifications for insert to authenticated with check (true);

create policy "Users can update their own notifications"
  on public.notifications for update to authenticated using (user_id = auth.uid());

-- =====================
-- STORIES POLICIES
-- =====================
create policy "Stories viewable by authenticated users"
  on public.stories for select to authenticated using (true);

create policy "Users can create their own stories"
  on public.stories for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can delete their own stories"
  on public.stories for delete to authenticated using (auth.uid() = user_id);

-- =====================
-- SAVED POSTS POLICIES
-- =====================
create policy "Users can view their own saved posts"
  on public.saved_posts for select to authenticated using (user_id = auth.uid());

create policy "Users can save posts"
  on public.saved_posts for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can unsave posts"
  on public.saved_posts for delete to authenticated using (auth.uid() = user_id);
