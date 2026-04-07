import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../store/uiStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.identifier.trim()) e.identifier = 'Enter your email or username'
    if (!form.password) e.password = 'Enter your password'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    let email = form.identifier.trim()

    // If it's not an email, look up the username to get the email
    if (!email.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', email)
        .single()
      if (!profile) {
        setLoading(false)
        setErrors({ identifier: 'Username not found' })
        return
      }
      // Use the auth user email via admin — fallback: ask user to use email
      setLoading(false)
      setErrors({ identifier: 'Please use your email address to log in' })
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: form.password,
    })
    setLoading(false)
    if (error) {
      showToast(error.message, 'error')
      setErrors({ password: 'Incorrect credentials' })
    } else {
      navigate('/feed', { replace: true })
    }
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">Circle</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            placeholder="Email address"
            value={form.identifier}
            onChange={set('identifier')}
            error={errors.identifier}
            autoComplete="username"
            autoCapitalize="none"
            type="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Log in
          </Button>
        </form>

        <div className="auth-divider"><span>OR</span></div>

        <button className="auth-google-btn" type="button" onClick={() => showToast('Google sign-in coming soon', 'info')}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <Link to="/forgot-password" className="auth-link auth-link--center">Forgot password?</Link>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  )
}
