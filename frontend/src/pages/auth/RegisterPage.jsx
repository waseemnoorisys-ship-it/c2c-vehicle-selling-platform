import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { registerApi } from "../../api/auth.api";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    mobile: "", countryCode: "+33",
    password: "", confirmPassword: "",
    role: "buyer",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  function validate() {
    const err = {};
    if (!form.firstName.trim()) err.firstName = "Required";
    if (!form.lastName.trim()) err.lastName = "Required";
    if (!form.email.trim()) err.email = "Required";
    if (!/\S+@\S+\.\S+/.test(form.email)) err.email = "Invalid email";
    if (!form.mobile.trim()) err.mobile = "Required";
    if (form.password.length < 8) err.password = "Min 8 characters";
    if (form.password !== form.confirmPassword)
      err.confirmPassword = "Passwords do not match";
    return err;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }

    setLoading(true);
    try {
      await registerApi({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        mobile: form.mobile,
        countryCode: form.countryCode,
        password: form.password,
        role: form.role,
      });
      toast.success("OTP sent to your email!");
      // Pass email to OTP page via state
      navigate("/verify-email", { state: { email: form.email, type: "email_verify" } });
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Logo placeholder */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary-700">🚗 C2C Vehicles</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        {/* Role selector */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-6">
          {["buyer", "vendor"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: r }))}
              className={`flex-1 py-2 text-sm font-semibold transition
                ${form.role === r
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              {r === "buyer" ? t("buyer") : t("vendor")}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <Input label={t("firstName")} name="firstName"
              value={form.firstName} onChange={handleChange}
              error={errors.firstName} placeholder="John" />
            <Input label={t("lastName")} name="lastName"
              value={form.lastName} onChange={handleChange}
              error={errors.lastName} placeholder="Doe" />
          </div>

          <Input label={t("email")} name="email" type="email"
            value={form.email} onChange={handleChange}
            error={errors.email} placeholder="you@email.com" />

          <div className="flex gap-2">
            <div className="w-28">
              <Input label="Code" name="countryCode"
                value={form.countryCode} onChange={handleChange}
                placeholder="+33" />
            </div>
            <div className="flex-1">
              <Input label={t("mobile")} name="mobile"
                value={form.mobile} onChange={handleChange}
                error={errors.mobile} placeholder="612345678" />
            </div>
          </div>

          <Input label={t("password")} name="password" type="password"
            value={form.password} onChange={handleChange}
            error={errors.password} placeholder="Min 8 characters" />

          <Input label="Confirm Password" name="confirmPassword" type="password"
            value={form.confirmPassword} onChange={handleChange}
            error={errors.confirmPassword} placeholder="Repeat password" />

          <Button type="submit" loading={loading}>{t("register")}</Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {t("alreadyHaveAccount")}{" "}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}