import { useState, useEffect } from "react";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { BUYER_NAV } from "../../config/navigation";
import useCurrencyStore from "../../store/useCurrencyStore";

export default function BuyerDashboardPage() {
  const { formatPrice } = useCurrencyStore();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchBuyerDashboard().then((res) => setData(res.data.data));
  }, []);

  const columns = [
    { key: "vehicleTitle", label: "Vehicle" },
    { key: "amount", label: "Amount", render: (r) => formatPrice(r.amount) },
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <SidebarLayout navItems={BUYER_NAV} roleLabel="Buyer Portal">
      <PageHeader title="Dashboard" subtitle="Your buying activity overview" />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Purchases" value={data?.totalPurchases ?? "—"} />
        <StatCard label="Total Spent" value={data ? formatPrice(data.totalSpent) : "—"} />
        <StatCard label="Active Offers" value={data?.activeOffers ?? "—"} />
      </div>

      <h2 className="font-semibold text-text-primary mb-4">Recent Purchases</h2>
      <DataTable columns={columns} data={data?.recentPurchases} emptyMessage="No purchases yet" />
    </SidebarLayout>
  );
}
