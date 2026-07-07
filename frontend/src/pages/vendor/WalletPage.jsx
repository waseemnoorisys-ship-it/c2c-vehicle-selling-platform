import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { VENDOR_NAV } from "../../config/navigation";
import { fetchWallet, requestWithdrawal } from "../../api/vendor.api";
import { formatPrice } from "../../components/vehicles/BrowseVehicleCard";

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWallet().then((res) => {
      setWallet(res.data.data.wallet);
      setTransactions(res.data.data.transactions);
    });
  }, []);

  async function handleWithdraw(e) {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    setLoading(true);
    try {
      await requestWithdrawal(amount);
      toast.success("Withdrawal request submitted!");
      setShowWithdraw(false);
      setWithdrawAmount("");
    } catch {
      toast.error("Withdrawal failed");
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount", render: (r) => (
      <span className={r.amount < 0 ? "text-danger" : "text-success"}>{formatPrice(Math.abs(r.amount))}</span>
    )},
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <SidebarLayout navItems={VENDOR_NAV} roleLabel="Seller Portal">
      <PageHeader
        title="Wallet & Transactions"
        subtitle="Manage your earnings and withdrawals"
        action={
          <Button className="w-auto px-6" onClick={() => setShowWithdraw(true)}>Request Withdrawal</Button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Available Balance" value={wallet ? formatPrice(wallet.balance) : "—"} />
        <StatCard label="Pending" value={wallet ? formatPrice(wallet.pending) : "—"} />
        <StatCard label="Total Earnings" value={wallet ? formatPrice(wallet.totalEarnings) : "—"} />
      </div>

      <h2 className="font-semibold text-text-primary mb-4">Transaction History</h2>
      <DataTable columns={columns} data={transactions} emptyMessage="No transactions yet" />

      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
            <h3 className="font-display text-xl font-bold text-text-primary mb-4">Request Withdrawal</h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <Input label="Amount (€)" type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Max available balance" />
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="normal-case" onClick={() => setShowWithdraw(false)}>Cancel</Button>
                <Button type="submit" loading={loading}>Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
