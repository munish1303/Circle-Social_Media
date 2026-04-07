import { clsx } from 'clsx'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

export function cn(...inputs) {
  return clsx(inputs)
}

export function timeAgo(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true })
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export function formatCount(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function generateUsername(name) {
  return name?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_]/g, '') + Math.floor(Math.random() * 999)
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}
