import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import { VENDOR_NAV } from "../../config/navigation";
import { fetchVendorOffers, respondToOffer } from "../../api/vendor.api";
import { formatPrice } from "../../components/vehicles/BrowseVehicleCard";

export default function VendorOffersPage() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetchVendorOffers().then((res) => setOffers(res.data.data));
  }, []);

  async function handleRespond(offerId, action) {
    await respondToOffer(offerId, action);
    setOffers((prev) =>
      prev.map((o) => o.id === offerId ? { ...o, status: action === "accept" ? "accepted" : "rejected" } : o)
    );
    toast.success(`Offer ${action === "accept" ? "accepted" : "rejected"}`);
  }

  const columns = [
    { key: "vehicleTitle", label: "Vehicle" },
    { key: "buyerName", label: "Buyer" },
    { key: "amount", label: "Offer", render: (r) => formatPrice(r.amount) },
    { key: "createdAt", label: "Date" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) =>
        r.status === "pending" ? (
          <div className="flex gap-2">
            <Button variant="ghost" className="w-auto py-1 px-2 text-xs normal-case text-success" onClick={() => handleRespond(r.id, "accept")}>Accept</Button>
            <Button variant="ghost" className="w-auto py-1 px-2 text-xs normal-case text-danger" onClick={() => handleRespond(r.id, "reject")}>Reject</Button>
          </div>
        ) : (
          <span className="text-text-muted text-xs">—</span>
        ),
    },
  ];

  return (
    <SidebarLayout navItems={VENDOR_NAV} roleLabel="Seller Portal">
      <PageHeader title="Offers Management" subtitle="Review and respond to buyer offers" />
      <DataTable columns={columns} data={offers} emptyMessage="No offers received" />
    </SidebarLayout>
  );
}
