import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import { ADMIN_NAV } from "../../config/navigation";
import { fetchWithdrawals, processWithdrawal } from "../../api/admin.api";
import { formatPrice } from "../../components/vehicles/BrowseVehicleCard";

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    fetchWithdrawals().then((res) => setWithdrawals(res.data.data));
  }, []);

  async function handleProcess(id, action) {
    await processWithdrawal(id, action);
    setWithdrawals((prev) =>
      prev.map((w) => w.id === id ? { ...w, status: action } : w)
    );
    toast.success(`Withdrawal ${action}`);
  }

  const columns = [
    { key: "seller", label: "Seller" },
    { key: "amount", label: "Amount", render: (r) => formatPrice(r.amount) },
    { key: "bank", label: "Bank" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) =>
        r.status === "pending" ? (
          <div className="flex gap-2">
            <Button variant="ghost" className="w-auto py-1 px-2 text-xs normal-case text-success" onClick={() => handleProcess(r.id, "completed")}>Approve</Button>
            <Button variant="ghost" className="w-auto py-1 px-2 text-xs normal-case text-danger" onClick={() => handleProcess(r.id, "rejected")}>Reject</Button>
          </div>
        ) : (
          <span className="text-text-muted text-xs">—</span>
        ),
    },
  ];

  return (
    <SidebarLayout navItems={ADMIN_NAV} roleLabel="Admin Panel">
      <PageHeader title="Withdrawals" subtitle="Process seller payout requests" />
      <DataTable columns={columns} data={withdrawals} />
    </SidebarLayout>
  );
}
