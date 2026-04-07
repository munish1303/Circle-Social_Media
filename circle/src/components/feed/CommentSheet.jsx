import { useState, useEffect, useRef } from 'react'
import { Heart, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import Avatar from '../ui/Avatar'
import Spinner from '../ui/Spinner'
import { timeAgo } from '../../lib/utils'
import './CommentSheet.css'

export default function CommentSheet({ postId, onClose, onCommentAdded }) {
  const { user, profile } = useAuthStore()
  const { showToast } = useUIStore()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [likedComments, setLikedComments] = useState({})
  const inputRef = useRef()
  const listRef = useRef()

  useEffect(() => {
    if (!postId) return
    const load = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*, author:profiles!comments_user_id_fkey(id, username, avatar_url, full_name)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      setComments(data || [])
      setLoading(false)
    }
    load()
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [postId])

  const submit = async () => {
    if (!text.trim() || submitting || !user) return
    setSubmitting(true)
    const content = text.trim()
    setText('')
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: user.id, content })
      .select('*, author:profiles!comments_user_id_fkey(id, username, avatar_url, full_name)')
      .single()
    setSubmitting(false)
    if (!error && data) {
      setComments(c => [...c, data])
      onCommentAdded?.()
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 100)
    } else {
      showToast('Failed to post comment', 'error')
      setText(content)
    }
  }

  const toggleLike = (commentId) => {
    setLikedComments(prev => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const deleteComment = async (commentId) => {
    await supabase.from('comments').delete().eq('id', commentId)
    setComments(c => c.filter(x => x.id !== commentId))
  }

  return (
    <div className="comment-sheet-overlay" onClick={onClose}>
      <div className="comment-sheet" onClick={e => e.stopPropagation()}>
        <div className="comment-sheet__header">
          <span className="comment-sheet__title">Comments</span>
          <button className="comment-sheet__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="comment-sheet__list" ref={listRef}>
          {loading ? (
            <div className="comment-sheet__loading"><Spinner /></div>
          ) : comments.length === 0 ? (
            <div className="comment-sheet__empty">
              <p>No comments yet</p>
              <span>Be the first to comment</span>
            </div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="comment-row">
                <Avatar src={c.author?.avatar_url} name={c.author?.full_name} size="sm" />
                <div className="comment-row__content">
                  <p className="comment-row__text">
                    <span className="comment-row__user">{c.author?.username}</span>{' '}{c.content}
                  </p>
                  <div className="comment-row__meta">
                    <time>{timeAgo(c.created_at)}</time>
                    <button className="comment-row__reply">Reply</button>
                    {c.user_id === user?.id && (
                      <button className="comment-row__delete" onClick={() => deleteComment(c.id)}>Delete</button>
                    )}
                  </div>
                </div>
                <button
                  className={`comment-row__like ${likedComments[c.id] ? 'comment-row__like--active' : ''}`}
                  onClick={() => toggleLike(c.id)}
                  aria-label="Like comment"
                >
                  <Heart size={13} fill={likedComments[c.id] ? 'currentColor' : 'none'} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="comment-sheet__input-bar">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
          <input
            ref={inputRef}
            className="comment-sheet__input"
            placeholder="Add a comment..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            maxLength={500}
          />
          <button
            className={`comment-sheet__post ${!text.trim() ? 'comment-sheet__post--disabled' : ''}`}
            onClick={submit}
            disabled={!text.trim() || submitting}
          >
            {submitting ? <Spinner size="sm" /> : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}
