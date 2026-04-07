import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Spinner from '../components/ui/Spinner'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuthStore()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  return children
}
