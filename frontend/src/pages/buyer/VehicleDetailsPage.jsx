import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import LandingHeader from "../../components/landing/LandingHeader";
import LandingFooter from "../../components/landing/LandingFooter";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import StatusBadge from "../../components/dashboard/StatusBadge";
import useCurrencyStore, { formatPrice } from "../../store/useCurrencyStore";
import {
  fetchVehicleById,
  createOffer,
  fetchAcceptedOfferForListing,
  createPaymentIntent,
} from "../../api/vehicles.api";
import { getVehiclePlaceholderUrl } from "../../utils/vehicleImage.utils";
import ListingLocationMap from "../../components/vehicles/ListingLocationMap";
import VehicleImage from "../../components/vehicles/VehicleImage";
import useAuthStore from "../../store/useAuthStore";

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();
  const { getSymbol } = useCurrencyStore();
  const currencySymbol = getSymbol();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Checkout / Buy Now state
  const [acceptedOffer, setAcceptedOffer] = useState(null);
  const [checkingOffer, setCheckingOffer] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchVehicleById(id)
      .then((res) => setVehicle(res.data.data))
      .catch(() => toast.error("Vehicle not found"))
      .finally(() => setLoading(false));
  }, [id]);

  // When authenticated, check if buyer has an accepted offer on this vehicle
  useEffect(() => {
    if (!accessToken || !id) return;
    setCheckingOffer(true);
    fetchAcceptedOfferForListing(id)
      .then((offer) => setAcceptedOffer(offer || null))
      .catch(() => setAcceptedOffer(null))
      .finally(() => setCheckingOffer(false));
  }, [id, accessToken]);

  async function handleMakeOffer(e) {
    e.preventDefault();
    if (!accessToken) { navigate("/login"); return; }
    if (!offerAmount || Number(offerAmount) <= 0) { toast.error("Enter a valid offer amount"); return; }
    setSubmitting(true);
    try {
      await createOffer(id, Number(offerAmount), offerMessage);
      toast.success("Offer submitted successfully!");
      setShowOfferModal(false);
      navigate("/buyer/offers");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit offer");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBuyNow() {
    if (!accessToken) { navigate("/login"); return; }
    if (!acceptedOffer) {
      // No accepted offer — guide buyer to make one first
      toast("You need an accepted offer to pay. Make an offer first!", { icon: "💡" });
      setShowOfferModal(true);
      return;
    }
    setPaymentLoading(true);
    try {
      const result = await createPaymentIntent(acceptedOffer._id);
      const checkoutUrl = result?.data?.checkoutUrl || result?.data?.url || result?.data?.sessionUrl;
      if (!checkoutUrl) {
        toast.error("Could not get payment link. Please try again.");
        return;
      }
      // Open Stripe checkout in same tab
      window.location.href = checkoutUrl;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to initiate payment";
      toast.error(msg);
    } finally {
      setPaymentLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-text-muted">
        Loading...
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-text-muted">Vehicle not found</p>
        <Link to="/browse" className="text-text-accent hover:underline">← Back to Browse</Link>
      </div>
    );
  }

  const gallery = vehicle.images?.length ? vehicle.images : [];
  const hasGallery = gallery.length > 0;

  // Determine button label & style for buy
  const isBuyerRole = !user || user.role === "buyer";
  const isOwnListing = user && vehicle.vendorId && user._id === vehicle.vendorId;

  const pageContent = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/browse" className="text-sm text-text-muted hover:text-text-accent mb-6 inline-block">
        ← Back to Browse
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="relative h-72 lg:h-96 bg-gradient-to-br from-background-secondary to-surface-elevated overflow-hidden">
            {hasGallery ? (
              <img
                src={gallery[activeImage]}
                alt={vehicle.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getVehiclePlaceholderUrl(vehicle);
                }}
              />
            ) : (
              <VehicleImage
                vehicle={vehicle}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto border-t border-border">
              {gallery.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    activeImage === index ? "border-primary-400" : "border-border"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">{vehicle.title}</h1>
              <p className="text-text-muted text-sm mt-1">{vehicle.location}</p>
            </div>
            {vehicle.verified && <StatusBadge status="approved" />}
          </div>

          <p className="font-display text-3xl font-bold text-text-accent mt-4">{formatPrice(vehicle.price)}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Mileage", value: `${vehicle.mileage?.toLocaleString()} km` },
              { label: "Fuel", value: vehicle.fuel },
              { label: "Transmission", value: vehicle.transmission },
              { label: "Year", value: vehicle.year },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-lg border border-border bg-surface text-center">
                <p className="text-xs text-text-muted">{s.label}</p>
                <p className="text-sm font-semibold text-text-primary mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            {/* Buy Now / Checkout Button — only show for buyers, not own listing */}
            {!isOwnListing && isBuyerRole && (
              <div className="relative">
                <button
                  id="buy-now-btn"
                  type="button"
                  disabled={paymentLoading || checkingOffer}
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: acceptedOffer
                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "#fff",
                    boxShadow: acceptedOffer
                      ? "0 4px 20px rgba(16, 185, 129, 0.4)"
                      : "0 4px 20px rgba(245, 158, 11, 0.4)",
                  }}
                >
                  {paymentLoading || checkingOffer ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {checkingOffer ? "Checking offers..." : "Redirecting to payment..."}
                    </span>
                  ) : acceptedOffer ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Buy Now — Pay {formatPrice(vehicle.price)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Quick Buy (Make Offer First)
                    </span>
                  )}
                </button>
                {/* Accepted offer badge */}
                {acceptedOffer && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Offer accepted — ready to pay securely via Stripe
                  </div>
                )}
                {!acceptedOffer && !checkingOffer && accessToken && (
                  <p className="mt-2 text-xs text-text-muted">
                    💡 Your offer must be accepted by the seller before you can pay
                  </p>
                )}
              </div>
            )}

            {/* Make Offer + Contact Seller */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!isOwnListing && (
                <Button className="sm:w-auto flex-1" onClick={() => {
                  if (!accessToken) { navigate("/login"); return; }
                  setShowOfferModal(true);
                }}>
                  Make An Offer
                </Button>
              )}
              <Button
                variant="outline"
                className="sm:w-auto flex-1 normal-case flex items-center justify-center gap-2"
                onClick={() => {
                  if (!accessToken) {
                    navigate("/login");
                    return;
                  }
                  navigate(`/chat?listingId=${id}`);
                }}
              >
                <span>💬</span> Chat with Seller
              </Button>
            </div>
          </div>

          {/* Seller Info Box */}
          <div className="mt-6 p-4 rounded-xl border border-border bg-surface flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Seller</p>
              <p className="font-semibold text-text-primary">
                {vehicle.sellerName || "Verified Seller"}
              </p>
            </div>
            {!isOwnListing && (
              <Button
                variant="outline"
                className="py-1.5 px-3 text-xs normal-case"
                onClick={() => {
                  if (!accessToken) { navigate("/login"); return; }
                  navigate(`/chat?listingId=${id}`);
                }}
              >
                💬 Chat Seller
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-surface">
          <h2 className="font-semibold text-text-primary mb-3">Description</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{vehicle.description}</p>

          <h2 className="font-semibold text-text-primary mt-6 mb-3">Specifications</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(vehicle.specs || {}).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm py-2 border-b border-border">
                <span className="text-text-muted capitalize">{key}</span>
                <span className="text-text-primary font-medium">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-surface h-fit">
          <h2 className="font-semibold text-text-primary mb-3">Location</h2>
          <ListingLocationMap
            locationText={vehicle.locationText || vehicle.location}
            latitude={vehicle.latitude}
            longitude={vehicle.longitude}
            className="h-52"
          />
        </div>
      </div>

      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
            <h3 className="font-display text-xl font-bold text-text-primary mb-4">Make An Offer</h3>
            <form onSubmit={handleMakeOffer} className="space-y-4">
              <Input
                label={`Your Offer (${currencySymbol})`}
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder={`Listed at ${formatPrice(vehicle.price)}`}
              />
              <Input
                label="Message to Seller (optional)"
                type="text"
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="e.g. I'm very interested, can meet this week"
              />
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="normal-case" onClick={() => setShowOfferModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>Submit Offer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      {pageContent}
      <LandingFooter />
    </div>
  );
}

