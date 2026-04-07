import { cn } from '../../lib/utils'
import './Spinner.css'

export default function Spinner({ size = 'md', className }) {
  return <div className={cn('spinner', `spinner--${size}`, className)} aria-label="Loading" />
}
