import { Navigate, Outlet } from 'react-router-dom';
import { authApi } from '@/features/auth/api/auth-api';

export function ProtectedRoute() {
  const isAuth = authApi.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
