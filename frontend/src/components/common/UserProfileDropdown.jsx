import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export default function UserProfileDropdown() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initial = user.firstName ? user.firstName[0].toUpperCase() : "U";
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const dashboardLink = user.role === "vendor" ? "/vendor/dashboard" : "/buyer/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-[#00a884] text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
          {user.profilePhoto ? (
            <img src={user.profilePhoto} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <span className="hidden sm:inline-block text-xs font-semibold text-text-primary max-w-[100px] truncate">
          {user.firstName}
        </span>
        <svg className="w-3.5 h-3.5 text-text-muted fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden text-text-primary">
          {/* Header Profile Summary */}
          <div className="p-4 bg-surface-elevated border-b border-border flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#00a884] text-white flex items-center justify-center font-bold text-sm uppercase overflow-hidden shrink-0">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-text-primary truncate">{fullName}</h4>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-text-accent/10 text-text-accent">
                {user.role} Account
              </span>
            </div>
          </div>

          {/* Quick Navigation Items */}
          <div className="p-2 space-y-1 text-xs">
            <Link
              to={dashboardLink}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>

            {user.role === "buyer" && (
              <Link
                to="/buyer/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                <span>👤</span>
                <span>Profile Details</span>
              </Link>
            )}

            <Link
              to={user.role === "vendor" ? "/vendor/offers" : "/buyer/offers"}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <span>🏷️</span>
              <span>My Offers</span>
            </Link>

            <Link
              to="/chat"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <span>💬</span>
              <span>Messages</span>
            </Link>
          </div>

          {/* Logout Footer */}
          <div className="p-2 border-t border-border bg-surface-elevated/40">
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
