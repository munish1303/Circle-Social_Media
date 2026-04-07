import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'
import './TopBar.css'

export default function TopBar({ title, logo, onBack, actions, border = true, className }) {
  const navigate = useNavigate()
  const handleBack = onBack || (() => navigate(-1))

  return (
    <header className={cn('topbar', border && 'topbar--border', className)}>
      <div className="topbar__left">
        {onBack !== false && (
          <button className="topbar__back" onClick={handleBack} aria-label="Go back">
            <ArrowLeft size={24} />
          </button>
        )}
        {logo && <span className="topbar__logo">{logo}</span>}
        {title && <h1 className="topbar__title">{title}</h1>}
      </div>
      {actions && <div className="topbar__actions">{actions}</div>}
    </header>
  )
}
