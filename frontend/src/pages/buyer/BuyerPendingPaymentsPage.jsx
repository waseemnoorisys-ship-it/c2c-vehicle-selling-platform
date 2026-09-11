import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import { BUYER_NAV } from "../../config/navigation";
import { fetchAcceptedOffers } from "../../api/buyer.api";
import { createPaymentIntent } from "../../api/vehicles.api";
import { formatPrice } from "../../store/useCurrencyStore";


function PaymentCard({ offer, onPayNow, paying }) {
  // After mapping: offer.amount is already in euros (from mapOfferToBuyerRow)
  // offer.vehicleTitle = mapped title
  // offer.vehicleId = listing _id
  // offer._id = offer mongo id (for payment)
  const vehicleTitle = offer.vehicleTitle || "Vehicle";
  const vehicleId = offer.vehicleId || offer.listingId?._id || offer.listingId;
  const offerId = offer._id;         // raw mongo _id for createPaymentIntent
  const amountEuros = offer.amount;  // already converted by mapOfferToBuyerRow

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        border: "1px solid rgba(16, 185, 129, 0.3)",
        borderRadius: "16px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Green accepted badge */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "#fff",
          fontSize: "11px",
          fontWeight: 700,
          padding: "4px 12px",
          borderRadius: "999px",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        ✓ Offer Accepted
      </div>

      {/* Glow accent */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          left: "-40px",
          width: "120px",
          height: "120px",
          background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Vehicle info */}
        <div>
          <p style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            Vehicle
          </p>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            {vehicleId ? (
              <Link
                to={`/vehicles/${vehicleId}`}
                style={{ color: "#38bdf8", textDecoration: "none" }}
              >
                {vehicleTitle}
              </Link>
            ) : (
              vehicleTitle
            )}
          </h3>
        </div>

        {/* Price + Offer date */}
        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>Your Accepted Offer</p>
            <p style={{ fontSize: "26px", fontWeight: 800, color: "#10b981", margin: 0 }}>
              {formatPrice(amountEuros)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>Offer ID</p>
            <p style={{ fontSize: "12px", fontFamily: "monospace", color: "#94a3b8", margin: 0 }}>
              #{String(offer.id || offer._id).slice(-8).toUpperCase()}
            </p>
          </div>
          {offer.createdAt && (
            <div>
              <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>Date</p>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>{offer.createdAt}</p>
            </div>
          )}
        </div>

        {/* Info notice */}
        <div
          style={{
            background: "rgba(251, 191, 36, 0.08)",
            border: "1px solid rgba(251, 191, 36, 0.2)",
            borderRadius: "8px",
            padding: "10px 14px",
            display: "flex",
            gap: "8px",
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "14px", flexShrink: 0 }}>⏳</span>
          <p style={{ fontSize: "12px", color: "#fbbf24", margin: 0, lineHeight: 1.5 }}>
            The seller has accepted your offer. Complete payment to secure this vehicle before it becomes
            available to other buyers.
          </p>
        </div>

        {/* Pay Now button */}
        <button
          type="button"
          disabled={paying}
          onClick={() => onPayNow(offerId)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            background: paying
              ? "#374151"
              : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            border: "none",
            cursor: paying ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: paying ? "none" : "0 4px 20px rgba(16, 185, 129, 0.4)",
            transition: "all 0.2s",
          }}
        >
          {paying ? (
            <>
              <svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" style={{ opacity: 0.75 }} />
              </svg>
              Redirecting to Payment...
            </>
          ) : (
            <>
              <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pay Now — {formatPrice(amountEuros)}
            </>
          )}
        </button>

        <p style={{ fontSize: "11px", color: "#475569", textAlign: "center", margin: 0 }}>
          🔒 Secure payment via Stripe · Funds held in escrow until delivery
        </p>
      </div>
    </div>
  );
}

export default function BuyerPendingPaymentsPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    fetchAcceptedOffers()
      .then((res) => setOffers(res.data.data || []))
      .catch(() => toast.error("Failed to load pending payments"))
      .finally(() => setLoading(false));
  }, []);

  async function handlePayNow(offerId) {
    setPayingId(offerId);
    try {
      const result = await createPaymentIntent(offerId);
      const checkoutUrl =
        result?.data?.checkoutUrl ||
        result?.data?.url ||
        result?.data?.sessionUrl;
      if (!checkoutUrl) {
        toast.error("Could not get payment link. Please try again.");
        return;
      }
      window.location.href = checkoutUrl;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to start payment";
      toast.error(msg);
    } finally {
      setPayingId(null);
    }
  }

  return (
    <SidebarLayout navItems={BUYER_NAV} roleLabel="Buyer Portal">
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <PageHeader
        title="Pending Payments"
        subtitle="Accepted offers waiting for your payment — secure your vehicle before it's gone"
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
          Loading your accepted offers...
        </div>
      ) : offers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            borderRadius: "16px",
            border: "1px dashed #1e293b",
            color: "#475569",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛒</div>
          <h3 style={{ color: "#94a3b8", fontWeight: 600, marginBottom: "8px" }}>No pending payments</h3>
          <p style={{ fontSize: "14px", marginBottom: "24px" }}>
            When a seller accepts your offer, it will appear here so you can complete payment.
          </p>
          <Link
            to="/browse"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Browse Vehicles
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Summary banner */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "24px" }}>🚗</span>
            <div>
              <p style={{ fontWeight: 700, color: "#10b981", margin: 0, fontSize: "15px" }}>
                {offers.length} vehicle{offers.length > 1 ? "s" : ""} ready for payment
              </p>
              <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
                Click "Pay Now" on any card below to complete your purchase securely via Stripe
              </p>
            </div>
          </div>

          {/* Cards */}
          {offers.map((offer) => (
            <PaymentCard
              key={offer._id}
              offer={offer}
              paying={payingId === offer._id}
              onPayNow={handlePayNow}
            />
          ))}
        </div>
      )}
    </SidebarLayout>
  );
}
