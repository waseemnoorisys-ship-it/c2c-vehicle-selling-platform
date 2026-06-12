import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

import LandingPage      from "../pages/landing/LandingPage";
import LoginPage        from "../pages/auth/LoginPage";
import RegisterPage     from "../pages/auth/RegisterPage";
import VerifyOtpPage    from "../pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

// Buyer pages (stubs — filled in later sprints)
import BrowsePage       from "../pages/buyer/BrowsePage";

// Vendor pages (stubs)
import VendorDashboard  from "../pages/vendor/VendorDashboard";

// Admin pages (stubs)
import AdminDashboard   from "../pages/admin/AdminDashboard";

// Guard: redirect if NOT logged in
function PrivateRoute({ children, roles }) {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"              element={<LandingPage />} />
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/register"      element={<RegisterPage />} />
      <Route path="/verify-email"  element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Buyer protected */}
      <Route path="/browse" element={
        <PrivateRoute roles={["buyer"]}>
          <BrowsePage />
        </PrivateRoute>
      } />

      {/* Vendor protected */}
      <Route path="/vendor/dashboard" element={
        <PrivateRoute roles={["vendor"]}>
          <VendorDashboard />
        </PrivateRoute>
      } />

      {/* Admin protected */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute roles={["admin"]}>
          <AdminDashboard />
        </PrivateRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}