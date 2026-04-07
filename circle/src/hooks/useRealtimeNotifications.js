import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import { useUIStore } from '../store/uiStore'

export function useRealtimeNotifications() {
  const { user } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const { showToast } = useUIStore()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const notif = payload.new

          // Fetch actor profile
          const { data: actor } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, full_name')
            .eq('id', notif.actor_id)
            .single()

          const enriched = { ...notif, actor }
          addNotification(enriched)

          // Show toast
          const messages = {
            like: `${actor?.username} liked your post`,
            comment: `${actor?.username} commented on your post`,
            follow: `${actor?.username} started following you`,
            follow_request: `${actor?.username} requested to follow you`,
            mention: `${actor?.username} mentioned you`,
          }
          const msg = messages[notif.type]
          if (msg) showToast(msg, 'info')
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps
}
