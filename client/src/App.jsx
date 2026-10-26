import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastContainer, LoadingSkeleton } from './components/ui.jsx';
import { setDemoModeActive } from './lib/api.js';
import LandingPage from './pages/LandingPage.jsx';
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import InternshipExplorerPage from './pages/InternshipExplorerPage.jsx';
import InternshipDetailPage from './pages/InternshipDetailPage.jsx';
import SkillGapsPage from './pages/SkillGapsPage.jsx';
import RoadmapPage from './pages/RoadmapPage.jsx';
import ApplicationTrackerPage from './pages/ApplicationTrackerPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function ProtectedRoute({ children }) {
  const { user, isDemo, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ maxWidth: 680, margin: '80px auto', padding: 24 }}>
        <LoadingSkeleton lines={4} height={24} />
      </div>
    );
  }

  if (!user && !isDemo) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

function DemoRouteWrapper({ children }) {
  const { isDemo, loading, refreshIdentity } = useAuth();

  useEffect(() => {
    setDemoModeActive(true);
    if (!isDemo) {
      refreshIdentity(true);
    }
  }, [isDemo, refreshIdentity]);

  if (loading && !isDemo) {
    return (
      <div style={{ maxWidth: 680, margin: '80px auto', padding: 24 }}>
        <LoadingSkeleton lines={4} height={24} />
      </div>
    );
  }

  return children;
}

function AppRoutes() {
  const { toasts, removeToast } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Student Workspace (/app/*) */}
        <Route
          path="/app/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/internships"
          element={
            <ProtectedRoute>
              <InternshipExplorerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/internships/:id"
          element={
            <ProtectedRoute>
              <InternshipDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/skill-gaps"
          element={
            <ProtectedRoute>
              <SkillGapsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/roadmap"
          element={
            <ProtectedRoute>
              <RoadmapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/applications"
          element={
            <ProtectedRoute>
              <ApplicationTrackerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />

        {/* Isolated Demo Workspace (/demo/*) */}
        <Route
          path="/demo/dashboard"
          element={
            <DemoRouteWrapper>
              <DashboardPage />
            </DemoRouteWrapper>
          }
        />
        <Route
          path="/demo/internships"
          element={
            <DemoRouteWrapper>
              <InternshipExplorerPage />
            </DemoRouteWrapper>
          }
        />
        <Route
          path="/demo/internships/:id"
          element={
            <DemoRouteWrapper>
              <InternshipDetailPage />
            </DemoRouteWrapper>
          }
        />
        <Route
          path="/demo/skill-gaps"
          element={
            <DemoRouteWrapper>
              <SkillGapsPage />
            </DemoRouteWrapper>
          }
        />
        <Route
          path="/demo/roadmap"
          element={
            <DemoRouteWrapper>
              <RoadmapPage />
            </DemoRouteWrapper>
          }
        />
        <Route
          path="/demo/applications"
          element={
            <DemoRouteWrapper>
              <ApplicationTrackerPage />
            </DemoRouteWrapper>
          }
        />
        <Route
          path="/demo/profile"
          element={
            <DemoRouteWrapper>
              <ProfilePage />
            </DemoRouteWrapper>
          }
        />
        <Route path="/demo" element={<Navigate to="/demo/dashboard" replace />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
