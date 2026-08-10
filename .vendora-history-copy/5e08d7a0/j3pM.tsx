import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage, { LoginSelectionPage } from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import AdminDashboardPage from './pages/Dashboard/AdminDashboardPage';
import UserDashboardPage from './pages/Dashboard/UserDashboardPage';
import VideoPage from './pages/Video/VideoPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/login" element={<LoginSelectionPage />} />
        <Route path="/login/admin" element={<LoginPage loginRole="admin" />} />
        <Route path="/login/user" element={<LoginPage loginRole="user" />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Admin Route */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected User Route */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback route redirect */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <Navigate to="/user-dashboard" replace />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
