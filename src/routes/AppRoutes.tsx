import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverviewPage } from '@/features/dashboard/OverviewPage';
import { UserManagementPage } from '@/features/users/UserManagementPage';
import { UserDetailPage } from '@/features/users/UserDetailPage';
import { FormShowcasePage } from '@/features/showcase/FormShowcasePage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Authentication routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Dashboard routes */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="forms" element={<FormShowcasePage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
