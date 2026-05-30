import { useUserStore } from '@/store'
import { Navigate } from 'react-router'

interface ProtectedRouteProps {
  children: React.ReactNode
}
export const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return props.children
}
