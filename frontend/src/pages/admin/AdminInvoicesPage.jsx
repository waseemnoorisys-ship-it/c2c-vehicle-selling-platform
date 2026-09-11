import { useState, useEffect } from "react";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import InvoiceModal from "../../components/common/InvoiceModal";
import { ADMIN_NAV } from "../../config/navigation";
import { fetchAdminTransactions } from "../../api/admin.api";
import useCurrencyStore from "../../store/useCurrencyStore";
import useAuthStore from "../../store/useAuthStore";

export default function AdminInvoicesPage() {
  const { formatPrice } = useCurrencyStore();
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchAdminTransactions()
      .then((res) => setInvoices(res.data.data))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPdf = (invoice) => {
    const rawTitle = invoice.vehicleTitle || "Vehicle_Transaction";
    const cleanTitle = rawTitle.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_");
    const fileName = `Invoice_${cleanTitle}_${invoice.invoiceId || "C2C"}.pdf`;

    const txId = invoice.transactionId || invoice.id;
    if (txId) {
      const token = useAuthStore.getState().accessToken;
      fetch(`/api/v1/wallet/invoices/download/${txId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => {
          if (!res.ok) throw new Error("Download failed");
          return res.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        })
        .catch(() => {
          setSelectedInvoice(invoice);
        });
    } else {
      setSelectedInvoice(invoice);
    }
  };

  const columns = [
    { key: "invoiceId", label: "Invoice No.", render: (r) => <span className="font-mono text-xs font-bold text-emerald-400">{r.invoiceId}</span> },
    { key: "vehicleTitle", label: "Vehicle", render: (r) => <span className="font-semibold text-text-primary">{r.vehicleTitle}</span> },
    { key: "buyerName", label: "Buyer", render: (r) => <span>{r.buyerName} ({r.buyerEmail})</span> },
    { key: "sellerName", label: "Vendor", render: (r) => <span>{r.sellerName}</span> },
    { key: "amount", label: "Price", render: (r) => formatPrice(r.amount) },
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status || "escrowed"} /> },
    {
      key: "actions",
      label: "Invoice Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="w-auto py-1 px-2.5 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            onClick={() => setSelectedInvoice(r)}
          >
            👁️ View
          </Button>
          <Button
            variant="primary"
            className="w-auto py-1 px-2.5 text-xs bg-emerald-500 text-white"
            onClick={() => handleDownloadPdf(r)}
          >
            📥 Download
          </Button>
        </div>
      ),
    },
  ];

  return (
    <SidebarLayout navItems={ADMIN_NAV} roleLabel="Super Admin Portal">
      <PageHeader
        title="Transactions & Invoices"
        subtitle="Full audit registry and invoice management across all platform transactions"
      />

      {loading ? (
        <div className="p-8 text-center text-text-muted">Loading transactions & invoices...</div>
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          emptyMessage="No transaction invoices generated yet."
        />
      )}

      {selectedInvoice && (
        <InvoiceModal
          purchase={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </SidebarLayout>
  );
}
