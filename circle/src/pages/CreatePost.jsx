import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useFeedStore } from '../store/feedStore'
import { useUIStore } from '../store/uiStore'
import { compressImage, isImage, isVideo } from '../lib/compression'
import TopBar from '../components/layout/TopBar'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import './CreatePost.css'

export default function CreatePost() {
  const { user, profile } = useAuthStore()
  const { addPost } = useFeedStore()
  const { showToast } = useUIStore()
  const navigate = useNavigate()

  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [visibility, setVisibility] = useState('friends')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handleFiles = async (selected) => {
    const arr = Array.from(selected).slice(0, 10)
    const processed = []
    const prevs = []
    for (const f of arr) {
      if (isImage(f)) {
        const compressed = await compressImage(f)
        processed.push(compressed)
        prevs.push({ url: URL.createObjectURL(compressed), type: 'image' })
      } else if (isVideo(f)) {
        processed.push(f)
        prevs.push({ url: URL.createObjectURL(f), type: 'video' })
      }
    }
    setFiles(processed)
    setPreviews(prevs)
  }

  const removeFile = (i) => {
    setFiles(f => f.filter((_, idx) => idx !== i))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({ user_id: user.id, caption, location, visibility })
        .select()
        .single()

      if (postError) throw postError

      const mediaInserts = []
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        const ext = f.name?.split('.').pop() || (isImage(f) ? 'webp' : 'mp4')
        const path = `${user.id}/${post.id}/${i}.${ext}`
        const { error: uploadError } = await supabase.storage.from('post-media').upload(path, f)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(path)
        mediaInserts.push({ post_id: post.id, url: publicUrl, type: isImage(f) ? 'image' : 'video', order: i })
      }

      if (mediaInserts.length > 0) {
        await supabase.from('post_media').insert(mediaInserts)
      }

      addPost({ ...post, media: mediaInserts, username: profile?.username, avatar_url: profile?.avatar_url, full_name: profile?.full_name, likes_count: 0, comments_count: 0 })
      showToast('Post shared', 'success')
      navigate('/feed')
    } catch (err) {
      showToast(err.message || 'Failed to post', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar
        title="New Post"
        actions={
          <Button size="sm" onClick={handleSubmit} loading={loading} disabled={files.length === 0 && !caption.trim()}>
            Share
          </Button>
        }
      />
      <div className="page-content no-nav">
        {previews.length === 0 ? (
          <div className="create-upload-zone" onClick={() => fileRef.current?.click()}>
            <div className="create-upload-icon">
              <Image size={48} strokeWidth={1} />
            </div>
            <p className="create-upload-title">Add Photos & Videos</p>
            <p className="create-upload-sub">Tap to select from your library</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="sr-only"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>
        ) : (
          <div className="create-content">
            {/* Media preview */}
            <div className="create-media-scroll">
              {previews.map((p, i) => (
                <div key={i} className="create-media-item">
                  {p.type === 'video'
                    ? <video src={p.url} className="create-media-img" controls playsInline />
                    : <img src={p.url} alt="" className="create-media-img" />
                  }
                  <button className="create-media-remove" onClick={() => removeFile(i)} aria-label="Remove">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button className="create-media-add" onClick={() => fileRef.current?.click()} aria-label="Add more">
                <Image size={24} />
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="sr-only" onChange={e => handleFiles(e.target.files)} />
            </div>

            {/* Caption */}
            <div className="create-caption-row">
              <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
              <textarea
                className="create-caption-input"
                placeholder="Write a caption..."
                value={caption}
                onChange={e => setCaption(e.target.value)}
                rows={3}
                maxLength={2200}
              />
            </div>

            {/* Options */}
            <div className="create-options">
              <div className="create-option-row">
                <span>Location</span>
                <input
                  className="create-option-input"
                  placeholder="Add location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  autoComplete="off"
                  name="post-location"
                  id="post-location"
                />              </div>
              <div className="create-option-row">
                <span>Audience</span>
                <select
                  className="create-option-select"
                  value={visibility}
                  onChange={e => setVisibility(e.target.value)}
                >
                  <option value="friends">Friends</option>
                  <option value="close_friends">Close Friends</option>
                  <option value="only_me">Only Me</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
