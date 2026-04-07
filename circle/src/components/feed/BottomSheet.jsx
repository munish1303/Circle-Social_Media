import { useUIStore } from '../../store/uiStore'
import './BottomSheet.css'

export default function BottomSheet() {
  const { bottomSheet, closeBottomSheet } = useUIStore()
  if (!bottomSheet) return null

  return (
    <div className="bs-overlay" onClick={closeBottomSheet}>
      <div className="bs-box animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="bs-handle" />
        {bottomSheet.options?.map((opt, i) => (
          <button
            key={i}
            className={`bs-option ${opt.danger ? 'bs-option--danger' : ''}`}
            onClick={() => { opt.action?.(); closeBottomSheet() }}
          >
            {opt.icon && <span className="bs-option__icon">{opt.icon}</span>}
            {opt.label}
          </button>
        ))}
        <button className="bs-option bs-option--cancel" onClick={closeBottomSheet}>Cancel</button>
      </div>
    </div>
  )
}
