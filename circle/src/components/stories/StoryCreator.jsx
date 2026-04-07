import { useState, useRef } from 'react'
import { X, Image, Video, Type } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { compressImage, isImage, isVideo } from '../../lib/compression'
import Spinner from '../ui/Spinner'
import './StoryCreator.css'

export default function StoryCreator({ onClose, onCreated }) {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const handleFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (isImage(f)) {
      const compressed = await compressImage(f, { maxSizeMB: 2, maxWidthOrHeight: 1080 })
      setFile(compressed)
      setPreview({ url: URL.createObjectURL(compressed), type: 'image' })
    } else if (isVideo(f)) {
      setFile(f)
      setPreview({ url: URL.createObjectURL(f), type: 'video' })
    }
  }

  const handleUpload = async () => {
    if (!file || !user) return
    setUploading(true)
    try {
      const ext = isImage(file) ? 'webp' : 'mp4'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('stories').upload(path, file)
      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage.from('stories').getPublicUrl(path)

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const { data: story, error: insertErr } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: isImage(file) ? 'image' : 'video',
          expires_at: expiresAt,
        })
        .select()
        .single()

      if (insertErr) throw insertErr
      showToast('Story posted', 'success')
      onCreated?.(story)
      onClose()
    } catch (err) {
      showToast(err.message || 'Failed to post story', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="story-creator">
      <div className="story-creator__header">
        <button className="story-creator__close" onClick={onClose} aria-label="Close">
          <X size={24} color="#fff" />
        </button>
        <span className="story-creator__title">New Story</span>
        {preview && (
          <button
            className="story-creator__share-btn"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? <Spinner size="sm" /> : 'Share'}
          </button>
        )}
      </div>

      {!preview ? (
        <div className="story-creator__pick">
          <div className="story-creator__options">
            <button className="story-creator__option" onClick={() => fileRef.current?.click()}>
              <Image size={32} color="#fff" />
              <span>Photo</span>
            </button>
            <button className="story-creator__option" onClick={() => fileRef.current?.click()}>
              <Video size={32} color="#fff" />
              <span>Video</span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            onChange={handleFile}
          />
        </div>
      ) : (
        <div className="story-creator__preview">
          {preview.type === 'video' ? (
            <video src={preview.url} className="story-creator__media" autoPlay playsInline muted loop />
          ) : (
            <img src={preview.url} alt="" className="story-creator__media" />
          )}
          <button
            className="story-creator__retake"
            onClick={() => { setPreview(null); setFile(null) }}
          >
            Retake
          </button>
        </div>
      )}
    </div>
  )
}
