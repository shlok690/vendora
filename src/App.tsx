import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import VendorOnboardingPage from './pages/Dashboard/VendorOnboardingPage';
import CustomerExplorePage from './pages/Dashboard/CustomerExplorePage';
import ProductsPage from './pages/Products/ProductsPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/login"    element={<LoginPage />} />

          {/* Register routes */}
          <Route path="/register"         element={<RegisterPage registerRole="customer" />} />
          <Route path="/register/seller"  element={<RegisterPage registerRole="vendor" />} />
          <Route path="/register/buyer"   element={<RegisterPage registerRole="customer" />} />

          {/* Legacy register paths — redirect to new paths */}
          <Route path="/register/user"    element={<Navigate to="/register/buyer" replace />} />
          <Route path="/login/user"       element={<Navigate to="/login" replace />} />

          {/* Protected — Vendor */}
          <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorOnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Protected — Customer */}
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerExplorePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
