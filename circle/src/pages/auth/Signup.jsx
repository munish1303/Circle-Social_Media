import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../store/uiStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import './Auth.css'

export default function Signup() {
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  const [form, setForm] = useState({ email: '', fullName: '', username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email'
    if (form.fullName.trim().length < 2) e.fullName = 'Enter your full name'
    if (form.username.trim().length < 3) e.username = 'Username must be at least 3 characters'
    if (!/^[a-z0-9_.]+$/.test(form.username)) e.username = 'Only lowercase letters, numbers, _ and .'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, username: form.username },
      },
    })

    setLoading(false)
    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Account created! Check your email to verify.', 'success')
      navigate('/feed', { replace: true })
    }
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">Circle</h1>
        <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: -8 }}>
          Sign up to see photos and videos from your friends.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            placeholder="Mobile Number or Email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            autoComplete="email"
            type="email"
          />
          <Input
            placeholder="Full Name"
            value={form.fullName}
            onChange={set('fullName')}
            error={errors.fullName}
            autoComplete="name"
          />
          <Input
            placeholder="Username"
            value={form.username}
            onChange={set('username')}
            error={errors.username}
            autoCapitalize="none"
            autoComplete="username"
          />
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Sign up
          </Button>
        </form>

        <p className="auth-terms">
          By signing up, you agree to our{' '}
          <Link to="/terms">Terms</Link>,{' '}
          <Link to="/privacy">Privacy Policy</Link> and{' '}
          <Link to="/cookies">Cookies Policy</Link>.
        </p>

        <div className="auth-footer">
          Have an account?{' '}
          <Link to="/login" className="auth-link">Log in</Link>
        </div>
      </div>
    </div>
  )
}
