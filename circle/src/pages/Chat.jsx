import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Send, Image, Smile } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import TopBar from '../components/layout/TopBar'
import Avatar from '../components/ui/Avatar'
import { timeAgo } from '../lib/utils'
import './Chat.css'

export default function Chat() {
  const { userId } = useParams()
  const { user } = useAuthStore()
  const [otherUser, setOtherUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    if (!userId) return
    supabase.from('profiles').select('*').eq('id', userId).single().then(({ data }) => setOtherUser(data))

    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
      setMessages(data || [])
    }
    loadMessages()

    // Realtime subscription
    const channel = supabase
      .channel(`chat:${[user.id, userId].sort().join('-')}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new
        if ((msg.sender_id === user.id && msg.receiver_id === userId) ||
            (msg.sender_id === userId && msg.receiver_id === user.id)) {
          setMessages(m => [...m, msg])
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    const content = text.trim()
    setText('')
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: userId,
      content,
    })
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="chat-page">
      <TopBar
        title={otherUser?.username || ''}
        actions={otherUser && <Avatar src={otherUser.avatar_url} name={otherUser.full_name} size="sm" />}
      />

      <div className="chat-messages">
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === user?.id
          const showTime = i === 0 || new Date(msg.created_at) - new Date(messages[i-1].created_at) > 300000
          return (
            <div key={msg.id}>
              {showTime && <div className="chat-time-divider">{timeAgo(msg.created_at)}</div>}
              <div className={`chat-bubble-wrap ${isMe ? 'chat-bubble-wrap--me' : ''}`}>
                <div className={`chat-bubble ${isMe ? 'chat-bubble--me' : 'chat-bubble--them'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <button className="chat-input-action" aria-label="Add image">
          <Image size={22} />
        </button>
        <div className="chat-input-wrap">
          <input
            ref={inputRef}
            className="chat-input"
            placeholder="Message..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
          />
          <button className="chat-input-emoji" aria-label="Emoji">
            <Smile size={18} />
          </button>
        </div>
        {text.trim() ? (
          <button className="chat-send-btn" onClick={sendMessage} disabled={sending} aria-label="Send">
            <Send size={20} />
          </button>
        ) : (
          <button className="chat-input-action" aria-label="Like">
            ❤️
          </button>
        )}
      </div>
    </div>
  )
}
