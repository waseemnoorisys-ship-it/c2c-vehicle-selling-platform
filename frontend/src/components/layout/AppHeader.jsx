import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import ThemeToggle from "../theme/ThemeToggle";
import useAuthStore from "../../store/useAuthStore";
import useChatStore from "../../store/useChatStore";
import NotificationDropdown from "../common/NotificationDropdown";
import UserProfileDropdown from "../common/UserProfileDropdown";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Browse", to: "/browse" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "FAQ", to: "/faq" },
];

export default function AppHeader({ showBack = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { unreadCounts } = useChatStore();
  
  const totalUnreads = Object.values(unreadCounts || {}).reduce((a, b) => a + b, 0);

  const isAuthRoute = ["/login", "/register", "/verify-email", "/forgot-password"].includes(
    location.pathname
  );

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
      <div className="flex items-center gap-3">
        {(showBack || isAuthRoute) && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-accent hover:bg-surface-hover transition"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <Link to="/">
          <Logo />
        </Link>
      </div>

      <nav className="hidden sm:flex items-center gap-6">
        {user ? (
          <>
            <Link
              to={user.role === "vendor" ? "/vendor/dashboard" : "/buyer/dashboard"}
              className="text-sm font-medium text-text-muted hover:text-text-primary transition"
            >
              Dashboard
            </Link>
            <Link
              to="/browse"
              className={`text-sm font-medium transition ${
                location.pathname === "/browse" ? "text-text-accent" : "text-text-muted hover:text-text-primary"
              }`}
            >
              Inventory
            </Link>
            <Link
              to="/chat"
              className={`text-sm font-medium transition flex items-center gap-1.5 ${
                location.pathname === "/chat" ? "text-text-accent" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span>Chat</span>
              {totalUnreads > 0 && (
                <span className="bg-[#00a884] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalUnreads}
                </span>
              )}
            </Link>
          </>
        ) : (
          NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition ${
                location.pathname === link.to
                  ? "text-text-accent"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))
        )}
      </nav>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user && (
          <>
            <NotificationDropdown />
            <UserProfileDropdown />
          </>
        )}
      </div>
    </header>
  );
}
