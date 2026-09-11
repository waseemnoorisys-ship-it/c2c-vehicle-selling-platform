import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import { VENDOR_NAV } from "../../config/navigation";
import { fetchVendorDashboard } from "../../api/vendor.api";
import useCurrencyStore from "../../store/useCurrencyStore";

export default function VendorDashboard() {
  const { formatPrice } = useCurrencyStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchVendorDashboard().then((res) => setData(res.data.data));
  }, []);

  const columns = [
    { key: "vehicleTitle", label: "Vehicle" },
    { key: "buyerName", label: "Buyer" },
    { key: "amount", label: "Offer", render: (r) => formatPrice(r.amount) },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <SidebarLayout navItems={VENDOR_NAV} roleLabel="Seller Portal">
      <PageHeader
        title="Dashboard"
        subtitle="Your selling activity overview"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="w-auto px-4 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              onClick={() => navigate("/vendor/sales")}
            >
              🧾 Sales & Invoices
            </Button>
            <Button className="w-auto px-6 text-xs" onClick={() => navigate("/vendor/listings/new")}>
              + Add Vehicle
            </Button>
          </div>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Active Listings" value={data?.activeListings ?? "—"} />
        <StatCard label="Pending Offers" value={data?.pendingOffers ?? "—"} />
        <StatCard label="Total Earnings" value={data ? formatPrice(data.totalEarnings) : "—"} />
      </div>

      <h2 className="font-semibold text-text-primary mb-4">Recent Offers</h2>
      <DataTable columns={columns} data={data?.recentOffers} emptyMessage="No offers yet" />
    </SidebarLayout>
  );
}
