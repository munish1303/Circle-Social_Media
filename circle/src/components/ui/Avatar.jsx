import { cn, getInitials } from '../../lib/utils'
import './Avatar.css'

const sizeMap = { xs: 24, sm: 32, md: 40, lg: 56, story: 64, xl: 80, '2xl': 110 }

export default function Avatar({
  src,
  name,
  size = 'md',
  hasStory = false,
  storyViewed = false,
  onClick,
  className,
}) {
  const px = sizeMap[size] || 40

  const inner = (
    <div
      className={cn('avatar', `avatar--${size}`, !hasStory && onClick && 'avatar--clickable', className)}
      style={{ '--avatar-size': px + 'px' }}
      onClick={!hasStory ? onClick : undefined}
      role={!hasStory && onClick ? 'button' : undefined}
      tabIndex={!hasStory && onClick ? 0 : undefined}
    >
      {src
        ? <img src={src} alt={name || 'avatar'} className="avatar__img" loading="lazy" />
        : <span className="avatar__initials">{getInitials(name)}</span>
      }
    </div>
  )

  if (!hasStory) return inner

  return (
    <div
      className={cn('avatar-ring', storyViewed ? 'avatar-ring--viewed' : 'avatar-ring--active')}
      style={{ '--avatar-size': px + 'px' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="avatar-ring__inner">
        {inner}
      </div>
    </div>
  )
}
