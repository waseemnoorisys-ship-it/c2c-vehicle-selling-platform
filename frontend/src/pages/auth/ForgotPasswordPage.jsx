import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import AuthLayout from "../../components/layout/AuthLayout";
import { forgotPasswordApi, resetPasswordApi } from "../../api/auth.api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isResetStep = state?.step === "reset";

  const [email, setEmail] = useState(state?.email || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

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
    <AuthLayout
      title={isResetStep ? "Set New Password" : "Forgot Password"}
      subtitle={
        isResetStep
          ? "Choose a strong new password"
          : "Enter your email to receive an OTP"
      }
    >
      {!isResetStep ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            icon="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@c2c.com"
          />
          <Button type="submit" loading={loading}>
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <Input
            label="New Password"
            type="password"
            icon="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
          />
          <Input
            label="Confirm Password"
            type="password"
            icon="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
          />
          <Button type="submit" loading={loading}>
            Reset Password
          </Button>
        </form>
      )}

      <div className="text-center mt-6">
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
