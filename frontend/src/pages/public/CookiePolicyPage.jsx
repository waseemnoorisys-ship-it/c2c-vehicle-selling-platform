import { useState } from "react";
import toast from "react-hot-toast";

export default function CookiePolicyPage() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    functional: true,
    marketing: false,
  });

  function handleSavePreferences() {
    toast.success("Cookie preferences saved successfully.");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-text-muted leading-relaxed">
      <div className="space-y-3 pb-6 border-b border-border">
        <span className="text-xs font-bold uppercase tracking-wider text-text-accent">
          Privacy & Security
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary font-display">
          Cookie Policy & Settings
        </h1>
        <p className="text-xs text-text-muted">Last Updated: September 11, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">What Are Cookies?</h2>
        <p className="text-sm">
          Cookies are small text files placed on your computer or mobile device when you visit C2C Motors. They allow us to recognize your session, remember your login preferences, secure escrow transactions, and optimize platform performance.
        </p>
      </section>

      {/* Interactive Preference Manager */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border space-y-6">
        <h2 className="text-xl font-bold text-text-primary">Manage Cookie Preferences</h2>
        <p className="text-sm text-text-muted">Toggle your cookie preferences below:</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border">
            <div>
              <h4 className="text-sm font-bold text-text-primary">Strictly Necessary Cookies</h4>
              <p className="text-xs text-text-muted">Essential for security, authentication, and escrow session locking. Cannot be disabled.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary-500/10 text-text-accent text-xs font-bold uppercase">
              Always Active
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border">
            <div>
              <h4 className="text-sm font-bold text-text-primary">Analytics & Performance Cookies</h4>
              <p className="text-xs text-text-muted">Helps us understand how users navigate the site to improve page load speed and UI design.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
              className="w-5 h-5 accent-primary-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border">
            <div>
              <h4 className="text-sm font-bold text-text-primary">Marketing & Targeted Ad Cookies</h4>
              <p className="text-xs text-text-muted">Used to deliver relevant vehicle recommendations across external platforms.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
              className="w-5 h-5 accent-primary-500 cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={handleSavePreferences}
          className="px-6 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold uppercase tracking-wide"
        >
          Save Cookie Preferences
        </button>
      </div>
    </div>
  );
}
