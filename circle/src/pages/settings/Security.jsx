import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Smartphone, Clock, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import TopBar from '../../components/layout/TopBar'
import './SettingsPages.css'

export default function Security() {
  const { user, signOut } = useAuthStore()
  const { showToast, openBottomSheet } = useUIStore()
  const navigate = useNavigate()
  const [sending, setSending] = useState(false)

  const handlePasswordReset = async () => {
    setSending(true)
    const { error } = await supabase.auth.resetPasswordForEmail(user?.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSending(false)
    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Password reset link sent to your email', 'success')
    }
  }

  const handleSignOutAll = () => {
    openBottomSheet({
      options: [{
        label: 'Sign out of all devices',
        danger: true,
        action: async () => {
          await supabase.auth.signOut({ scope: 'global' })
          navigate('/login', { replace: true })
        }
      }]
    })
  }

  return (
    <>
      <TopBar title="Security" />
      <div className="page-content no-nav">
        <div className="settings-section-group">
          <p className="settings-group-title">Login Security</p>

          <button className="settings-action-row" onClick={() => navigate('/change-password')}>
            <div className="settings-action-icon"><Shield size={20} /></div>
            <div className="settings-action-info">
              <span className="settings-action-label">Change Password</span>
              <span className="settings-action-desc">Update your account password</span>
            </div>
          </button>

          <button className="settings-action-row" onClick={handlePasswordReset} disabled={sending}>
            <div className="settings-action-icon"><Clock size={20} /></div>
            <div className="settings-action-info">
              <span className="settings-action-label">Send Password Reset Email</span>
              <span className="settings-action-desc">Get a reset link at {user?.email}</span>
            </div>
          </button>
        </div>

        <div className="settings-section-group">
          <p className="settings-group-title">Active Sessions</p>
          <div className="settings-action-row">
            <div className="settings-action-icon"><Smartphone size={20} /></div>
            <div className="settings-action-info">
              <span className="settings-action-label">Current Device</span>
              <span className="settings-action-desc">This browser · Active now</span>
            </div>
            <span className="settings-active-dot" />
          </div>

          <button className="settings-action-row settings-action-row--danger" onClick={handleSignOutAll}>
            <div className="settings-action-icon"><AlertTriangle size={20} /></div>
            <div className="settings-action-info">
              <span className="settings-action-label">Sign Out All Devices</span>
              <span className="settings-action-desc">Removes all active sessions</span>
            </div>
          </button>
        </div>

        <div className="settings-section-group">
          <p className="settings-group-title">Account Info</p>
          <div className="settings-info-row">
            <span className="settings-info-label">Email</span>
            <span className="settings-info-value">{user?.email}</span>
          </div>
          <div className="settings-info-row">
            <span className="settings-info-label">Account created</span>
            <span className="settings-info-value">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
