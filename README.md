# Circle — Social Media App

A privacy-first social media application built for real friendships. No algorithms, no ads, no data selling. Just you and the people you actually care about.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Seeding Data](#seeding-data)
- [Security & Privacy](#security--privacy)
- [Architecture Decisions](#architecture-decisions)

---

## Overview

Circle is a full-stack social media web app inspired by Instagram, built with a focus on:

- **Privacy by default** — private accounts, no public discovery, no algorithmic feed
- **Chronological feed** — posts appear in order, no ranking or boosting
- **Real connections** — follow requests, accepted friendships, content gated behind follows
- **No ads, no tracking** — zero third-party analytics or data selling

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Routing | React Router v7 |
| State Management | Zustand 5 |
| Backend / Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime (WebSockets) |
| Image Compression | browser-image-compression |
| Icons | lucide-react |
| Date Utilities | date-fns |
| Styling | Plain CSS with CSS custom properties |
| Build Tool | Vite |

---

## Features

### Authentication
- Email + password signup and login
- Forgot password with email reset link
- Auto profile creation on signup via database trigger
- Session persistence across page refreshes
- Secure logout that clears all local state

### Feed
- Chronological feed — no algorithm, no ranking
- Only shows posts from users you follow (accepted friendships)
- Infinite scroll with pagination
- Auto-refreshes on tab focus and page navigation
- Double-tap to like (Instagram-style)

### Stories
- Post photo or video stories (24-hour expiry)
- Stories row on homepage showing your story + followed users
- Full-screen story viewer with progress bars
- Tap left/right to navigate between stories
- Gradient ring = unviewed, grey ring = viewed
- Viewed state persisted per-user in localStorage + synced to DB
- See who viewed your story (owner only)
- Reply bar for other users' stories

### Story Highlights
- Create named highlight collections from your stories
- Multiple highlights per profile, each with a custom cover
- Highlights visible on your profile page
- Long-press to edit or delete a highlight
- Stories added to highlights persist beyond 24h expiry

### Posts
- Create posts with photos and videos (up to 10 media items)
- Client-side image compression before upload (WebP, max 1MB)
- Caption with "read more" truncation
- Location tagging
- Audience control: Friends / Close Friends / Only Me
- Like, comment, share, save actions
- One like per user enforced at DB level (unique constraint)
- Delete your own posts

### Comments
- Bottom sheet comment viewer
- Post and delete comments
- Like individual comments
- Real-time comment count updates

### Share
- Share posts to followed friends via DM
- Copy link to clipboard
- Native Web Share API support

### Saved Posts
- Save/unsave any post
- Saved posts page (private, only visible to you)
- 3-column grid layout

### Profile
- Avatar upload with compression
- Bio, website, full name, username
- Post count, followers, following stats
- 3-column post grid + reels tab
- Story ring on profile avatar
- Story highlights row
- Edit profile page
- Share profile

### Privacy System
- Public accounts: anyone can follow and see posts
- Private accounts: follow request required
- When account switches to private, posts immediately disappear from non-followers' feeds (enforced by RLS at DB level)
- Private profiles show locked state to non-followers
- No stories, highlights, or posts visible until follow is accepted

### Follow System
- Follow public accounts instantly
- Send follow requests to private accounts
- Accept / Decline follow requests in Notifications
- "Follow Back" button when someone follows you
- Unfollow at any time
- Cancel pending follow requests

### Notifications
- Real-time notifications via Supabase Realtime
- Like notifications (someone liked your post)
- Comment notifications
- Follow notifications
- Follow request with Confirm / Delete buttons
- Toast notifications for real-time events
- Unread badge on bottom nav

### Direct Messages
- Conversation list with unread counts
- Real-time chat via Supabase Realtime
- Send text messages
- Share posts directly to a friend's DMs
- Online/active status

### Search
- Search users by username or full name
- Recent searches saved locally
- Remove individual recent searches
- Results show verified badges

### Settings
- Edit Profile (avatar, name, username, bio, website)
- Change Password (re-authenticates before updating)
- Privacy settings (private account toggle, DM control, activity status)
- Notification preferences (per-type toggles, persisted to localStorage)
- Security page (active sessions, sign out all devices)
- Help & Support (FAQ accordion, report a problem form)
- Saved Posts archive
- Log out
- Delete Account

### UI / UX
- Mobile-first design (max-width 470px, centered)
- Instagram-inspired design language
- Gradient story rings (pink → purple → blue)
- Bottom navigation bar
- Bottom sheets for options and actions
- Toast notifications
- Skeleton loading states
- Smooth animations (fade in, slide up)
- Safe area insets for notched phones
- Custom scrollbar hidden for clean look
- Dancing Script font for the Circle logo

---

## Project Structure

```
circle/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── feed/
│   │   │   ├── BottomSheet.jsx       # Action bottom sheet
│   │   │   ├── CommentSheet.jsx      # Comments bottom sheet
│   │   │   ├── PostCard.jsx          # Feed post card
│   │   │   ├── ShareSheet.jsx        # Share post sheet
│   │   │   └── StoriesRow.jsx        # Horizontal stories row
│   │   ├── layout/
│   │   │   ├── BottomNav.jsx         # Bottom navigation bar
│   │   │   └── TopBar.jsx            # Page top bar
│   │   ├── stories/
│   │   │   ├── HighlightCreator.jsx  # Create/edit highlights
│   │   │   ├── StoryCreator.jsx      # Post a new story
│   │   │   └── StoryViewer.jsx       # Full-screen story viewer
│   │   └── ui/
│   │       ├── Avatar.jsx            # Avatar with story ring
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Spinner.jsx
│   │       └── Toast.jsx
│   ├── hooks/
│   │   ├── useAuth.js                # Auth listener + story store init
│   │   └── useRealtimeNotifications.js
│   ├── lib/
│   │   ├── compression.js            # Image/video compression utils
│   │   ├── supabase.js               # Supabase client
│   │   └── utils.js                  # cn(), timeAgo(), formatCount()
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Splash.jsx
│   │   ├── settings/
│   │   │   ├── ChangePassword.jsx
│   │   │   ├── HelpSupport.jsx
│   │   │   ├── NotificationPrefs.jsx
│   │   │   ├── Privacy.jsx
│   │   │   └── Security.jsx
│   │   ├── Chat.jsx                  # DM conversation
│   │   ├── CreatePost.jsx
│   │   ├── EditProfile.jsx
│   │   ├── Feed.jsx
│   │   ├── Messages.jsx              # Conversations list
│   │   ├── Notifications.jsx
│   │   ├── PostDetail.jsx
│   │   ├── Profile.jsx
│   │   ├── SavedPosts.jsx
│   │   ├── Search.jsx
│   │   └── Settings.jsx
│   ├── router/
│   │   └── ProtectedRoute.jsx
│   ├── store/
│   │   ├── authStore.js              # User session + profile
│   │   ├── feedStore.js              # Posts + likes
│   │   ├── notificationStore.js      # Notifications + unread count
│   │   ├── storyStore.js             # Viewed story IDs (per-user, persisted)
│   │   └── uiStore.js                # Toast, modal, bottom sheet
│   ├── App.jsx
│   ├── index.css                     # Design system + CSS variables
│   └── main.jsx
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql            # All tables
│       ├── 002_views.sql             # posts_with_details, conversations
│       ├── 003_rls.sql               # Row Level Security policies
│       ├── 004_triggers.sql          # Auto profile, notifications, counts
│       ├── 005_indexes.sql           # Performance indexes
│       ├── 006_stories.sql           # story_views, highlights tables
│       ├── 007_privacy_feed.sql      # Privacy-aware RLS policies
│       ├── 008_per_user_identity.sql # View fix + profile update policy
│       ├── 009_seed_data.sql         # 10 fake users with posts & stories
│       └── 010_follow_seed_users.sql # Make your account follow seed users
├── .env                              # Your Supabase credentials (gitignored)
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## Database Schema

```
auth.users              → Managed by Supabase Auth
profiles                → id, username, full_name, bio, avatar_url, is_private, is_verified
friendships             → user_id, friend_id, status (pending/accepted/blocked)
posts                   → id, user_id, caption, location, visibility, created_at
post_media              → id, post_id, url, type (image/video), order
likes                   → id, post_id, user_id  [unique: post_id + user_id]
comments                → id, post_id, user_id, content
stories                 → id, user_id, media_url, media_type, expires_at
story_views             → id, story_id, viewer_id  [unique: story_id + viewer_id]
highlights              → id, user_id, title, cover_url
highlight_items         → id, highlight_id, story_id, media_url, media_type
messages                → id, sender_id, receiver_id, content, read
notifications           → id, user_id, actor_id, type, post_id, payload, read
saved_posts             → id, user_id, post_id  [unique: user_id + post_id]
```

### Views
- `posts_with_details` — joins posts with profile info, like counts, comment counts, and media
- `stories_with_profiles` — active stories joined with author profiles
- `conversations_with_details` — latest message per conversation with unread count

### Key Triggers
- `on_auth_user_created` — auto-creates a profile row when a user signs up
- `on_friendship_change` — updates follower/following counts
- `on_like_insert` — creates a like notification for the post owner
- `on_comment_insert` — creates a comment notification for the post owner
- `set_updated_at` — auto-updates `updated_at` on profiles and posts

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) account (free tier works)

### Clone the repository

```bash
git clone https://github.com/yourusername/circle.git
cd circle
```

### Install dependencies

```bash
npm install
```

---

## Supabase Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New Project → fill in name and password → Create.

### 2. Run migrations

In your Supabase dashboard → SQL Editor → run each file in order:

```
supabase/migrations/001_schema.sql
supabase/migrations/002_views.sql
supabase/migrations/003_rls.sql
supabase/migrations/004_triggers.sql
supabase/migrations/005_indexes.sql
supabase/migrations/006_stories.sql
supabase/migrations/007_privacy_feed.sql
supabase/migrations/008_per_user_identity.sql
```

### 3. Create storage buckets

In Supabase → Storage → New bucket (set each to **Public**):

| Bucket name | Public |
|---|---|
| `avatars` | ✅ Yes |
| `post-media` | ✅ Yes |
| `stories` | ✅ Yes |

### 4. Add storage policies

Run this in SQL Editor:

```sql
-- post-media
CREATE POLICY "Anyone can view post media" ON storage.objects FOR SELECT USING (bucket_id = 'post-media');
CREATE POLICY "Auth users can upload post media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-media');
CREATE POLICY "Users can delete own post media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'post-media');

-- avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

-- stories
CREATE POLICY "Anyone can view stories" ON storage.objects FOR SELECT USING (bucket_id = 'stories');
CREATE POLICY "Auth users can upload stories" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'stories');
CREATE POLICY "Users can delete own stories" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'stories');
```

### 5. Enable Realtime

In Supabase → SQL Editor:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

### 6. Disable email confirmation (for development)

Supabase → Authentication → Providers → Email → turn off **Confirm email** → Save.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in Supabase → Settings → API.

---

## Running the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other commands

```bash
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## Seeding Data

To populate the app with fake users, posts, and stories:

### Step 1 — Run the seed script

In Supabase SQL Editor, run `supabase/migrations/009_seed_data.sql`.

This creates 10 fake users with:
- Realistic usernames, bios, and avatar photos
- 15 posts with Unsplash images
- 8 active stories
- Friendships between seed users
- Likes on posts

### Step 2 — Follow seed users from your account

Edit `supabase/migrations/010_follow_seed_users.sql` — replace `munish_13` with your actual username, then run it.

This makes your account follow all 10 seed users (and they follow you back), so their posts and stories appear in your feed immediately.

---

## Security & Privacy

### Row Level Security (RLS)

Every table has RLS enabled. Key policies:

- **Posts** — only visible to the post owner or accepted followers (private accounts) / everyone (public accounts)
- **Stories** — only visible to the story owner or accepted followers
- **Highlights** — same as stories
- **Messages** — only visible to sender and receiver
- **Notifications** — only visible to the recipient
- **Saved posts** — only visible to the saving user
- **Likes** — unique constraint prevents duplicate likes

### Privacy toggle enforcement

When a user switches their account to private, the RLS policy on `posts` immediately stops returning their posts to non-followers on the next query. No extra code needed — the database enforces it at the row level on every request.

### No data selling

The app has zero third-party analytics, no ad infrastructure, and no tracking pixels. User data stays in your Supabase project.

---

## Architecture Decisions

### Why Zustand over Redux?

Zustand has a much smaller API surface, no boilerplate, and works perfectly for this scale. The stores are simple slices: `authStore`, `feedStore`, `notificationStore`, `storyStore`, `uiStore`.

### Why plain CSS over Tailwind?

The design system uses CSS custom properties (variables) for colors, spacing, and typography. This gives full control over the design without class name bloat, and makes the Instagram-inspired aesthetic easier to maintain consistently.

### Why client-side image compression?

Using `browser-image-compression`, images are compressed to WebP at max 1MB before upload. This reduces storage costs, speeds up uploads, and improves feed load times — all without a server-side processing step.

### Story viewed state

Viewed story IDs are stored in Zustand with `localStorage` persistence, keyed by user ID (`circle-story-views-{userId}`). This means:
- Ring color updates instantly without a DB round-trip
- State persists across page refreshes
- Different users on the same device have separate viewed states
- DB sync happens in the background for cross-device consistency

### Feed pagination

The feed uses offset-based pagination with a page size of 10. The `posts_with_details` view handles all joins server-side. Per-user like/save state is fetched in a single batch query after the posts load, not per-post.

### Realtime notifications

Supabase Realtime listens on the `notifications` table filtered by `user_id = current_user`. When a like or comment trigger fires and inserts a notification row, the client receives it instantly and shows a toast + increments the bell badge.

---

## Design System

```css
/* Colors */
--color-bg: #ffffff
--color-surface: #fafafa
--color-border: #dbdbdb
--color-text: #262626
--color-text-secondary: #8e8e8e
--color-link: #0095f6
--color-cta: #0095f6
--color-error: #ed4956
--color-like: #ed4956
--gradient-story: linear-gradient(45deg, #f58529, #dd2a7b, #8134af, #515bd4)

/* Typography */
--font-logo: 'Dancing Script', cursive
--font-body: 'Inter', -apple-system, sans-serif

/* Layout */
--max-width: 470px
--nav-height: 60px
--topbar-height: 56px
```

---

## License

MIT — free to use, modify, and distribute.

---

Built with ❤️ — made by friends, for friends.
