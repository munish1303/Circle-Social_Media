import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import TopBar from '../../components/layout/TopBar'
import './SettingsPages.css'

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

export default function Privacy() {
  const { profile, updateProfile } = useAuthStore()
  const { showToast } = useUIStore()

  const [prefs, setPrefs] = useState({
    is_private: profile?.is_private || false,
    show_activity: profile?.show_activity ?? true,
    allow_dms: profile?.allow_dms ?? true,
    show_online: profile?.show_online ?? true,
  })

  const handleToggle = async (key, value) => {
    const updated = { ...prefs, [key]: value }
    setPrefs(updated)
    const { error } = await updateProfile({ [key]: value })
    if (error) {
      setPrefs(prefs) // revert
      showToast('Failed to update', 'error')
    } else {
      showToast('Saved', 'success')
      // If toggling privacy, inform the user what this means
      if (key === 'is_private') {
        showToast(
          value
            ? 'Account is now private. Only followers can see your posts.'
            : 'Account is now public. Everyone can see your posts.',
          'info'
        )
      }
    }
  }

  return (
    <>
      <TopBar title="Privacy" />
      <div className="page-content no-nav">
        <div className="settings-section-group">
          <p className="settings-group-title">Account Privacy</p>
          <Toggle
            checked={prefs.is_private}
            onChange={(v) => handleToggle('is_private', v)}
            label="Private Account"
            description="Only approved followers can see your posts and stories"
          />
        </div>

        <div className="settings-section-group">
          <p className="settings-group-title">Interactions</p>
          <Toggle
            checked={prefs.allow_dms}
            onChange={(v) => handleToggle('allow_dms', v)}
            label="Allow Direct Messages"
            description="Let friends send you messages"
          />
          <Toggle
            checked={prefs.show_activity}
            onChange={(v) => handleToggle('show_activity', v)}
            label="Activity Status"
            description="Show when you were last active"
          />
          <Toggle
            checked={prefs.show_online}
            onChange={(v) => handleToggle('show_online', v)}
            label="Show Online Status"
            description="Let friends see when you're online"
          />
        </div>

        <div className="settings-section-group">
          <p className="settings-group-title">Data & Privacy</p>
          <div className="settings-info-row">
            <span>We never sell your data to third parties.</span>
          </div>
          <div className="settings-info-row">
            <span>We don't use your data for advertising.</span>
          </div>
          <button className="settings-link-btn" onClick={() => alert('Data export coming soon')}>
            Download your data
          </button>
        </div>
      </div>
    </>
  )
}
