import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { BUYER_NAV } from "../../config/navigation";
import useCurrencyStore from "../../store/useCurrencyStore";
import { fetchBuyerDashboard, fetchAcceptedOffers } from "../../api/buyer.api";

export default function BuyerDashboardPage() {
  const { formatPrice } = useCurrencyStore();
  const [data, setData] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchBuyerDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => {});
    fetchAcceptedOffers()
      .then((res) => setPendingCount((res.data.data || []).length))
      .catch(() => {});
  }, []);

  const columns = [
    { key: "vehicleTitle", label: "Vehicle" },
    { key: "amount", label: "Amount", render: (r) => formatPrice(r.amount) },
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <SidebarLayout navItems={BUYER_NAV} roleLabel="Buyer Portal">
      <PageHeader
        title="Dashboard"
        subtitle="Your buying activity overview"
        action={
          <Link
            to="/buyer/purchases"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition"
          >
            🧾 Invoices & Purchases
          </Link>
        }
      />

      {/* Pending payments alert */}
      {pendingCount > 0 && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))",
            border: "1px solid rgba(16,185,129,0.35)",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "22px" }}>🚗</span>
            <div>
              <p style={{ fontWeight: 700, color: "#10b981", margin: 0, fontSize: "14px" }}>
                {pendingCount} offer{pendingCount > 1 ? "s" : ""} accepted — payment pending!
              </p>
              <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
                A seller has accepted your offer. Complete payment to secure your vehicle.
              </p>
            </div>
          </div>
          <Link
            to="/buyer/pending-payments"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "13px",
              whiteSpace: "nowrap",
              boxShadow: "0 3px 12px rgba(16,185,129,0.35)",
            }}
          >
            Pay Now →
          </Link>
        </div>
      )}

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
