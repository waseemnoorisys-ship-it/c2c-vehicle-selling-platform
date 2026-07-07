import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import { ADMIN_NAV } from "../../config/navigation";
import { fetchSellers, updateUserStatus } from "../../api/admin.api";

export default function ManageSellersPage() {
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    fetchSellers().then((res) => setSellers(res.data.data));
  }, []);

  async function toggleStatus(user) {
    const newStatus = user.status === "active" ? "inactive" : "active";
    await updateUserStatus(user.id, "seller", newStatus);
    setSellers((prev) => prev.map((s) => s.id === user.id ? { ...s, status: newStatus } : s));
    toast.success(`Seller ${newStatus === "active" ? "activated" : "deactivated"}`);
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "listings", label: "Listings" },
    { key: "sales", label: "Sales" },
    { key: "joined", label: "Joined" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <Button variant="ghost" className="w-auto py-1 px-2 text-xs normal-case" onClick={() => toggleStatus(r)}>
          {r.status === "active" ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <SidebarLayout navItems={ADMIN_NAV} roleLabel="Admin Panel">
      <PageHeader title="Manage Sellers" subtitle="View and manage seller accounts" />
      <DataTable columns={columns} data={sellers} />
    </SidebarLayout>
  );
}
