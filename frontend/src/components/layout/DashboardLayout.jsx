import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import ThemeToggle from "../theme/ThemeToggle";
import CurrencySelector from "../theme/CurrencySelector";
import useAuthStore from "../../store/useAuthStore";
import { logoutApi } from "../../api/auth.api";
import { adminLogoutApi } from "../../api/adminAuth.api";

export default function DashboardLayout({ children, title }) {
  const { user, logout, refreshToken, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      if (refreshToken) {
        if (isAdmin) await adminLogoutApi({ refreshToken });
        else await logoutApi({ refreshToken });
      }
    } catch {
      // ignore
    }
    logout();
    navigate(isAdmin ? "/admin/login" : "/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {user && (
              <span className="text-sm text-text-secondary hidden sm:inline">
                {user.firstName} {user.lastName}
                <span className="ml-2 text-xs text-text-muted capitalize">({user.role})</span>
              </span>
            )}
            <CurrencySelector />
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-text-muted hover:text-danger transition px-3 py-1.5 rounded-lg border border-border hover:border-danger/50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {title && (
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary uppercase tracking-wide mb-6">
            {title}
          </h1>
        )}
        {children}
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-text-muted">
        © {new Date().getFullYear()} C2C Motors. Precision Engineered.
      </footer>
    </div>
  );
}
