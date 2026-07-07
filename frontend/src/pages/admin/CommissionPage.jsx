import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { ADMIN_NAV } from "../../config/navigation";
import { fetchCommission, updateCommission } from "../../api/admin.api";

export default function CommissionPage() {
  const [rate, setRate] = useState(5);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCommission().then((res) => {
      setRate(res.data.data.rate);
      setLastUpdated(res.data.data.lastUpdated);
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    if (rate < 0 || rate > 100) { toast.error("Rate must be 0-100%"); return; }
    setLoading(true);
    try {
      const res = await updateCommission(rate);
      setLastUpdated(res.data.data.lastUpdated);
      toast.success("Commission rate updated!");
    } catch {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarLayout navItems={ADMIN_NAV} roleLabel="Admin Panel">
      <PageHeader title="Commission Settings" subtitle="Set the platform commission rate" />

      <form onSubmit={handleSave} className="max-w-md p-6 rounded-xl border border-border bg-surface space-y-4">
        <div>
          <Input
            label="Commission Rate (%)"
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            min={0}
            max={100}
            step={0.5}
          />
          <p className="text-xs text-text-muted mt-2">
            Applied to every successful sale on the platform.
          </p>
        </div>
        {lastUpdated && (
          <p className="text-xs text-text-muted">Last updated: {lastUpdated}</p>
        )}
        <Button type="submit" loading={loading} className="w-auto px-8">Save Commission Rate</Button>
      </form>
    </SidebarLayout>
  );
}
