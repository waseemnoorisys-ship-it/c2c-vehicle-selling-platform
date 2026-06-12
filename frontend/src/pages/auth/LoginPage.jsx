import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import useAuthStore from "../../store/useAuthStore";
import { loginApi } from "../../api/auth.api";

export default function LoginPage() {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const setAuth  = useAuthStore((s) => s.setAuth);

  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
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

      // Route based on role
      if (user.role === "buyer")  navigate("/browse");
      if (user.role === "vendor") navigate("/vendor/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary-700">🚗 C2C Vehicles</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label={t("email")} name="email" type="email"
            value={form.email} onChange={handleChange}
            error={errors.email} placeholder="you@email.com" />

          <Input label={t("password")} name="password" type="password"
            value={form.password} onChange={handleChange}
            error={errors.password} placeholder="Your password" />

          <div className="text-right -mt-2">
            <Link to="/forgot-password"
              className="text-xs text-primary-600 hover:underline">
              {t("forgotPassword")}?
            </Link>
          </div>

          <Button type="submit" loading={loading}>{t("login")}</Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {t("dontHaveAccount")}{" "}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}