import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import TopBar from '../components/layout/TopBar'
import Spinner from '../components/ui/Spinner'
import './SavedPosts.css'

export default function SavedPosts() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setPosts([])
    const load = async () => {
      const { data } = await supabase
        .from('saved_posts')
        .select(`
          post_id,
          post:posts_with_details!saved_posts_post_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setPosts((data || []).map(d => d.post).filter(Boolean))
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <>
      <TopBar title="Saved" />
      <div className="page-content no-nav">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="saved-empty">
            <Bookmark size={48} strokeWidth={1} />
            <p>No saved posts</p>
            <span>Save posts to revisit them later. Only you can see what you've saved.</span>
          </div>
        ) : (
          <div className="saved-grid">
            {posts.map(post => (
              <button
                key={post.id}
                className="saved-grid__item"
                onClick={() => navigate(`/post/${post.id}`)}
                aria-label="View saved post"
              >
                {post.media?.[0]?.type === 'video' ? (
                  <video src={post.media[0].url} className="saved-grid__img" preload="metadata" />
                ) : post.media?.[0]?.url ? (
                  <img src={post.media[0].url} alt="" className="saved-grid__img" loading="lazy" />
                ) : (
                  <div className="saved-grid__text-post">
                    <p>{post.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
