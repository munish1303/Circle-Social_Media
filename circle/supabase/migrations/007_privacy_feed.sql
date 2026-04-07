-- =====================
-- FIX FEED: Only show posts from followed users (accepted) + own posts
-- =====================
DROP POLICY IF EXISTS "posts_select" ON public.posts;
DROP POLICY IF EXISTS "Posts viewable by friends or owner" ON public.posts;

CREATE POLICY "posts_select" ON public.posts
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
      AND (
        (user_id = auth.uid() AND friend_id = posts.user_id)
        OR (friend_id = auth.uid() AND user_id = posts.user_id)
      )
    )
  );

-- =====================
-- FIX STORIES: Only show stories from followed users + own stories
-- =====================
DROP POLICY IF EXISTS "Stories viewable by authenticated users" ON public.stories;
DROP POLICY IF EXISTS "stories_select" ON public.stories;

CREATE POLICY "stories_select" ON public.stories
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
      AND (
        (user_id = auth.uid() AND friend_id = stories.user_id)
        OR (friend_id = auth.uid() AND user_id = stories.user_id)
      )
    )
  );

-- =====================
-- FIX HIGHLIGHTS: Only show highlights from followed users + own
-- =====================
DROP POLICY IF EXISTS "highlights_select" ON public.highlights;

CREATE POLICY "highlights_select" ON public.highlights
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
      AND (
        (user_id = auth.uid() AND friend_id = highlights.user_id)
        OR (friend_id = auth.uid() AND user_id = highlights.user_id)
      )
    )
  );

-- =====================
-- FIX PROFILES: Always searchable, but is_private flag controls content
-- =====================
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

-- =====================
-- FIX NOTIFICATIONS: Allow trigger to insert for any user
-- =====================
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
