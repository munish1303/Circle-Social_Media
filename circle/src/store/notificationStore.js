import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async (userId) => {
    set({ loading: true })
    const { data } = await supabase
      .from('notifications')
      .select('*, actor:profiles!notifications_actor_id_fkey(id, username, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) {
      set({
        notifications: data,
        unreadCount: data.filter(n => !n.read).length,
        loading: false,
      })
    } else {
      set({ loading: false })
    }
  },

  markAllRead: async (userId) => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  addNotification: (notif) =>
    set(s => ({
      notifications: [notif, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    })),
}))
