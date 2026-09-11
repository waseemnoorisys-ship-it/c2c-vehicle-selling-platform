import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { VENDOR_NAV } from "../../config/navigation";
import { fetchBankDetails, updateBankDetails } from "../../api/vendor.api";

export default function BankDetailsPage() {
  const [form, setForm] = useState({
    accountName: "", bankName: "", iban: "", swift: "", country: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBankDetails().then((res) => setForm(res.data.data));
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateBankDetails(form);
      toast.success("Bank details saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save bank details");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarLayout navItems={VENDOR_NAV} roleLabel="Seller Portal">
      <PageHeader title="Bank Details" subtitle="Banking information for payouts" />

      <form onSubmit={handleSave} className="max-w-xl space-y-4 p-6 rounded-xl border border-border bg-surface">
        <Input label="Account Holder Name" name="accountName" value={form.accountName} onChange={handleChange} />
        <Input label="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} />
        <Input label="IBAN" name="iban" value={form.iban} onChange={handleChange} placeholder="FR76 3000 4000 0500 0000 1234 567" />
        <Input label="SWIFT / BIC" name="swift" value={form.swift} onChange={handleChange} placeholder="BNPAFRPP" />
        <Input label="Country" name="country" value={form.country} onChange={handleChange} />
        <Button type="submit" loading={loading} className="w-auto px-8">Save Bank Details</Button>
      </form>
    </SidebarLayout>
  );
}
