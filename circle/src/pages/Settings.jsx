import { useNavigate } from 'react-router-dom'
import { ChevronRight, User, Lock, Bell, Eye, Shield, HelpCircle, LogOut, Trash2, Bookmark } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import TopBar from '../components/layout/TopBar'
import Avatar from '../components/ui/Avatar'
import './Settings.css'

const SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Edit Profile', path: '/edit-profile' },
      { icon: Lock, label: 'Change Password', path: '/change-password' },
      { icon: Eye, label: 'Privacy', path: '/settings/privacy' },
      { icon: Bookmark, label: 'Saved Posts', path: '/saved' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', path: '/settings/notifications' },
      { icon: Shield, label: 'Security', path: '/settings/security' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & Support', path: '/help' },
    ],
  },
]
export default function Settings() {
  const { profile, signOut } = useAuthStore()
  const { showToast, openBottomSheet } = useUIStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const handleDelete = () => {
    openBottomSheet({
      options: [
        {
          label: 'Delete Account — this cannot be undone',
          danger: true,
          action: async () => {
            await signOut()
            navigate('/login', { replace: true })
            showToast('Account deletion requested. Contact support to complete.', 'info')
          },
        },
      ],
    })
  }

  return (
    <>
      <TopBar title="Settings" />
      <div className="page-content">
        {/* Profile preview */}
        <div className="settings-profile" onClick={() => navigate(`/profile/${profile?.username}`)}>
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size="lg" />
          <div className="settings-profile__info">
            <p className="settings-profile__name">{profile?.full_name}</p>
            <p className="settings-profile__username">@{profile?.username}</p>
          </div>
          <ChevronRight size={18} color="var(--color-text-secondary)" />
        </div>

        {SECTIONS.map(section => (
          <div key={section.title} className="settings-section">
            <p className="settings-section__title">{section.title}</p>
            {section.items.map(item => (
              <button key={item.label} className="settings-item" onClick={() => navigate(item.path)}>
                <item.icon size={20} className="settings-item__icon" />
                <span className="settings-item__label">{item.label}</span>
                <ChevronRight size={16} color="var(--color-text-secondary)" />
              </button>
            ))}
          </div>
        ))}

        <div className="settings-section">
          <button className="settings-item settings-item--danger" onClick={handleLogout}>
            <LogOut size={20} className="settings-item__icon" />
            <span className="settings-item__label">Log out</span>
          </button>
          <button className="settings-item settings-item--danger" onClick={handleDelete}>
            <Trash2 size={20} className="settings-item__icon" />
            <span className="settings-item__label">Delete Account</span>
          </button>
        </div>
        <p className="settings-version">Circle v1.0.0 · Made with ❤️ for friends</p>
      </div>
    </>
  )
}
