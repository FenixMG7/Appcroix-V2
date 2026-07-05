import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import AuthPage from './pages/AuthPage';
import SetupPage from './pages/SetupPage';
import ProfileSelectPage from './pages/ProfileSelectPage';
import ParentPinPage from './pages/ParentPinPage';
import ParentDashboard from './pages/ParentDashboard';
import ChildDashboard from './pages/ChildDashboard';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
  </div>
);

/** Route "/" : aiguille vers Auth, Setup, ou Sélection de profil selon l'état. */
const RootRedirect: React.FC = () => {
  const { user, authLoading, family, familyLoading } = useApp();

  if (authLoading || (user && familyLoading)) return <LoadingScreen />;
  if (!user) return <AuthPage />;
  if (!family?.setupComplete) return <Navigate to="/setup" replace />;
  return <Navigate to="/select-profile" replace />;
};

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading } = useApp();
  if (authLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const RequireSetupDone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { family, familyLoading } = useApp();
  if (familyLoading) return <LoadingScreen />;
  if (!family?.setupComplete) return <Navigate to="/setup" replace />;
  return <>{children}</>;
};

const RequireRole: React.FC<{ role: 'parent' | 'child'; children: React.ReactNode }> = ({ role, children }) => {
  const { activeMember } = useApp();
  if (!activeMember || activeMember.role !== role) return <Navigate to="/select-profile" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/setup"
        element={
          <RequireAuth>
            <SetupPage />
          </RequireAuth>
        }
      />

      <Route
        path="/select-profile"
        element={
          <RequireAuth>
            <RequireSetupDone>
              <ProfileSelectPage />
            </RequireSetupDone>
          </RequireAuth>
        }
      />

      <Route
        path="/parent-pin/:memberId"
        element={
          <RequireAuth>
            <RequireSetupDone>
              <ParentPinPage />
            </RequireSetupDone>
          </RequireAuth>
        }
      />

      <Route
        path="/parent"
        element={
          <RequireAuth>
            <RequireSetupDone>
              <RequireRole role="parent">
                <ParentDashboard />
              </RequireRole>
            </RequireSetupDone>
          </RequireAuth>
        }
      />

      <Route
        path="/child"
        element={
          <RequireAuth>
            <RequireSetupDone>
              <RequireRole role="child">
                <ChildDashboard />
              </RequireRole>
            </RequireSetupDone>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
