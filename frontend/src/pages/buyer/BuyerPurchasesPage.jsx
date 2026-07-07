import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import { BUYER_NAV } from "../../config/navigation";
import { fetchBuyerPurchases } from "../../api/buyer.api";
import { formatPrice } from "../../components/vehicles/BrowseVehicleCard";

export default function BuyerPurchasesPage() {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    fetchBuyerPurchases().then((res) => setPurchases(res.data.data));
  }, []);

  const columns = [
    { key: "vehicleTitle", label: "Vehicle" },
    { key: "amount", label: "Amount", render: (r) => formatPrice(r.amount) },
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "invoiceId", label: "Invoice" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <Button
          variant="ghost"
          className="w-auto py-1 px-3 text-xs normal-case"
          onClick={() => toast.success(`Invoice ${r.invoiceId} downloaded (mock)`)}
        >
          View Invoice
        </Button>
      ),
    },
  ];

  return (
    <SidebarLayout navItems={BUYER_NAV} roleLabel="Buyer Portal">
      <PageHeader title="Purchase History" subtitle="All your completed and pending purchases" />
      <DataTable columns={columns} data={purchases} emptyMessage="No purchases yet" />
    </SidebarLayout>
  );
}
