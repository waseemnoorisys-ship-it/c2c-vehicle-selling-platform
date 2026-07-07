import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

// Public
import LandingPage from "../pages/landing/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import BrowsePage from "../pages/buyer/BrowsePage";
import VehicleDetailsPage from "../pages/buyer/VehicleDetailsPage";

// Buyer
import BuyerDashboardPage from "../pages/buyer/BuyerDashboardPage";
import BuyerOffersPage from "../pages/buyer/BuyerOffersPage";
import BuyerPurchasesPage from "../pages/buyer/BuyerPurchasesPage";
import BuyerProfilePage from "../pages/buyer/BuyerProfilePage";

// Vendor
import VendorDashboard from "../pages/vendor/VendorDashboard";
import ManageListingsPage from "../pages/vendor/ManageListingsPage";
import AddEditVehiclePage from "../pages/vendor/AddEditVehiclePage";
import VendorOffersPage from "../pages/vendor/VendorOffersPage";
import WalletPage from "../pages/vendor/WalletPage";
import BankDetailsPage from "../pages/vendor/BankDetailsPage";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageBuyersPage from "../pages/admin/ManageBuyersPage";
import ManageSellersPage from "../pages/admin/ManageSellersPage";
import AdminListingsPage from "../pages/admin/AdminListingsPage";
import CommissionPage from "../pages/admin/CommissionPage";
import WithdrawalsPage from "../pages/admin/WithdrawalsPage";
import VehicleDataPage from "../pages/admin/VehicleDataPage";

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
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />

      {/* Buyer */}
      <Route path="/buyer/dashboard" element={<PrivateRoute roles={["buyer"]}><BuyerDashboardPage /></PrivateRoute>} />
      <Route path="/buyer/offers" element={<PrivateRoute roles={["buyer"]}><BuyerOffersPage /></PrivateRoute>} />
      <Route path="/buyer/purchases" element={<PrivateRoute roles={["buyer"]}><BuyerPurchasesPage /></PrivateRoute>} />
      <Route path="/buyer/profile" element={<PrivateRoute roles={["buyer"]}><BuyerProfilePage /></PrivateRoute>} />

      {/* Vendor */}
      <Route path="/vendor/dashboard" element={<PrivateRoute roles={["vendor"]}><VendorDashboard /></PrivateRoute>} />
      <Route path="/vendor/listings" element={<PrivateRoute roles={["vendor"]}><ManageListingsPage /></PrivateRoute>} />
      <Route path="/vendor/listings/new" element={<PrivateRoute roles={["vendor"]}><AddEditVehiclePage /></PrivateRoute>} />
      <Route path="/vendor/listings/:id/edit" element={<PrivateRoute roles={["vendor"]}><AddEditVehiclePage /></PrivateRoute>} />
      <Route path="/vendor/offers" element={<PrivateRoute roles={["vendor"]}><VendorOffersPage /></PrivateRoute>} />
      <Route path="/vendor/wallet" element={<PrivateRoute roles={["vendor"]}><WalletPage /></PrivateRoute>} />
      <Route path="/vendor/bank" element={<PrivateRoute roles={["vendor"]}><BankDetailsPage /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/buyers" element={<PrivateRoute roles={["admin"]}><ManageBuyersPage /></PrivateRoute>} />
      <Route path="/admin/sellers" element={<PrivateRoute roles={["admin"]}><ManageSellersPage /></PrivateRoute>} />
      <Route path="/admin/listings" element={<PrivateRoute roles={["admin"]}><AdminListingsPage /></PrivateRoute>} />
      <Route path="/admin/commission" element={<PrivateRoute roles={["admin"]}><CommissionPage /></PrivateRoute>} />
      <Route path="/admin/withdrawals" element={<PrivateRoute roles={["admin"]}><WithdrawalsPage /></PrivateRoute>} />
      <Route path="/admin/vehicle-data" element={<PrivateRoute roles={["admin"]}><VehicleDataPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
