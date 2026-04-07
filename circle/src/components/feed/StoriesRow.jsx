import { useEffect, useState, useRef } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useStoryStore } from '../../store/storyStore'
import Avatar from '../ui/Avatar'
import StoryViewer from '../stories/StoryViewer'
import StoryCreator from '../stories/StoryCreator'
import './StoriesRow.css'

export default function StoriesRow() {
  const { user, profile } = useAuthStore()
  const { markViewed, syncFromDB, pruneOld, viewedIds } = useStoryStore()

  const [allGroups, setAllGroups] = useState([])
  const [myHasStory, setMyHasStory] = useState(false)
  const [activeGroupIndex, setActiveGroupIndex] = useState(null)
  const [creatorOpen, setCreatorOpen] = useState(false)

  const allGroupsRef = useRef([])
  const profileRef = useRef(profile)
  useEffect(() => { profileRef.current = profile }, [profile])

  useEffect(() => {
    if (user?.id) loadStories()
  }, [user?.id, profile?.id])

  async function loadStories() {
    if (!user) return
    const now = new Date().toISOString()

    // Step 1: own stories
    const { data: myStories } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })

    // Step 2: get followed user IDs
    const { data: friendships } = await supabase
      .from('friendships')
      .select('user_id, friend_id')
      .eq('status', 'accepted')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

    const followedIds = (friendships || [])
      .map(f => f.user_id === user.id ? f.friend_id : f.user_id)
      .filter(Boolean)

    // Step 3: fetch their stories
    let friendStories = []
    if (followedIds.length > 0) {
      const { data } = await supabase
        .from('stories')
        .select('*')
        .in('user_id', followedIds)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
      friendStories = data || []
    }

    const hasMyStory = (myStories || []).length > 0
    setMyHasStory(hasMyStory)

    const allStories = [...(myStories || []), ...friendStories]
    if (allStories.length > 0) {
      pruneOld(allStories.map(s => s.id))
      syncFromDB(user.id)
    }

    // Step 4: fetch profiles for friend authors
    const friendAuthorIds = [...new Set(friendStories.map(s => s.user_id))]
    const profileMap = {}
    if (friendAuthorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', friendAuthorIds)
      ;(profiles || []).forEach(p => { profileMap[p.id] = p })
    }

    // Step 5: build groups
    const groups = []

    if (hasMyStory) {
      const p = profileRef.current
      groups.push({
        user_id: user.id,
        username: p?.username || '',
        full_name: p?.full_name || '',
        avatar_url: p?.avatar_url || '',
        stories: myStories || [],
      })
    }

    const friendGroupMap = {}
    friendStories.forEach(story => {
      const uid = story.user_id
      if (!friendGroupMap[uid]) {
        const p = profileMap[uid] || {}
        friendGroupMap[uid] = {
          user_id: uid,
          username: p.username || '',
          full_name: p.full_name || '',
          avatar_url: p.avatar_url || '',
          stories: [],
        }
      }
      friendGroupMap[uid].stories.push(story)
    })

    const friendGroups = Object.values(friendGroupMap)
      .sort((a, b) => new Date(b.stories[0].created_at) - new Date(a.stories[0].created_at))

    const finalGroups = [...groups, ...friendGroups]
    setAllGroups(finalGroups)
    allGroupsRef.current = finalGroups
  }

  // Reactive viewed check using subscribed viewedIds
  const groupViewed = (stories) =>
    Array.isArray(stories) &&
    stories.length > 0 &&
    stories.every(s => viewedIds.includes(s.id))

  const openMyStory = () => {
    const groups = allGroupsRef.current
    const myGroup = groups.find(g => g.user_id === user?.id)
    if (myGroup && myGroup.stories.length > 0) {
      setActiveGroupIndex(groups.indexOf(myGroup))
    } else {
      setCreatorOpen(true)
    }
  }

  const openOtherStory = (userId) => {
    const groups = allGroupsRef.current
    const idx = groups.findIndex(g => g.user_id === userId)
    if (idx !== -1) setActiveGroupIndex(idx)
  }

  const myGroup = allGroups.find(g => g.user_id === user?.id)
  const otherGroups = allGroups.filter(g => g.user_id !== user?.id)

  return (
    <>
      <div className="stories-row" aria-label="Stories">
        {/* Your story */}
        <div className="story-bubble" onClick={openMyStory}>
          <div className="story-bubble__avatar-wrap">
            <Avatar
              src={profile?.avatar_url}
              name={profile?.full_name || profile?.username}
              size="story"
              hasStory={myHasStory}
              storyViewed={myHasStory && groupViewed(myGroup?.stories || [])}
            />
            <button
              className="story-bubble__add"
              onClick={e => { e.stopPropagation(); setCreatorOpen(true) }}
              aria-label="Add story"
            >
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
          <span className="story-bubble__name">Your story</span>
        </div>

        {/* Followed users' stories */}
        {otherGroups.map(group => (
          <div key={group.user_id} className="story-bubble" onClick={() => openOtherStory(group.user_id)}>
            <Avatar
              src={group.avatar_url}
              name={group.full_name || group.username}
              size="story"
              hasStory
              storyViewed={groupViewed(group.stories)}
            />
            <span className="story-bubble__name">{group.username}</span>
          </div>
        ))}
      </div>

      {activeGroupIndex !== null && allGroupsRef.current.length > 0 && (
        <StoryViewer
          storyGroups={allGroupsRef.current}
          initialGroupIndex={activeGroupIndex}
          onStoryViewed={(id) => {
            markViewed(id)
            setAllGroups(g => [...g]) // force re-render for ring color
          }}
          onClose={() => setActiveGroupIndex(null)}
        />
      )}

      {creatorOpen && (
        <StoryCreator
          onClose={() => setCreatorOpen(false)}
          onCreated={() => { setCreatorOpen(false); loadStories() }}
        />
      )}
    </>
  )
}
