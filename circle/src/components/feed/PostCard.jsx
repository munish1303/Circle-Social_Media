import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useFeedStore } from '../../store/feedStore'
import { useUIStore } from '../../store/uiStore'
import { supabase } from '../../lib/supabase'
import Avatar from '../ui/Avatar'
import CommentSheet from './CommentSheet'
import ShareSheet from './ShareSheet'
import { timeAgo, formatCount } from '../../lib/utils'
import './PostCard.css'

export default function PostCard({ post }) {
  const { user } = useAuthStore()
  const { toggleLike, deletePost } = useFeedStore()
  const { openBottomSheet, showToast } = useUIStore()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(post.saved_by_me || false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)

  const handleLike = () => {
    if (!user) return
    toggleLike(post.id, user.id, post.liked_by_me)
  }

  const handleDoubleTap = () => {
    if (!post.liked_by_me) handleLike()
  }

  const handleSave = async () => {
    if (!user) return
    const newSaved = !saved
    setSaved(newSaved)
    if (newSaved) {
      const { error } = await supabase.from('saved_posts').insert({ user_id: user.id, post_id: post.id })
      if (error) { setSaved(false); showToast('Failed to save', 'error') }
      else showToast('Post saved', 'success')
    } else {
      await supabase.from('saved_posts').delete().match({ user_id: user.id, post_id: post.id })
      showToast('Removed from saved', 'info')
    }
  }

  const handleOptions = () => {
    const isOwner = user?.id === post.user_id
    openBottomSheet({
      options: isOwner
        ? [
            { label: 'Delete post', danger: true, action: () => { deletePost(post.id); showToast('Post deleted', 'success') } },
          ]
        : [
            { label: 'Report', danger: true, action: () => showToast('Reported', 'info') },
            { label: 'Not interested', action: () => showToast('Got it', 'info') },
          ],
    })
  }

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-card__header">
        <div className="post-card__user" onClick={() => navigate(`/profile/${post.username}`)}>
          <Avatar src={post.avatar_url} name={post.full_name} size="sm" hasStory={post.has_story} />
          <div className="post-card__user-info">
            <span className="post-card__username">{post.username}</span>
            {post.location && <span className="post-card__location">{post.location}</span>}
          </div>
        </div>
        <button className="post-card__more" onClick={handleOptions} aria-label="Post options">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Media */}
      {post.media?.length > 0 && (
        <div className="post-card__media" onDoubleClick={handleDoubleTap}>
          {!imgLoaded && post.media[0].type !== 'video' && <div className="post-card__media-skeleton" />}
          {post.media[0].type === 'video' ? (
            <VideoPlayer src={post.media[0].url} />
          ) : (
            <img
              src={post.media[0].url}
              alt={post.caption || 'Post image'}
              className="post-card__img"
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              style={{ opacity: imgLoaded ? 1 : 0 }}
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="post-card__actions">
        <div className="post-card__actions-left">
          <button
            className={`post-card__action-btn ${post.liked_by_me ? 'post-card__action-btn--liked' : ''}`}
            onClick={handleLike}
            aria-label={post.liked_by_me ? 'Unlike' : 'Like'}
          >
            <Heart size={24} fill={post.liked_by_me ? 'currentColor' : 'none'} />
          </button>
          <button
            className="post-card__action-btn"
            onClick={() => setShowComments(true)}
            aria-label="Comment"
          >
            <MessageCircle size={24} />
          </button>
          <button
            className="post-card__action-btn"
            onClick={() => setShowShare(true)}
            aria-label="Share"
          >
            <Send size={24} />
          </button>
        </div>
        <button
          className={`post-card__action-btn ${saved ? 'post-card__action-btn--saved' : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <Bookmark size={24} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Likes */}
      {post.likes_count > 0 && (
        <div className="post-card__likes">
          {formatCount(post.likes_count)} {post.likes_count === 1 ? 'like' : 'likes'}
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="post-card__caption">
          <span className="post-card__caption-user" onClick={() => navigate(`/profile/${post.username}`)}>
            {post.username}
          </span>{' '}
          <PostCaption text={post.caption} />
        </div>
      )}

      {/* Comments preview */}
      {commentsCount > 0 && (
        <button className="post-card__comments-link" onClick={() => setShowComments(true)}>
          View all {formatCount(commentsCount)} comments
        </button>
      )}

      {/* Timestamp */}
      <time className="post-card__time" dateTime={post.created_at}>
        {timeAgo(post.created_at)}
      </time>

      {/* Comment Sheet */}
      {showComments && (
        <CommentSheet
          postId={post.id}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentsCount(c => c + 1)}
        />
      )}

      {/* Share Sheet */}
      {showShare && (
        <ShareSheet
          post={post}
          onClose={() => setShowShare(false)}
        />
      )}
    </article>
  )
}

function VideoPlayer({ src }) {
  const videoRef = useRef()
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) { videoRef.current.pause() } else { videoRef.current.play() }
    setPlaying(v => !v)
  }

  return (
    <div className="video-player" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        className="post-card__img"
        playsInline
        muted={muted}
        preload="metadata"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {!playing && (
        <div className="video-play-btn" aria-label="Play video">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.45)" />
            <polygon points="19,14 38,24 19,34" fill="white" />
          </svg>
        </div>
      )}
      <button
        className="video-mute-btn"
        onClick={e => { e.stopPropagation(); setMuted(v => !v); if (videoRef.current) videoRef.current.muted = !muted }}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18l2 2L21 18.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        )}
      </button>
    </div>
  )
}

function PostCaption({ text }) {
  const [expanded, setExpanded] = useState(false)
  const MAX = 120
  if (text.length <= MAX || expanded) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, MAX)}…{' '}
      <button className="post-card__more-text" onClick={() => setExpanded(true)}>more</button>
    </span>
  )
}
