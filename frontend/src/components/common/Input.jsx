import React, { useState } from "react";

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

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 014.122-.863c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21f-9 9 0 1112.728-12.728L3 3" />
    </svg>
  );
}

const ICONS = {
  email: EnvelopeIcon,
  password: LockIcon,
};

export default function Input({ label, error, icon, type, className = "", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const effectiveType = isPasswordType ? (showPassword ? "text" : "password") : type;
  const IconComponent = icon ? ICONS[icon] : null;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <div className="relative flex items-center">
        {IconComponent && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10">
            <IconComponent />
          </span>
        )}

        <input
          type={effectiveType}
          className={`w-full py-2.5 border rounded-lg text-sm outline-none transition
            bg-surface text-text-primary placeholder:text-text-muted
            focus:ring-2 focus:ring-primary-400 focus:border-transparent
            ${IconComponent ? "pl-10" : "pl-4"}
            ${isPasswordType ? "pr-10" : "pr-4"}
            ${error ? "border-danger bg-danger/10" : "border-border"}`}
          {...props}
        />

        {isPasswordType && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 rounded transition-colors focus:outline-none z-10"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
