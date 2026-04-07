-- Ensure likes are strictly per user (unique constraint already exists)
-- Ensure saved_posts are strictly per user (unique constraint already exists)

-- When a user switches to private, their existing non-follower relationships
-- don't need to be deleted — the RLS policy handles visibility automatically.
-- But we add a trigger to notify followers when privacy changes.

-- Fix the posts_with_details view to NOT include liked_by_me/saved_by_me
-- (those are fetched per-user in the app layer to avoid cross-user contamination)
CREATE OR REPLACE VIEW public.posts_with_details AS
SELECT
  p.id,
  p.user_id,
  p.caption,
  p.location,
  p.visibility,
  p.created_at,
  pr.username,
  pr.full_name,
  pr.avatar_url,
  pr.is_verified,
  pr.is_private,
  coalesce(l.likes_count, 0) as likes_count,
  coalesce(c.comments_count, 0) as comments_count,
  coalesce(
    json_agg(
      json_build_object('id', pm.id, 'url', pm.url, 'type', pm.type, 'order', pm."order")
      order by pm."order"
    ) filter (where pm.id is not null),
    '[]'
  ) as media
FROM public.posts p
JOIN public.profiles pr ON pr.id = p.user_id
LEFT JOIN (SELECT post_id, count(*) as likes_count FROM public.likes GROUP BY post_id) l ON l.post_id = p.id
LEFT JOIN (SELECT post_id, count(*) as comments_count FROM public.comments GROUP BY post_id) c ON c.post_id = p.id
LEFT JOIN public.post_media pm ON pm.post_id = p.id
GROUP BY p.id, pr.id, l.likes_count, c.comments_count;

GRANT SELECT ON public.posts_with_details TO authenticated;

-- Ensure the privacy toggle on profiles propagates correctly
-- The RLS on posts already checks is_private at query time, so no trigger needed.
-- Just make sure the profile update policy is correct.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
