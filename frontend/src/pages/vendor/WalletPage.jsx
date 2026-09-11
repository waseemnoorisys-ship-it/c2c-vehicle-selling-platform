import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { VENDOR_NAV } from "../../config/navigation";
import { fetchWallet, requestWithdrawal, fetchBankDetails } from "../../api/vendor.api";
import useCurrencyStore, { formatPrice } from "../../store/useCurrencyStore";

export default function WalletPage() {
  const { getSymbol } = useCurrencyStore();
  const currencySymbol = getSymbol();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [hasBankDetails, setHasBankDetails] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadWalletData = async () => {
    try {
      const res = await fetchWallet();
      setWallet(res.data.data.wallet);
      setTransactions(res.data.data.transactions);
    } catch (err) {
      console.error("Failed to load wallet data:", err);
    }
  };

  useEffect(() => {
    loadWalletData();
    fetchBankDetails()
      .then((res) => {
        const bd = res.data?.data;
        if (!bd || (!bd.iban && !bd.accountName)) {
          setHasBankDetails(false);
        } else {
          setHasBankDetails(true);
        }
      })
      .catch(() => {
        setHasBankDetails(false);
      });
  }, []);

  async function handleWithdraw(e) {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid withdrawal amount");
      return;
    }

    if (wallet && amount > wallet.balance) {
      toast.error(`Requested amount exceeds available balance (${formatPrice(wallet.balance)})`);
      return;
    }

    if (!hasBankDetails) {
      toast.error("Please add bank details before requesting a withdrawal");
      return;
    }

    setLoading(true);
    try {
      const res = await requestWithdrawal(amount);
      toast.success(res.message || "Withdrawal request submitted successfully!");
      setShowWithdraw(false);
      setWithdrawAmount("");
      await loadWalletData();
    } catch (err) {
      console.error("Withdrawal request error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Withdrawal request failed. Please check your bank details and balance."
      );
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: "description", label: "Description" },
    {
      key: "amount",
      label: "Amount",
      render: (r) => (
        <span className={r.amount < 0 ? "text-danger font-medium" : "text-success font-medium"}>
          {r.amount < 0 ? `- ${formatPrice(Math.abs(r.amount))}` : `+ ${formatPrice(Math.abs(r.amount))}`}
        </span>
      ),
    },
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <SidebarLayout navItems={VENDOR_NAV} roleLabel="Seller Portal">
      <PageHeader
        title="Wallet & Transactions"
        subtitle="Manage your earnings and withdrawals"
        action={
          <Button className="w-auto px-6" onClick={() => setShowWithdraw(true)}>
            Request Withdrawal
          </Button>
        }
      />

      {!hasBankDetails && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-amber-200 text-sm">Bank Details Required</h4>
              <p className="text-xs text-amber-300/80">
                You must add your bank account details before submitting withdrawal requests.
              </p>
            </div>
          </div>
          <Link
            to="/vendor/bank"
            className="px-4 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition-colors shrink-0"
          >
            Add Bank Details
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Available Balance" value={wallet ? formatPrice(wallet.balance) : "—"} />
        <StatCard label="Pending" value={wallet ? formatPrice(wallet.pending) : "—"} />
        <StatCard label="Total Earnings" value={wallet ? formatPrice(wallet.totalEarnings) : "—"} />
      </div>

      <h2 className="font-semibold text-text-primary mb-4">Transaction History</h2>
      <DataTable columns={columns} data={transactions} emptyMessage="No transactions yet" />

      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-text-primary mb-4">
              Request Withdrawal
            </h3>

            {!hasBankDetails && (
              <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start justify-between gap-2">
                <span>⚠️ No bank account linked. Please add bank details first.</span>
                <Link
                  to="/vendor/bank"
                  className="font-bold underline hover:text-amber-200 shrink-0"
                >
                  Add Now
                </Link>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <Input
                label={`Amount (${currencySymbol})`}
                type="number"
                step="0.01"
                min="1"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={wallet ? `Max: ${wallet.balance}` : "Enter amount"}
              />

              {wallet && (
                <p className="text-xs text-text-muted">
                  Available for withdrawal:{" "}
                  <span className="font-semibold text-text-primary">
                    {formatPrice(wallet.balance)}
                  </span>
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="normal-case"
                  onClick={() => setShowWithdraw(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading} disabled={!hasBankDetails}>
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
