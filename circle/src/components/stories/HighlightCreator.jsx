import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import Spinner from '../ui/Spinner'
import './HighlightCreator.css'

export default function HighlightCreator({ onClose, onCreated, existingHighlight = null }) {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [title, setTitle] = useState(existingHighlight?.title || '')
  const [myStories, setMyStories] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    // Load all stories (including expired ones for highlights)
    supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMyStories(data || [])
        setLoading(false)
      })

    // If editing, pre-select existing items
    if (existingHighlight) {
      supabase
        .from('highlight_items')
        .select('story_id')
        .eq('highlight_id', existingHighlight.id)
        .then(({ data }) => {
          setSelected(new Set((data || []).map(i => i.story_id)))
        })
    }
  }, [user, existingHighlight])

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    if (!user || selected.size === 0) return
    setSaving(true)
    try {
      let highlightId = existingHighlight?.id

      if (!highlightId) {
        const { data, error } = await supabase
          .from('highlights')
          .insert({ user_id: user.id, title: title.trim() })
          .select()
          .single()
        if (error) throw error
        highlightId = data.id
      } else {
        await supabase.from('highlights').update({ title: title.trim() }).eq('id', highlightId)
        await supabase.from('highlight_items').delete().eq('highlight_id', highlightId)
      }

      const items = Array.from(selected).map(storyId => {
        const story = myStories.find(s => s.id === storyId)
        return {
          highlight_id: highlightId,
          story_id: storyId,
          media_url: story?.media_url || '',
          media_type: story?.media_type || 'image',
        }
      })

      await supabase.from('highlight_items').insert(items)

      // Set cover to first selected story
      const firstStory = myStories.find(s => selected.has(s.id))
      if (firstStory) {
        await supabase.from('highlights').update({ cover_url: firstStory.media_url }).eq('id', highlightId)
      }

      showToast(existingHighlight ? 'Highlight updated' : 'Highlight created', 'success')
      onCreated?.()
      onClose()
    } catch (err) {
      showToast(err.message || 'Failed to save highlight', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="hl-creator-overlay" onClick={onClose}>
      <div className="hl-creator" onClick={e => e.stopPropagation()}>
        <div className="hl-creator__header">
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
          <span>{existingHighlight ? 'Edit Highlight' : 'New Highlight'}</span>
          <button
            className={`hl-creator__save ${selected.size === 0 ? 'hl-creator__save--disabled' : ''}`}
            onClick={handleSave}
            disabled={selected.size === 0 || saving}
          >
            {saving ? <Spinner size="sm" /> : 'Save'}
          </button>
        </div>

        <div className="hl-creator__name-row">
          <input
            className="hl-creator__name-input"
            placeholder="Highlight name (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={30}
          />
        </div>

        {loading ? (
          <div className="hl-creator__loading"><Spinner /></div>
        ) : myStories.length === 0 ? (
          <div className="hl-creator__empty">
            <p>No stories yet</p>
            <span>Post a story first to add it to a highlight</span>
          </div>
        ) : (
          <div className="hl-creator__grid">
            {myStories.map(story => (
              <button
                key={story.id}
                className={`hl-creator__item ${selected.has(story.id) ? 'hl-creator__item--selected' : ''}`}
                onClick={() => toggle(story.id)}
              >
                {story.media_type === 'video' ? (
                  <video src={story.media_url} className="hl-creator__media" preload="metadata" />
                ) : (
                  <img src={story.media_url} alt="" className="hl-creator__media" loading="lazy" />
                )}
                {selected.has(story.id) && (
                  <div className="hl-creator__check">
                    <Check size={14} strokeWidth={3} color="#fff" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
