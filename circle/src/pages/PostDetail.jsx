import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, Send, MoreHorizontal, Bookmark, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import TopBar from '../components/layout/TopBar'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import CommentSheet from '../components/feed/CommentSheet'
import ShareSheet from '../components/feed/ShareSheet'
import { timeAgo, formatCount } from '../lib/utils'
import './PostDetail.css'

export default function PostDetail() {
  const { postId } = useParams()
  const { user } = useAuthStore()
  const { showToast, openBottomSheet } = useUIStore()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [saved, setSaved] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase
        .from('posts_with_details')
        .select('*')
        .eq('id', postId)
        .single()

      if (!p) { navigate('/feed'); return }
      setPost(p)
      setLikesCount(p.likes_count || 0)
      setCommentsCount(p.comments_count || 0)

      if (user) {
        // Check if already liked
        const { data: likeRow } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle()
        setLiked(!!likeRow)

        // Check if saved
        const { data: saveRow } = await supabase
          .from('saved_posts')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle()
        setSaved(!!saveRow)
      }
      setLoading(false)
    }
    load()
  }, [postId, user, navigate])

  const handleLike = async () => {
    if (!user) return
    if (liked) {
      setLiked(false)
      setLikesCount(c => Math.max(0, c - 1))
      await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id })
    } else {
      setLiked(true)
      setLikesCount(c => c + 1)
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
    }
  }

  const handleSave = async () => {
    if (!user) return
    const newSaved = !saved
    setSaved(newSaved)
    if (newSaved) {
      await supabase.from('saved_posts').insert({ user_id: user.id, post_id: postId })
      showToast('Post saved', 'success')
    } else {
      await supabase.from('saved_posts').delete().match({ user_id: user.id, post_id: postId })
      showToast('Removed from saved', 'info')
    }
  }

  const handleOptions = () => {
    const isOwner = user?.id === post?.user_id
    openBottomSheet({
      options: isOwner
        ? [{ label: 'Delete post', danger: true, action: async () => {
            await supabase.from('posts').delete().eq('id', postId)
            showToast('Post deleted', 'success')
            navigate(-1)
          }}]
        : [
            { label: 'Report', danger: true, action: () => showToast('Reported', 'info') },
            { label: 'Not interested', action: () => showToast('Got it', 'info') },
          ],
    })
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <Spinner size="lg" />
    </div>
  )
  if (!post) return null

  return (
    <>
      <TopBar title="Post" />
      <div className="page-content">
        {/* Post header */}
        <div className="post-detail__header">
          <div className="post-detail__user" onClick={() => navigate(`/profile/${post.username}`)}>
            <Avatar src={post.avatar_url} name={post.full_name} size="sm" />
            <div>
              <span className="post-detail__username">{post.username}</span>
              {post.location && <p className="post-detail__location">{post.location}</p>}
            </div>
          </div>
          <button onClick={handleOptions} aria-label="Options">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Media */}
        {post.media?.[0] && (
          <div className="post-detail__media" onDoubleClick={handleLike}>
            {post.media[0].type === 'video'
              ? <video src={post.media[0].url} controls playsInline className="post-detail__img" />
              : <img src={post.media[0].url} alt="" className="post-detail__img" />
            }
          </div>
        )}

        {/* Actions row */}
        <div className="post-detail__actions">
          <div className="post-detail__actions-left">
            <button
              className={`post-detail__action-btn ${liked ? 'post-detail__action-btn--liked' : ''}`}
              onClick={handleLike}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <Heart size={26} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button
              className="post-detail__action-btn"
              onClick={() => setShowComments(true)}
              aria-label="Comment"
            >
              <MessageCircle size={26} />
            </button>
            <button
              className="post-detail__action-btn"
              onClick={() => setShowShare(true)}
              aria-label="Share"
            >
              <Send size={26} />
            </button>
          </div>
          <button
            className={`post-detail__action-btn ${saved ? 'post-detail__action-btn--saved' : ''}`}
            onClick={handleSave}
            aria-label={saved ? 'Unsave' : 'Save'}
          >
            <Bookmark size={26} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Likes count */}
        {likesCount > 0 && (
          <div className="post-detail__likes">{formatCount(likesCount)} {likesCount === 1 ? 'like' : 'likes'}</div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="post-detail__caption">
            <span className="post-detail__caption-user">{post.username}</span> {post.caption}
          </div>
        )}

        {/* View comments */}
        {commentsCount > 0 && (
          <button className="post-detail__view-comments" onClick={() => setShowComments(true)}>
            View all {formatCount(commentsCount)} comments
          </button>
        )}

        <time className="post-detail__time">{timeAgo(post.created_at)}</time>

        <div style={{ height: 32 }} />
      </div>

      {showComments && (
        <CommentSheet
          postId={postId}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentsCount(c => c + 1)}
        />
      )}

      {showShare && (
        <ShareSheet post={post} onClose={() => setShowShare(false)} />
      )}
    </>
  )
}
