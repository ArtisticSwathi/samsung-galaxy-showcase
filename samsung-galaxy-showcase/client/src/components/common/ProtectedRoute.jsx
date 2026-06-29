import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    // Redirect to landing page with login trigger query param
    return <Navigate to="/?login=true" replace />
  }

  return children
}
