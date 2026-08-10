import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage, { RegisterSelectionPage } from './pages/Register/RegisterPage';
import VendorOnboardingPage from './pages/Register/VendorOnboardingPage';
import CustomerExplorePage from './pages/Register/CustomerExplorePage';
import AdminDashboardPage from './pages/Dashboard/AdminDashboardPage';
import UserDashboardPage from './pages/Dashboard/UserDashboardPage';
import VideoPage from './pages/Video/VideoPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/seller" element={<LoginPage loginRole="vendor" />} />
        <Route path="/login/buyer" element={<LoginPage loginRole="customer" />} />
        <Route path="/register" element={<RegisterSelectionPage />} />
        <Route path="/register/seller" element={<RegisterPage registerRole="vendor" />} />
        <Route path="/register/buyer" element={<RegisterPage registerRole="customer" />} />
        <Route
          path="/seller-dashboard"
          element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorOnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-dashboard"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerExplorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
