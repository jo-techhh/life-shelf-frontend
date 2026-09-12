import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { LoginPage } from '@/features/auth/login-page';
import { RegisterPage } from '@/features/auth/register-page';
import { ForgotPasswordPage } from '@/features/auth/forgot-password-page';
import { DashboardPage } from '@/features/dashboard/dashboard-page';
import { MovieListPage } from '@/features/movies/movie-list-page';
import { MovieDetailsPage } from '@/features/movies/movie-details-page';
import { SeriesListPage } from '@/features/series/series-list-page';
import { SeriesDetailsPage } from '@/features/series/series-details-page';
import { ReadListPage } from '@/features/readlist/read-list-page';
import { StudyListPage } from '@/features/study/study-list-page';
import { TravelPage } from '@/features/travel/travel-page';
import { PlansPage } from '@/features/plans/plans-page';
import { MediaPage } from '@/features/media/media-page';
import { SettingsPage } from '@/features/settings/settings-page';
import { SharedWatchListPage } from '@/features/share/shared-watch-list-page';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-sm font-medium">Opening your LifeShelf...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public Authentication routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />

      {/* Public Shared Watch List route (No auth required) */}
      <Route path="/shared/watch/:token" element={<SharedWatchListPage />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Watch: Movies & Series */}
        <Route path="watch/movies" element={<MovieListPage />} />
        <Route path="watch/movies/:id" element={<MovieDetailsPage />} />
        <Route path="watch/series" element={<SeriesListPage />} />
        <Route path="watch/series/:id" element={<SeriesDetailsPage />} />

        {/* Grow: Read & Study */}
        <Route path="read" element={<ReadListPage />} />
        <Route path="study" element={<StudyListPage />} />

        {/* Experience: Travel & Plans */}
        <Route path="travel" element={<TravelPage />} />
        <Route path="plans" element={<PlansPage />} />

        {/* Library & Settings */}
        <Route path="media" element={<MediaPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
