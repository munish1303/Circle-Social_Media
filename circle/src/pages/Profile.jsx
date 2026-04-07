import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Grid3X3, Film, MoreHorizontal, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import TopBar from '../components/layout/TopBar'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import StoryViewer from '../components/stories/StoryViewer'
import StoryCreator from '../components/stories/StoryCreator'
import HighlightCreator from '../components/stories/HighlightCreator'
import { useStoryStore } from '../store/storyStore'
import { formatCount } from '../lib/utils'
import './Profile.css'

export default function Profile() {
  const { username } = useParams()
  const { user, profile: myProfile } = useAuthStore()
  const { signOut } = useAuthStore()
  const { showToast, openBottomSheet } = useUIStore()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [highlights, setHighlights] = useState([])
  const [myStories, setMyStories] = useState([])
  const [tab, setTab] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [friendStatus, setFriendStatus] = useState(null)
  const { markViewed, isGroupViewed } = useStoryStore()
  const [storyViewer, setStoryViewer] = useState(null)
  const [showStoryCreator, setShowStoryCreator] = useState(false)
  const [showHighlightCreator, setShowHighlightCreator] = useState(false)
  const [editingHighlight, setEditingHighlight] = useState(null)

  const isMe = myProfile?.username === username

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()
      if (!prof) { navigate('/404'); return }
      setProfile(prof)

      const { data: userPosts } = await supabase
        .from('posts_with_details')
        .select('*')
        .eq('user_id', prof.id)
        .order('created_at', { ascending: false })
      setPosts(userPosts || [])

      // Load active stories for this profile
      const { data: profileStories } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', prof.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
      setMyStories(profileStories || [])

      // Load highlights
      const { data: hl } = await supabase
        .from('highlights')
        .select('*, items:highlight_items(id, media_url, media_type, story_id)')
        .eq('user_id', prof.id)
        .order('created_at', { ascending: true })
      setHighlights(hl || [])

      if (!isMe && user) {
        const { data: fs } = await supabase
          .from('friendships')
          .select('status')
          .or(`and(user_id.eq.${user.id},friend_id.eq.${prof.id}),and(user_id.eq.${prof.id},friend_id.eq.${user.id})`)
          .single()
        setFriendStatus(fs?.status || null)
      }
      setLoading(false)
    }
    load()
  }, [username, user, isMe, navigate])

  const handleFollow = async () => {
    if (!user || !profile) return
    if (friendStatus === 'accepted') {
      // Unfollow
      await supabase.from('friendships').delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${user.id})`)
      setFriendStatus(null)
      showToast('Unfollowed', 'info')
    } else if (friendStatus === 'pending') {
      // Cancel request
      await supabase.from('friendships').delete()
        .eq('user_id', user.id).eq('friend_id', profile.id)
      setFriendStatus(null)
      showToast('Follow request cancelled', 'info')
    } else {
      // Send follow request
      await supabase.from('friendships').insert({
        user_id: user.id,
        friend_id: profile.id,
        status: profile.is_private ? 'pending' : 'accepted',
      })
      // Insert notification for the target user
      await supabase.from('notifications').insert({
        user_id: profile.id,
        actor_id: user.id,
        type: profile.is_private ? 'follow_request' : 'follow',
      })
      setFriendStatus(profile.is_private ? 'pending' : 'accepted')
      showToast(profile.is_private ? 'Follow request sent' : 'Following', 'success')
    }
  }

  const handleOptions = () => {
    openBottomSheet({
      options: isMe
        ? [
            { label: 'Settings', action: () => navigate('/settings') },
            { label: 'Log out', danger: true, action: async () => {
              await signOut()
              navigate('/login', { replace: true })
            }},
          ]
        : [
            { label: 'Block', danger: true, action: () => showToast('Blocked', 'info') },
            { label: 'Report', danger: true, action: () => showToast('Reported', 'info') },
          ],
    })
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size="lg" /></div>
  if (!profile) return null

  // Can view full content if: own profile, public account, or accepted follower
  const canViewContent = isMe || !profile.is_private || friendStatus === 'accepted'

  return (
    <>
      <TopBar
        title={profile.username}
        onBack={isMe ? false : undefined}
        actions={
          <button onClick={handleOptions} aria-label="Options">
            <MoreHorizontal size={24} />
          </button>
        }
      />
      <div className="page-content">
        {/* Profile header */}
        <div className="profile-header">
          <div className="profile-header__top">
            <Avatar
              src={profile.avatar_url}
              name={profile.full_name}
              size="xl"
              hasStory={canViewContent && myStories.length > 0}
              storyViewed={canViewContent && isGroupViewed(myStories)}
              onClick={canViewContent && myStories.length > 0 ? () => setStoryViewer({
                groups: [{
                  user_id: profile.id,
                  username: profile.username,
                  full_name: profile.full_name,
                  avatar_url: profile.avatar_url,
                  stories: myStories,
                }],
                index: 0,
              }) : undefined}
            />
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat__num">{formatCount(posts.length)}</span>
                <span className="profile-stat__label">Posts</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat__num">{formatCount(profile.followers_count || 0)}</span>
                <span className="profile-stat__label">Followers</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat__num">{formatCount(profile.following_count || 0)}</span>
                <span className="profile-stat__label">Following</span>
              </div>
            </div>
          </div>

          <div className="profile-bio">
            <p className="profile-bio__name">{profile.full_name}</p>
            {profile.bio && <p className="profile-bio__text">{profile.bio}</p>}
            {profile.website && (
              <a href={profile.website} className="profile-bio__link" target="_blank" rel="noopener noreferrer">
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

          {/* Action buttons */}
          <div className="profile-actions">
            {isMe ? (
              <>
                <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/edit-profile')}>
                  Edit Profile
                </Button>
                <Button variant="secondary" size="sm" fullWidth onClick={() => showToast('Share link copied', 'success')}>
                  Share Profile
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={friendStatus === 'accepted' ? 'secondary' : 'primary'}
                  size="sm"
                  fullWidth
                  onClick={handleFollow}
                >
                  {friendStatus === 'accepted' ? 'Following' : friendStatus === 'pending' ? 'Requested' : 'Follow'}
                </Button>
                {friendStatus === 'accepted' && (
                  <Button variant="secondary" size="sm" fullWidth onClick={() => navigate(`/messages/${profile.id}`)}>
                    Message
                  </Button>
                )}
                {friendStatus !== 'accepted' && (
                  <Button variant="secondary" size="sm" fullWidth onClick={() => navigate(`/messages/${profile.id}`)}>
                    Message
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Highlights — only visible if can view content */}
          {canViewContent && (
          <div className="profile-highlights">
            {isMe && (
              <div className="highlight-bubble" onClick={() => setShowHighlightCreator(true)}>
                <div className="highlight-bubble__ring">
                  <span className="highlight-bubble__plus">+</span>
                </div>
                <span className="highlight-bubble__label">New</span>
              </div>
            )}
            {highlights.map(hl => (
              <div
                key={hl.id}
                className="highlight-bubble"
                onClick={() => {
                  if (hl.items?.length > 0) {
                    setStoryViewer({
                      groups: [{
                        user_id: profile.id,
                        username: profile.username,
                        avatar_url: profile.avatar_url,
                        full_name: profile.full_name,
                        stories: hl.items.map(item => ({
                          id: item.story_id,
                          media_url: item.media_url,
                          media_type: item.media_type,
                          created_at: new Date().toISOString(),
                        })),
                      }],
                      index: 0,
                    })
                  }
                }}
                onContextMenu={isMe ? (e) => {
                  e.preventDefault()
                  openBottomSheet({
                    options: [
                      { label: 'Edit Highlight', action: () => setEditingHighlight(hl) },
                      { label: 'Delete Highlight', danger: true, action: async () => {
                        await supabase.from('highlights').delete().eq('id', hl.id)
                        setHighlights(h => h.filter(x => x.id !== hl.id))
                        showToast('Highlight deleted', 'info')
                      }},
                    ]
                  })
                } : undefined}
              >
                <div className="highlight-bubble__ring highlight-bubble__ring--filled">
                  {hl.cover_url
                    ? <img src={hl.cover_url} alt={hl.title} className="highlight-bubble__cover" />
                    : <span className="highlight-bubble__plus">◆</span>
                  }
                </div>
                <span className="highlight-bubble__label">{hl.title || 'Highlight'}</span>
              </div>
            ))}
          </div>
          )} {/* end canViewContent highlights */}
        </div>

        {/* Tabs + Grid — only show if can view content */}
        {canViewContent ? (
          <>
            <div className="profile-tabs">
              <button className={`profile-tab ${tab === 'grid' ? 'profile-tab--active' : ''}`} onClick={() => setTab('grid')} aria-label="Posts grid">
                <Grid3X3 size={22} />
              </button>
              <button className={`profile-tab ${tab === 'reels' ? 'profile-tab--active' : ''}`} onClick={() => setTab('reels')} aria-label="Reels">
                <Film size={22} />
              </button>
            </div>

            <div className="profile-grid">
              {posts.filter(p => tab === 'reels' ? p.media?.[0]?.type === 'video' : true).map(post => (
                <button key={post.id} className="profile-grid__item" onClick={() => navigate(`/post/${post.id}`)} aria-label="View post">
                  {post.media?.[0]?.type === 'video'
                    ? <video src={post.media[0].url} className="profile-grid__img" preload="metadata" />
                    : <img src={post.media?.[0]?.url} alt="" className="profile-grid__img" loading="lazy" />
                  }
                </button>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="profile-empty">
                <p>{isMe ? 'Share your first photo' : 'No posts yet'}</p>
                {isMe && <button className="feed-empty__cta" onClick={() => navigate('/create')}>Create Post</button>}
              </div>
            )}
          </>
        ) : (
          <div className="profile-private">
            <div className="profile-private__icon">🔒</div>
            <p className="profile-private__title">This account is private</p>
            <p className="profile-private__sub">
              {friendStatus === 'pending'
                ? 'Your follow request is pending approval.'
                : 'Follow this account to see their photos and videos.'}
            </p>
          </div>
        )}
      </div>

      {storyViewer && (
        <StoryViewer
          storyGroups={storyViewer.groups}
          initialGroupIndex={storyViewer.index}
          onStoryViewed={markViewed}
          onClose={() => setStoryViewer(null)}
        />
      )}

      {showStoryCreator && (
        <StoryCreator onClose={() => setShowStoryCreator(false)} onCreated={() => {}} />
      )}

      {(showHighlightCreator || editingHighlight) && (
        <HighlightCreator
          onClose={() => { setShowHighlightCreator(false); setEditingHighlight(null) }}
          onCreated={async () => {
            const { data: hl } = await supabase
              .from('highlights')
              .select('*, items:highlight_items(id, media_url, media_type, story_id)')
              .eq('user_id', profile.id)
              .order('created_at', { ascending: true })
            setHighlights(hl || [])
          }}
          existingHighlight={editingHighlight}
        />
      )}
    </>
  )
}
