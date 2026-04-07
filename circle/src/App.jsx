import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthListener } from './hooks/useAuth'
import { useRealtimeNotifications } from './hooks/useRealtimeNotifications'
import ProtectedRoute from './router/ProtectedRoute'
import BottomNav from './components/layout/BottomNav'
import Toast from './components/ui/Toast'
import BottomSheet from './components/feed/BottomSheet'

import SetupBanner from './components/SetupBanner'

// Pages
import Splash from './pages/auth/Splash'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Search from './pages/Search'
import CreatePost from './pages/CreatePost'
import Notifications from './pages/Notifications'
import Messages from './pages/Messages'
import Chat from './pages/Chat'
import PostDetail from './pages/PostDetail'
import EditProfile from './pages/EditProfile'
import Settings from './pages/Settings'
import ChangePassword from './pages/settings/ChangePassword'
import Privacy from './pages/settings/Privacy'
import NotificationPrefs from './pages/settings/NotificationPrefs'
import Security from './pages/settings/Security'
import HelpSupport from './pages/settings/HelpSupport'
import SavedPosts from './pages/SavedPosts'

const NO_NAV_ROUTES = ['/create', '/messages/', '/chat/', '/edit-profile', '/settings']

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <SetupBanner />
      {children}
      <Toast />
      <BottomSheet />
    </div>
  )
}

function AuthedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>
        {children}
        <BottomNav />
      </AppShell>
    </ProtectedRoute>
  )
}

function AuthedNoNav({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

export default function App() {
  useAuthListener()
  useRealtimeNotifications()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<AppShell><Splash /></AppShell>} />
        <Route path="/login" element={<AppShell><Login /></AppShell>} />
        <Route path="/signup" element={<AppShell><Signup /></AppShell>} />
        <Route path="/forgot-password" element={<AppShell><ForgotPassword /></AppShell>} />

        {/* Authed with nav */}
        <Route path="/feed" element={<AuthedLayout><Feed /></AuthedLayout>} />
        <Route path="/search" element={<AuthedLayout><Search /></AuthedLayout>} />
        <Route path="/notifications" element={<AuthedLayout><Notifications /></AuthedLayout>} />
        <Route path="/profile/:username" element={<AuthedLayout><Profile /></AuthedLayout>} />
        <Route path="/post/:postId" element={<AuthedLayout><PostDetail /></AuthedLayout>} />

        {/* Authed without nav */}
        <Route path="/create" element={<AuthedNoNav><CreatePost /></AuthedNoNav>} />
        <Route path="/messages" element={<AuthedNoNav><Messages /></AuthedNoNav>} />
        <Route path="/messages/:userId" element={<AuthedNoNav><Chat /></AuthedNoNav>} />
        <Route path="/edit-profile" element={<AuthedNoNav><EditProfile /></AuthedNoNav>} />
        <Route path="/settings" element={<AuthedNoNav><Settings /></AuthedNoNav>} />
        <Route path="/change-password" element={<AuthedNoNav><ChangePassword /></AuthedNoNav>} />
        <Route path="/settings/privacy" element={<AuthedNoNav><Privacy /></AuthedNoNav>} />
        <Route path="/settings/notifications" element={<AuthedNoNav><NotificationPrefs /></AuthedNoNav>} />
        <Route path="/settings/security" element={<AuthedNoNav><Security /></AuthedNoNav>} />
        <Route path="/help" element={<AuthedNoNav><HelpSupport /></AuthedNoNav>} />
        <Route path="/saved" element={<AuthedNoNav><SavedPosts /></AuthedNoNav>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
