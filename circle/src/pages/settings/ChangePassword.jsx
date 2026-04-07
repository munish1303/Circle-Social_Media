import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../store/uiStore'
import TopBar from '../../components/layout/TopBar'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import './SettingsPages.css'

export default function ChangePassword() {
  const { showToast } = useUIStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.current) e.current = 'Enter your current password'
    if (form.newPass.length < 8) e.newPass = 'Password must be at least 8 characters'
    if (form.newPass !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    // Re-authenticate first
    const { data: { user } } = await supabase.auth.getUser()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: form.current,
    })

    if (signInError) {
      setLoading(false)
      setErrors({ current: 'Current password is incorrect' })
      return
    }

    const { error } = await supabase.auth.updateUser({ password: form.newPass })
    setLoading(false)

    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Password updated successfully', 'success')
      navigate(-1)
    }
  }

  return (
    <>
      <TopBar title="Change Password" />
      <div className="page-content no-nav">
        <div className="settings-page-content">
          <p className="settings-page-desc">
            For your security, we recommend using a strong password that you don't use anywhere else.
          </p>
          <form onSubmit={handleSubmit} className="settings-form">
            <Input
              type="password"
              label="Current Password"
              placeholder="Enter current password"
              value={form.current}
              onChange={set('current')}
              error={errors.current}
              autoComplete="current-password"
            />
            <Input
              type="password"
              label="New Password"
              placeholder="At least 8 characters"
              value={form.newPass}
              onChange={set('newPass')}
              error={errors.newPass}
              autoComplete="new-password"
            />
            <Input
              type="password"
              label="Confirm New Password"
              placeholder="Repeat new password"
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
              autoComplete="new-password"
            />
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
