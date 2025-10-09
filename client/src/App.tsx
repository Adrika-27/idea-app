import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useSocketStore } from './store/socketStore';
import { useThemeStore } from './store/themeStore';
import { authApi } from './api/auth';
import toast from 'react-hot-toast';

// Layout components
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Page components
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import IdeaDetailPage from './pages/IdeaDetailPage';
import CreateIdeaPage from './pages/CreateIdeaPage';
import EditIdeaPage from './pages/EditIdeaPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';

// Utility components
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
  const { isAuthenticated, tokens, setUser, logout, setLoading, isLoading } = useAuthStore();
  const { connect, disconnect } = useSocketStore();
  
  // Initialize theme store (this triggers theme initialization)
  useThemeStore();

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      if (tokens?.accessToken) {
        try {
          setLoading(true);
          const { user } = await authApi.getCurrentUser();
          setUser(user);
          
          // Connect to socket if authenticated
          if (tokens.accessToken) {
            connect(tokens.accessToken);
          }
        } catch (error) {
          console.error('Failed to initialize user:', error);
          logout();
          toast.error('Session expired. Please login again.');
        } finally {
          setLoading(false);
        }
      }
    };

    initializeApp();

    // Cleanup socket connection on unmount
    return () => {
      disconnect();
    };
  }, [tokens?.accessToken, setUser, logout, setLoading, connect, disconnect]);

  // Show loading spinner during initialization
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="ideas/:id" element={<IdeaDetailPage />} />
        <Route path="users/:username" element={<ProfilePage />} />
      </Route>

      {/* Auth routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="callback" element={<AuthCallbackPage />} />
      </Route>

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="create" element={<CreateIdeaPage />} />
        <Route path="ideas/:id/edit" element={<EditIdeaPage />} />
      </Route>

      {/* Redirect authenticated users from auth pages */}
      {isAuthenticated && (
        <>
          <Route path="/auth/*" element={<Navigate to="/dashboard" replace />} />
        </>
      )}

      {/* Redirect unauthenticated users to login for protected pages */}
      {!isAuthenticated && (
        <>
          <Route path="/dashboard" element={<Navigate to="/auth/login" replace />} />
          <Route path="/notifications" element={<Navigate to="/auth/login" replace />} />
          <Route path="/create" element={<Navigate to="/auth/login" replace />} />
          <Route path="/ideas/*/edit" element={<Navigate to="/auth/login" replace />} />
        </>
      )}

      {/* 404 fallback */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-6">Page not found</p>
            <a href="/" className="btn btn-primary">Go Home</a>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default App;
