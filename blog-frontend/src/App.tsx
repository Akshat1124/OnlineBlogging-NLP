import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { useTheme } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Feed from './pages/Feed';
import Article from './pages/Article';
import Write from './pages/Write';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const { hydrate } = useAuthStore();
  const { theme } = useTheme();

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public — guests can browse */}
            <Route path="/" element={<Feed />} />
            <Route path="/post/:id" element={<Article />} />
            <Route path="/u/:username" element={<UserProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private — requires authentication */}
            <Route
              path="/write"
              element={
                <ProtectedRoute>
                  <Write />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>

      {/* Toast notifications — theme-aware */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#1e293b' : '#0f172a',
            color: '#f8fafc',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '12px',
            padding: '12px 16px',
            border: theme === 'dark' ? '1px solid #334155' : 'none',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f8fafc',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f8fafc',
            },
          },
        }}
      />
    </>
  );
}

export default App;
