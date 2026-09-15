import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { BUYER_NAV } from "../../config/navigation";
import useCurrencyStore from "../../store/useCurrencyStore";
import { fetchBuyerOffers, fetchBuyerPayments } from "../../api/buyer.api";
import { cancelOffer } from "../../api/vehicles.api";


export default function BuyerOffersPage() {
  const { formatPrice } = useCurrencyStore();
  const [offers, setOffers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [cancelingId, setCancelingId] = useState(null);

  const loadData = () => {
    fetchBuyerOffers().then((res) => setOffers(res.data.data));
    fetchBuyerPayments().then((res) => setPayments(res.data.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  async function handleCancel(offerId) {
    setCancelingId(offerId);
    try {
      await cancelOffer(offerId);
      toast.success("Offer canceled successfully.");
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel offer");
    } finally {
      setCancelingId(null);
    }
  }

  const offerColumns = [
    {
      key: "vehicleTitle", label: "Vehicle", render: (r) => (
        <Link to={`/vehicles/${r.vehicleId}`} className="text-text-accent hover:underline">{r.vehicleTitle}</Link>
      )
    },
    { key: "amount", label: "Offer", render: (r) => formatPrice(r.amount) },
    { key: "createdAt", label: "Date" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/chat?listingId=${r.vehicleId}`}
            className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold text-text-accent hover:bg-surface-hover transition-colors inline-flex items-center gap-1"
          >
            💬 Chat
          </Link>
          {(r.status === "pending" || r.status === "accepted") && (
            <button
              type="button"
              disabled={cancelingId === r.id}
              onClick={() => handleCancel(r.id)}
              className="px-2.5 py-1 rounded-lg border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
            >
              {cancelingId === r.id ? "Canceling..." : "✕ Cancel"}
            </button>
          )}
        </div>
      ),
    },
  ];

  const paymentColumns = [
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount", render: (r) => formatPrice(r.amount) },
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "method", label: "Method" },
  ];

  return (
    <SidebarLayout navItems={BUYER_NAV} roleLabel="Buyer Portal">
      <PageHeader title="Offers & Payments" subtitle="Track your offers and payment history" />

      <h2 className="font-semibold text-text-primary mb-4">My Offers</h2>
      <DataTable columns={offerColumns} data={offers} emptyMessage="No offers yet" />

      <h2 className="font-semibold text-text-primary mb-4 mt-8">Payment History</h2>
      <DataTable columns={paymentColumns} data={payments} emptyMessage="No payments yet" />
    </SidebarLayout>
  );
}
