import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import LandingHeader from "../../components/landing/LandingHeader";
import LandingFooter from "../../components/landing/LandingFooter";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { formatPrice } from "../../components/vehicles/BrowseVehicleCard";
import { fetchVehicleById, createOffer } from "../../api/vehicles.api";
import { getVehiclePlaceholderUrl } from "../../utils/vehicleImage.utils";
import ListingLocationMap from "../../components/vehicles/ListingLocationMap";
import VehicleImage from "../../components/vehicles/VehicleImage";
import useAuthStore from "../../store/useAuthStore";

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerAmount, setOfferAmount] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchVehicleById(id)
      .then((res) => setVehicle(res.data.data))
      .catch(() => toast.error("Vehicle not found"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleMakeOffer(e) {
    e.preventDefault();
    if (!accessToken) { navigate("/login"); return; }
    if (!offerAmount || Number(offerAmount) <= 0) { toast.error("Enter a valid offer amount"); return; }
    setSubmitting(true);
    try {
      await createOffer(id, Number(offerAmount));
      toast.success("Offer submitted successfully!");
      setShowOfferModal(false);
      navigate("/buyer/offers");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit offer");
    } finally {
      setSubmitting(false);
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

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button className="sm:w-auto flex-1" onClick={() => {
              if (!accessToken) { navigate("/login"); return; }
              setShowOfferModal(true);
            }}>
              Make An Offer
            </Button>
            <Button variant="outline" className="sm:w-auto flex-1 normal-case" onClick={() => toast.success("Contact request sent (mock)")}>
              Contact Seller
            </Button>
          </div>

          <div className="mt-6 p-4 rounded-xl border border-border bg-surface">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Seller</p>
            <p className="font-semibold text-text-primary">{vehicle.sellerName}</p>
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
                label="Your Offer (€)"
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder={`Listed at ${formatPrice(vehicle.price)}`}
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
