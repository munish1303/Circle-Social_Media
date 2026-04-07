import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../store/uiStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import './Auth.css'
import './ForgotPassword.css'

export default function ForgotPassword() {
  const { showToast } = useUIStore()
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!identifier.trim()) return
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(identifier, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) {
      showToast(error.message, 'error')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="fp-icon">
          <Lock size={36} strokeWidth={1.5} />
        </div>

        <h2 className="fp-title">Trouble logging in?</h2>
        <p className="fp-subtitle">
          Enter your email, phone, or username and we'll send you a link to get back into your account.
        </p>

        {sent ? (
          <div className="fp-sent">
            <p>We sent a login link to <strong>{identifier}</strong>. Check your inbox.</p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              placeholder="Email, Phone, or Username"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              autoCapitalize="none"
            />
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Send Login Link
            </Button>
          </form>
        )}

        <div className="auth-divider"><span>OR</span></div>

        <Link to="/signup" className="auth-link auth-link--center">Create New Account</Link>

        <div className="fp-back">
          <Link to="/login" className="fp-back-link">Back To Login</Link>
        </div>
      </div>
    </div>
  )
}
