import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { compressImage } from '../lib/compression'
import TopBar from '../components/layout/TopBar'
import Avatar from '../components/ui/Avatar'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import './EditProfile.css'

export default function EditProfile() {
  const { user, profile, updateProfile } = useAuthStore()
  const { showToast } = useUIStore()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
  })
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url)
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file, { maxSizeMB: 0.5, maxWidthOrHeight: 400 })
    setAvatarFile(compressed)
    setAvatarPreview(URL.createObjectURL(compressed))
  }

  const validate = () => {
    const e = {}
    if (form.full_name.trim().length < 2) e.full_name = 'Name is too short'
    if (form.username.trim().length < 3) e.username = 'Username must be at least 3 characters'
    if (!/^[a-z0-9_.]+$/.test(form.username)) e.username = 'Only lowercase letters, numbers, _ and .'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    let avatar_url = profile?.avatar_url

    if (avatarFile) {
      const path = `avatars/${user.id}.webp`
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = publicUrl
      }
    }

    const { error } = await updateProfile({ ...form, avatar_url })
    setLoading(false)
    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Profile updated', 'success')
      navigate(`/profile/${form.username}`)
    }
  }

  return (
    <>
      <TopBar
        title="Edit Profile"
        actions={<Button size="sm" onClick={handleSave} loading={loading}>Save</Button>}
      />
      <div className="page-content no-nav">
        <div className="edit-avatar-section">
          <div className="edit-avatar-wrap">
            <Avatar src={avatarPreview} name={form.full_name} size="xl" />
            <button className="edit-avatar-btn" onClick={() => fileRef.current?.click()} aria-label="Change photo">
              <Camera size={16} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatar} />
          </div>
          <button className="edit-avatar-label" onClick={() => fileRef.current?.click()}>
            Change profile photo
          </button>
        </div>

        <div className="edit-form">
          <Input label="Name" value={form.full_name} onChange={set('full_name')} error={errors.full_name} />
          <Input label="Username" value={form.username} onChange={set('username')} error={errors.username} autoCapitalize="none" />
          <div className="input-wrapper">
            <label className="input-label">Bio</label>
            <textarea
              className="edit-bio-input"
              value={form.bio}
              onChange={set('bio')}
              placeholder="Write something about yourself..."
              rows={4}
              maxLength={150}
            />
            <span className="edit-bio-count">{form.bio.length}/150</span>
          </div>
          <Input label="Website" value={form.website} onChange={set('website')} placeholder="https://" type="url" />
        </div>
      </div>
    </>
  )
}
