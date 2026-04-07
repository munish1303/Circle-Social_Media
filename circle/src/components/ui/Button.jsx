import { cn } from '../../lib/utils'
import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn('btn', `btn--${variant}`, `btn--${size}`, fullWidth && 'btn--full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : children}
    </button>
  )
}
