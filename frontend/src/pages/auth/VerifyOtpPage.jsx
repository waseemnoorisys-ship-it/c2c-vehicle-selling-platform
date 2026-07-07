import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";
import AuthLayout from "../../components/layout/AuthLayout";
import {
  verifyEmailApi,
  resendOtpApi,
  verifyResetOtpApi,
} from "../../api/auth.api";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;
  const type = state?.type || "email_verify";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  function handleOtpChange(value, idx) {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[idx] = value.slice(-1);
    setOtp(updated);
    if (value && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleKeyDown(e, idx) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < 6) { toast.error("Enter all 6 digits"); return; }
    setLoading(true);
    try {
      const apiFn = type === "email_verify" ? verifyEmailApi : verifyResetOtpApi;
      const res = await apiFn({ email, otp: code });

      if (type === "email_verify") {
        toast.success("Email verified! Please login.");
        navigate("/login");
      } else {
        toast.success("OTP verified!");
        navigate("/forgot-password", {
          state: { step: "reset", email, resetToken: res.data.data.resetToken },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await resendOtpApi({ email, type });
      toast.success("New OTP sent!");
      setResendTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not resend");
    }
  }

  if (!email) {
    return (
      <AuthLayout title="Verification" subtitle="Email required">
        <p className="text-text-muted text-center">
          No email found.{" "}
          <Link to="/register" className="text-text-accent font-semibold hover:underline">
            Register
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Check Your Email"
      subtitle={
        <>
          OTP sent to{" "}
          <span className="font-semibold text-text-primary">{email}</span>
        </>
      }
    >
      <div className="flex justify-center gap-2 sm:gap-3 mb-6">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-lg
              bg-surface border-border text-text-primary
              focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 focus:outline-none transition"
          />
        ))}
      </div>

      <Button loading={loading} onClick={handleVerify}>
        Verify OTP
      </Button>

      <div className="text-center mt-4">
        {resendTimer > 0 ? (
          <p className="text-sm text-text-muted">Resend in {resendTimer}s</p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-text-accent font-semibold hover:underline"
          >
            Resend OTP
          </button>
        )}
      </div>

      <div className="text-center mt-3">
        <Link
          to="/login"
          className="text-sm text-text-muted hover:text-text-accent transition"
        >
          ← Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}
