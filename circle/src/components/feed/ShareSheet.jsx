import { useState, useEffect } from 'react'
import { X, Link2, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import Avatar from '../ui/Avatar'
import './ShareSheet.css'

export default function ShareSheet({ post, onClose }) {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [friends, setFriends] = useState([])
  const [sent, setSent] = useState({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('friendships')
      .select('friend:profiles!friendships_friend_id_fkey(id, username, avatar_url, full_name), user:profiles!friendships_user_id_fkey(id, username, avatar_url, full_name)')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .limit(20)
      .then(({ data }) => {
        if (!data) return
        const list = data.map(f => f.user?.id === user.id ? f.friend : f.user).filter(Boolean)
        setFriends(list)
      })
  }, [user])

  const sendToFriend = async (friendId) => {
    if (sent[friendId]) return
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: friendId,
      content: `Check out this post: ${window.location.origin}/post/${post.id}`,
    })
    setSent(s => ({ ...s, [friendId]: true }))
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
    setCopied(true)
    showToast('Link copied', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${post.username} on Circle`,
        text: post.caption || 'Check out this post on Circle',
        url: `${window.location.origin}/post/${post.id}`,
      })
    } else {
      copyLink()
    }
  }

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-sheet" onClick={e => e.stopPropagation()}>
        <div className="share-sheet__header">
          <span className="share-sheet__title">Share</span>
          <button className="share-sheet__close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        {/* Friends row */}
        {friends.length > 0 && (
          <div className="share-friends">
            {friends.map(f => (
              <button key={f.id} className="share-friend" onClick={() => sendToFriend(f.id)}>
                <div className="share-friend__avatar-wrap">
                  <Avatar src={f.avatar_url} name={f.full_name} size="md" />
                  {sent[f.id] && (
                    <span className="share-friend__sent"><Check size={10} strokeWidth={3} /></span>
                  )}
                </div>
                <span className="share-friend__name">{f.username}</span>
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="share-actions">
          <button className="share-action-btn" onClick={copyLink}>
            <div className="share-action-icon">
              {copied ? <Check size={22} color="var(--color-success)" /> : <Link2 size={22} />}
            </div>
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button className="share-action-btn" onClick={nativeShare}>
            <div className="share-action-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </div>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  )
}
