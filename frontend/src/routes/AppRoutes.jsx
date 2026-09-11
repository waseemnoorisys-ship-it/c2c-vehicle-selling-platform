import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

// Public
import LandingPage from "../pages/landing/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import AdminLoginPage from "../pages/auth/AdminLoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import BrowsePage from "../pages/buyer/BrowsePage";
import VehicleDetailsPage from "../pages/buyer/VehicleDetailsPage";
import ChatPage from "../pages/chat/ChatPage";

import McpGuidePage from "../pages/mcp/McpGuidePage";

// Public Content Pages Layout & Pages
import PublicLayout from "../components/layout/PublicLayout";
import HowItWorksPage from "../pages/public/HowItWorksPage";
import AboutUsPage from "../pages/public/AboutUsPage";
import ContactUsPage from "../pages/public/ContactUsPage";
import FaqPage from "../pages/public/FaqPage";
import FinancingPage from "../pages/public/FinancingPage";
import BuyerProtectionPage from "../pages/public/BuyerProtectionPage";
import SellVehiclePage from "../pages/public/SellVehiclePage";
import SellerGuidePage from "../pages/public/SellerGuidePage";
import PricingToolsPage from "../pages/public/PricingToolsPage";
import SuccessStoriesPage from "../pages/public/SuccessStoriesPage";
import PrivacyPolicyPage from "../pages/public/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/public/TermsOfServicePage";
import CookiePolicyPage from "../pages/public/CookiePolicyPage";
import DisclaimerPage from "../pages/public/DisclaimerPage";
import UnsubscribePage from "../pages/public/UnsubscribePage";

// Buyer
import BuyerDashboardPage from "../pages/buyer/BuyerDashboardPage";
import BuyerOffersPage from "../pages/buyer/BuyerOffersPage";
import BuyerPurchasesPage from "../pages/buyer/BuyerPurchasesPage";
import BuyerProfilePage from "../pages/buyer/BuyerProfilePage";
import BuyerPendingPaymentsPage from "../pages/buyer/BuyerPendingPaymentsPage";

// Vendor
import VendorDashboard from "../pages/vendor/VendorDashboard";
import ManageListingsPage from "../pages/vendor/ManageListingsPage";
import AddEditVehiclePage from "../pages/vendor/AddEditVehiclePage";
import VendorOffersPage from "../pages/vendor/VendorOffersPage";
import VendorSalesPage from "../pages/vendor/VendorSalesPage";
import WalletPage from "../pages/vendor/WalletPage";
import BankDetailsPage from "../pages/vendor/BankDetailsPage";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageBuyersPage from "../pages/admin/ManageBuyersPage";
import ManageSellersPage from "../pages/admin/ManageSellersPage";
import AdminListingsPage from "../pages/admin/AdminListingsPage";
import AdminInvoicesPage from "../pages/admin/AdminInvoicesPage";
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
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
      <Route path="/mcp-guide" element={<McpGuidePage />} />
      <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />

      {/* Public Informational & Utility Pages */}
      <Route path="/how-it-works" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutUsPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactUsPage /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FaqPage /></PublicLayout>} />
      <Route path="/financing" element={<PublicLayout><FinancingPage /></PublicLayout>} />
      <Route path="/buyer-protection" element={<PublicLayout><BuyerProtectionPage /></PublicLayout>} />
      <Route path="/sell" element={<PublicLayout><SellVehiclePage /></PublicLayout>} />
      <Route path="/seller-guide" element={<PublicLayout><SellerGuidePage /></PublicLayout>} />
      <Route path="/pricing-tools" element={<PublicLayout><PricingToolsPage /></PublicLayout>} />
      <Route path="/success-stories" element={<PublicLayout><SuccessStoriesPage /></PublicLayout>} />
      <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
      <Route path="/terms-of-service" element={<PublicLayout><TermsOfServicePage /></PublicLayout>} />
      <Route path="/cookie-policy" element={<PublicLayout><CookiePolicyPage /></PublicLayout>} />
      <Route path="/disclaimer" element={<PublicLayout><DisclaimerPage /></PublicLayout>} />
      <Route path="/unsubscribe" element={<PublicLayout><UnsubscribePage /></PublicLayout>} />

      {/* Buyer */}
      <Route path="/buyer/dashboard" element={<PrivateRoute roles={["buyer"]}><BuyerDashboardPage /></PrivateRoute>} />
      <Route path="/buyer/offers" element={<PrivateRoute roles={["buyer"]}><BuyerOffersPage /></PrivateRoute>} />
      <Route path="/buyer/pending-payments" element={<PrivateRoute roles={["buyer"]}><BuyerPendingPaymentsPage /></PrivateRoute>} />
      <Route path="/buyer/purchases" element={<PrivateRoute roles={["buyer"]}><BuyerPurchasesPage /></PrivateRoute>} />
      <Route path="/buyer/profile" element={<PrivateRoute roles={["buyer"]}><BuyerProfilePage /></PrivateRoute>} />


      {/* Vendor */}
      <Route path="/vendor/dashboard" element={<PrivateRoute roles={["vendor"]}><VendorDashboard /></PrivateRoute>} />
      <Route path="/vendor/listings" element={<PrivateRoute roles={["vendor"]}><ManageListingsPage /></PrivateRoute>} />
      <Route path="/vendor/listings/new" element={<PrivateRoute roles={["vendor"]}><AddEditVehiclePage /></PrivateRoute>} />
      <Route path="/vendor/listings/:id/edit" element={<PrivateRoute roles={["vendor"]}><AddEditVehiclePage /></PrivateRoute>} />
      <Route path="/vendor/offers" element={<PrivateRoute roles={["vendor"]}><VendorOffersPage /></PrivateRoute>} />
      <Route path="/vendor/sales" element={<PrivateRoute roles={["vendor"]}><VendorSalesPage /></PrivateRoute>} />
      <Route path="/vendor/wallet" element={<PrivateRoute roles={["vendor"]}><WalletPage /></PrivateRoute>} />
      <Route path="/vendor/bank" element={<PrivateRoute roles={["vendor"]}><BankDetailsPage /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/buyers" element={<PrivateRoute roles={["admin"]}><ManageBuyersPage /></PrivateRoute>} />
      <Route path="/admin/sellers" element={<PrivateRoute roles={["admin"]}><ManageSellersPage /></PrivateRoute>} />
      <Route path="/admin/listings" element={<PrivateRoute roles={["admin"]}><AdminListingsPage /></PrivateRoute>} />
      <Route path="/admin/invoices" element={<PrivateRoute roles={["admin"]}><AdminInvoicesPage /></PrivateRoute>} />
      <Route path="/admin/commission" element={<PrivateRoute roles={["admin"]}><CommissionPage /></PrivateRoute>} />
      <Route path="/admin/withdrawals" element={<PrivateRoute roles={["admin"]}><WithdrawalsPage /></PrivateRoute>} />
      <Route path="/admin/vehicle-data" element={<PrivateRoute roles={["admin"]}><VehicleDataPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
