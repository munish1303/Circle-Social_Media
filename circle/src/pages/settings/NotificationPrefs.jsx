import { useState } from 'react'
import { useUIStore } from '../../store/uiStore'
import TopBar from '../../components/layout/TopBar'
import './SettingsPages.css'

const DEFAULTS = {
  likes: true,
  comments: true,
  follows: true,
  follow_requests: true,
  messages: true,
  mentions: true,
  post_reminders: false,
  email_notifications: false,
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="settings-toggle-row">
      <div className="settings-toggle-info">
        <span className="settings-toggle-label">{label}</span>
        {description && <span className="settings-toggle-desc">{description}</span>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        className={`toggle ${checked ? 'toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle__thumb" />
      </button>
    </div>
  )
}

export default function NotificationPrefs() {
  const { showToast } = useUIStore()
  const [prefs, setPrefs] = useState(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('circle_notif_prefs') || '{}') }
    } catch { return DEFAULTS }
  })

  const handleToggle = (key, value) => {
    const updated = { ...prefs, [key]: value }
    setPrefs(updated)
    localStorage.setItem('circle_notif_prefs', JSON.stringify(updated))
    showToast('Saved', 'success')
  }

  return (
    <>
      <TopBar title="Notifications" />
      <div className="page-content no-nav">
        <div className="settings-section-group">
          <p className="settings-group-title">Push Notifications</p>
          <Toggle checked={prefs.likes} onChange={v => handleToggle('likes', v)} label="Likes" description="When someone likes your post" />
          <Toggle checked={prefs.comments} onChange={v => handleToggle('comments', v)} label="Comments" description="When someone comments on your post" />
          <Toggle checked={prefs.follows} onChange={v => handleToggle('follows', v)} label="New Followers" description="When someone follows you" />
          <Toggle checked={prefs.follow_requests} onChange={v => handleToggle('follow_requests', v)} label="Follow Requests" description="When someone requests to follow you" />
          <Toggle checked={prefs.messages} onChange={v => handleToggle('messages', v)} label="Messages" description="When you receive a new message" />
          <Toggle checked={prefs.mentions} onChange={v => handleToggle('mentions', v)} label="Mentions" description="When someone mentions you" />
        </div>

        <div className="settings-section-group">
          <p className="settings-group-title">Other</p>
          <Toggle
            checked={prefs.post_reminders}
            onChange={v => handleToggle('post_reminders', v)}
            label="Post Reminders"
            description="Occasional reminders to share with friends"
          />
          <Toggle
            checked={prefs.email_notifications}
            onChange={v => handleToggle('email_notifications', v)}
            label="Email Notifications"
            description="Receive notifications via email"
          />
        </div>
      </div>
    </>
  )
}
