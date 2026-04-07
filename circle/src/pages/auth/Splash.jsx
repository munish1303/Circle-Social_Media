import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import './Splash.css'

export default function Splash() {
  const { session, loading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => {
      navigate(session ? '/feed' : '/login', { replace: true })
    }, 2000)
    return () => clearTimeout(timer)
  }, [session, loading, navigate])

  return (
    <div className="splash">
      <div className="splash__content">
        <h1 className="splash__logo">Circle</h1>
        <p className="splash__tagline">made by friends, for friends</p>
      </div>
      <div className="splash__footer">
        <p className="splash__from">from</p>
        <p className="splash__company">Circle Inc.</p>
      </div>
    </div>
  )
}
