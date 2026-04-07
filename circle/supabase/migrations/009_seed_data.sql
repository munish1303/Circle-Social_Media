-- =====================
-- SEED: Create fake auth users first, then profiles, posts, stories
-- =====================

DO $$
DECLARE
  u1  uuid := 'a1000000-0000-0000-0000-000000000001';
  u2  uuid := 'a1000000-0000-0000-0000-000000000002';
  u3  uuid := 'a1000000-0000-0000-0000-000000000003';
  u4  uuid := 'a1000000-0000-0000-0000-000000000004';
  u5  uuid := 'a1000000-0000-0000-0000-000000000005';
  u6  uuid := 'a1000000-0000-0000-0000-000000000006';
  u7  uuid := 'a1000000-0000-0000-0000-000000000007';
  u8  uuid := 'a1000000-0000-0000-0000-000000000008';
  u9  uuid := 'a1000000-0000-0000-0000-000000000009';
  u10 uuid := 'a1000000-0000-0000-0000-000000000010';
BEGIN

-- =====================
-- Step 1: Insert into auth.users (required for FK)
-- =====================
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud
)
VALUES
  (u1,  '00000000-0000-0000-0000-000000000000', 'alex@circle.seed',   crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Alex Carter","username":"alex_vibes"}',        false, 'authenticated', 'authenticated'),
  (u2,  '00000000-0000-0000-0000-000000000000', 'sara@circle.seed',   crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sara Mitchell","username":"sara.moments"}',    false, 'authenticated', 'authenticated'),
  (u3,  '00000000-0000-0000-0000-000000000000', 'rajan@circle.seed',  crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rajan Patel","username":"dev_rajan"}',         false, 'authenticated', 'authenticated'),
  (u4,  '00000000-0000-0000-0000-000000000000', 'luna@circle.seed',   crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Luna Reyes","username":"luna_art"}',           false, 'authenticated', 'authenticated'),
  (u5,  '00000000-0000-0000-0000-000000000000', 'jake@circle.seed',   crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jake Thompson","username":"jake.outdoors"}',   false, 'authenticated', 'authenticated'),
  (u6,  '00000000-0000-0000-0000-000000000000', 'priya@circle.seed',  crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Sharma","username":"priya_cooks"}',      false, 'authenticated', 'authenticated'),
  (u7,  '00000000-0000-0000-0000-000000000000', 'tom@circle.seed',    crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tom Walker","username":"tom_travels"}',        false, 'authenticated', 'authenticated'),
  (u8,  '00000000-0000-0000-0000-000000000000', 'mia@circle.seed',    crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mia Johnson","username":"mia.fitness"}',       false, 'authenticated', 'authenticated'),
  (u9,  '00000000-0000-0000-0000-000000000000', 'kai@circle.seed',    crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kai Nakamura","username":"kai_music"}',        false, 'authenticated', 'authenticated'),
  (u10, '00000000-0000-0000-0000-000000000000', 'zoe@circle.seed',    crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Zoe Williams","username":"zoe.design"}',       false, 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- Step 2: Insert profiles
-- =====================
INSERT INTO public.profiles (id, username, full_name, bio, avatar_url, followers_count, following_count, is_verified)
VALUES
  (u1,  'alex_vibes',    'Alex Carter',    'Living life one photo at a time 📸',         'https://i.pravatar.cc/150?img=1',  142, 89,  false),
  (u2,  'sara.moments',  'Sara Mitchell',  'Coffee addict ☕ | Travel lover ✈️',          'https://i.pravatar.cc/150?img=5',  389, 201, true),
  (u3,  'dev_rajan',     'Rajan Patel',    'Full stack dev 💻 | Building cool stuff',     'https://i.pravatar.cc/150?img=8',  256, 134, false),
  (u4,  'luna_art',      'Luna Reyes',     'Artist 🎨 | Dreamer | She/Her',               'https://i.pravatar.cc/150?img=9',  891, 312, true),
  (u5,  'jake.outdoors', 'Jake Thompson',  'Hiking trails & mountain views 🏔️',           'https://i.pravatar.cc/150?img=12', 203, 178, false),
  (u6,  'priya_cooks',   'Priya Sharma',   'Home chef 🍳 | Food blogger | Mumbai',        'https://i.pravatar.cc/150?img=16', 567, 423, false),
  (u7,  'tom_travels',   'Tom Walker',     'Passport full, heart fuller 🌍',              'https://i.pravatar.cc/150?img=17', 1204, 567, true),
  (u8,  'mia.fitness',   'Mia Johnson',    'Fitness coach � | Mindset over matter',      'https://i.pravatar.cc/150?img=20', 734, 289, false),
  (u9,  'kai_music',     'Kai Nakamura',   'Producer 🎵 | Beats & vibes only',            'https://i.pravatar.cc/150?img=25', 445, 198, false),
  (u10, 'zoe.design',    'Zoe Williams',   'UI/UX Designer ✨ | Making things beautiful', 'https://i.pravatar.cc/150?img=29', 678, 345, true)
ON CONFLICT (id) DO NOTHING;

-- =====================
-- Step 3: Insert posts
-- =====================
INSERT INTO public.posts (id, user_id, caption, location, visibility, created_at)
VALUES
  ('b1000000-0000-0000-0000-000000000001', u1,  'Golden hour hits different 🌅 #photography #vibes',                'Santorini, Greece',   'friends', now() - interval '2 hours'),
  ('b1000000-0000-0000-0000-000000000002', u1,  'Weekend energy ⚡',                                                 'Los Angeles, CA',     'friends', now() - interval '1 day'),
  ('b1000000-0000-0000-0000-000000000003', u2,  'Morning coffee and good vibes ☕✨',                                 'Paris, France',       'friends', now() - interval '3 hours'),
  ('b1000000-0000-0000-0000-000000000004', u2,  'Explored this hidden gem today 🗺️ Highly recommend!',               'Kyoto, Japan',        'friends', now() - interval '2 days'),
  ('b1000000-0000-0000-0000-000000000005', u3,  'Just shipped a new feature 🚀 The grind never stops',               'Bangalore, India',    'friends', now() - interval '5 hours'),
  ('b1000000-0000-0000-0000-000000000006', u4,  'New painting finished 🎨 What do you think?',                       'Barcelona, Spain',    'friends', now() - interval '1 hour'),
  ('b1000000-0000-0000-0000-000000000007', u4,  'Art is not what you see, but what you make others see 🖌️',          'Studio, NYC',         'friends', now() - interval '3 days'),
  ('b1000000-0000-0000-0000-000000000008', u5,  'Summit reached! 3 hours of climbing worth every step 🏔️',          'Rocky Mountains, CO', 'friends', now() - interval '6 hours'),
  ('b1000000-0000-0000-0000-000000000009', u6,  'Homemade biryani for Sunday lunch 🍛 Recipe in bio!',               'Mumbai, India',       'friends', now() - interval '4 hours'),
  ('b1000000-0000-0000-0000-000000000010', u6,  'Tried this new fusion recipe and it slapped 🔥',                    'Home Kitchen',        'friends', now() - interval '1 day'),
  ('b1000000-0000-0000-0000-000000000011', u7,  'Bali sunsets are unreal 🌺 Day 3 of the trip',                      'Bali, Indonesia',     'friends', now() - interval '30 minutes'),
  ('b1000000-0000-0000-0000-000000000012', u7,  'Street food in Bangkok > everything else 🍜',                       'Bangkok, Thailand',   'friends', now() - interval '4 days'),
  ('b1000000-0000-0000-0000-000000000013', u8,  'Morning run done ✅ 5am club is real',                              'Central Park, NYC',   'friends', now() - interval '7 hours'),
  ('b1000000-0000-0000-0000-000000000014', u9,  'New beat dropping this Friday 🎵 Stay tuned',                       'Tokyo, Japan',        'friends', now() - interval '2 hours'),
  ('b1000000-0000-0000-0000-000000000015', u10, 'Redesigned this app UI from scratch 💻 Swipe to see before/after', 'Remote',              'friends', now() - interval '8 hours')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- Step 4: Insert post media
-- =====================
INSERT INTO public.post_media (post_id, url, type, "order")
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',    'image', 0),
  ('b1000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', 'image', 0),
  ('b1000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', 'image', 0)
ON CONFLICT DO NOTHING;

-- =====================
-- Step 5: Insert stories (active for 24h)
-- =====================
INSERT INTO public.stories (user_id, media_url, media_type, expires_at, created_at)
VALUES
  (u1,  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080', 'image', now() + interval '20 hours', now() - interval '4 hours'),
  (u2,  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080', 'image', now() + interval '22 hours', now() - interval '2 hours'),
  (u4,  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1080', 'image', now() + interval '18 hours', now() - interval '6 hours'),
  (u5,  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1080',    'image', now() + interval '21 hours', now() - interval '3 hours'),
  (u7,  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1080', 'image', now() + interval '23 hours', now() - interval '1 hour'),
  (u8,  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080', 'image', now() + interval '19 hours', now() - interval '5 hours'),
  (u9,  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1080', 'image', now() + interval '20 hours', now() - interval '3 hours'),
  (u10, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080',    'image', now() + interval '22 hours', now() - interval '2 hours')
ON CONFLICT DO NOTHING;

-- =====================
-- Step 6: Friendships between seed users
-- =====================
INSERT INTO public.friendships (user_id, friend_id, status)
VALUES
  (u1,u2,'accepted'),(u1,u3,'accepted'),(u1,u4,'accepted'),(u1,u7,'accepted'),(u1,u8,'accepted'),
  (u2,u3,'accepted'),(u2,u5,'accepted'),(u2,u6,'accepted'),
  (u3,u4,'accepted'),(u3,u9,'accepted'),(u3,u10,'accepted'),
  (u4,u5,'accepted'),(u4,u6,'accepted'),(u4,u7,'accepted'),
  (u5,u6,'accepted'),(u5,u8,'accepted'),
  (u6,u7,'accepted'),(u6,u9,'accepted'),
  (u7,u8,'accepted'),(u7,u10,'accepted'),
  (u8,u9,'accepted'),(u9,u10,'accepted')
ON CONFLICT DO NOTHING;

-- =====================
-- Step 7: Likes
-- =====================
INSERT INTO public.likes (post_id, user_id)
VALUES
  ('b1000000-0000-0000-0000-000000000001',u2),('b1000000-0000-0000-0000-000000000001',u3),('b1000000-0000-0000-0000-000000000001',u4),
  ('b1000000-0000-0000-0000-000000000003',u1),('b1000000-0000-0000-0000-000000000003',u4),('b1000000-0000-0000-0000-000000000003',u5),
  ('b1000000-0000-0000-0000-000000000006',u1),('b1000000-0000-0000-0000-000000000006',u2),('b1000000-0000-0000-0000-000000000006',u7),
  ('b1000000-0000-0000-0000-000000000008',u1),('b1000000-0000-0000-0000-000000000008',u3),
  ('b1000000-0000-0000-0000-000000000011',u1),('b1000000-0000-0000-0000-000000000011',u2),('b1000000-0000-0000-0000-000000000011',u4),('b1000000-0000-0000-0000-000000000011',u6),
  ('b1000000-0000-0000-0000-000000000013',u2),('b1000000-0000-0000-0000-000000000013',u5),
  ('b1000000-0000-0000-0000-000000000014',u3),('b1000000-0000-0000-0000-000000000014',u6),('b1000000-0000-0000-0000-000000000014',u9)
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Seed data inserted successfully! 10 users, 15 posts, 8 stories.';
END $$;
