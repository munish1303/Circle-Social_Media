import { useEffect } from 'react'
import { supabase, supabaseMissing } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useStoryStore } from '../store/storyStore'
import { useFeedStore } from '../store/feedStore'

export function useAuthListener() {
  const { setSession, setLoading, fetchProfile } = useAuthStore()
  const { initForUser, clearForUser } = useStoryStore()
  const { clearFeed } = useFeedStore()

  useEffect(() => {
    if (supabaseMissing) { setLoading(false); return }

    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => { if (mounted) setLoading(false) })
        initForUser(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch(() => { if (mounted) setLoading(false) })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
        initForUser(session.user.id)
      } else {
        clearForUser()
        clearFeed()
      }
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
