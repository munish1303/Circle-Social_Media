import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import Avatar from '../ui/Avatar'
import './BottomNav.css'

export default function BottomNav() {
  const { profile } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <NavLink to="/feed" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`} aria-label="Home">
        <Home size={26} />
      </NavLink>

      <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`} aria-label="Search">
        <Search size={26} />
      </NavLink>

      <button className="nav-item nav-item--create" onClick={() => navigate('/create')} aria-label="Create post">
        <PlusSquare size={28} />
      </button>

      <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`} aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}>
        <span className="nav-item__icon-wrap">
          <Heart size={26} />
          {unreadCount > 0 && (
            <span className="nav-badge" aria-hidden="true">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
      </NavLink>

      <NavLink to={`/profile/${profile?.username}`} className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`} aria-label="Profile">
        <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
      </NavLink>
    </nav>
  )
}
