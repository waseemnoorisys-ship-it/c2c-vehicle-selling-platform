export default function Button({
  children,
  loading = false,
  variant = "primary",
  className = "",
  icon,
  ...props
}) {
  const hasCustomWidth = className.split(" ").some((cls) => cls.startsWith("w-"));
  const widthClass = hasCustomWidth ? "" : "w-full";

  const base =
    `${widthClass} py-2.5 px-4 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed`;

  const variants = {
    primary:
      "btn-gradient text-white uppercase tracking-wider shadow-glow hover:shadow-glow dark:hover:shadow-[0_0_30px_rgba(126,230,200,0.35)]",
    outline:
      "border border-border text-text-accent hover:bg-surface-hover bg-transparent normal-case",
    ghost:
      "text-text-accent hover:bg-surface-hover bg-transparent",
    social:
      "border border-border bg-surface text-text-primary hover:bg-surface-hover flex items-center justify-center gap-2 font-medium normal-case",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
