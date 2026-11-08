import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';

export default function ProtectedRoute({ roles, children }) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}


