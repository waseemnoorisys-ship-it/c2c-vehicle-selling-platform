import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { BUYER_NAV } from "../../config/navigation";
import useCurrencyStore from "../../store/useCurrencyStore";

export default function BuyerOffersPage() {
  const { formatPrice } = useCurrencyStore();
  const [offers, setOffers] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchBuyerOffers().then((res) => setOffers(res.data.data));
    fetchBuyerPayments().then((res) => setPayments(res.data.data));
  }, []);

  const offerColumns = [
    {
      key: "vehicleTitle", label: "Vehicle", render: (r) => (
        <Link to={`/vehicles/${r.vehicleId}`} className="text-text-accent hover:underline">{r.vehicleTitle}</Link>
      )
    },
    { key: "amount", label: "Offer", render: (r) => formatPrice(r.amount) },
    { key: "createdAt", label: "Date" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
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
