import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../layout/Logo";
import ThemeToggle from "../theme/ThemeToggle";
import CurrencySelector from "../theme/CurrencySelector";
import { NAV_LINKS } from "../../data/landingData";

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleNavClick(to) {
    setMenuOpen(false);
    if (to.startsWith("#")) {
      const el = document.querySelector(to);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) =>
              link.to.startsWith("#") ? (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.to);
                  }}
                  className="text-sm text-text-muted hover:text-text-accent transition"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm text-text-muted hover:text-text-accent transition"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <CurrencySelector />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-text-primary border border-border rounded-lg hover:bg-surface-hover transition"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-white btn-gradient rounded-lg uppercase tracking-wide"
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg border border-border text-text-muted hover:text-text-accent"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="lg:hidden pb-4 flex flex-col gap-1 border-t border-border pt-3">
            {NAV_LINKS.map((link) =>
              link.to.startsWith("#") ? (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.to);
                  }}
                  className="px-3 py-2 text-sm text-text-muted hover:text-text-accent hover:bg-surface-hover rounded-lg"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 text-sm text-text-muted hover:text-text-accent hover:bg-surface-hover rounded-lg"
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="flex gap-2 pt-2 sm:hidden">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); navigate("/login"); }}
                className="flex-1 py-2 text-sm border border-border rounded-lg"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); navigate("/register"); }}
                className="flex-1 py-2 text-sm btn-gradient text-white rounded-lg"
              >
                Register
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
