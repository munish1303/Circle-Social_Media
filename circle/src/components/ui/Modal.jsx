import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../lib/utils'
import './Modal.css'

export default function Modal({ title, children, onClose, className }) {
  const { closeModal } = useUIStore()
  const handleClose = onClose || closeModal

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handleClose])

  return (
    <div className="modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className={cn('modal-box animate-fade-in', className)} onClick={e => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button className="modal-close" onClick={handleClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
