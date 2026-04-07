import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/utils'
import './Input.css'

export default function Input({
  label,
  error,
  type = 'text',
  className,
  containerClass,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={cn('input-wrapper', containerClass)}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-field-wrap">
        <input
          type={inputType}
          className={cn('input-field', error && 'input-field--error', className)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="input-eye"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="input-error" role="alert">{error}</span>}
    </div>
  )
}
