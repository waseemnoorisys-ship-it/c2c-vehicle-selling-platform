import { useState, useEffect } from "react";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import InvoiceModal from "../../components/common/InvoiceModal";
import { BUYER_NAV } from "../../config/navigation";
import useCurrencyStore from "../../store/useCurrencyStore";
import { fetchBuyerPurchases } from "../../api/buyer.api";

export default function BuyerPurchasesPage() {
  const { formatPrice } = useCurrencyStore();
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuyerPurchases()
      .then((res) => setPurchases(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "vehicleTitle",
      label: "Vehicle",
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.vehicleImage ? (
            <img
              src={r.vehicleImage}
              alt={r.vehicleTitle}
              className="w-10 h-10 rounded-lg object-cover border border-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-surface-hover border border-border flex items-center justify-center text-text-muted text-xs">
              🚗
            </div>
          )}
          <div>
            <span className="font-semibold text-text-primary block">{r.vehicleTitle}</span>
            <span className="text-[11px] text-text-muted">Ref: #{r.id?.slice(-6).toUpperCase()}</span>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (r) => <span className="font-bold text-text-primary">{formatPrice(r.amount)}</span>,
    },
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "invoiceId",
      label: "Invoice",
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
          {r.invoiceId}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <Button
          variant="outline"
          className="w-auto py-1 px-3 text-xs normal-case flex items-center gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all"
          onClick={() => setSelectedPurchase(r)}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          View Invoice
        </Button>
      ),
    },
  ];

  return (
    <SidebarLayout navItems={BUYER_NAV} roleLabel="Buyer Portal">
      <PageHeader
        title="Purchase History"
        subtitle="All your completed purchases, invoices and escrow transaction receipts"
      />

      <DataTable
        columns={columns}
        data={purchases}
        emptyMessage={loading ? "Loading purchases..." : "No purchases found"}
      />

      {/* Real Car Platform Invoice Modal */}
      {selectedPurchase && (
        <InvoiceModal
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}
    </SidebarLayout>
  );
}
