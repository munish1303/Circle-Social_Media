import { supabaseMissing } from '../lib/supabase'
import './SetupBanner.css'

export default function SetupBanner() {
  if (!supabaseMissing) return null

  return (
    <div className="setup-banner">
      <span className="setup-banner__icon">⚙️</span>
      <span>
        <strong>Supabase not connected.</strong> Create a <code>.env</code> file in the <code>circle/</code> folder with your{' '}
        <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
      </span>
    </div>
  )
}
