-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update follower counts on friendship change
create or replace function public.update_follower_counts()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' and NEW.status = 'accepted' then
    update public.profiles set following_count = following_count + 1 where id = NEW.user_id;
    update public.profiles set followers_count = followers_count + 1 where id = NEW.friend_id;
  elsif TG_OP = 'DELETE' and OLD.status = 'accepted' then
    update public.profiles set following_count = following_count - 1 where id = OLD.user_id;
    update public.profiles set followers_count = followers_count - 1 where id = OLD.friend_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$;

create trigger on_friendship_change
  after insert or delete on public.friendships
  for each row execute procedure public.update_follower_counts();

-- Notification on like
create or replace function public.notify_on_like()
returns trigger language plpgsql security definer as $$
declare
  post_owner uuid;
begin
  select user_id into post_owner from public.posts where id = NEW.post_id;
  if post_owner != NEW.user_id then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (post_owner, NEW.user_id, 'like', NEW.post_id);
  end if;
  return NEW;
end;
$$;

create trigger on_like_insert
  after insert on public.likes
  for each row execute procedure public.notify_on_like();

-- Notification on comment
create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer as $$
declare
  post_owner uuid;
begin
  select user_id into post_owner from public.posts where id = NEW.post_id;
  if post_owner != NEW.user_id then
    insert into public.notifications (user_id, actor_id, type, post_id, payload)
    values (post_owner, NEW.user_id, 'comment', NEW.post_id, json_build_object('comment', left(NEW.content, 100)));
  end if;
  return NEW;
end;
$$;

create trigger on_comment_insert
  after insert on public.comments
  for each row execute procedure public.notify_on_comment();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_posts_updated_at before update on public.posts
  for each row execute procedure public.set_updated_at();
