function EnvelopeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

const ICONS = {
  email: EnvelopeIcon,
  password: LockIcon,
};

export default function Input({ label, error, icon, type, className = "", ...props }) {
  const IconComponent = icon ? ICONS[icon] : null;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <div className="relative">
        {IconComponent && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <IconComponent />
          </span>
        )}
        <input
          type={type}
          className={`w-full py-2.5 border rounded-lg text-sm outline-none transition
            bg-surface text-text-primary placeholder:text-text-muted
            focus:ring-2 focus:ring-primary-400 focus:border-transparent
            ${IconComponent ? "pl-10 pr-4" : "px-4"}
            ${error ? "border-danger bg-danger/10" : "border-border"}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
