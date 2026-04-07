import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useNotificationStore } from '../store/notificationStore'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import TopBar from '../components/layout/TopBar'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import { timeAgo } from '../lib/utils'
import './Notifications.css'

const NOTIF_LABELS = {
  like: 'liked your photo.',
  comment: 'commented:',
  follow: 'started following you.',
  follow_request: 'requested to follow you.',
  mention: 'mentioned you in a comment.',
  tag: 'tagged you in a photo.',
}

export default function Notifications() {
  const { user } = useAuthStore()
  const { notifications, loading, fetchNotifications, markAllRead } = useNotificationStore()
  const { showToast } = useUIStore()
  const navigate = useNavigate()
  // Track locally which requests were accepted/rejected this session
  const [accepted, setAccepted] = useState({})
  const [rejected, setRejected] = useState({})
  // Track which "follow" notifications we've followed back
  const [followedBack, setFollowedBack] = useState({})

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id)
      markAllRead(user.id)
    }
  }, [user])

  const handleNotifClick = (notif) => {
    if (notif.type === 'follow_request') return
    if (notif.post_id) navigate(`/post/${notif.post_id}`)
    else if (notif.actor?.username) navigate(`/profile/${notif.actor.username}`)
  }

  const handleAccept = async (notif) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('user_id', notif.actor_id)
      .eq('friend_id', user.id)

    if (error) {
      // Try inserting if it doesn't exist
      await supabase.from('friendships').upsert({
        user_id: notif.actor_id,
        friend_id: user.id,
        status: 'accepted',
      }, { onConflict: 'user_id,friend_id' })
    }

    // Notify the requester they were accepted
    await supabase.from('notifications').insert({
      user_id: notif.actor_id,
      actor_id: user.id,
      type: 'follow',
    })

    // Update notification payload
    await supabase.from('notifications')
      .update({ read: true, payload: JSON.stringify({ accepted: true }) })
      .eq('id', notif.id)

    setAccepted(a => ({ ...a, [notif.id]: true }))
    showToast(`Accepted ${notif.actor?.username}'s request`, 'success')
  }

  const handleReject = async (notif) => {
    await supabase.from('friendships')
      .delete()
      .eq('user_id', notif.actor_id)
      .eq('friend_id', user.id)

    await supabase.from('notifications').delete().eq('id', notif.id)
    setRejected(r => ({ ...r, [notif.id]: true }))
    showToast('Request declined', 'info')
  }

  const handleFollowBack = async (notif) => {
    if (!notif.actor_id || followedBack[notif.id]) return
    // Check if already following
    const { data: existing } = await supabase
      .from('friendships')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('friend_id', notif.actor_id)
      .maybeSingle()

    if (!existing) {
      await supabase.from('friendships').insert({
        user_id: user.id,
        friend_id: notif.actor_id,
        status: 'accepted',
      })
      await supabase.from('notifications').insert({
        user_id: notif.actor_id,
        actor_id: user.id,
        type: 'follow',
      })
    }
    setFollowedBack(f => ({ ...f, [notif.id]: true }))
    showToast(`Following ${notif.actor?.username}`, 'success')
  }

  return (
    <>
      <TopBar onBack={false} title="Notifications" border />
      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size="lg" /></div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <p>No notifications yet</p>
            <span>When your friends interact with you, you'll see it here.</span>
          </div>
        ) : (
          <ul className="notif-list">
            {notifications.map(n => {
              if (rejected[n.id]) return null
              const isAccepted = accepted[n.id] || n.payload?.accepted
              return (
                <li key={n.id}>
                  <div
                    className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}
                    onClick={() => handleNotifClick(n)}
                    style={{ cursor: ['follow_request', 'follow'].includes(n.type) ? 'default' : 'pointer' }}
                  >
                    <Avatar
                      src={n.actor?.avatar_url}
                      name={n.actor?.username}
                      size="md"
                      onClick={() => navigate(`/profile/${n.actor?.username}`)}
                    />
                    <div className="notif-content">
                      <p className="notif-text">
                        <span className="notif-actor" onClick={() => navigate(`/profile/${n.actor?.username}`)}>
                          {n.actor?.username}
                        </span>{' '}
                        {NOTIF_LABELS[n.type] || ''}
                        {n.type === 'comment' && <span className="notif-comment"> "{n.payload?.comment}"</span>}
                      </p>
                      <time className="notif-time">{timeAgo(n.created_at)}</time>
                    </div>

                    {n.post_thumbnail && (
                      <img src={n.post_thumbnail} alt="" className="notif-thumb" />
                    )}

                    {/* Follow request — show Confirm/Delete */}
                    {n.type === 'follow_request' && !isAccepted && (
                      <div className="notif-actions" onClick={e => e.stopPropagation()}>
                        <button className="notif-btn notif-btn--confirm" onClick={() => handleAccept(n)}>
                          Confirm
                        </button>
                        <button className="notif-btn notif-btn--delete" onClick={() => handleReject(n)}>
                          Delete
                        </button>
                      </div>
                    )}

                    {/* After accepting — show "Accepted" badge */}
                    {n.type === 'follow_request' && isAccepted && (
                      <span className="notif-accepted">Accepted</span>
                    )}

                    {/* Someone followed you — show "Follow Back" */}
                    {n.type === 'follow' && (
                      <button
                        className={`notif-btn ${followedBack[n.id] ? 'notif-btn--following' : 'notif-btn--confirm'}`}
                        onClick={e => { e.stopPropagation(); handleFollowBack(n) }}
                        disabled={followedBack[n.id]}
                      >
                        {followedBack[n.id] ? 'Following' : 'Follow Back'}
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}
