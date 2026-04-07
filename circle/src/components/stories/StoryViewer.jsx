import { useState, useEffect, useRef, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Eye, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import Avatar from '../ui/Avatar'
import { timeAgo } from '../../lib/utils'
import './StoryViewer.css'

const STORY_DURATION = 5000 // 5 seconds per story

export default function StoryViewer({ storyGroups, initialGroupIndex = 0, onClose, onStoryViewed }) {
  const { user } = useAuthStore()
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showViewers, setShowViewers] = useState(false)
  const [viewers, setViewers] = useState([])
  const [viewersLoading, setViewersLoading] = useState(false)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const elapsedRef = useRef(0)

  const currentGroup = storyGroups[groupIndex]
  const currentStory = currentGroup?.stories?.[storyIndex]
  const isMyStory = currentGroup?.user_id === user?.id

  // Mark story as viewed — notify parent and persist
  useEffect(() => {
    if (!currentStory || !user) return
    onStoryViewed?.(currentStory.id)
  }, [currentStory?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => {
    const stories = currentGroup?.stories || []
    if (storyIndex < stories.length - 1) {
      setStoryIndex(i => i + 1)
      elapsedRef.current = 0
      setProgress(0)
    } else if (groupIndex < storyGroups.length - 1) {
      setGroupIndex(g => g + 1)
      setStoryIndex(0)
      elapsedRef.current = 0
      setProgress(0)
    } else {
      onClose()
    }
  }, [storyIndex, groupIndex, currentGroup, storyGroups, onClose])

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex(i => i - 1)
      elapsedRef.current = 0
      setProgress(0)
    } else if (groupIndex > 0) {
      setGroupIndex(g => g - 1)
      setStoryIndex(0)
      elapsedRef.current = 0
      setProgress(0)
    }
  }, [storyIndex, groupIndex])

  // Progress timer
  useEffect(() => {
    if (paused || !currentStory) return
    clearInterval(intervalRef.current)
    startTimeRef.current = Date.now() - elapsedRef.current

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100)
      setProgress(pct)
      if (elapsed >= STORY_DURATION) {
        clearInterval(intervalRef.current)
        goNext()
      }
    }, 50)

    return () => clearInterval(intervalRef.current)
  }, [storyIndex, groupIndex, paused, goNext])

  const handlePause = () => {
    elapsedRef.current = Date.now() - startTimeRef.current
    setPaused(true)
    clearInterval(intervalRef.current)
  }

  const handleResume = () => {
    setPaused(false)
  }

  const loadViewers = async () => {
    if (!currentStory) return
    setViewersLoading(true)
    setShowViewers(true)
    handlePause()
    const { data } = await supabase
      .from('story_views')
      .select('viewer:profiles!story_views_viewer_id_fkey(id, username, avatar_url, full_name), viewed_at')
      .eq('story_id', currentStory.id)
      .order('viewed_at', { ascending: false })
    setViewers(data || [])
    setViewersLoading(false)
  }

  const closeViewers = () => {
    setShowViewers(false)
    handleResume()
  }

  if (!currentGroup || !currentStory) return null

  return (
    <div className="story-viewer" onMouseDown={handlePause} onMouseUp={handleResume} onTouchStart={handlePause} onTouchEnd={handleResume}>
      {/* Progress bars */}
      <div className="story-progress-bars">
        {currentGroup.stories.map((_, i) => (
          <div key={i} className="story-progress-bar">
            <div
              className="story-progress-fill"
              style={{
                width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="story-header">
        <div className="story-header__user">
          <Avatar src={currentGroup.avatar_url} name={currentGroup.full_name} size="sm" />
          <div>
            <span className="story-header__username">{currentGroup.username}</span>
            <span className="story-header__time">{timeAgo(currentStory.created_at)}</span>
          </div>
        </div>
        <button className="story-header__close" onClick={onClose} aria-label="Close stories">
          <X size={24} color="#fff" />
        </button>
      </div>

      {/* Media */}
      <div className="story-media">
        {currentStory.media_type === 'video' ? (
          <video
            key={currentStory.id}
            src={currentStory.media_url}
            className="story-media__content"
            autoPlay
            playsInline
            muted
            loop={false}
            onEnded={goNext}
          />
        ) : (
          <img
            key={currentStory.id}
            src={currentStory.media_url}
            alt=""
            className="story-media__content"
          />
        )}
      </div>

      {/* Tap zones */}
      <button className="story-tap-zone story-tap-zone--left" onClick={goPrev} aria-label="Previous story" />
      <button className="story-tap-zone story-tap-zone--right" onClick={goNext} aria-label="Next story" />

      {/* Footer */}
      <div className="story-footer">
        {isMyStory ? (
          <button className="story-viewers-btn" onClick={loadViewers}>
            <Eye size={18} color="#fff" />
            <span>{currentStory.views_count || 0} viewers</span>
          </button>
        ) : (
          <div className="story-reply-bar">
            <input className="story-reply-input" placeholder={`Reply to ${currentGroup.username}...`} />
          </div>
        )}
      </div>

      {/* Viewers sheet */}
      {showViewers && (
        <div className="story-viewers-sheet" onClick={e => e.stopPropagation()}>
          <div className="story-viewers-header">
            <span>Viewers ({viewers.length})</span>
            <button onClick={closeViewers}><X size={20} /></button>
          </div>
          <div className="story-viewers-list">
            {viewersLoading ? (
              <p className="story-viewers-empty">Loading...</p>
            ) : viewers.length === 0 ? (
              <p className="story-viewers-empty">No views yet</p>
            ) : (
              viewers.map(v => (
                <div key={v.viewer?.id} className="story-viewer-row">
                  <Avatar src={v.viewer?.avatar_url} name={v.viewer?.full_name} size="sm" />
                  <div>
                    <p className="story-viewer-name">{v.viewer?.username}</p>
                    <p className="story-viewer-time">{timeAgo(v.viewed_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
