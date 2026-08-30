import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverviewPage } from '@/features/dashboard/OverviewPage';
import { CameraManagementPage } from '@/features/cameras/CameraManagementPage';
import { CameraDetailPage } from '@/features/cameras/CameraDetailPage';
import { GitHubIssuesPage } from '@/features/issues/GitHubIssuesPage';
import { FormShowcasePage } from '@/features/showcase/FormShowcasePage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Dashboard routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          
          {/* Camera Management Routes */}
          <Route path="cameras" element={<CameraManagementPage />} />
          <Route path="cameras/:id" element={<CameraDetailPage />} />
          
          {/* Backward-compatibility alias for /users -> /cameras */}
          <Route path="users" element={<Navigate to="/cameras" replace />} />
          <Route path="users/:id" element={<Navigate to="/cameras" replace />} />

          {/* GitHub Issues Route */}
          <Route path="issues" element={<GitHubIssuesPage />} />

          {/* Form Showcase */}
          <Route path="forms" element={<FormShowcasePage />} />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
