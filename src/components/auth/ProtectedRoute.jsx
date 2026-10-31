import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/useAuthStore'
import Loader from '@components/ui/Loader'

export default function ProtectedRoute({ children, requiredLevel = 1 }) {
  const { user, loading, hasAccess } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return <Loader />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!hasAccess(requiredLevel)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
