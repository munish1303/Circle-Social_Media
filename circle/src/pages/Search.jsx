import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import TopBar from '../components/layout/TopBar'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import './Search.css'

export default function Search() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('circle_recent_searches') || '[]') } catch { return [] }
  })
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const q = query.trim().toLowerCase()

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, is_verified')
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
        .neq('id', user?.id || '00000000-0000-0000-0000-000000000000')
        .limit(20)

      if (error) {
        console.error('Search error:', error)
      }
      setResults(data || [])
      setLoading(false)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, user])

  const handleSelect = (profile) => {
    const updated = [profile, ...recentSearches.filter(r => r.id !== profile.id)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('circle_recent_searches', JSON.stringify(updated))
    navigate(`/profile/${profile.username}`)
  }

  const clearRecent = (id) => {
    const updated = recentSearches.filter(r => r.id !== id)
    setRecentSearches(updated)
    localStorage.setItem('circle_recent_searches', JSON.stringify(updated))
  }

  const displayList = query.trim() ? results : recentSearches

  return (
    <>
      <TopBar onBack={false} title="Search" border />
      <div className="page-content">
        <div className="search-bar-wrap">
          <div className="search-bar">
            <SearchIcon size={16} className="search-bar__icon" />
            <input
              ref={inputRef}
              className="search-bar__input"
              placeholder="Search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
            />
            {query && (
              <button className="search-bar__clear" onClick={() => setQuery('')} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Spinner /></div>}

        {!loading && !query && recentSearches.length > 0 && (
          <div className="search-section-label">Recent</div>
        )}

        {!loading && displayList.length > 0 && (
          <ul className="search-results">
            {displayList.map(profile => (
              <li key={profile.id}>
                <button className="search-result-item" onClick={() => handleSelect(profile)}>
                  <Avatar src={profile.avatar_url} name={profile.full_name} size="md" />
                  <div className="search-result-info">
                    <span className="search-result-username">
                      {profile.username}
                      {profile.is_verified && <span className="verified-badge" aria-label="Verified">✓</span>}
                    </span>
                    <span className="search-result-name">{profile.full_name}</span>
                  </div>
                  {!query && (
                    <button
                      className="search-result-remove"
                      onClick={e => { e.stopPropagation(); clearRecent(profile.id) }}
                      aria-label="Remove from recent"
                    >
                      <X size={14} />
                    </button>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {!loading && query && results.length === 0 && (
          <div className="search-empty">No results for "{query}"</div>
        )}
      </div>
    </>
  )
}
