-- =====================
-- POSTS WITH DETAILS VIEW
-- =====================
create or replace view public.posts_with_details as
select
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
  coalesce(l.likes_count, 0) as likes_count,
  coalesce(c.comments_count, 0) as comments_count,
  coalesce(
    json_agg(
      json_build_object('id', pm.id, 'url', pm.url, 'type', pm.type, 'order', pm."order")
      order by pm."order"
    ) filter (where pm.id is not null),
    '[]'
  ) as media
from public.posts p
join public.profiles pr on pr.id = p.user_id
left join (select post_id, count(*) as likes_count from public.likes group by post_id) l on l.post_id = p.id
left join (select post_id, count(*) as comments_count from public.comments group by post_id) c on c.post_id = p.id
left join public.post_media pm on pm.post_id = p.id
group by p.id, pr.id, l.likes_count, c.comments_count;

-- =====================
-- STORIES WITH PROFILES VIEW
-- =====================
create or replace view public.stories_with_profiles as
select
  s.id,
  s.user_id,
  s.media_url,
  s.media_type,
  s.expires_at,
  s.created_at,
  pr.username,
  pr.full_name,
  pr.avatar_url
from public.stories s
join public.profiles pr on pr.id = s.user_id
where s.expires_at > now();

-- =====================
-- CONVERSATIONS VIEW
-- =====================
create or replace view public.conversations_with_details as
select distinct on (least(m.sender_id, m.receiver_id), greatest(m.sender_id, m.receiver_id))
  m.id,
  case when m.sender_id = auth.uid() then m.receiver_id else m.sender_id end as other_user_id,
  case when m.sender_id = auth.uid() then m.receiver_id else m.sender_id end as participant_id,
  pr.username as other_username,
  pr.full_name as other_full_name,
  pr.avatar_url as other_avatar_url,
  m.content as last_message,
  m.created_at as last_message_at,
  (
    select count(*) from public.messages
    where receiver_id = auth.uid()
    and sender_id = case when m.sender_id = auth.uid() then m.receiver_id else m.sender_id end
    and read = false
  ) as unread_count
from public.messages m
join public.profiles pr on pr.id = case when m.sender_id = auth.uid() then m.receiver_id else m.sender_id end
where m.sender_id = auth.uid() or m.receiver_id = auth.uid()
order by least(m.sender_id, m.receiver_id), greatest(m.sender_id, m.receiver_id), m.created_at desc;
