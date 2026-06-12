export default function Button({
    children,
    loading = false,
    variant = "primary",
    className = "",
    ...props
  }) {
    const base =
      "w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  
    const variants = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
      outline:
        "border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-400",
      ghost:
        "text-primary-600 hover:bg-primary-50 focus:ring-primary-400",
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
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }