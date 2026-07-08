import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { BUYER_NAV } from "../../config/navigation";
import { updateBuyerProfile, fetchBuyerProfile } from "../../api/buyer.api";
import useAuthStore from "../../store/useAuthStore";

export default function BuyerProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBuyerProfile()
      .then((res) => {
        const u = res.data.data;
        setForm({
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
          phone: u.mobile ? `${u.countryCode || ""} ${u.mobile}`.trim() : "",
        });
        setUser({ ...user, ...u });
      })
      .catch(() => {});
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateBuyerProfile(form);
      setUser({ ...user, ...res.data.data });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  function handlePasswordChange(e) {
    e.preventDefault();
    if (passwords.newPass.length < 8) { toast.error("Min 8 characters"); return; }
    if (passwords.newPass !== passwords.confirm) { toast.error("Passwords don't match"); return; }
    toast.success("Password changed (mock)");
    setPasswords({ current: "", newPass: "", confirm: "" });
  }

  return (
    <SidebarLayout navItems={BUYER_NAV} roleLabel="Buyer Portal">
      <PageHeader title="Profile Settings" subtitle="Manage your personal information" />

      <div className="max-w-xl space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-500/20 border border-primary-400/30 flex items-center justify-center text-2xl font-bold text-text-accent">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <Button variant="outline" className="w-auto px-4 normal-case" onClick={() => toast.success("Photo upload coming soon")}>
            Change Photo
          </Button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 p-6 rounded-xl border border-border bg-surface">
          <h2 className="font-semibold text-text-primary">Personal Info</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} />
            <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
          </div>
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+33 612345678" />
          <Button type="submit" loading={loading} className="w-auto px-8">Save Changes</Button>
        </form>

        <form onSubmit={handlePasswordChange} className="space-y-4 p-6 rounded-xl border border-border bg-surface">
          <h2 className="font-semibold text-text-primary">Change Password</h2>
          <Input label="Current Password" type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} />
          <Input label="New Password" type="password" value={passwords.newPass} onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))} />
          <Input label="Confirm Password" type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} />
          <Button type="submit" className="w-auto px-8">Update Password</Button>
        </form>
      </div>
    </SidebarLayout>
  );
}
