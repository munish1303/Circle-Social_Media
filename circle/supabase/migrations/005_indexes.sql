-- Performance indexes
create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_post_media_post_id on public.post_media(post_id);
create index idx_likes_post_id on public.likes(post_id);
create index idx_likes_user_id on public.likes(user_id);
create index idx_comments_post_id on public.comments(post_id);
create index idx_friendships_user_id on public.friendships(user_id);
create index idx_friendships_friend_id on public.friendships(friend_id);
create index idx_messages_sender_receiver on public.messages(sender_id, receiver_id);
create index idx_messages_created_at on public.messages(created_at desc);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_read on public.notifications(user_id, read);
create index idx_stories_user_id on public.stories(user_id);
create index idx_stories_expires_at on public.stories(expires_at);
create index idx_profiles_username on public.profiles(username);
