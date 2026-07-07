export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-glow">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5 text-white"
          aria-hidden="true"
        >
          <path
            d="M5 11h14l-1.5 6H6.5L5 11zM7 8l1-3h8l1 3M9 14h6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="font-display font-bold text-xl tracking-wider text-text-accent text-glow">
        C2C
      </span>
    </div>
  );
}
