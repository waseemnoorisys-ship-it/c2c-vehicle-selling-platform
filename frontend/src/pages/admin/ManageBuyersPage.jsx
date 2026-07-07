import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import { ADMIN_NAV } from "../../config/navigation";
import { fetchBuyers, updateUserStatus } from "../../api/admin.api";

export default function ManageBuyersPage() {
  const [buyers, setBuyers] = useState([]);

  useEffect(() => {
    fetchBuyers().then((res) => setBuyers(res.data.data));
  }, []);

  async function toggleStatus(user) {
    const newStatus = user.status === "active" ? "inactive" : "active";
    await updateUserStatus(user.id, "buyer", newStatus);
    setBuyers((prev) => prev.map((b) => b.id === user.id ? { ...b, status: newStatus } : b));
    toast.success(`Buyer ${newStatus === "active" ? "activated" : "deactivated"}`);
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "purchases", label: "Purchases" },
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
      <PageHeader title="Manage Buyers" subtitle="View and manage buyer accounts" />
      <DataTable columns={columns} data={buyers} />
    </SidebarLayout>
  );
}
