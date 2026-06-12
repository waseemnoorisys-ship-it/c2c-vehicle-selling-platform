import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import {
  forgotPasswordApi,
  resetPasswordApi,
} from "../../api/auth.api";

// This page handles 2 steps:
// Step 1 — enter email → send OTP (then redirect to /verify-email with type=password_reset)
// Step 2 — enter new password (arrives here from VerifyOtpPage with resetToken)

export default function ForgotPasswordPage() {
  const navigate    = useNavigate();
  const { state }   = useLocation();
  const isResetStep = state?.step === "reset";

  const [email, setEmail]         = useState(state?.email || "");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();
    if (!email) { toast.error("Enter your email"); return; }
    setLoading(true);
    try {
      await forgotPasswordApi({ email });
      toast.success("OTP sent to your email!");
      navigate("/verify-email", {
        state: { email, type: "password_reset" },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Min 8 characters"); return; }
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      await resetPasswordApi({
        email: state.email,
        resetToken: state.resetToken,
        newPassword: password,
      });
      toast.success("Password reset! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{isResetStep ? "🔒" : "🔑"}</div>
          <h2 className="text-xl font-bold text-gray-800">
            {isResetStep ? "Set New Password" : "Forgot Password"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isResetStep
              ? "Choose a strong new password"
              : "Enter your email to receive an OTP"}
          </p>
        </div>

        {!isResetStep ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <Input label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" />
            <Button type="submit" loading={loading}>Send OTP</Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <Input label="New Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters" />
            <Input label="Confirm Password" type="password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password" />
            <Button type="submit" loading={loading}>Reset Password</Button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}