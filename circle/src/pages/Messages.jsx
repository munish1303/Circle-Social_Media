import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import TopBar from '../components/layout/TopBar'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import { timeAgo } from '../lib/utils'
import './Messages.css'

export default function Messages() {
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await supabase
        .from('conversations_with_details')
        .select('*')
        .eq('participant_id', user.id)
        .order('last_message_at', { ascending: false })
      setConversations(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <>
      <TopBar
        title={profile?.username || 'Messages'}
        actions={
          <button onClick={() => navigate('/new-message')} aria-label="New message">
            <Edit size={22} />
          </button>
        }
      />
      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size="lg" /></div>
        ) : conversations.length === 0 ? (
          <div className="messages-empty">
            <p>No messages yet</p>
            <span>Send a message to a friend to get started.</span>
            <button className="feed-empty__cta" onClick={() => navigate('/new-message')}>Send Message</button>
          </div>
        ) : (
          <ul className="conversations-list">
            {conversations.map(conv => (
              <li key={conv.id}>
                <button
                  className={`conversation-item ${conv.unread_count > 0 ? 'conversation-item--unread' : ''}`}
                  onClick={() => navigate(`/messages/${conv.other_user_id}`)}
                >
                  <Avatar src={conv.other_avatar_url} name={conv.other_full_name} size="md" />
                  <div className="conversation-info">
                    <div className="conversation-top">
                      <span className="conversation-name">{conv.other_username}</span>
                      <time className="conversation-time">{timeAgo(conv.last_message_at)}</time>
                    </div>
                    <div className="conversation-preview">
                      <span className="conversation-last-msg">{conv.last_message}</span>
                      {conv.unread_count > 0 && (
                        <span className="conversation-badge">{conv.unread_count}</span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
