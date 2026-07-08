import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import AuthLayout from "../../components/layout/AuthLayout";
import useAuthStore from "../../store/useAuthStore";
import { adminLoginApi } from "../../api/adminAuth.api";

export default function AdminLoginPage() {
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
      const res = await adminLoginApi(form);
      const { admin, accessToken, refreshToken } = res.data.data;
      setAuth(
        { ...admin, role: "admin" },
        accessToken,
        refreshToken,
        true
      );
      toast.success(`Welcome, ${admin.firstName}!`);
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Admin Login" subtitle="Sign in to the admin panel">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          icon="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="admin@c2c.com"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          icon="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
        />
        <Button type="submit" loading={loading} className="mt-2">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        <Link to="/login" className="text-text-accent font-semibold hover:underline">
          ← Back to user login
        </Link>
      </p>
    </AuthLayout>
  );
}
