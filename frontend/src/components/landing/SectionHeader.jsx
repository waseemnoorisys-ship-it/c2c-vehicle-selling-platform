import { Link } from "react-router-dom";

export default function SectionHeader({ label, title, linkText, linkTo = "#" }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-accent mb-2">
          {label}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-primary uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {linkText && (
        <Link
          to={linkTo}
          className="text-sm text-text-accent font-medium hover:underline shrink-0"
        >
          {linkText} →
        </Link>
      )}
    </div>
  );
}
