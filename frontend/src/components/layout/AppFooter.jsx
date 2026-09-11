import { Link } from "react-router-dom";
import Logo from "./Logo";

const FOOTER_LINKS = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Help Center", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

export default function AppFooter() {
  return (
    <footer className="px-4 sm:px-6 py-6 border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo className="scale-90 origin-left" />
          <span className="text-xs text-text-muted">
            © {new Date().getFullYear()} C2C Motors. Precision Engineered.
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-xs text-text-muted hover:text-text-accent transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

