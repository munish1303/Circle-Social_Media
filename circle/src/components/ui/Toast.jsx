import { useUIStore } from '../../store/uiStore'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import './Toast.css'

const icons = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
}

export default function Toast() {
  const { toast, showToast } = useUIStore()
  if (!toast) return null

  return (
    <div className={`toast toast--${toast.type} animate-slide-up`} role="alert" key={toast.id}>
      <span className="toast__icon">{icons[toast.type] || icons.info}</span>
      <span className="toast__msg">{toast.message}</span>
      <button className="toast__close" onClick={() => showToast(null)} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  )
}
