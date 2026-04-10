import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function ProtectedRoute({ children }) {
  const { isAdmin } = useAuthStore()
  return isAdmin ? children : <Navigate to="/login" replace />
}