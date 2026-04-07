import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useFeedStore = create((set, get) => ({
  posts: [],
  loading: false,
  hasMore: true,
  page: 0,
  PAGE_SIZE: 10,
  currentUserId: null, // track which user's feed this is

  // Call when user changes to clear stale data
  clearFeed: () => set({ posts: [], page: 0, hasMore: true, currentUserId: null }),

  fetchFeed: async (reset = false) => {
    const { page, PAGE_SIZE, posts, loading } = get()
    if (loading && !reset) return
    const currentPage = reset ? 0 : page
    set({ loading: true })

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { set({ loading: false }); return }

    // If user changed, reset
    if (get().currentUserId && get().currentUserId !== user.id) {
      set({ posts: [], page: 0, hasMore: true })
    }

    const { data, error } = await supabase
      .from('posts_with_details')
      .select('*')
      .order('created_at', { ascending: false })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

    if (error || !data) {
      set({ loading: false })
      return
    }

    // Fetch this user's likes and saves for these posts
    let likedPostIds = new Set()
    let savedPostIds = new Set()

    if (data.length > 0) {
      const postIds = data.map(p => p.id)

      const [{ data: likes }, { data: saves }] = await Promise.all([
        supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
        supabase.from('saved_posts').select('post_id').eq('user_id', user.id).in('post_id', postIds),
      ])

      likedPostIds = new Set((likes || []).map(l => l.post_id))
      savedPostIds = new Set((saves || []).map(s => s.post_id))
    }

    const enriched = data.map(p => ({
      ...p,
      liked_by_me: likedPostIds.has(p.id),
      saved_by_me: savedPostIds.has(p.id),
    }))

    set({
      posts: reset ? enriched : [...posts, ...enriched],
      page: currentPage + 1,
      hasMore: data.length === PAGE_SIZE,
      loading: false,
      currentUserId: user.id,
    })
  },

  toggleLike: async (postId, userId, currentlyLiked) => {
    const { posts } = get()

    // Optimistic update
    set({
      posts: posts.map(p =>
        p.id === postId
          ? { ...p, liked_by_me: !currentlyLiked, likes_count: currentlyLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1 }
          : p
      ),
    })

    if (currentlyLiked) {
      const { error } = await supabase.from('likes').delete().match({ post_id: postId, user_id: userId })
      if (error) {
        // Revert
        set({ posts: get().posts.map(p => p.id === postId ? { ...p, liked_by_me: true, likes_count: p.likes_count + 1 } : p) })
      }
    } else {
      const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId })
      if (error) {
        // Revert (e.g. duplicate)
        set({ posts: get().posts.map(p => p.id === postId ? { ...p, liked_by_me: false, likes_count: Math.max(0, p.likes_count - 1) } : p) })
      }
    }
  },

  addPost: (post) => set(s => ({ posts: [{ ...post, liked_by_me: false, saved_by_me: false }, ...s.posts] })),

  deletePost: async (postId) => {
    await supabase.from('posts').delete().eq('id', postId)
    set(s => ({ posts: s.posts.filter(p => p.id !== postId) }))
  },
}))
