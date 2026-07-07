import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import { ADMIN_NAV } from "../../config/navigation";
import { fetchAdminListings, approveListing } from "../../api/admin.api";
import { formatPrice } from "../../components/vehicles/BrowseVehicleCard";

export default function AdminListingsPage() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    fetchAdminListings().then((res) => setListings(res.data.data));
  }, []);

  async function handleApproval(id, action) {
    await approveListing(id, action);
    setListings((prev) =>
      prev.map((l) => l.id === id ? { ...l, approvalStatus: action, status: action === "approved" ? "active" : "rejected" } : l)
    );
    toast.success(`Listing ${action}`);
  }

  const columns = [
    { key: "title", label: "Vehicle" },
    { key: "sellerName", label: "Seller" },
    { key: "price", label: "Price", render: (r) => formatPrice(r.price) },
    { key: "submittedAt", label: "Submitted" },
    { key: "approvalStatus", label: "Status", render: (r) => <StatusBadge status={r.approvalStatus} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) =>
        r.approvalStatus === "pending" ? (
          <div className="flex gap-2">
            <Button variant="ghost" className="w-auto py-1 px-2 text-xs normal-case text-success" onClick={() => handleApproval(r.id, "approved")}>Approve</Button>
            <Button variant="ghost" className="w-auto py-1 px-2 text-xs normal-case text-danger" onClick={() => handleApproval(r.id, "rejected")}>Reject</Button>
          </div>
        ) : (
          <span className="text-text-muted text-xs">—</span>
        ),
    },
  ];

  return (
    <SidebarLayout navItems={ADMIN_NAV} roleLabel="Admin Panel">
      <PageHeader title="Vehicle Listings" subtitle="Approve or reject pending listings" />
      <DataTable columns={columns} data={listings} />
    </SidebarLayout>
  );
}
