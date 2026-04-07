import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// Keyed by userId so different users on same device don't share viewed state
const getStorageKey = (userId) => `circle-story-views-${userId}`

const loadFromStorage = (userId) => {
  if (!userId) return []
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(userId)) || '[]')
  } catch { return [] }
}

const saveToStorage = (userId, ids) => {
  if (!userId) return
  localStorage.setItem(getStorageKey(userId), JSON.stringify(ids))
}

export const useStoryStore = create((set, get) => ({
  viewedIds: [],      // story IDs viewed by the CURRENT user
  currentUserId: null,

  // Call this on login / auth change
  initForUser: async (userId) => {
    const stored = loadFromStorage(userId)
    set({ viewedIds: stored, currentUserId: userId })

    // Sync from DB to catch views from other devices
    const { data } = await supabase
      .from('story_views')
      .select('story_id')
      .eq('viewer_id', userId)
    if (data) {
      const dbIds = data.map(v => v.story_id)
      const merged = [...new Set([...stored, ...dbIds])]
      set({ viewedIds: merged })
      saveToStorage(userId, merged)
    }
  },

  markViewed: (storyId) => {
    const { viewedIds, currentUserId } = get()
    if (viewedIds.includes(storyId)) return
    const next = [...viewedIds, storyId]
    set({ viewedIds: next })
    saveToStorage(currentUserId, next)

    // Persist to DB (best-effort, for other devices)
    if (currentUserId) {
      supabase.from('story_views').upsert(
        { story_id: storyId, viewer_id: currentUserId },
        { onConflict: 'story_id,viewer_id' }
      ).then(() => {})
    }
  },

  isViewed: (storyId) => get().viewedIds.includes(storyId),

  isGroupViewed: (stories) =>
    Array.isArray(stories) &&
    stories.length > 0 &&
    stories.every(s => get().viewedIds.includes(s.id)),

  pruneOld: (activeStoryIds) => {
    const { viewedIds, currentUserId } = get()
    const active = new Set(activeStoryIds)
    const pruned = viewedIds.filter(id => active.has(id))
    set({ viewedIds: pruned })
    saveToStorage(currentUserId, pruned)
  },

  clearForUser: () => {
    set({ viewedIds: [], currentUserId: null })
  },
}))
