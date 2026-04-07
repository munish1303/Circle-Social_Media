import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import { useFeedStore } from '../store/feedStore'
import TopBar from '../components/layout/TopBar'
import StoriesRow from '../components/feed/StoriesRow'
import PostCard from '../components/feed/PostCard'
import Spinner from '../components/ui/Spinner'
import './Feed.css'

export default function Feed() {
  const { posts, loading, hasMore, fetchFeed } = useFeedStore()
  const navigate = useNavigate()

  // Refresh feed every time this page becomes visible
  useEffect(() => {
    fetchFeed(true)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchFeed(true)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const handleScroll = useCallback((e) => {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200 && hasMore && !loading) {
      fetchFeed()
    }
  }, [hasMore, loading, fetchFeed])

  return (
    <>
      <TopBar
        onBack={false}
        logo="Circle"
        border
        actions={
          <button className="feed-topbar-btn" onClick={() => navigate('/messages')} aria-label="Messages">
            <Send size={24} />
          </button>
        }
      />
      <div className="page-content" onScroll={handleScroll}>
        <StoriesRow />

        {loading && posts.length === 0 ? (
          <div className="feed-loading"><Spinner size="lg" /></div>
        ) : posts.length === 0 ? (
          <div className="feed-empty">
            <p className="feed-empty__title">Welcome to Circle</p>
            <p className="feed-empty__sub">Follow friends to see their posts here.</p>
            <button className="feed-empty__cta" onClick={() => navigate('/search')}>Find Friends</button>
          </div>
        ) : (
          <>
            {posts.map(post => <PostCard key={post.id} post={post} />)}
            {loading && <div className="feed-loading-more"><Spinner /></div>}
            {!hasMore && posts.length > 0 && <div className="feed-end">You're all caught up</div>}
          </>
        )}
      </div>
    </>
  )
}
