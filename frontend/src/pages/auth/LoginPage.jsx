import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import SocialLoginButtons from "../../components/common/SocialLoginButtons";
import AuthLayout from "../../components/layout/AuthLayout";
import useAuthStore from "../../store/useAuthStore";
import { loginApi } from "../../api/auth.api";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email) { setErrors({ email: "Required" }); return; }
    if (!form.password) { setErrors({ password: "Required" }); return; }

    setLoading(true);
    try {
      const res = await loginApi(form);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.firstName}!`);

      if (user.role === "buyer") navigate("/buyer/dashboard");
      if (user.role === "vendor") navigate("/vendor/dashboard");
      if (user.role === "admin") navigate("/admin/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Access your elite vehicle portfolio."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={t("email")}
          name="email"
          type="email"
          icon="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="name@c2c.com"
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-text-secondary">
              {t("password")}
            </span>
            <Link
              to="/forgot-password"
              className="text-xs text-text-accent font-semibold uppercase tracking-wide hover:underline"
            >
              {t("forgotPassword")}?
            </Link>
          </div>
          <Input
            name="password"
            type="password"
            icon="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" loading={loading} className="mt-2">
          {t("login")}
        </Button>
      </form>

      <SocialLoginButtons />

      <p className="text-center text-sm text-text-muted mt-6">
        {t("dontHaveAccount")}{" "}
        <Link
          to="/register"
          className="text-text-accent font-semibold hover:underline"
        >
          {t("register")}
        </Link>
      </p>

      <p className="text-center text-xs text-text-muted mt-3">
        <Link to="/admin/login" className="hover:text-text-accent hover:underline">
          Admin login →
        </Link>
      </p>
    </AuthLayout>
  );
}
