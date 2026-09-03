import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import ThemeToggle from "../theme/ThemeToggle";

const NAV_LINKS = [
  { label: "Login", to: "/login" },
  { label: "Inventory", to: "/browse" },
  { label: "Performance", to: "/" },
];

export default function AppHeader({ showBack = false }) {
  const location = useLocation();
  const navigate = useNavigate();
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
        {NAV_LINKS.map((link) => (
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
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
