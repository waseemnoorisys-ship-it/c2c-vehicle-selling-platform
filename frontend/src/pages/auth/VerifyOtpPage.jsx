import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";
import { verifyEmailApi, resendOtpApi,
         verifyResetOtpApi } from "../../api/auth.api";

export default function VerifyOtpPage() {
  const navigate   = useNavigate();
  const { state }  = useLocation(); // { email, type: 'email_verify' | 'password_reset' }
  const email      = state?.email;
  const type       = state?.type || "email_verify";

  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  // countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  function handleOtpChange(value, idx) {
    if (!/^\d*$/.test(value)) return; // digits only
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
        // pass reset token to reset-password page
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

  if (!email) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">No email found. <Link to="/register" className="text-primary-600">Register</Link></p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📬</div>
          <h2 className="text-xl font-bold text-gray-800">Check your email</h2>
          <p className="text-gray-500 text-sm mt-1">
            OTP sent to <span className="font-semibold text-gray-700">{email}</span>
          </p>
        </div>

        {/* 6-box OTP input */}
        <div className="flex justify-center gap-3 mb-6">
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
              className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg
                focus:border-primary-500 focus:outline-none transition
                border-gray-200 bg-gray-50"
            />
          ))}
        </div>

        <Button loading={loading} onClick={handleVerify}>
          Verify OTP
        </Button>

        <div className="text-center mt-4">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-400">Resend in {resendTimer}s</p>
          ) : (
            <button onClick={handleResend}
              className="text-sm text-primary-600 font-semibold hover:underline">
              Resend OTP
            </button>
          )}
        </div>

        <div className="text-center mt-3">
          <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}