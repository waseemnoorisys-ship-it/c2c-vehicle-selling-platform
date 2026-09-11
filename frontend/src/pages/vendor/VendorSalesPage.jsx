import { useState, useEffect } from "react";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Button from "../../components/common/Button";
import InvoiceModal from "../../components/common/InvoiceModal";
import { VENDOR_NAV } from "../../config/navigation";
import { fetchVendorSales } from "../../api/vendor.api";
import useCurrencyStore from "../../store/useCurrencyStore";
import useAuthStore from "../../store/useAuthStore";

export default function VendorSalesPage() {
  const { formatPrice } = useCurrencyStore();
  const { user } = useAuthStore();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchVendorSales()
      .then((res) => setSales(res.data.data))
      .catch(() => setSales([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPdf = (sale) => {
    const rawTitle = sale.vehicleTitle || "Vehicle_Sale";
    const cleanTitle = rawTitle.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_");
    const fileName = `Invoice_${cleanTitle}_${sale.invoiceId || "C2C"}.pdf`;

    const txId = sale.transactionId || sale.id;
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
          setSelectedInvoice(sale);
        });
    } else {
      setSelectedInvoice(sale);
    }
  };

  const columns = [
    { key: "invoiceId", label: "Invoice No.", render: (r) => <span className="font-mono text-xs font-bold text-emerald-400">{r.invoiceId}</span> },
    { key: "vehicleTitle", label: "Vehicle", render: (r) => <span className="font-semibold text-text-primary">{r.vehicleTitle}</span> },
    { key: "buyerName", label: "Buyer" },
    { key: "amount", label: "Amount", render: (r) => formatPrice(r.amount) },
    { key: "date", label: "Date" },
    { key: "status", label: "Payment Status", render: (r) => <StatusBadge status="paid" /> },
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
    <SidebarLayout navItems={VENDOR_NAV} roleLabel="Seller Portal">
      <PageHeader
        title="Invoices & Sales History"
        subtitle="View, track, and download official invoices for all completed vehicle sales"
      />

      {loading ? (
        <div className="p-8 text-center text-text-muted">Loading invoice history...</div>
      ) : (
        <DataTable
          columns={columns}
          data={sales}
          emptyMessage="No completed sales or invoices found yet."
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
