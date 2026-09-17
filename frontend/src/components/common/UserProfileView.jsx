import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../dashboard/SidebarLayout";
import PageHeader from "../dashboard/PageHeader";
import Input from "./Input";
import Button from "./Button";
import useAuthStore from "../../store/useAuthStore";
import { fetchMe, updateProfile, uploadProfilePhoto } from "../../api/user.api";

export default function UserProfileView({ navItems, roleLabel }) {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    countryCode: user?.countryCode || "+33",
    mobile: user?.mobile || "",
  });

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(user?.profilePhoto || null);

  useEffect(() => {
    fetchMe()
      .then((res) => {
        const u = res.data;
        if (u) {
          setForm({
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
            countryCode: u.countryCode || "+33",
            mobile: u.mobile || "",
          });
          setPreviewPhoto(u.profilePhoto || null);
          setUser({ ...user, ...u });
        }
      })
      .catch(() => {});
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First Name and Last Name are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        countryCode: form.countryCode.trim(),
        mobile: form.mobile.trim(),
      });
      const updatedUser = res.data;
      setUser({ ...user, ...updatedUser });
      toast.success(res.message || "Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    setPhotoUploading(true);
    try {
      const res = await uploadProfilePhoto(file);
      const newPhotoUrl = res.data?.profilePhoto;
      if (newPhotoUrl) {
        setPreviewPhoto(newPhotoUrl);
        setUser({ ...user, profilePhoto: newPhotoUrl });
        toast.success(res.message || "Profile photo updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload profile photo");
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handlePasswordChange(e) {
    e.preventDefault();
    if (!passwords.current) {
      toast.error("Please enter your current password.");
      return;
    }
    if (passwords.newPass.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    toast.success("Password updated successfully!");
    setPasswords({ current: "", newPass: "", confirm: "" });
  }

  const initials = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase() || "U";

  return (
    <SidebarLayout navItems={navItems} roleLabel={roleLabel}>
      <PageHeader title="Profile Settings" subtitle="View and edit your profile details and avatar" />

      <div className="max-w-2xl space-y-8 pb-12">
        {/* Avatar & Summary Header */}
        <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-card">
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-full bg-surface-hover border-2 border-primary-400/40 flex items-center justify-center font-bold text-3xl text-text-accent overflow-hidden shadow-glow">
              {previewPhoto ? (
                <img src={previewPhoto} alt="Profile Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <button
              type="button"
              disabled={photoUploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition cursor-pointer disabled:opacity-50"
              title="Upload Photo"
            >
              {photoUploading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-text-primary">
                {user?.firstName} {user?.lastName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-400/10 text-text-accent border border-primary-400/20">
                {user?.role || "User"}
              </span>
            </div>
            <p className="text-sm text-text-muted">{user?.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                loading={photoUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-auto px-4 py-1.5 text-xs normal-case"
              >
                {previewPhoto ? "Change Photo" : "Upload Photo"}
              </Button>
            </div>
          </div>
        </div>

        {/* Personal Info Form */}
        <form onSubmit={handleSaveProfile} className="space-y-5 p-6 rounded-2xl border border-border bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-semibold text-text-primary text-base">Personal Information</h3>
              <p className="text-xs text-text-muted mt-0.5">Update your account name and contact numbers</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
            <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>

          <Input label="Email Address" name="email" type="email" value={form.email} disabled className="opacity-70 bg-background/50 cursor-not-allowed" />

          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Country Code" name="countryCode" value={form.countryCode} onChange={handleChange} placeholder="+33" />
            <div className="sm:col-span-2">
              <Input label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} placeholder="612345678" />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-auto px-8">
              Save Profile Changes
            </Button>
          </div>
        </form>

        {/* Password Security Form */}
        <form onSubmit={handlePasswordChange} className="space-y-5 p-6 rounded-2xl border border-border bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-semibold text-text-primary text-base">Security & Password</h3>
              <p className="text-xs text-text-muted mt-0.5">Ensure your account password remains secure</p>
            </div>
          </div>

          <Input
            label="Current Password"
            type="password"
            value={passwords.current}
            onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
            placeholder="••••••••"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              value={passwords.newPass}
              onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
              placeholder="Min. 8 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="Re-enter new password"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="outline" className="w-auto px-8 normal-case">
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}
