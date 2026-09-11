import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { unsubscribeApi } from "../../api/newsletter.api";
import toast from "react-hot-toast";

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  async function handleUnsubscribe(e) {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await unsubscribeApi({ email });
      toast.success(res.data.message || "Successfully unsubscribed.");
      setUnsubscribed(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to unsubscribe. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 space-y-6 text-center">
      <div className="p-8 rounded-3xl bg-surface border border-border space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary-500/10 text-text-accent flex items-center justify-center font-bold text-xl">
          ✉️
        </div>
        <h1 className="text-2xl font-bold text-text-primary">
          Newsletter Unsubscribe
        </h1>

        {unsubscribed ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-text-muted leading-relaxed">
              Your email <strong className="text-text-primary">{email}</strong> has been removed from our subscription list. You will no longer receive newsletter updates from C2C Motors.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold uppercase tracking-wide"
            >
              Back to Home Page
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="space-y-4 pt-2">
            <p className="text-sm text-text-muted">
              Enter your email address below to unsubscribe from C2C Motors newsletter updates.
            </p>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-gradient text-white font-semibold text-sm uppercase tracking-wide disabled:opacity-50 transition"
            >
              {loading ? "Unsubscribing..." : "Unsubscribe Now"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
