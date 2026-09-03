import { useState, useEffect } from "react";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import { ADMIN_NAV } from "../../config/navigation";
import { fetchAdminDashboard } from "../../api/admin.api";
import useCurrencyStore from "../../store/useCurrencyStore";

export default function AdminDashboard() {
  const { formatPrice } = useCurrencyStore();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAdminDashboard().then((res) => setData(res.data.data));
  }, []);

  const stats = data?.stats;
  const chart = data?.chart || [];
  const maxRevenue = Math.max(...chart.map((c) => c.revenue), 1);

  return (
    <SidebarLayout navItems={ADMIN_NAV} roleLabel="Admin Panel">
      <PageHeader title="Dashboard" subtitle="Platform overview and analytics" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers?.toLocaleString() ?? "—"} />
        <StatCard label="Total Listings" value={stats?.totalListings?.toLocaleString() ?? "—"} />
        <StatCard label="Total Revenue" value={stats ? formatPrice(stats.totalRevenue) : "—"} />
        <StatCard label="Commission Earned" value={stats ? formatPrice(stats.commissionEarned) : "—"} />
        <StatCard label="Pending Approvals" value={stats?.pendingApprovals ?? "—"} />
        <StatCard label="Pending Withdrawals" value={stats?.pendingWithdrawals ?? "—"} />
      </div>

      <div className="p-6 rounded-xl border border-border bg-surface">
        <h2 className="font-semibold text-text-primary mb-6">Revenue & Commission</h2>
        <div className="flex items-end gap-3 h-48">
          {chart.map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col gap-1 items-center justify-end h-36">
                <div
                  className="w-full max-w-[40px] bg-primary-400/60 rounded-t"
                  style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                  title={`Revenue: ${formatPrice(item.revenue)}`}
                />
                <div
                  className="w-full max-w-[40px] bg-text-accent/40 rounded-t"
                  style={{ height: `${(item.commission / maxRevenue) * 100}%` }}
                  title={`Commission: ${formatPrice(item.commission)}`}
                />
              </div>
              <span className="text-xs text-text-muted">{item.month}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-4 text-xs text-text-muted">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-primary-400/60" /> Revenue</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-text-accent/40" /> Commission</span>
        </div>
      </div>
    </SidebarLayout>
  );
}
