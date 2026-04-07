-- Run this AFTER 009_seed_data.sql
-- Makes your real account follow all seed users so their content appears in your feed

-- Replace 'YOUR_USERNAME' with your actual username (e.g. 'munish_13')
DO $$
DECLARE
  my_id uuid;
  seed_ids uuid[] := ARRAY[
    'a1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000002'::uuid,
    'a1000000-0000-0000-0000-000000000003'::uuid,
    'a1000000-0000-0000-0000-000000000004'::uuid,
    'a1000000-0000-0000-0000-000000000005'::uuid,
    'a1000000-0000-0000-0000-000000000006'::uuid,
    'a1000000-0000-0000-0000-000000000007'::uuid,
    'a1000000-0000-0000-0000-000000000008'::uuid,
    'a1000000-0000-0000-0000-000000000009'::uuid,
    'a1000000-0000-0000-0000-000000000010'::uuid
  ];
  sid uuid;
BEGIN
  -- Get your real user ID by username
  SELECT id INTO my_id FROM public.profiles WHERE username = 'munish_13';

  IF my_id IS NULL THEN
    RAISE NOTICE 'User not found. Update the username in this script.';
    RETURN;
  END IF;

  FOREACH sid IN ARRAY seed_ids LOOP
    INSERT INTO public.friendships (user_id, friend_id, status)
    VALUES (my_id, sid, 'accepted')
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Also make seed users follow you back
  FOREACH sid IN ARRAY seed_ids LOOP
    INSERT INTO public.friendships (user_id, friend_id, status)
    VALUES (sid, my_id, 'accepted')
    ON CONFLICT DO NOTHING;
  END LOOP;

  RAISE NOTICE 'You are now following all seed users and they follow you back!';
END $$;
